function detectJobMeta(text) {
  const lower = String(text || "").toLowerCase();

  return {
    level: lower.includes("senior") ? "senior"
      : lower.includes("junior") ? "junior"
      : lower.includes("intern") ? "intern"
      : "unknown",

    type: lower.includes("nurse") || lower.includes("health") ? "healthcare"
      : lower.includes("developer") || lower.includes("engineer") ? "tech"
      : "general",

    remote: lower.includes("remote")
  };
}

function scoreJob(text, merged) {
  let score = 50;

  const lower = text.toLowerCase();

  if (merged.company) score += 10;
  if (merged.role) score += 10;
  if (merged.salary) score += 10;
  if (merged.location) score += 5;

  if (lower.includes("remote")) score += 5;
  if (lower.includes("senior")) score += 10;
  if (lower.includes("urgent")) score += 5;

  if (!merged.salary) score -= 10;

  return Math.max(0, Math.min(100, score));
}

module.exports = {
  detectJobMeta,
  scoreJob
};
