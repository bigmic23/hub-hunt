function analyzeRecruitment({ text = "" }) {
  text = String(text);

  const extract = (regex) => text.match(regex)?.[0] || null;

  const data = {
    company: extract(/at\s+([a-z0-9 &]+)/i),
    role: extract(/(developer|engineer|manager|intern|role|position)/i),
    location: extract(/remote|onsite|hybrid/i),
    salary: extract(/\d{3,}/),
    contact: extract(/[^\s]+@[^\s]+\.[^\s]+/),
    notes: text
  };

  const filled = Object.values(data).filter(Boolean).length;

  return {
    data,
    confidence: filled / 5
  };
}

module.exports = { analyzeRecruitment };
