function scoreConfidence(
  jobData,
  baseConfidence,
  memorySignal = [],
  identity = {}
) {
  let confidence = baseConfidence;

  // -------------------------
  // MEMORY EFFECT
  // -------------------------

  const memoryBoost =
    memorySignal.reduce((sum, m) => {
      if (m.outcome === "success") return sum + 0.03;
      if (m.outcome === "uncertain") return sum + 0.01;
      if (m.outcome === "failed") return sum - 0.02;

      return sum;
    }, 0);

  confidence += memoryBoost;

  // -------------------------
  // IDENTITY EFFECT
  // -------------------------

  const recruiterBoost =
    (identity.recruiterStability || 0) * 0.15;

  const seekerBoost =
    (identity.jobSeekerLevel || 0) * 0.08;

  const interactionBoost =
    Math.min(
      0.05,
      (identity.totalInteractions || 0) * 0.001
    );

  confidence += recruiterBoost;
  confidence += seekerBoost;
  confidence += interactionBoost;

  // -------------------------
  // DATA QUALITY
  // -------------------------

  if (!jobData.company) confidence -= 0.10;

  if (!jobData.role) confidence -= 0.10;

  if (!jobData.location) confidence -= 0.03;

  if (!jobData.contact) confidence -= 0.03;

  // -------------------------
  // STABILITY
  // -------------------------

  confidence =
    Math.max(
      0.50,
      Math.min(0.95, confidence)
    );

  return confidence;
}

module.exports = {
  scoreConfidence
};
