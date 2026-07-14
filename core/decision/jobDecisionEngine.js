function getDecision(job = {}) {
  const score = job?.score?.finalScore || 0;
  const confidence = job?.confidence || 50;
  const roleCount = job?.roleCount || 1;

  // HARD SAFETY FILTER (FINAL GATE)
  if (score < 150 && !job?.applyLink) {
    return {
      action: "DROP",
      label: "❌ LOW QUALITY JOB",
      reason: "Low score + no application channel"
    };
  }

  // penalty for noisy multi-role posts
  const complexityPenalty =
    roleCount > 2
      ? 10
      : 0;

  const adjusted =
    score - complexityPenalty;

  // HARD RULES (NO MEMORY, NO GUESSING)

  if (adjusted >= 700 && confidence >= 70) {
    return {
      action: "APPLY",
      label: "🔥 HIGH MATCH",
      reason: "Strong score + high confidence"
    };
  }

  if (adjusted >= 450) {
    return {
      action: "REVIEW",
      label: "⚠️ BORDERLINE",
      reason: "Moderate alignment or incomplete confidence"
    };
  }

  return {
    action: "DROP",
    label: "❌ LOW MATCH",
    reason: "Insufficient score signal"
  };
}

module.exports = {
  getDecision
};
