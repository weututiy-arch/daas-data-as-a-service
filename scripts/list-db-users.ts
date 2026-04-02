import { getDatabasePath, listUsers } from '../server/database';

console.log(`Database: ${getDatabasePath()}`);

for (const user of listUsers()) {
  console.log(`${user.id} | ${user.role} | ${user.isActive ? 'enabled' : 'disabled'} | ${user.name} | ${user.email}`);
}
