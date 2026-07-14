const store = new Map();

function get(userId) {
  return store.get(userId) || {
    acceptedSkills: {},
    rejectedSkills: {},
    jobTypes: {},
    history: []
  };
}

function update(userId, job, decision) {
  const mem = get(userId);

  const title = (job.title || "").toLowerCase();

  mem.history.push({
    title: job.title,
    score: job.score?.score,
    decision,
    time: Date.now()
  });

  if (decision === "SAVED" || decision === "APPLIED") {
    mem.acceptedSkills[title] = (mem.acceptedSkills[title] || 0) + 1;
  }

  if (decision === "IGNORED" || decision === "REJECTED") {
    mem.rejectedSkills[title] = (mem.rejectedSkills[title] || 0) + 1;
  }

  store.set(userId, mem);
}

function getBias(userId) {
  const mem = get(userId);

  return {
    prefers: Object.keys(mem.acceptedSkills),
    avoids: Object.keys(mem.rejectedSkills)
  };
}

module.exports = {
  get,
  update,
  getBias
};
