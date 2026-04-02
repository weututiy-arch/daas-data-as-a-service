import 'dotenv/config';
import crypto from 'crypto';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import type { NextFunction, Request, Response } from 'express';
import type { LoginErrorCode } from '../src/types/auth';
import {
  cleanupExpiredSessions,
  createSession,
  deleteSessionById,
  deleteSessionsByUserId,
  type DatabaseSessionRecord,
  findActiveSessionByUserId,
  findSessionById,
  findUserById,
  getDatabasePath,
  initDatabase,
  listAdminUsers,
  touchSession as updateSessionTimestamps,
  upsertUser,
} from './database';
import { toPublicUser } from './portalUsers';

const SESSION_COOKIE_NAME = 'daas_session';
const SESSION_TTL_MS = 30 * 60 * 1000;
const PORT = Number(process.env.PORT || process.env.AUTH_PORT || 3001);
const HOST = process.env.HOST || '0.0.0.0';
const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const SESSION_SECRET = process.env.SESSION_SECRET || 'change-this-session-secret';

const app = express();
app.disable('x-powered-by');
app.use(express.json());
app.use((_, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  next();
});

const asyncRoute = (
  handler: (request: Request, response: Response, next: NextFunction) => Promise<unknown>
) => (request: Request, response: Response, next: NextFunction) => {
  void handler(request, response, next).catch(next);
};

const timingSafeMatch = (a: string, b: string) => {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) {
    return false;
  }
  return crypto.timingSafeEqual(left, right);
};

const hashPassword = (password: string, salt: string) =>
  crypto.scryptSync(password, salt, 64).toString('hex');

const createPasswordHash = (password: string) => {
  const passwordSalt = crypto.randomBytes(16).toString('hex');
  const passwordHash = hashPassword(password, passwordSalt);
  return { passwordSalt, passwordHash };
};

const signValue = (value: string) =>
  crypto.createHmac('sha256', SESSION_SECRET).update(value).digest('hex');

const serializeCookie = (name: string, value: string, maxAgeSeconds?: number) => {
  const parts = [`${name}=${encodeURIComponent(value)}`, 'Path=/', 'HttpOnly', 'SameSite=Lax'];

  if (IS_PRODUCTION) {
    parts.push('Secure');
  }

  if (typeof maxAgeSeconds === 'number') {
    parts.push(`Max-Age=${maxAgeSeconds}`);
  }

  return parts.join('; ');
};

const parseCookies = (cookieHeader?: string) => {
  if (!cookieHeader) {
    return {};
  }

  return Object.fromEntries(
    cookieHeader
      .split(';')
      .map(chunk => chunk.trim())
      .filter(Boolean)
      .map(chunk => {
        const separatorIndex = chunk.indexOf('=');
        if (separatorIndex === -1) {
          return [chunk, ''];
        }

        const key = chunk.slice(0, separatorIndex);
        const value = chunk.slice(separatorIndex + 1);
        return [key, decodeURIComponent(value)];
      })
  );
};

const getSessionIdFromRequest = (request: Request) => {
  const cookies = parseCookies(request.headers.cookie);
  const rawCookie = cookies[SESSION_COOKIE_NAME];
  if (!rawCookie) {
    return null;
  }

  const separatorIndex = rawCookie.lastIndexOf('.');
  if (separatorIndex === -1) {
    return null;
  }

  const sessionId = rawCookie.slice(0, separatorIndex);
  const signature = rawCookie.slice(separatorIndex + 1);
  const expectedSignature = signValue(sessionId);

  if (!timingSafeMatch(signature, expectedSignature)) {
    return null;
  }

  return sessionId;
};

const getSessionFromRequest = async (request: Request) => {
  await cleanupExpiredSessions();

  const sessionId = getSessionIdFromRequest(request);
  if (!sessionId) {
    return null;
  }

  const session = await findSessionById(sessionId);
  if (!session) {
    return null;
  }

  const activeSession = await findActiveSessionByUserId(session.userId);
  if (!activeSession || activeSession.sessionId !== session.sessionId) {
    await deleteSessionById(session.sessionId);
    return null;
  }

  return session;
};

const setSessionCookie = (response: Response, sessionId: string) => {
  const signedValue = `${sessionId}.${signValue(sessionId)}`;
  response.setHeader('Set-Cookie', serializeCookie(SESSION_COOKIE_NAME, signedValue, Math.floor(SESSION_TTL_MS / 1000)));
};

