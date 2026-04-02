import fs from 'fs';
import path from 'path';
import postgres from 'postgres';
import { DatabaseSync, type StatementSync } from 'node:sqlite';
import type { AdminPortalUser, User } from '../src/types/auth';
import { PORTAL_USERS, toPublicUser } from './portalUsers';

export interface DatabaseUserRecord extends User {
  passwordSalt: string;
  passwordHash: string;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface DatabaseSessionRecord {
  sessionId: string;
  userId: string;
  createdAt: number;
  lastSeenAt: number;
  expiresAt: number;
}

interface DatabaseUserRow {
  id: string;
  name: string;
  role: DatabaseUserRecord['role'];
  email: string;
  passwordSalt: string;
  passwordHash: string;
  isActive: boolean | number;
  createdAt: string | number;
  updatedAt: string | number;
}

interface DatabaseSessionRow {
  sessionId: string;
  userId: string;
  createdAt: string | number;
  lastSeenAt: string | number;
  expiresAt: string | number;
}

interface SQLiteStatements {
  countUsersStatement: StatementSync;
  insertUserStatement: StatementSync;
  findUserByIdStatement: StatementSync;
  listUsersStatement: StatementSync;
  cleanupExpiredSessionsStatement: StatementSync;
  findSessionByIdStatement: StatementSync;
  findActiveSessionByUserIdStatement: StatementSync;
  insertSessionStatement: StatementSync;
  updateSessionStatement: StatementSync;
  deleteSessionByIdStatement: StatementSync;
  deleteSessionsByUserIdStatement: StatementSync;
}

const configuredDatabaseUrl =
  process.env.DATABASE_URL?.trim() ||
  process.env.SUPABASE_DB_URL?.trim() ||
  process.env.POSTGRES_URL?.trim() ||
  '';
const shouldUsePostgres = configuredDatabaseUrl.length > 0;
const configuredDatabasePath = process.env.DATABASE_PATH?.trim();
const sqliteDatabasePath = configuredDatabasePath
  ? path.resolve(process.cwd(), configuredDatabasePath)
  : path.resolve(process.cwd(), 'data', 'portal.sqlite');
const sqliteDataDirectory = path.dirname(sqliteDatabasePath);

const shouldRequireSsl = (connectionString: string) => {
  try {
    const parsed = new URL(connectionString);
    return !['localhost', '127.0.0.1'].includes(parsed.hostname);
  } catch {
    return true;
  }
};

const describeDatabaseTarget = () => {
  if (!shouldUsePostgres) {
    return sqliteDatabasePath;
  }

  try {
    const parsed = new URL(configuredDatabaseUrl);
    return `Postgres (${parsed.hostname}${parsed.port ? `:${parsed.port}` : ''}${parsed.pathname})`;
  } catch {
    return 'Postgres (DATABASE_URL)';
  }
};

const postgresClient = shouldUsePostgres
  ? postgres(configuredDatabaseUrl, {
      prepare: false,
      max: 1,
      idle_timeout: 20,
      connect_timeout: 30,
      ssl: shouldRequireSsl(configuredDatabaseUrl) ? 'require' : undefined,
    })
  : null;

let sqliteDatabase: DatabaseSync | null = null;
let sqliteStatements: SQLiteStatements | null = null;
let initPromise: Promise<void> | null = null;

const normalizeBoolean = (value: boolean | number) => value === true || value === 1;

const normalizeUserRow = (row: DatabaseUserRow | undefined | null): DatabaseUserRecord | null => {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    name: row.name,
    role: row.role,
    email: row.email,
    passwordSalt: row.passwordSalt,
    passwordHash: row.passwordHash,
    isActive: normalizeBoolean(row.isActive),
    createdAt: Number(row.createdAt),
    updatedAt: Number(row.updatedAt),
  };
};

const normalizeSessionRow = (row: DatabaseSessionRow | undefined | null): DatabaseSessionRecord | null => {
  if (!row) {
    return null;
  }

  return {
    sessionId: row.sessionId,
    userId: row.userId,
    createdAt: Number(row.createdAt),
    lastSeenAt: Number(row.lastSeenAt),
    expiresAt: Number(row.expiresAt),
  };
};

const ensureSqliteDirectory = () => {
  if (!fs.existsSync(sqliteDataDirectory)) {
    fs.mkdirSync(sqliteDataDirectory, { recursive: true });
  }
};

