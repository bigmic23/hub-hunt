const memory = require("../data/memoryStore");

function getSession(userId) {
  return memory.get(userId) || {};
}

function updateSession(userId, data) {
  const current = getSession(userId);
  const updated = { ...current, ...data };
  memory.set(userId, updated);
  return updated;
}

module.exports = {
  getSession,
  updateSession
};
