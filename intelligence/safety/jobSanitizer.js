function isScamPattern(text = "") {
  const t = text.toLowerCase();

  const redFlags = [
    "send cv to gmail",
    "urgent hiring",
    "no interview",
    "work from home easy money",
    "registration fee",
    "pay to apply",
    "whatsapp only",
    "no experience required",
    "immediate start"
  ];

  let hits = 0;

  for (const flag of redFlags) {
    if (t.includes(flag)) hits++;
  }

  return hits >= 2;
}

function sanitizeJob(job = {}) {
  if (!job) return null;

  const raw = job.raw || job.title || "";

  if (isScamPattern(raw)) {
    return {
      ...job,
      blocked: true,
      reason: "SCAM_PATTERN_DETECTED"
    };
  }

  return {
    ...job,
    blocked: false
  };
}

module.exports = {
  sanitizeJob
};
