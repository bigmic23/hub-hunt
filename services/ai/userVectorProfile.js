const memory = new Map();

function get(userId) {
  return memory.get(userId) || {
    skills: {},
    rejected: {},
    preferences: {}
  };
}

function updateFromJob(userId, job, action) {
  const profile = get(userId);

  const key = (job.title || "").toLowerCase();

  if (action === "SAVED" || action === "APPLIED") {
    profile.skills[key] = (profile.skills[key] || 0) + 1;
  }

  if (action === "IGNORED" || action === "REJECTED") {
    profile.rejected[key] = (profile.rejected[key] || 0) + 1;
  }

  memory.set(userId, profile);
}

module.exports = {
  get,
  updateFromJob
};

