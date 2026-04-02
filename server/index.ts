import 'dotenv/config';
import crypto from 'crypto';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
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

const getSessionIdFromRequest = (request: express.Request) => {
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

const getSessionFromRequest = (request: express.Request) => {
  cleanupExpiredSessions();

  const sessionId = getSessionIdFromRequest(request);
  if (!sessionId) {
    return null;
  }

  const session = findSessionById(sessionId);
  if (!session) {
    return null;
  }

  const activeSession = findActiveSessionByUserId(session.userId);
  if (!activeSession || activeSession.sessionId !== session.sessionId) {
    deleteSessionById(session.sessionId);
    return null;
  }

  return session;
};

const setSessionCookie = (response: express.Response, sessionId: string) => {
  const signedValue = `${sessionId}.${signValue(sessionId)}`;
  response.setHeader('Set-Cookie', serializeCookie(SESSION_COOKIE_NAME, signedValue, Math.floor(SESSION_TTL_MS / 1000)));
};

const clearSessionCookie = (response: express.Response) => {
  response.setHeader('Set-Cookie', serializeCookie(SESSION_COOKIE_NAME, '', 0));
};

const refreshSession = (session: DatabaseSessionRecord) => {
  const updated = {
    ...session,
    lastSeenAt: Date.now(),
    expiresAt: Date.now() + SESSION_TTL_MS,
  };
  updateSessionTimestamps(updated.sessionId, updated.lastSeenAt, updated.expiresAt);
  return updated;
};

const jsonAuthError = (response: express.Response, status: number, error: LoginErrorCode) =>
  response.status(status).json({ user: null, error });

const getAuthenticatedUser = (request: express.Request, response: express.Response) => {
  const session = getSessionFromRequest(request);
  if (!session) {
    clearSessionCookie(response);
    return null;
  }

  const user = findUserById(session.userId);
  if (!user || !user.isActive) {
    deleteSessionById(session.sessionId);
    clearSessionCookie(response);
    return null;
  }

  const refreshedSession = refreshSession(session);
  setSessionCookie(response, refreshedSession.sessionId);
  return { session: refreshedSession, user };
};

const requireAdmin = (request: express.Request, response: express.Response) => {
  const auth = getAuthenticatedUser(request, response);
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

app.post('/api/auth/login', (request, response) => {
  const id = typeof request.body?.id === 'string' ? request.body.id.trim().toUpperCase() : '';
  const password = typeof request.body?.password === 'string' ? request.body.password : '';
  const portalUser = findUserById(id);

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

  const currentSession = getSessionFromRequest(request);
  if (currentSession?.userId === portalUser.id) {
    const refreshedSession = refreshSession(currentSession);
    setSessionCookie(response, refreshedSession.sessionId);
    return response.json({ user: toPublicUser(portalUser) });
  }

  const existingSession = findActiveSessionByUserId(portalUser.id);
  if (existingSession) {
    if (existingSession.expiresAt > Date.now()) {
      return jsonAuthError(response, 409, 'ALREADY_ACTIVE_ELSEWHERE');
    }
    deleteSessionById(existingSession.sessionId);
  }

  const sessionId = crypto.randomUUID();
  const session: DatabaseSessionRecord = {
    sessionId,
    userId: portalUser.id,
    createdAt: Date.now(),
    lastSeenAt: Date.now(),
    expiresAt: Date.now() + SESSION_TTL_MS,
  };

  createSession(session);
  setSessionCookie(response, sessionId);

  return response.json({ user: toPublicUser(portalUser) });
});

app.get('/api/auth/session', (request, response) => {
  const auth = getAuthenticatedUser(request, response);
  if (!auth) {
    return response.status(401).json({ user: null });
  }

  return response.json({ user: toPublicUser(auth.user) });
});

app.post('/api/auth/logout', (request, response) => {
  const session = getSessionFromRequest(request);
  if (session) {
    deleteSessionById(session.sessionId);
  }

  clearSessionCookie(response);
  return response.status(204).end();
});

app.get('/api/admin/users', (request, response) => {
  const auth = requireAdmin(request, response);
  if (!auth) {
    return;
  }

  return response.json({ users: listAdminUsers() });
});

app.post('/api/admin/users', (request, response) => {
  const auth = requireAdmin(request, response);
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

  if (findUserById(id)) {
    return response.status(409).json({ error: 'USER_EXISTS' });
  }

  const now = Date.now();
  const { passwordSalt, passwordHash } = createPasswordHash(password);

  upsertUser({
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

  return response.status(201).json({ user: listAdminUsers().find(user => user.id === id) });
});

app.patch('/api/admin/users/:id/status', (request, response) => {
  const auth = requireAdmin(request, response);
  if (!auth) {
    return;
  }

  const targetId = request.params.id.trim().toUpperCase();
  const nextIsActive = request.body?.isActive;
  const targetUser = findUserById(targetId);

  if (!targetUser || typeof nextIsActive !== 'boolean') {
    return response.status(400).json({ error: 'INVALID_INPUT' });
  }

  if (auth.user.id === targetId && !nextIsActive) {
    return response.status(400).json({ error: 'CANNOT_DISABLE_SELF' });
  }

  upsertUser({
    ...targetUser,
    isActive: nextIsActive,
    updatedAt: Date.now(),
  });

  if (!nextIsActive) {
    deleteSessionsByUserId(targetId);
  }

  return response.json({ user: listAdminUsers().find(user => user.id === targetId) });
});

app.post('/api/admin/users/:id/reset-password', (request, response) => {
  const auth = requireAdmin(request, response);
  if (!auth) {
    return;
  }

  const targetId = request.params.id.trim().toUpperCase();
  const password = typeof request.body?.password === 'string' ? request.body.password : '';
  const targetUser = findUserById(targetId);

  if (!targetUser || password.length < 8) {
    return response.status(400).json({ error: 'INVALID_INPUT' });
  }

  const { passwordSalt, passwordHash } = createPasswordHash(password);
  upsertUser({
    ...targetUser,
    passwordSalt,
    passwordHash,
    updatedAt: Date.now(),
  });
  deleteSessionsByUserId(targetId);

  return response.json({ user: listAdminUsers().find(user => user.id === targetId) });
});

app.post('/api/admin/users/:id/revoke-session', (request, response) => {
  const auth = requireAdmin(request, response);
  if (!auth) {
    return;
  }

  const targetId = request.params.id.trim().toUpperCase();
  const targetUser = findUserById(targetId);

  if (!targetUser) {
    return response.status(404).json({ error: 'USER_NOT_FOUND' });
  }

  deleteSessionsByUserId(targetId);
  return response.status(204).end();
});

app.get('/api/health', (_, response) => {
  response.json({ ok: true });
});

setInterval(cleanupExpiredSessions, 60 * 1000).unref();

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

app.listen(PORT, HOST, () => {
  console.log(`Auth server ready on http://${HOST}:${PORT}`);
  console.log(`Using SQLite database at ${getDatabasePath()}`);
});
