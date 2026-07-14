const { Pool } = require("pg");

const db = new Pool({
  user: "postgres",
  host: "localhost",
  database: "crm",
  password: "your_password_here",
  port: 5432
});

/**
 * CREATE JOB
 */
async function createJob(job) {
  const result = await db.query(
    `INSERT INTO jobs (id, user_id, title, salary, location, status, created_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7)
     RETURNING *`,
    [
      job.id,
      job.userId,
      job.title,
      job.salary,
      job.location,
      job.status || "open",
      job.createdAt
    ]
  );

  return result.rows[0];
}

/**
 * GET JOBS BY USER
 */
async function getJobs(userId) {
  const result = await db.query(
    `SELECT * FROM jobs WHERE user_id = $1 ORDER BY created_at DESC`,
    [userId]
  );

  return result.rows;
}

/**
 * UPDATE JOB STATUS
 */
async function updateJobStatus(id, data) {
  const result = await db.query(
    `UPDATE jobs
     SET status = $2
     WHERE id = $1
     RETURNING *`,
    [id, data.status]
  );

  return result.rows[0];
}

module.exports = {
  db,
  createJob,
  getJobs,
  updateJobStatus
};
