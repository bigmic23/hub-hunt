const fs = require("fs");
const path = require("path");

const DB_PATH = path.join(__dirname, "../data/sessions.json");

/**
 * Ensure storage file exists
 */
function ensureDB() {
  if (!fs.existsSync(path.dirname(DB_PATH))) {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  }

  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify({}));
  }
}

/**
 * Read DB safely
 */
function readDB() {
  ensureDB();
  const raw = fs.readFileSync(DB_PATH, "utf-8");

  try {
    return JSON.parse(raw || "{}");
  } catch (e) {
    return {};
  }
}

/**
 * Write DB safely
 */
function writeDB(data) {
  ensureDB();
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

/**
 * GET SESSION
 */
async function getSession(userId) {
  const db = readDB();

  const id = String(userId);

  return db[id] || {
    step: "INPUT",
    data: {}
  };
}

/**
 * UPDATE SESSION
 */
async function updateSession(userId, payload) {
  const db = readDB();

  const id = String(userId);

  const existing = db[id] || {
    step: "INPUT",
    data: {}
  };

  db[id] = {
    ...existing,
    ...payload,
    data: {
      ...(existing.data || {}),
      ...(payload.data || {})
    }
  };

  writeDB(db);

  return db[id];
}

async function appendMemory(userId, key, value) {
  const db = readDB();

  const existing = db[String(userId)] || { data: {} };

  db[String(userId)] = {
    ...existing,
    data: {
      ...(existing.data || {}),
      [key]: value
    }
  };

  writeDB(db);
  return db[String(userId)];
}

async function setFeed(userId, jobs) {
const session = readDB();

if (!session[userId]) session[userId] = {};

session[userId].feed = jobs;
session[userId].feedIndex = 0;

writeDB(session);
}

async function getFeed(userId) {
const session = readDB();
return session[userId]?.feed || [];
}

async function nextFeed(userId) {
const session = readDB();

if (!session[userId]) return null;

session[userId].feedIndex =
(session[userId].feedIndex || 0) + 1;

writeDB(session);

return session[userId].feed?.[
session[userId].feedIndex
] || null;
}

/**
 * DELETE SESSION (optional)
 */
async function deleteSession(userId) {
  const db = readDB();

  const id = String(userId);

  delete db[id];

  writeDB(db);
}

const {
updateCvProfileFromBehavior
} =
require("./ai/profile/cvLearningEngine");

async function learnFromJob(
userId,
job,
decision
) {

const session =
await getSession(userId);

session.cvProfile =
updateCvProfileFromBehavior(
session.cvProfile || {},
{
type:
decision,
job
}
);

await updateSession(
userId,
{
cvProfile:
session.cvProfile
}
);

return session.cvProfile;

}

module.exports = {
getSession,
updateSession,
appendMemory,
setFeed,
getFeed,
nextFeed,
deleteSession,
learnFromJob
};
