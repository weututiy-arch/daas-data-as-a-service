import fs from 'fs';
import path from 'path';
import { DatabaseSync } from 'node:sqlite';
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

const configuredDatabasePath = process.env.DATABASE_PATH?.trim();
const databasePath = configuredDatabasePath
  ? path.resolve(process.cwd(), configuredDatabasePath)
  : path.resolve(process.cwd(), 'data', 'portal.sqlite');
const dataDirectory = path.dirname(databasePath);

if (!fs.existsSync(dataDirectory)) {
  fs.mkdirSync(dataDirectory, { recursive: true });
}

const database = new DatabaseSync(databasePath);

database.exec(`
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
  (database.prepare(`PRAGMA table_info(${tableName})`).all() as Array<{ name: string }>).map(column => column.name);

const ensureColumn = (tableName: string, columnName: string, definition: string) => {
  if (!getTableColumns(tableName).includes(columnName)) {
    database.exec(`ALTER TABLE ${tableName} ADD COLUMN ${definition}`);
  }
};

ensureColumn('users', 'is_active', 'is_active INTEGER NOT NULL DEFAULT 1');
ensureColumn('users', 'updated_at', 'updated_at INTEGER NOT NULL DEFAULT 0');
database.exec('UPDATE users SET updated_at = created_at WHERE updated_at = 0');

const countUsersStatement = database.prepare('SELECT COUNT(*) AS count FROM users');
const insertUserStatement = database.prepare(`
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
`);
const findUserByIdStatement = database.prepare(`
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
`);
const listUsersStatement = database.prepare(`
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
`);
const cleanupExpiredSessionsStatement = database.prepare('DELETE FROM sessions WHERE expires_at <= ?');
const findSessionByIdStatement = database.prepare(`
  SELECT
    session_id AS sessionId,
    user_id AS userId,
    created_at AS createdAt,
    last_seen_at AS lastSeenAt,
    expires_at AS expiresAt
  FROM sessions
  WHERE session_id = ?
`);
const findActiveSessionByUserIdStatement = database.prepare(`
  SELECT
    session_id AS sessionId,
    user_id AS userId,
    created_at AS createdAt,
    last_seen_at AS lastSeenAt,
    expires_at AS expiresAt
  FROM sessions
  WHERE user_id = ?
`);
const insertSessionStatement = database.prepare(`
  INSERT INTO sessions (session_id, user_id, created_at, last_seen_at, expires_at)
  VALUES (?, ?, ?, ?, ?)
`);
const updateSessionStatement = database.prepare(`
  UPDATE sessions
  SET last_seen_at = ?, expires_at = ?
  WHERE session_id = ?
`);
const deleteSessionByIdStatement = database.prepare('DELETE FROM sessions WHERE session_id = ?');
const deleteSessionsByUserIdStatement = database.prepare('DELETE FROM sessions WHERE user_id = ?');

const toDatabaseUserRecord = (row: unknown) => row as DatabaseUserRecord | undefined;
const toDatabaseSessionRecord = (row: unknown) => row as DatabaseSessionRecord | undefined;

const seedDefaultUsers = () => {
  const row = countUsersStatement.get() as { count: number } | undefined;
  if ((row?.count || 0) > 0) {
    return;
  }

  const now = Date.now();
  database.exec('BEGIN IMMEDIATE');
  try {
    for (const user of PORTAL_USERS) {
      insertUserStatement.run(
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
    database.exec('COMMIT');
  } catch (error) {
    database.exec('ROLLBACK');
    throw error;
  }
};

seedDefaultUsers();

export const getDatabasePath = () => databasePath;

export const findUserById = (id: string) =>
  toDatabaseUserRecord(findUserByIdStatement.get(id)) || null;

export const listUsers = () =>
  (listUsersStatement.all() as unknown[]).map(row => toDatabaseUserRecord(row)!).map(toPublicUser);

export const listAdminUsers = (): AdminPortalUser[] =>
  (listUsersStatement.all() as unknown[]).map(row => {
    const user = toDatabaseUserRecord(row)!;
    const activeSession = findActiveSessionByUserId(user.id);
    return {
      id: user.id,
      name: user.name,
      role: user.role,
      email: user.email,
      isActive: !!user.isActive,
      hasActiveSession: !!activeSession && activeSession.expiresAt > Date.now(),
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  });

export const upsertUser = (user: DatabaseUserRecord) => {
  insertUserStatement.run(
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

export const cleanupExpiredSessions = (now = Date.now()) => {
  cleanupExpiredSessionsStatement.run(now);
};

export const findSessionById = (sessionId: string) =>
  toDatabaseSessionRecord(findSessionByIdStatement.get(sessionId)) || null;

export const findActiveSessionByUserId = (userId: string) =>
  toDatabaseSessionRecord(findActiveSessionByUserIdStatement.get(userId)) || null;

export const createSession = (session: DatabaseSessionRecord) => {
  insertSessionStatement.run(
    session.sessionId,
    session.userId,
    session.createdAt,
    session.lastSeenAt,
    session.expiresAt
  );
};

export const touchSession = (sessionId: string, lastSeenAt: number, expiresAt: number) => {
  updateSessionStatement.run(lastSeenAt, expiresAt, sessionId);
};

export const deleteSessionById = (sessionId: string) => {
  deleteSessionByIdStatement.run(sessionId);
};

export const deleteSessionsByUserId = (userId: string) => {
  deleteSessionsByUserIdStatement.run(userId);
};
