function decide(job, scoreData) {
  const score = scoreData.score;

  if (score >= 850) {
    return {
      action: "APPLY_NOW",
      reason:
        "High score, strong salary and complete job details."
    };
  }

  if (score >= 700) {
    return {
      action: "REVIEW_FIRST",
      reason:
        `Good ${job.mode} role in ${job.city}. Verify company legitimacy and requirements.`
    };
  }

  return {
    action: "SAVE",
    reason:
      "Save for later. Better opportunities may exist."
  };
}

module.exports = { decide };
