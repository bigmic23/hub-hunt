const db = require("../db");

/**
 * CREATE JOB
 */
async function createJob({ userId, title, salary, location }) {
  const result = await db.query(
    `INSERT INTO jobs (user_id, title, salary, location, status, created_at)
     VALUES ($1, $2, $3, $4, 'active', NOW())
     RETURNING *`,
    [userId, title, salary, location]
  );

  return result.rows[0];
}

/**
 * GET USER JOBS
 */
async function getJobs(userId) {
  const result = await db.query(
    `SELECT id, user_id, title, location, salary, status, created_at
     FROM jobs
     WHERE user_id = $1
     ORDER BY created_at DESC`,
    [userId]
  );

  return result.rows;
}

/**
 * UPDATE JOB
 */
async function updateJobStatus(id, status) {
  const result = await db.query(
    `UPDATE jobs
     SET status = $1
     WHERE id = $2
     RETURNING *`,
    [status, id]
  );

  return result.rows[0];
}

module.exports = {
  createJob,
  getJobs,
  updateJobStatus
};
