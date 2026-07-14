function mergeJobStructure(structuredJob = {}) {
  const roles = structuredJob.roles || [];

  if (!roles.length) {
    return {
      ...structuredJob,
      title: structuredJob.title || null,
      roleCount: 0,
      merged: false
    };
  }

  // normalize roles
  const titles = roles
    .map(r => (typeof r === "string" ? r : r.title))
    .filter(Boolean);

  const confidences = roles
    .map(r => r.confidence || 50)
    .filter(Boolean);

  const avgConfidence =
    confidences.reduce((a, b) => a + b, 0) /
    (confidences.length || 1);

  return {
    ...structuredJob,

    title: titles.join(" / "),

    roles: titles.map(t => ({
      title: t,
      confidence: avgConfidence
    })),

    roleCount: titles.length,

    confidence: Math.round(avgConfidence),

    merged: titles.length > 1
  };
}

module.exports = {
  mergeJobStructure
};
