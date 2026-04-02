import crypto from 'crypto';
import { findUserById, upsertUser } from '../server/database';
import type { DatabaseUserRecord } from '../server/database';

const readFlag = (flag: string) => {
  const index = process.argv.indexOf(flag);
  if (index === -1) {
    return '';
  }

  return process.argv[index + 1] || '';
};

const id = readFlag('--id').trim().toUpperCase();
const name = readFlag('--name').trim();
const role = readFlag('--role').trim() as DatabaseUserRecord['role'];
const email = readFlag('--email').trim().toLowerCase();
const password = readFlag('--password');

if (!id || !name || !role || !email || !password) {
  console.error('Usage: npm run add-db-user -- --id EMP-200 --name "User Name" --role employee --email user@daas.ai --password "StrongPassword"');
  process.exit(1);
}

if (role !== 'admin' && role !== 'employee') {
  console.error('Role must be either "admin" or "employee".');
  process.exit(1);
}

const existingUser = findUserById(id);
const salt = crypto.randomBytes(16).toString('hex');
const hash = crypto.scryptSync(password, salt, 64).toString('hex');

upsertUser({
  id,
  name,
  role,
  email,
  passwordSalt: salt,
  passwordHash: hash,
  isActive: true,
  createdAt: existingUser?.createdAt || Date.now(),
  updatedAt: Date.now(),
});

console.log(`Saved database user ${id}.`);
