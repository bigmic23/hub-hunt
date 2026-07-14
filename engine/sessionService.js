const sessions = new Map();

async function getSession(userId) {
  return sessions.get(userId) || {};
}

async function setSession(userId, data) {
  sessions.set(userId, data);
}

module.exports = {
  getSession,
  setSession
};
