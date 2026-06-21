import { createClient } from '@libsql/client';

function getTursoClient() {
  const url = process.env.TURSO_DATABASE_URL;
  const token = process.env.TURSO_AUTH_TOKEN;

  if (!url || !token) {
    throw new Error('Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN environment variables.');
  }

  return createClient({ url, authToken: token });
}

export async function initDatabase() {
  const turso = getTursoClient();
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
  const turso = getTursoClient();
  const result = await turso.execute(
    'SELECT * FROM submissions ORDER BY created_at DESC'
  );
  return result.rows;
}

export async function createSubmission(data) {
  const turso = getTursoClient();
  const { title, message, phone, instagram } = data;
  const result = await turso.execute({
    sql: `INSERT INTO submissions (title, message, phone, instagram, verified)
          VALUES (?, ?, ?, ?, 1)`,
    args: [title || null, message, phone, instagram || null],
  });
  return result;
}
