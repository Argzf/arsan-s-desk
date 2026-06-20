import { createClient } from '@libsql/client';

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export async function initDatabase() {
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
}

export async function getSubmissions() {
  const result = await turso.execute(
    'SELECT * FROM submissions ORDER BY created_at DESC'
  );
  return result.rows;
}

export async function createSubmission(data) {
  const { title, message, phone, instagram } = data;
  const result = await turso.execute({
    sql: `INSERT INTO submissions (title, message, phone, instagram, verified)
          VALUES (?, ?, ?, ?, 1)`,
    args: [title || null, message, phone, instagram || null],
  });
  return result;
}

export default turso;
