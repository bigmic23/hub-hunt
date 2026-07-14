const sessions = new Map();

function startSession(userId, jobId) {
  sessions.set(String(userId), {
    jobId,
    step: "TYPE",
    data: {},
    locked: false
  });
}

function getSession(userId) {
  return sessions.get(String(userId));
}

function updateSession(userId, updates) {
  const key = String(userId);
  const session = sessions.get(key);

  if (!session) return;

  sessions.set(key, {
    ...session,
    ...updates,
    data: {
      ...session.data,
      ...(updates.data || {})
    }
  });
}

function lockSession(userId) {
  const session = sessions.get(String(userId));
  if (session) session.locked = true;
}

function clearSession(userId) {
  sessions.delete(String(userId));
}

module.exports = {
  startSession,
  getSession,
  updateSession,
  clearSession,
  lockSession
};
