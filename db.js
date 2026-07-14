require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

/* ---------------- INIT DB ---------------- */

async function initDB() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS reminders (
        id SERIAL PRIMARY KEY,
        chat_id TEXT NOT NULL,
        message TEXT NOT NULL,
        run_at BIGINT NOT NULL
      )
    `);
await pool.query(`
  CREATE TABLE IF NOT EXISTS jobs (
    id SERIAL PRIMARY KEY,
    telegram_id TEXT NOT NULL,
    company TEXT NOT NULL,
    role TEXT,
    status TEXT NOT NULL DEFAULT 'APPLIED',
    notes TEXT DEFAULT '',
    created_at BIGINT NOT NULL
  )
`);

    console.log("DB initialized successfully");
  } catch (err) {
    console.error("DB INIT FAILED:", err);
    throw err;
  }
}

/* ---------------- SAVE REMINDER ---------------- */

async function saveReminder({ chat_id, message, run_at }) {

  console.log("SAVE INPUT:", { chat_id, message, run_at });

  return pool.query(
    "INSERT INTO reminders (chat_id, message, run_at) VALUES ($1, $2, $3)",
    [chat_id, message, Number(run_at)]   // 👈 FIX IS HERE
  );
}

/* ---------------- GET USER REMINDERS ---------------- */

async function getUserReminders(chat_id) {
  const res = await pool.query(
    "SELECT * FROM reminders WHERE chat_id = $1",
    [chat_id]
  );
  return res.rows;
}

/* ---------------- GET DUE REMINDERS ---------------- */

async function getDueReminders(now) {
  const res = await pool.query(
    "SELECT * FROM reminders WHERE run_at <= $1",
    [now]
  );
  return res.rows;
}

/* ---------------- DELETE REMINDER ---------------- */

async function deleteReminder(id) {
  return pool.query(
    "DELETE FROM reminders WHERE id = $1",
    [id]
  );
}

async function deleteJob(id) {
  return pool.query(
    "DELETE FROM jobs WHERE id = $1",
    [id]
  );
}

async function createJob({
telegram_id,
company,
role
}) {
return pool.query(
"INSERT INTO jobs (telegram_id, company, role, status, created_at) VALUES ($1, $2, $3, $4, $5)",
[
telegram_id,
company,
role,
"APPLIED",
Date.now()
]
);
}

async function getJobs(telegram_id) {
const res = await pool.query(
"SELECT * FROM jobs WHERE telegram_id = $1 ORDER BY id DESC",
[telegram_id]
);

return res.rows;
}

async function updateJobStatus(
  telegram_id,
  company,
  status
) {
  return pool.query(
    `
    UPDATE jobs
    SET status = $1
    WHERE telegram_id = $2
    AND LOWER(company) = LOWER($3)
    `,
    [status, telegram_id, company]
  );
}

async function addJobNote(telegram_id, company, note) {
  return pool.query(
    `
    UPDATE jobs
    SET notes = notes || $1 || E'\n'
    WHERE telegram_id = $2
    AND LOWER(company) = LOWER($3)
    `,
    [note, telegram_id, company]
  );
}

/* ---------------- EXPORTS ---------------- */

module.exports = {
  pool,
  initDB,
  saveReminder,
  getUserReminders,
  getDueReminders,
  deleteReminder,
  createJob,
  getJobs,
  updateJobStatus,
  addJobNote
};
