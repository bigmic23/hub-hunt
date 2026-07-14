const feedState = new Map();

/* =========================
   SET FEED
========================= */
function setFeed(userId, jobs) {
  feedState.set(userId, {
    jobs,
    index: 0
  });
}

/* =========================
   GET FEED
========================= */
function getFeed(userId) {
  return feedState.get(userId);
}

/* =========================
   RESET FEED
========================= */
function resetFeed(userId) {
  feedState.delete(userId);
}

/* =========================
   NEXT JOB
========================= */
function getNextJob(userId) {
  const state = feedState.get(userId);

  if (!state) {
    return null;
  }

  const job = state.jobs[state.index];

  state.index++;

  if (!job) {
    return {
      done: true
    };
  }

  return {
    done: false,
    job
  };
}

/* =========================
   EXPORTS
========================= */
module.exports = {
  setFeed,
  getFeed,
  resetFeed,
  getNextJob
};
