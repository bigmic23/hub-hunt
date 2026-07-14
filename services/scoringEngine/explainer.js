function explainScore(job, scoreData) {
  const reasons = [];

  if (job.city === "Lagos") {
    reasons.push("✔ Location match (Lagos)");
  }

  if (job.salary > 100000) {
    reasons.push("✔ Salary meets threshold");
  } else {
    reasons.push("⚠ Low salary band");
  }

  if (job.title.match(/engineer|analyst|officer/i)) {
    reasons.push("✔ Strong role relevance");
  }

  return reasons;
}

function formatExplanation(reasons) {
  return `🧠 Why this score:\n\n` + reasons.map(r => `• ${r}`).join("\n");
}

module.exports = { explainScore, formatExplanation };
