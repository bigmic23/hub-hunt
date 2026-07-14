const feedState = new Map();

/**
 * CREATE SAFE STATE
 */
function createState(jobs = []) {
  return {
    jobs: Array.isArray(jobs) ? jobs.filter(Boolean) : [],
    index: 0,
    updatedAt: Date.now()
  };
}

/**
 * GET OR INITIALIZE STATE
 */
function getState(userId) {
  if (!feedState.has(userId)) {
    const fresh = createState([]);
    feedState.set(userId, fresh);
    return fresh;
  }

  const state = feedState.get(userId);

  if (!Array.isArray(state.jobs)) state.jobs = [];
  if (typeof state.index !== "number") state.index = 0;

  return state;
}

/**
 * SET FEED (FULL REPLACE)
 */
function setFeed(userId, jobs = []) {
  const state = createState(jobs);
  feedState.set(userId, state);
  return state;
}

/**
 * RESET FEED
 */
function resetFeed(userId) {
  const state = createState([]);
  feedState.set(userId, state);
  return state;
}

/**
 * GET FEED (READ ONLY SAFE SNAPSHOT)
 */
function getFeed(userId) {
  const state = getState(userId);

  return {
    jobs: [...state.jobs],
    index: state.index,
    updatedAt: state.updatedAt
  };
}

/**
 * NEXT JOB (CONTROLLED ADVANCEMENT)
 */
function getNextJob(userId) {
  const state = getState(userId);

  if (!state.jobs.length) {
    return { done: true, job: null };
  }

  if (state.index >= state.jobs.length) {
    return { done: true, job: null };
  }

  const job = state.jobs[state.index];

  state.index += 1;
  state.updatedAt = Date.now();

  return {
    done: false,
    job: job || null
  };
}

/**
 * PUSH JOB (DEDUP + SAFE INSERT)
 */
function pushJob(userId, job) {
  if (!job?.id) return;

  const state = getState(userId);

  const exists = state.jobs.some(j => j?.id === job.id);
  if (exists) return;

  state.jobs.unshift(job);
  state.updatedAt = Date.now();

  feedState.set(userId, state);
}

/**
 * REMOVE DUPLICATES (PURE FUNCTION)
 */
function removeDuplicates(jobs = []) {
  const seen = new Set();

  return (jobs || []).filter(j => {
    if (!j?.id) return true;

    if (seen.has(j.id)) return false;

    seen.add(j.id);
    return true;
  });
}

/**
 * DEBUG
 */
function debug(userId) {
  return feedState.get(userId) || null;
}

module.exports = {
  setFeed,
  getFeed,
  resetFeed,
  getNextJob,
  pushJob,
  removeDuplicates,
  debug
};
