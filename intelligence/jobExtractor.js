const crypto = require("crypto");

function extractJobTitle(text = "") {
  const lines = String(text)
    .split("\n")
    .map(l => l.trim())
    .filter(Boolean);

  const blacklist = /hiring|vacancy|apply|send|cv|email|📧|💌|remote|full[- ]time|part[- ]time/i;

  let best = "";
  let bestScore = 0;

  for (const line of lines) {
    if (line.length < 4 || line.length > 80) continue;
    if (blacklist.test(line)) continue;
    if (!/[a-zA-Z]/.test(line)) continue;

    let score = 0;

    if (/(developer|engineer|designer|intern|manager|analyst|support|assistant|officer)/i.test(line)) score += 5;
    if (/^[A-Z]/.test(line)) score += 2;
    if (line.length >= 10 && line.length <= 60) score += 2;

    if (score > bestScore) {
      bestScore = score;
      best = line.replace(/^[-•*\s]+/, "").trim();
    }
  }

  return bestScore >= 4 ? best : "";
}

function extractLocation(text = "") {
  const t = text.toLowerCase();

  if (t.includes("remote")) return "Remote";
  if (t.includes("lagos")) return "Lagos, Nigeria";
  if (t.includes("abuja")) return "Abuja, Nigeria";
  if (t.includes("ikeja")) return "Ikeja, Lagos";

  return "Nigeria";
}

function extractApplyLink(text = "") {
  const email = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,}/);
  if (email) return email[0];

  const url = text.match(/https?:\/\/[^\s]+/);
  if (url) return url[0];

  return null;
}

function extractSalary(text = "") {
  const range = text.match(/₦\s?([\d,]+)\s*[-–]\s*₦?\s?([\d,]+)/);
  if (range) {
    const min = Number(range[1].replace(/,/g, ""));
    const max = Number(range[2].replace(/,/g, ""));
    return Math.round((min + max) / 2);
  }

  const single = text.match(/₦\s?([\d,]{4,})/);
  if (single) return Number(single[1].replace(/,/g, ""));

  return 0;
}

module.exports = {
  extractJobTitle,
  extractLocation,
  extractApplyLink,
  extractSalary
};
