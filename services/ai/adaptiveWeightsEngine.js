function adjustWeights(profile, event = {}) {
  const cv = profile?.cvProfile || {};
  const weights = profile?.weights || {};

  const safeWeights = {
    skillMatch: weights.skillMatch ?? 1,
    roleMatch: weights.roleMatch ?? 1,
    salaryMatch: weights.salaryMatch ?? 1
  };

  const job = event.job || {};
  const title = (job.title || "").toLowerCase();

  // ------------------------
  // SAVED / APPLIED SIGNAL
  // ------------------------
  if (event.action === "SAVED" || event.action === "APPLIED") {
    safeWeights.skillMatch += 0.05;
    safeWeights.roleMatch += 0.08;

    if (cv.salaryExpectation && job.salary) {
      if (job.salary >= cv.salaryExpectation) {
        safeWeights.salaryMatch += 0.1;
      }
    }
  }

  // ------------------------
  // REJECT SIGNAL
  // ------------------------
  if (event.action === "REJECTED") {
    safeWeights.skillMatch -= 0.1;
    safeWeights.roleMatch -= 0.1;
  }

  // ------------------------
  // HARD LIMITS (CRITICAL SAFETY)
  // ------------------------
  safeWeights.skillMatch = clamp(safeWeights.skillMatch);
  safeWeights.roleMatch = clamp(safeWeights.roleMatch);
  safeWeights.salaryMatch = clamp(safeWeights.salaryMatch);

  return safeWeights;
}

function clamp(value) {
  if (!value || isNaN(value)) return 1;
  return Math.max(0.5, Math.min(2.0, value));
}

module.exports = { adjustWeights };
