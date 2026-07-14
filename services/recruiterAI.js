function analyzeJob({ text }) {
  const result = {
    company: null,
    role: null,
    location: null,
    salary: null,
    contact: null,
    notes: null
  };

  const clean = String(text || "").trim();

  // role + company
  const match = clean.match(/(.+?)\s+at\s+(.+)/i);
  if (match) {
    result.title = match[1].trim();
    result.location = match[2].trim();
    result.salary = match[3]?.trim() || null;
  } else {
    result.role = clean;
  }

  // location
  if (/remote/i.test(clean)) {
    result.location = "Remote";
  }

  // salary
  if (/₦|\$|\d{3,}/.test(clean)) {
    result.salary = clean.replace(/[₦,]/g, "").trim();
  }

  return {
    data: result,
    confidence: 0.9,
    intent: "recruiter"
  };
}

module.exports = { analyzeJob };
