function normalize(text = "") {
  return text
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+/g, " ")
    .trim();
}

function extractCompany(text = "") {
  const match =
    text.match(/(?:at|@)\s*([A-Z][a-zA-Z0-9& ]{2,})/) ||
    text.match(/([A-Z][a-zA-Z0-9& ]{3,})\s+(?:is hiring|are hiring)/i);

  return match?.[1]?.trim() || null;
}

function extractCity(text = "") {
  const match = text.match(/Location:\s*([A-Za-z ,\/-]+)/i);
  return match?.[1]?.trim() || null;
}

function extractSalary(text = "") {
  const match = text.match(/₦\s?([\d,]+)/i);
  if (!match) return 0;
  return parseInt(match[1].replace(/,/g, ""), 10);
}

function extractMode(text = "") {
  if (/remote/i.test(text)) return "Remote";
  if (/onsite|on-site/i.test(text)) return "Onsite";
  return "Unknown";
}

function extractRoles(text = "") {
  const roles = [];

  // bullet roles
  const bulletRegex = /^\s*(\d+[\.\)]\s*)?(.+?)(?=\n|$)/gm;
  let m;

  while ((m = bulletRegex.exec(text)) !== null) {
    const line = m[2].trim();

    if (line.length < 3) continue;
    if (/salary|location|apply|send cv|we are|qualifications/i.test(line)) continue;

    if (
      /manager|assistant|officer|support|customer|developer|copywriter|writer|admin/i.test(line)
    ) {
      roles.push(line);
    }
  }

  return [...new Set(roles)];
}

function detectConfidence(text = "") {
  let score = 50;

  if (/we are hiring|currently hiring|vacancy/i.test(text)) score += 10;
  if (/apply|send cv/i.test(text)) score += 5;
  if (/\d+\.\s/.test(text)) score += 10;
  if (/salary|₦|range/i.test(text)) score += 10;

  return Math.min(100, score);
}

function parseJobIntent(text = "") {
  const clean = normalize(text);

  const roles = extractRoles(clean);

  const base = {
    company: extractCompany(clean),
    city: extractCity(clean),
    mode: extractMode(clean),
    salary: extractSalary(clean),
    confidence: detectConfidence(clean),
    raw: clean
  };

  if (!roles.length) {
    return [
      {
        ...base,
        title: null,
        roleCount: 0
      }
    ];
  }

  return roles.map((title) => ({
    ...base,
    title,
    roleCount: roles.length
  }));
}

module.exports = {
  parseJobIntent
};
