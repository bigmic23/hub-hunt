const fs = require("fs");
const path = require("path");

const DB = path.join(__dirname, "../db/feedback.json");

function saveFeedback(userId, data) {
  let db = {};
  if (fs.existsSync(DB)) db = JSON.parse(fs.readFileSync(DB));

  if (!db[userId]) db[userId] = [];

  db[userId].push(data);

  fs.writeFileSync(DB, JSON.stringify(db, null, 2));
}

module.exports = { saveFeedback };
