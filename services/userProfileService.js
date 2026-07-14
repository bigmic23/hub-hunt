const fs = require("fs");
const path = require("path");

const DB_PATH = path.join(__dirname, "../data/profiles.json");

function ensureDB() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(DB_PATH)) fs.writeFileSync(DB_PATH, "{}");
}

function readDB() {
  ensureDB();
  try {
    return JSON.parse(fs.readFileSync(DB_PATH, "utf-8") || "{}");
  } catch {
    return {};
  }
}

function writeDB(data) {
  ensureDB();
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

function ensureCvProfile(profile = {}) {
  profile.cvProfile = profile.cvProfile || {
    skills: [],
    roles: [],
    location: "",
    salaryExpectation: 0,
    skillStrength: {},
    rolePreference: {},
    rejectionReasons: {},
    embeddingHints: {
      topTitles: [],
      topSkills: []
    }
  };
  return profile;
}

async function get(userId) {
  const db = readDB();
  return db[String(userId)] || null;
}

async function save(userId, profile) {
  const db = readDB();
  db[String(userId)] = ensureCvProfile(profile);
  writeDB(db);
  return db[String(userId)];
}

async function set(userId, profile) {
  return save(userId, profile);
}

async function patch(userId, updates = {}) {
  const current = await get(userId);

  return save(userId, {
    ...(current || {}),
    ...updates
  });
}

module.exports = {
  get,
  save,
  set,
  patch
};