const clearSessionCookie = (response: Response) => {
  response.setHeader('Set-Cookie', serializeCookie(SESSION_COOKIE_NAME, '', 0));
};

const refreshSession = async (session: DatabaseSessionRecord) => {
  const updated = {
    ...session,
    lastSeenAt: Date.now(),
    expiresAt: Date.now() + SESSION_TTL_MS,
  };
  await updateSessionTimestamps(updated.sessionId, updated.lastSeenAt, updated.expiresAt);
  return updated;
};

const jsonAuthError = (response: Response, status: number, error: LoginErrorCode) =>
  response.status(status).json({ user: null, error });

const getAuthenticatedUser = async (request: Request, response: Response) => {
  const session = await getSessionFromRequest(request);
  if (!session) {
    clearSessionCookie(response);
    return null;
  }

  const user = await findUserById(session.userId);
  if (!user || !user.isActive) {
    await deleteSessionById(session.sessionId);
    clearSessionCookie(response);
    return null;
  }

  const refreshedSession = await refreshSession(session);
  setSessionCookie(response, refreshedSession.sessionId);
  return { session: refreshedSession, user };
};

const requireAdmin = async (request: Request, response: Response) => {
  const auth = await getAuthenticatedUser(request, response);
  if (!auth) {
    response.status(401).json({ error: 'UNAUTHORIZED' });
    return null;
  }

  if (auth.user.role !== 'admin') {
    response.status(403).json({ error: 'FORBIDDEN' });
    return null;
  }

  return auth;
};

app.post('/api/auth/login', asyncRoute(async (request, response) => {
  const id = typeof request.body?.id === 'string' ? request.body.id.trim().toUpperCase() : '';
  const password = typeof request.body?.password === 'string' ? request.body.password : '';
  const portalUser = await findUserById(id);

  if (!portalUser) {
    return jsonAuthError(response, 401, 'INVALID_CREDENTIALS');
  }

  if (!portalUser.isActive) {
    return jsonAuthError(response, 403, 'ACCOUNT_DISABLED');
  }

  const hashedPassword = hashPassword(password, portalUser.passwordSalt);
  if (!timingSafeMatch(hashedPassword, portalUser.passwordHash)) {
    return jsonAuthError(response, 401, 'INVALID_CREDENTIALS');
  }

  const currentSession = await getSessionFromRequest(request);
  if (currentSession?.userId === portalUser.id) {
    const refreshedSession = await refreshSession(currentSession);
    setSessionCookie(response, refreshedSession.sessionId);
    return response.json({ user: toPublicUser(portalUser) });
  }

  const existingSession = await findActiveSessionByUserId(portalUser.id);
  if (existingSession) {
    if (existingSession.expiresAt > Date.now()) {
      return jsonAuthError(response, 409, 'ALREADY_ACTIVE_ELSEWHERE');
    }
    await deleteSessionById(existingSession.sessionId);
  }

  const sessionId = crypto.randomUUID();
  const session: DatabaseSessionRecord = {
    sessionId,
    userId: portalUser.id,
    createdAt: Date.now(),
    lastSeenAt: Date.now(),
    expiresAt: Date.now() + SESSION_TTL_MS,
  };

  await createSession(session);
  setSessionCookie(response, sessionId);

  return response.json({ user: toPublicUser(portalUser) });
}));

app.get('/api/auth/session', asyncRoute(async (request, response) => {
  const auth = await getAuthenticatedUser(request, response);
  if (!auth) {
    return response.status(401).json({ user: null });
  }

  return response.json({ user: toPublicUser(auth.user) });
}));

app.post('/api/auth/logout', asyncRoute(async (request, response) => {
  const session = await getSessionFromRequest(request);
  if (session) {
    await deleteSessionById(session.sessionId);
  }

  clearSessionCookie(response);
  return response.status(204).end();
}));

app.get('/api/admin/users', asyncRoute(async (request, response) => {
  const auth = await requireAdmin(request, response);
  if (!auth) {
    return;
  }

  return response.json({ users: await listAdminUsers() });
}));

