const fs = require("fs");
const path = require("path");

const DB_PATH = path.join(__dirname, "../data/jobPipeline.json");

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

function setState(userId, jobId, state) {
  const db = readDB();

  if (!db[userId]) db[userId] = {};

  db[userId][jobId] = {
    state,
    updatedAt: Date.now()
  };

  writeDB(db);
}

function getState(userId, jobId) {
  const db = readDB();
  return db[userId]?.[jobId] || { state: "NEW" };
}

function getAll(userId) {
  const db = readDB();
  return db[userId] || {};
}

function getByState(userId, state) {
  const all = getAll(userId);

  return Object.entries(all)
    .filter(([_, v]) => v.state === state)
    .map(([jobId]) => jobId);
}

module.exports = {
  setState,
  getState,
  getAll,
  getByState
};
