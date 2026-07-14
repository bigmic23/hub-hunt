function decide(job, scoreData) {

  const score = scoreData?.score || 0;

  if (score >= 800) {
    return {
      action: "ACCEPT",
      label: "🔥 HIGH MATCH",
      reason: "Strong job fit with high opportunity value"
    };
  }

  if (score >= 600) {
    return {
      action: "REVIEW",
      label: "⚠️ MEDIUM MATCH",
      reason: "Moderate opportunity, manual review recommended"
    };
  }

  return {
    action: "REJECT",
    label: "❌ LOW MATCH",
    reason: "Low alignment with user profile"
  };
}

module.exports = { decide };
