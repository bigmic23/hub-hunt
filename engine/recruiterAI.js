function analyzeJob({ text }) {
  const result = {
    company: null,
    role: null,
    location: null,
    salary: null
  };

  const match = text.match(/(.+?)\s+at\s+(.+)/i);

  if (match) {
    result.title = match[1].trim();
    result.location = match[2].trim();
    result.salary = match[3]?.trim() || null;
  } else {
    result.role = text;
  }

  if (/remote/i.test(text)) {
    result.location = "Remote";
  }

  if (/₦|\$|\d{3,}/.test(text)) {
    result.salary = text.replace(/[₦,]/g, "").trim();
  }

  return {
    data: result,
    confidence: 0.9,
    intent: "recruiter"
  };
}

module.exports = { analyzeJob };

