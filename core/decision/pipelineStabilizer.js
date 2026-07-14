function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

/**
 * Prevent runaway scoring (your current biggest bug)
 */
function normalizeScore(score = 0) {
  if (typeof score !== "number" || isNaN(score)) return 0;

  // hard cap
  return clamp(score, 0, 1000);
}

/**
 * Prevent unstable APPLY decisions
 */
function stabilizeDecision(recommendation, score) {
  const s = normalizeScore(score);

  // force REVIEW band around middle zone
  if (s >= 400 && s <= 650) {
    return {
      action: "REVIEW",
      label: "⚠️ REVIEW (STABLE)",
      reason: "Score in uncertainty band"
    };
  }

  // hard gate low quality jobs
  if (s < 250) {
    return {
      action: "DROP",
      label: "❌ DROP (LOW CONFIDENCE)",
      reason: "Below minimum threshold"
    };
  }

  // allow APPLY only if strong signal
  if (s > 650) {
    return {
      action: "APPLY",
      label: "🔥 APPLY (HIGH CONFIDENCE)",
      reason: "Strong signal confirmed"
    };
  }

  return recommendation;
}

/**
 * Fix memory explosion issues
 */
function stabilizeMemoryWeights(weights = {}) {
  const cleaned = {};

  for (const k in weights) {
    const v = weights[k];

    if (typeof v !== "number" || isNaN(v)) continue;

    // prevent runaway learning
    cleaned[k] = clamp(v, 0.2, 5);
  }

  return cleaned;
}

module.exports = {
  normalizeScore,
  stabilizeDecision,
  stabilizeMemoryWeights
};
