const fs = require("fs");
const path = require("path");

const DB = path.join(__dirname, "../db/memory.json");

function read() {
  if (!fs.existsSync(DB)) return {};
  return JSON.parse(fs.readFileSync(DB));
}

function write(data) {
  fs.writeFileSync(DB, JSON.stringify(data, null, 2));
}

function getUser(userId) {
  const db = read();
  return db[userId] || { preferences: {}, history: [] };
}

function updateUser(userId, payload) {
  const db = read();

  db[userId] = {
    ...getUser(userId),
    ...payload
  };

  write(db);
}

module.exports = { getUser, updateUser };
