function extractProfileFromCV(text) {
  const lower = text.toLowerCase();

  const skillKeywords = [
    "excel", "word", "outlook", "crm", "data entry",
    "customer support", "customer experience", "customer service",
    "communication", "complaint resolution", "escalation",
    "reporting", "documentation", "administrative",
    "operations", "virtual assistant", "sales",
    "patient care", "health", "social care", "first aid",
    "mental health", "dementia", "nlp", "emotional intelligence",
    "inbound", "outbound", "contact handling", "ticketing"
  ];

  const skills = skillKeywords.filter(skill => lower.includes(skill));

  const salaryMatch = text.match(/(\d{5,7})/);
  const salaryExpectation = salaryMatch ? Number(salaryMatch[1]) : 0;

  const remote = /remote/i.test(text);
  const lagos = /lagos/i.test(text);

  const roleKeywords = [
    "personal assistant", "executive assistant", "office assistant",
    "customer service", "customer support", "healthcare assistant",
    "administrative", "operations", "virtual assistant",
    "social worker", "care worker", "data entry"
  ];
  const roles = roleKeywords.filter(role => lower.includes(role));

  return {
    skills,
    roles,
    salaryExpectation,
    remote,
    lagos,
    experienceLevel: /5|6|7|8|9|10/.test(text) ? "mid" : "entry",
    raw: text
  };
}

module.exports = { extractProfileFromCV };
