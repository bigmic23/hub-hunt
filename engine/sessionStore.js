const sessions = new Map();

function getSession(userId) {
  return sessions.get(userId) || null;
}

function setSession(userId, data) {
  sessions.set(userId, data);
}

function updateSession(userId, patch) {
  const current = sessions.get(userId) || {};
  sessions.set(userId, {
    ...current,
    ...patch
  });
}

function clearSession(userId) {
  sessions.delete(userId);
}

module.exports = {
  getSession,
  setSession,
  updateSession,
  clearSession
};
