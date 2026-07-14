const fs = require("fs");
const path = require("path");

const DB_PATH = path.join(__dirname, "../data/feedState.json");

function ensureDB() {
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify({}));
  }
}

function readDB() {
  ensureDB();
  return JSON.parse(fs.readFileSync(DB_PATH, "utf-8") || "{}");
}

function writeDB(db) {
  ensureDB();
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

function getState(userId) {
  const db = readDB();

  if (!db[userId]) {
    db[userId] = {
      index: -1,
      seen: []
    };
    writeDB(db);
  }

  return db[userId];
}

function setState(userId, state) {
  const db = readDB();
  db[userId] = state;
  writeDB(db);
}

function reset(userId) {
  const db = readDB();
  db[userId] = { index: -1, seen: [] };
  writeDB(db);
}

module.exports = {
  getState,
  setState,
  reset
};
