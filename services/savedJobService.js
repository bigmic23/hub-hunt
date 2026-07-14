const fs = require("fs");
const path = require("path");

const DB_PATH = path.join(__dirname, "../data/savedJobs.json");

function ensureDB() {
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify({}));
  }
}

function readDB() {
  ensureDB();
  return JSON.parse(fs.readFileSync(DB_PATH, "utf-8") || "{}");
}

function writeDB(data) {
  ensureDB();
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

async function saveJob(userId, job) {
  const db = readDB();

  if (!db[userId]) db[userId] = [];

  db[userId].push({
  ...job,
  savedAt: Date.now(),
  id: Date.now(),
  status: "saved",
  appliedAt: null
});

  writeDB(db);
  return true;
}

async function getSavedJobs(userId) {
  const db = readDB();
  return db[userId] || [];
}

function updateAll(userId, jobs) {
  const db = readDB();
  db[userId] = jobs;
  writeDB(db);
}

module.exports = {
  saveJob,
  getSavedJobs,
  updateAll
};
