const state = new Map();

/**
 * Initialize feed for user
 */
function setFeed(userId, jobs) {
  state.set(userId, {
    feed: jobs || [],
    index: -1
  });
}

/**
 * Get next job in sequence (ONLY SOURCE OF TRUTH)
 */
function getNextJob(userId) {
  const data = state.get(userId);

  if (!data || !data.feed.length) {
    return { job: null, done: false };
  }

  const nextIndex = data.index + 1;

  if (nextIndex >= data.feed.length) {
    return { job: null, done: true };
  }

  const job = data.feed[nextIndex];

  data.index = nextIndex;
  state.set(userId, data);

  return {
    job,
    done: false
  };
}

/**
 * Reset pointer ONLY (NOT feed)
 */
function resetPointer(userId) {
  const data = state.get(userId);

  if (!data) return;

  data.index = -1;
  state.set(userId, data);
}

module.exports = {
  setFeed,
  getNextJob,
  resetPointer
};
