function parseSalary(text = "") {
  const match = text.match(/₦\s?([\d,]+)\s*-\s*₦?\s?([\d,]+)/i);
  if (!match) return 0;

  const min = Number(match[1].replace(/,/g, ""));
  const max = Number(match[2].replace(/,/g, ""));

  return Math.round((min + max) / 2);
}

function normalizeText(text) {
  return text
    .replace(/\r/g, "")
    .replace(/[ \t]+/g, " ")
    .trim();
}

function extractTitleCandidates(text) {
  return text
    .split("\n")
    .map(l => l.trim())
    .filter(l => l.length > 3);
}

function extractLocation(text = "") {
  if (/ajah/i.test(text)) return "Ajah, Lagos";
  if (/ibeju/i.test(text)) return "Ibeju-Lekki, Lagos";
  if (/lagos/i.test(text)) return "Lagos";
  return "Unknown";
}

function scoreTitle(line) {
  let score = 0;

  if (!line) return -999;

  // BAD signals
  if (/apply|cv|portfolio|email|send|💌|📧/i.test(line)) score -= 10;
  if (/hiring|job|🚨/i.test(line)) score -= 2;

  // GOOD signals
  if (/^[A-Z][a-zA-Z ]{3,}$/.test(line)) score += 4;
  if (line.length >= 8 && line.length <= 60) score += 3;
  if (/developer|engineer|designer|intern|manager/i.test(line)) score += 6;

  return score;
}

module.exports = {
  parseSalary,
  extractLocation
};
