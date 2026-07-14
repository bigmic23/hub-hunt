const db = require("./db");

function saveJob(userId, job) {
  db.prepare(`
    INSERT INTO saved_jobs (userId, jobId, job, savedAt)
    VALUES (?, ?, ?, ?)
  `).run(userId, job.id, JSON.stringify(job), Date.now());
}

function getSavedJobs(userId) {
  const rows = db.prepare(`
    SELECT job FROM saved_jobs WHERE userId = ?
  `).all(userId);

  return rows.map(r => JSON.parse(r.job));
}

module.exports = { saveJob, getSavedJobs };
