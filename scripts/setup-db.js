const { createClient } = require('@libsql/client');
require('dotenv').config();

async function setupDatabase() {
  const turso = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  console.log('Setting up database...');

  try {
    await turso.execute(`
      CREATE TABLE IF NOT EXISTS submissions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        message TEXT NOT NULL,
        phone TEXT NOT NULL,
        instagram TEXT,
        verified BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ Database setup complete!');
  } catch (error) {
    console.error('❌ Database setup failed:', error);
  }
}

setupDatabase();
