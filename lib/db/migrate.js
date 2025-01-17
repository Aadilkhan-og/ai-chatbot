import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/mysql2';
import { migrate } from 'drizzle-orm/mysql2/migrator';
import mysql from 'mysql2/promise';

config({
  path: '.env.local', // Load environment variables
});

const connectionParams = {
  host: 'sql12.freemysqlhosting.net',
  port: 3306,
  user: 'sql12757960',
  password: 'fWtqruY2vt',
  database: 'sql12757960',
  
};
const runMigrate = async () => {
  // Establish MySQL connection
  const connection = await mysql.createConnection(connectionParams);
  const db = drizzle(connection);

  console.log('⏳ Running migrations...');

  const start = Date.now();
  // Run migrations
  await migrate(db, { migrationsFolder: './lib/db/migrations' });
  const end = Date.now();

  console.log('✅ Migrations completed in', end - start, 'ms');

  await connection.end(); // Close the MySQL connection
  process.exit(0);
};

runMigrate().catch((err) => {
  console.error('❌ Migration failed');
  console.error(err);
  process.exit(1);
});