const initSqlite = () => {
  if (sqliteDatabase && sqliteStatements) {
    return;
  }

  ensureSqliteDirectory();
  sqliteDatabase = new DatabaseSync(sqliteDatabasePath);

  sqliteDatabase.exec(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('admin', 'employee')),
      email TEXT NOT NULL UNIQUE,
      password_salt TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sessions (
      session_id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL UNIQUE,
      created_at INTEGER NOT NULL,
      last_seen_at INTEGER NOT NULL,
      expires_at INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
  `);

  const getTableColumns = (tableName: string) =>
    (sqliteDatabase!.prepare(`PRAGMA table_info(${tableName})`).all() as Array<{ name: string }>).map(column => column.name);

  const ensureColumn = (tableName: string, columnName: string, definition: string) => {
    if (!getTableColumns(tableName).includes(columnName)) {
      sqliteDatabase!.exec(`ALTER TABLE ${tableName} ADD COLUMN ${definition}`);
    }
  };

  ensureColumn('users', 'is_active', 'is_active INTEGER NOT NULL DEFAULT 1');
  ensureColumn('users', 'updated_at', 'updated_at INTEGER NOT NULL DEFAULT 0');
  sqliteDatabase.exec('UPDATE users SET updated_at = created_at WHERE updated_at = 0');

  sqliteStatements = {
    countUsersStatement: sqliteDatabase.prepare('SELECT COUNT(*) AS count FROM users'),
    insertUserStatement: sqliteDatabase.prepare(`
      INSERT INTO users (id, name, role, email, password_salt, password_hash, is_active, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        name = excluded.name,
        role = excluded.role,
        email = excluded.email,
        password_salt = excluded.password_salt,
        password_hash = excluded.password_hash,
        is_active = excluded.is_active,
        updated_at = excluded.updated_at
    `),
    findUserByIdStatement: sqliteDatabase.prepare(`
      SELECT
        id,
        name,
        role,
        email,
        password_salt AS passwordSalt,
        password_hash AS passwordHash,
        is_active AS isActive,
        created_at AS createdAt,
        updated_at AS updatedAt
      FROM users
      WHERE id = ?
    `),
    listUsersStatement: sqliteDatabase.prepare(`
      SELECT
        id,
        name,
        role,
        email,
        password_salt AS passwordSalt,
        password_hash AS passwordHash,
        is_active AS isActive,
        created_at AS createdAt,
        updated_at AS updatedAt
      FROM users
      ORDER BY role ASC, created_at ASC
    `),
    cleanupExpiredSessionsStatement: sqliteDatabase.prepare('DELETE FROM sessions WHERE expires_at <= ?'),
    findSessionByIdStatement: sqliteDatabase.prepare(`
      SELECT
        session_id AS sessionId,
        user_id AS userId,
        created_at AS createdAt,
        last_seen_at AS lastSeenAt,
        expires_at AS expiresAt
      FROM sessions
      WHERE session_id = ?
    `),
    findActiveSessionByUserIdStatement: sqliteDatabase.prepare(`
      SELECT
        session_id AS sessionId,
        user_id AS userId,
        created_at AS createdAt,
        last_seen_at AS lastSeenAt,
        expires_at AS expiresAt
      FROM sessions
      WHERE user_id = ?
    `),
    insertSessionStatement: sqliteDatabase.prepare(`
      INSERT INTO sessions (session_id, user_id, created_at, last_seen_at, expires_at)
      VALUES (?, ?, ?, ?, ?)
    `),
    updateSessionStatement: sqliteDatabase.prepare(`
      UPDATE sessions
      SET last_seen_at = ?, expires_at = ?
      WHERE session_id = ?
    `),
    deleteSessionByIdStatement: sqliteDatabase.prepare('DELETE FROM sessions WHERE session_id = ?'),
    deleteSessionsByUserIdStatement: sqliteDatabase.prepare('DELETE FROM sessions WHERE user_id = ?'),
  };

  const row = sqliteStatements.countUsersStatement.get() as { count: number } | undefined;
  if ((row?.count || 0) === 0) {
    const now = Date.now();
    sqliteDatabase.exec('BEGIN IMMEDIATE');
    try {
      for (const user of PORTAL_USERS) {
        sqliteStatements.insertUserStatement.run(
          user.id,
          user.name,
          user.role,
          user.email,
          user.passwordSalt,
          user.passwordHash,
          1,
          now,
          now
        );
      }
      sqliteDatabase.exec('COMMIT');
    } catch (error) {
      sqliteDatabase.exec('ROLLBACK');
      throw error;
    }
  }
};

const initPostgres = async () => {
  if (!postgresClient) {
    return;
  }

  await postgresClient.unsafe(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('admin', 'employee')),
      email TEXT NOT NULL UNIQUE,
      password_salt TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at BIGINT NOT NULL,
      updated_at BIGINT NOT NULL DEFAULT 0
    )
  `);

  await postgresClient.unsafe(`
    CREATE TABLE IF NOT EXISTS sessions (
      session_id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
      created_at BIGINT NOT NULL,
      last_seen_at BIGINT NOT NULL,
      expires_at BIGINT NOT NULL
    )
  `);

  await postgresClient.unsafe('CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at)');
  await postgresClient.unsafe('UPDATE users SET updated_at = created_at WHERE updated_at = 0');

  const countRows = await postgresClient<{ count: number }[]>`SELECT COUNT(*)::int AS count FROM users`;
  if ((countRows[0]?.count || 0) > 0) {
    return;
  }

  const now = Date.now();
  for (const user of PORTAL_USERS) {
    await postgresClient`
      INSERT INTO users (
        id,
        name,
        role,
        email,
        password_salt,
        password_hash,
        is_active,
        created_at,
        updated_at
      )
      VALUES (
        ${user.id},
        ${user.name},
        ${user.role},
        ${user.email},
        ${user.passwordSalt},
        ${user.passwordHash},
        ${true},
        ${now},
        ${now}
      )
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        role = EXCLUDED.role,
        email = EXCLUDED.email,
        password_salt = EXCLUDED.password_salt,
        password_hash = EXCLUDED.password_hash,
        is_active = EXCLUDED.is_active,
        updated_at = EXCLUDED.updated_at
    `;
  }
};

export const initDatabase = async () => {
  if (!initPromise) {
    initPromise = (async () => {
      if (shouldUsePostgres) {
        await initPostgres();
        return;
      }

      initSqlite();
    })();
  }

  await initPromise;
};

const listSqliteUserRecords = () =>
  (sqliteStatements!.listUsersStatement.all() as unknown as DatabaseUserRow[]).map(row => normalizeUserRow(row)!).filter(Boolean);

const listPostgresUserRecords = async () => {
  const rows = await postgresClient!<DatabaseUserRow[]>`
    SELECT
      id,
      name,
      role,
      email,
      password_salt AS "passwordSalt",
      password_hash AS "passwordHash",
      is_active AS "isActive",
      created_at AS "createdAt",
      updated_at AS "updatedAt"
    FROM users
    ORDER BY role ASC, created_at ASC
  `;

  return rows.map(row => normalizeUserRow(row)!).filter(Boolean);
};

const listDatabaseUsers = async () => {
  await initDatabase();
  return shouldUsePostgres ? listPostgresUserRecords() : listSqliteUserRecords();
};

export const getDatabasePath = () => describeDatabaseTarget();

export const findUserById = async (id: string) => {
  await initDatabase();

  if (shouldUsePostgres) {
    const rows = await postgresClient!<DatabaseUserRow[]>`
      SELECT
        id,
        name,
        role,
        email,
        password_salt AS "passwordSalt",
        password_hash AS "passwordHash",
        is_active AS "isActive",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM users
      WHERE id = ${id}
      LIMIT 1
    `;
    return normalizeUserRow(rows[0]);
  }

  return normalizeUserRow(sqliteStatements!.findUserByIdStatement.get(id) as unknown as DatabaseUserRow | undefined);
};

export const listUsers = async () => (await listDatabaseUsers()).map(toPublicUser);

export const listAdminUsers = async (): Promise<AdminPortalUser[]> => {
  const users = await listDatabaseUsers();
  const admins: AdminPortalUser[] = [];

  for (const user of users) {
    const activeSession = await findActiveSessionByUserId(user.id);
    admins.push({
      id: user.id,
      name: user.name,
      role: user.role,
      email: user.email,
      isActive: !!user.isActive,
      hasActiveSession: !!activeSession && activeSession.expiresAt > Date.now(),
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  }

  return admins;
};

export const upsertUser = async (user: DatabaseUserRecord) => {
  await initDatabase();

  if (shouldUsePostgres) {
    await postgresClient!`
      INSERT INTO users (
        id,
        name,
        role,
        email,
        password_salt,
        password_hash,
        is_active,
        created_at,
        updated_at
      )
      VALUES (
        ${user.id},
        ${user.name},
        ${user.role},
        ${user.email},
        ${user.passwordSalt},
        ${user.passwordHash},
        ${user.isActive},
        ${user.createdAt},
        ${user.updatedAt}
      )
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        role = EXCLUDED.role,
        email = EXCLUDED.email,
        password_salt = EXCLUDED.password_salt,
        password_hash = EXCLUDED.password_hash,
        is_active = EXCLUDED.is_active,
        updated_at = EXCLUDED.updated_at
    `;
    return;
  }

  sqliteStatements!.insertUserStatement.run(
    user.id,
    user.name,
    user.role,
    user.email,
    user.passwordSalt,
    user.passwordHash,
    user.isActive ? 1 : 0,
    user.createdAt,
    user.updatedAt
  );
};

export const cleanupExpiredSessions = async (now = Date.now()) => {
  await initDatabase();

  if (shouldUsePostgres) {
    await postgresClient!`DELETE FROM sessions WHERE expires_at <= ${now}`;
    return;
  }

  sqliteStatements!.cleanupExpiredSessionsStatement.run(now);
};

export const findSessionById = async (sessionId: string) => {
  await initDatabase();

  if (shouldUsePostgres) {
    const rows = await postgresClient!<DatabaseSessionRow[]>`
      SELECT
        session_id AS "sessionId",
        user_id AS "userId",
        created_at AS "createdAt",
        last_seen_at AS "lastSeenAt",
        expires_at AS "expiresAt"
      FROM sessions
      WHERE session_id = ${sessionId}
      LIMIT 1
    `;
    return normalizeSessionRow(rows[0]);
  }

  return normalizeSessionRow(sqliteStatements!.findSessionByIdStatement.get(sessionId) as unknown as DatabaseSessionRow | undefined);
};

export const findActiveSessionByUserId = async (userId: string) => {
  await initDatabase();

  if (shouldUsePostgres) {
    const rows = await postgresClient!<DatabaseSessionRow[]>`
      SELECT
        session_id AS "sessionId",
        user_id AS "userId",
        created_at AS "createdAt",
        last_seen_at AS "lastSeenAt",
        expires_at AS "expiresAt"
      FROM sessions
      WHERE user_id = ${userId}
      LIMIT 1
    `;
    return normalizeSessionRow(rows[0]);
  }

  return normalizeSessionRow(sqliteStatements!.findActiveSessionByUserIdStatement.get(userId) as unknown as DatabaseSessionRow | undefined);
};

export const createSession = async (session: DatabaseSessionRecord) => {
  await initDatabase();

  if (shouldUsePostgres) {
    await postgresClient!`
      INSERT INTO sessions (session_id, user_id, created_at, last_seen_at, expires_at)
      VALUES (
        ${session.sessionId},
        ${session.userId},
        ${session.createdAt},
        ${session.lastSeenAt},
        ${session.expiresAt}
      )
    `;
    return;
  }

  sqliteStatements!.insertSessionStatement.run(
    session.sessionId,
    session.userId,
    session.createdAt,
    session.lastSeenAt,
    session.expiresAt
  );
};

export const touchSession = async (sessionId: string, lastSeenAt: number, expiresAt: number) => {
  await initDatabase();

  if (shouldUsePostgres) {
    await postgresClient!`
      UPDATE sessions
      SET last_seen_at = ${lastSeenAt}, expires_at = ${expiresAt}
      WHERE session_id = ${sessionId}
    `;
    return;
  }

  sqliteStatements!.updateSessionStatement.run(lastSeenAt, expiresAt, sessionId);
};

export const deleteSessionById = async (sessionId: string) => {
  await initDatabase();

  if (shouldUsePostgres) {
    await postgresClient!`DELETE FROM sessions WHERE session_id = ${sessionId}`;
    return;
  }

  sqliteStatements!.deleteSessionByIdStatement.run(sessionId);
};

export const deleteSessionsByUserId = async (userId: string) => {
  await initDatabase();

  if (shouldUsePostgres) {
    await postgresClient!`DELETE FROM sessions WHERE user_id = ${userId}`;
    return;
  }

  sqliteStatements!.deleteSessionsByUserIdStatement.run(userId);
};