app.post('/api/admin/users', asyncRoute(async (request, response) => {
  const auth = await requireAdmin(request, response);
  if (!auth) {
    return;
  }

  const id = typeof request.body?.id === 'string' ? request.body.id.trim().toUpperCase() : '';
  const name = typeof request.body?.name === 'string' ? request.body.name.trim() : '';
  const email = typeof request.body?.email === 'string' ? request.body.email.trim().toLowerCase() : '';
  const password = typeof request.body?.password === 'string' ? request.body.password : '';
  const role = request.body?.role === 'admin' ? 'admin' : request.body?.role === 'employee' ? 'employee' : null;

  if (!id || !name || !email || !password || !role || password.length < 8) {
    return response.status(400).json({ error: 'INVALID_INPUT' });
  }

  if (await findUserById(id)) {
    return response.status(409).json({ error: 'USER_EXISTS' });
  }

  const now = Date.now();
  const { passwordSalt, passwordHash } = createPasswordHash(password);

  await upsertUser({
    id,
    name,
    role,
    email,
    passwordSalt,
    passwordHash,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  });

  const users = await listAdminUsers();
  return response.status(201).json({ user: users.find(user => user.id === id) });
}));

app.patch('/api/admin/users/:id/status', asyncRoute(async (request, response) => {
  const auth = await requireAdmin(request, response);
  if (!auth) {
    return;
  }

  const targetId = request.params.id.trim().toUpperCase();
  const nextIsActive = request.body?.isActive;
  const targetUser = await findUserById(targetId);

  if (!targetUser || typeof nextIsActive !== 'boolean') {
    return response.status(400).json({ error: 'INVALID_INPUT' });
  }

  if (auth.user.id === targetId && !nextIsActive) {
    return response.status(400).json({ error: 'CANNOT_DISABLE_SELF' });
  }

  await upsertUser({
    ...targetUser,
    isActive: nextIsActive,
    updatedAt: Date.now(),
  });

  if (!nextIsActive) {
    await deleteSessionsByUserId(targetId);
  }

  const users = await listAdminUsers();
  return response.json({ user: users.find(user => user.id === targetId) });
}));

app.post('/api/admin/users/:id/reset-password', asyncRoute(async (request, response) => {
  const auth = await requireAdmin(request, response);
  if (!auth) {
    return;
  }

  const targetId = request.params.id.trim().toUpperCase();
  const password = typeof request.body?.password === 'string' ? request.body.password : '';
  const targetUser = await findUserById(targetId);

  if (!targetUser || password.length < 8) {
    return response.status(400).json({ error: 'INVALID_INPUT' });
  }

  const { passwordSalt, passwordHash } = createPasswordHash(password);
  await upsertUser({
    ...targetUser,
    passwordSalt,
    passwordHash,
    updatedAt: Date.now(),
  });
  await deleteSessionsByUserId(targetId);

  const users = await listAdminUsers();
  return response.json({ user: users.find(user => user.id === targetId) });
}));

app.post('/api/admin/users/:id/revoke-session', asyncRoute(async (request, response) => {
  const auth = await requireAdmin(request, response);
  if (!auth) {
    return;
  }

  const targetId = request.params.id.trim().toUpperCase();
  const targetUser = await findUserById(targetId);

  if (!targetUser) {
    return response.status(404).json({ error: 'USER_NOT_FOUND' });
  }

  await deleteSessionsByUserId(targetId);
  return response.status(204).end();
}));

app.get('/api/health', (_, response) => {
  response.json({ ok: true });
});

if (IS_PRODUCTION) {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const distPath = path.resolve(__dirname, '../dist');

  app.use(express.static(distPath));
  app.get('*', (request, response, next) => {
    if (request.path.startsWith('/api/')) {
      return next();
    }

    return response.sendFile(path.join(distPath, 'index.html'));
  });
}

app.use((error: unknown, request: Request, response: Response, next: NextFunction) => {
  console.error('Request failed', error);

  if (response.headersSent) {
    return next(error);
  }

  if (request.path.startsWith('/api/')) {
    return response.status(500).json({ error: 'INTERNAL_SERVER_ERROR' });
  }

  return response.status(500).send('Internal Server Error');
});

const bootstrap = async () => {
  await initDatabase();

  setInterval(() => {
    void cleanupExpiredSessions().catch(error => {
      console.error('Failed to clean expired sessions', error);
    });
  }, 60 * 1000).unref();

  app.listen(PORT, HOST, () => {
    console.log(`Auth server ready on http://${HOST}:${PORT}`);
    console.log(`Using database target ${getDatabasePath()}`);
  });
};

void bootstrap().catch(error => {
  console.error('Failed to start server', error);
  process.exit(1);
});
