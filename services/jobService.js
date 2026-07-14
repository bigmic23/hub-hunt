const fs = require("fs");
const path = require("path");

const DB_PATH = path.join(__dirname, "../data/jobs.json");

/**
 * Ensure DB exists
 */
function ensureDB() {
  const dir = path.dirname(DB_PATH);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify({ jobs: [] }, null, 2));
  }
}

/**
 * Read DB
 */
function readDB() {
  ensureDB();
  return JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
}

/**
 * Write DB
 */
function writeDB(data) {
  ensureDB();
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

/**
 * CREATE JOB
 */
async function createJob(userId, job) {
  const db = readDB();

  const record = {
    telegram_id: userId,
    title: job.title,
    location: job.city,
    mode: job.mode,
    salary: job.salary,
    raw: job.raw,
    status: "APPLIED",
    created_at: Date.now()
  };

  db.jobs.push(record);
  writeDB(db);

  return record;
}

/**
 * GET JOBS
 */
async function getJobs(userId) {
  const db = readDB();
  return db.jobs.filter(j => j.telegram_id === userId);
}

module.exports = {
  createJob,
  getJobs
};
