const fs = require("fs");
const path = require("path");

const FILE = path.join(__dirname, "jobsSession.json");

let sessions = {};

/**
 * load sessions from disk
 */
function load() {
  try {
    if (fs.existsSync(FILE)) {
      sessions = JSON.parse(fs.readFileSync(FILE, "utf-8"));
    }
  } catch (e) {
    sessions = {};
  }
}

/**
 * save sessions to disk
 */
function save() {
  fs.writeFileSync(FILE, JSON.stringify(sessions, null, 2));
}

/**
 * start session
 */
async function startSession(userId) {
  const key = String(userId);

  sessions[key] = {
    step: null,
    data: {},
    memory: [],
    profile: {
      jobSeekerLevel: 0,
      supportLevel: 0,
      healthcareInterest: 0,
      reliabilityScore: 0.5
    },
    updatedAt: Date.now()
  };

  save();
}

/**
 * get session
 */
async function getSession(userId) {
  return sessions[String(userId)] || null;
}

/**
 * update session
 */
async function updateSession(userId, updates = {}) {
  const key = String(userId);

  if (!sessions[key]) {
    sessions[key] = {
      step: null,
      data: {},
      memory: [],
      profile: {
        jobSeekerLevel: 0,
        supportLevel: 0,
        healthcareInterest: 0,
        reliabilityScore: 0.5
      },
      updatedAt: Date.now()
    };
  }

  // ONLY MERGE DATA — NO LOGIC
  sessions[key].step = updates.step ?? sessions[key].step;

  sessions[key].data = {
    ...sessions[key].data,
    ...(updates.data || {})
  };

  // OPTIONAL PROFILE MERGE ONLY (NO SCORING)
  if (updates.profile) {
    sessions[key].profile = {
      ...sessions[key].profile,
      ...updates.profile
    };
  }

  sessions[key].updatedAt = Date.now();

  save();
  return sessions[key];
}

/**
 * clear session
 */
async function clearSession(userId) {
  delete sessions[String(userId)];
  save();
}

/**
 * optional: cancel helper
 */
async function cancelSession(userId) {
  delete sessions[String(userId)];
  save();
}

/**
 * auto cleanup stale sessions (15 min)
 */
setInterval(() => {
  const now = Date.now();

  for (const key in sessions) {
    if (now - sessions[key].updatedAt > 15 * 60 * 1000) {
      delete sessions[key];
    }
  }

  save();
}, 60 * 1000);

async function pushMemory(userId, data) {
  const key = String(userId);

  if (!sessions[key]) return;

  sessions[key].memory.push({
    company: data.lastCompany,
    role: data.lastRole,
    confidence: data.lastConfidence,
    intent: data.intent || "recruiter",
    outcome: data.outcome || "unknown",
    time: Date.now()
  });

  sessions[key].memory = sessions[key].memory.slice(-50);

  const p = sessions[key].profile;

  if (data.intent === "recruiter") p.jobSeekerLevel += 0.05;
  if (data.intent === "support") p.supportLevel += 0.05;
  if (data.intent === "healthcare") p.healthcareInterest += 0.05;

  if (data.outcome === "success") p.reliabilityScore += 0.02;
  if (data.outcome === "failed") p.reliabilityScore -= 0.02;

  save();
}

async function updateProfile(userId, data) {
  const key = String(userId);

  if (!sessions[key]) return;

  sessions[key].profile = {
    ...sessions[key].profile,
    ...(data || {})
  };

  save();
}

async function getMemoryInsights(userId) {
  const session = await getSession(userId);

  if (!session?.memory) {
    return [];
  }

  const stats = {};

  for (const item of session.memory) {
    const key = `${item.company}-${item.role}`;

    stats[key] = (stats[key] || 0) + item.confidence;
  }

  return Object.entries(stats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
}

async function finalizeSession(userId, result = {}) {
  const key = String(userId);

  if (!sessions[key]) return null;

  const session = sessions[key];

  const snapshot = {
    step: session.step,
    data: session.data,
    memorySize: session.memory.length,
    profile: session.profile,
    result,
    time: Date.now()
  };

  // RESET SESSION FLOW STATE ONLY
  session.step = null;
  session.data = {};
  session.updatedAt = Date.now();

  save();

  return snapshot;
}

// load on startup
load();

module.exports = {
  getSession,
  startSession,
  updateSession,
  clearSession,
  pushMemory,
  updateProfile,
  finalizeSession   // 🔥 ADD THIS
};
