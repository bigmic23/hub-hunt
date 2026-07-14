function detectMode(text) {
  const t = text.toLowerCase();

  if (t.includes("remote")) return "Remote";
  if (t.includes("hybrid")) return "Hybrid";
  if (t.includes("on-site") || t.includes("onsite")) return "On-site";

  return "Unknown";
}

module.exports = { detectMode };
