const recruiter = require("./recruiter");
const candidate = require("./candidate");

async function route(payload) {
  const text = String(payload.text || "").toLowerCase();

  // Recruiter intent
  if (
    text.includes("hire") ||
    text.includes("recruit") ||
    text.includes("vacancy") ||
    text.includes("job description")
  ) {
    return recruiter.process(payload);
  }

  // Default → candidate
  return candidate.process(payload);
}

module.exports = {
  route
};
