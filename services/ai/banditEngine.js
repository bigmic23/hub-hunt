function random() {
  return Math.random();
}

/**
 * Injects controlled exploration into ranked jobs
 */
function applyBanditShuffle(jobs = [], profile = {}) {
  if (!Array.isArray(jobs)) return [];

  const explorationRate =
    profile?.explorationRate ?? 0.15; // 15% exploration default

  return jobs
    .map(job => {
      const exploreBoost =
        random() < explorationRate ? 50 : 0;

      return {
        ...job,
        finalScore:
          (job.finalScore || job.score?.score || 0) +
          exploreBoost,
        exploreBoost
      };
    })
    .sort((a, b) => b.finalScore - a.finalScore);
}

module.exports = {
  applyBanditShuffle
};
