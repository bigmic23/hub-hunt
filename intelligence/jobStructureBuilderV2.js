function extractRoles(text = "") {
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);

  const roles = [];

  for (const line of lines) {
    // numbered roles
    const bullet = line.match(/^\d+[\.\)]\s*(.+)/);
    if (bullet) {
      roles.push({
        title: bullet[1].trim(),
        confidence: 80
      });
      continue;
    }

    // fallback role detection
    const lower = line.toLowerCase();

    if (
      line.length <= 60 &&
      /manager|assistant|officer|support|customer|admin|secretary/i.test(lower)
    ) {
      roles.push({
        title: line,
        confidence: 60
      });
    }
  }

  return roles;
}

function extractCompany(text = "") {
  const match =
    text.match(/(?:company|at)\s*[:\-]?\s*(.+)/i) ||
    text.match(/^(.+?)\s+is\s+hiring/i);

  return match ? match[1].trim().slice(0, 80) : null;
}

function extractSalary(text = "") {
  const match = text.match(/₦\s?[\d,]+|\d{2,6}\s?-\s?\d{2,6}/);
  return match ? match[0] : null;
}

function extractLocation(text = "") {
  const match = text.match(/location\s*:\s*(.+)/i);
  return match ? match[1].trim() : null;
}

function extractContact(text = "") {
  const email = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,}/);
  return email ? email[0] : null;
}

function buildJobStructure(text = "") {
  const roles = extractRoles(text);

  return {
    company: extractCompany(text),
    roles,
    salary: extractSalary(text),
    location: extractLocation(text),
    contact: extractContact(text),
    isMultiRole: roles.length > 1,
    raw: text
  };
}

module.exports = {
  buildJobStructure
};
