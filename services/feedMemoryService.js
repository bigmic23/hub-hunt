const memory = new Map();

/**
 * structure:
 * {
 *   userId: {
 *     saved: Set,
 *     applied: Set,
 *     ignored: Set
 *   }
 * }
 */

function ensure(userId) {
  if (!memory.has(userId)) {
    memory.set(userId, {
      saved: new Set(),
      applied: new Set(),
      ignored: new Set()
    });
  }
  return memory.get(userId);
}

function markSaved(userId, jobId) {
  const m = ensure(userId);
  m.saved.add(jobId);
}

function markApplied(userId, jobId) {
  const m = ensure(userId);
  m.applied.add(jobId);
}

function markIgnored(userId, jobId) {
  const m = ensure(userId);
  m.ignored.add(jobId);
}

function getSignals(userId) {
  return ensure(userId);
}

module.exports = {
  markSaved,
  markApplied,
  markIgnored,
  getSignals
};
