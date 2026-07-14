const fs = require("fs");
const path = require("path");

const DB_PATH = path.join(__dirname, "../db/identity.json");

// -----------------------------
// LOAD IDENTITY DB
// -----------------------------
function loadDB() {
  try {
    if (!fs.existsSync(DB_PATH)) return {};
    return JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
  } catch (err) {
    return {};
  }
}

// -----------------------------
// SAVE IDENTITY DB
// -----------------------------
function saveDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// -----------------------------
// GET USER IDENTITY
// -----------------------------
function getIdentity(userId) {
  const db = loadDB();
  return (
    db[userId] || {
      jobSeekerLevel: 0,
      supportLevel: 0,
      healthcareInterest: 0,
      recruiterStability: 0,
      totalInteractions: 0
    }
  );
}

// -----------------------------
// UPDATE IDENTITY (LEARNING LAYER)
// -----------------------------
function updateIdentity(userId, event = {}) {
  const db = loadDB();

  if (!db[userId]) {
    db[userId] = getIdentity(userId);
  }

  const identity = db[userId];

  identity.totalInteractions += 1;

  // -----------------------------
  // JOB SEEKER BEHAVIOR
  // -----------------------------
  if (event.intent === "recruiter") {
    identity.jobSeekerLevel += 0.05;

    if (event.outcome === "success") {
      identity.recruiterStability += 0.03;
    }
  }

  // -----------------------------
  // SUPPORT BEHAVIOR
  // -----------------------------
  if (event.intent === "support") {
    identity.supportLevel += 0.05;
  }

  // -----------------------------
  // HEALTHCARE BEHAVIOR
  // -----------------------------
  if (event.intent === "healthcare") {
    identity.healthcareInterest += 0.05;
  }

  // -----------------------------
  // STABILITY DECAY (prevents overfitting)
  // -----------------------------
  identity.jobSeekerLevel *= 0.999;
  identity.supportLevel *= 0.999;
  identity.healthcareInterest *= 0.999;

  db[userId] = identity;
  saveDB(db);

  return identity;
}

// -----------------------------
module.exports = {
  getIdentity,
  updateIdentity
};
