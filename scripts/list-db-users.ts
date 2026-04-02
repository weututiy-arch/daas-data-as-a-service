import { getDatabasePath, listUsers } from '../server/database';

const run = async () => {
  console.log(`Database: ${getDatabasePath()}`);

  for (const user of await listUsers()) {
    console.log(`${user.id} | ${user.role} | ${user.isActive ? 'enabled' : 'disabled'} | ${user.name} | ${user.email}`);
  }
};

void run().catch(error => {
  console.error('Failed to list database users.', error);
  process.exit(1);
});
