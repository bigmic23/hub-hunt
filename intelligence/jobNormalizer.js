const crypto = require("crypto");

console.log("🔥 PARSER ACTIVE: jobNormalizer.js");

function generateId(text) {
  return crypto.createHash("md5").update(text).digest("hex");
}

function capitalize(v) {
  return v
    ? v.charAt(0).toUpperCase() + v.slice(1).toLowerCase()
    : "";
}

/*
ORDER:
1 role line
2 heading line
3 fallback
NEVER CTA
*/

function clean(v = "") {
  return String(v)
    .replace(/^[-•*]\s*/, "")
    .replace(/[🚨📧💌📍💼‼️]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function isCtaLine(v = "") {
  return (
    /apply|send your cv|send cv|send resume|email|portfolio|contact|@|http/i
      .test(v)
  );
}

function isNoise(v = "") {
  return (
    /^[-•]/.test(v) ||
    /requirement|responsibilit|benefit|deadline/i.test(v)
  );
}

function isRole(v = "") {
  return (
    /(developer|engineer|intern|support|assistant|manager|analyst|designer|officer|representative|customer service|frontend|backend|wordpress|seo|social media)/i
      .test(v)
  );
}

function scoreTitle(line = "") {
  let score = 0;

  const v = clean(line);

  if (!v) return -999;

  if (isCtaLine(v)) score -= 100;
  if (isNoise(v)) score -= 50;

  if (isRole(v)) score += 80;

  if (v.length >= 8 && v.length <= 60)
    score += 15;

  if (/^[A-Z]/.test(v))
    score += 10;

  if (
    /hiring|vacancy|position|opening/i.test(v)
  )
    score += 20;

  return score;
}

function extractBestTitle(lines) {
  let best = "";
  let bestScore = -999;

  for (const raw of lines) {
    const line = clean(raw);

    const score = scoreTitle(line);

    if (score > bestScore) {
      bestScore = score;
      best = line;
    }
  }

  if (bestScore < 20)
    return "Unknown Role";

  best = best
    .replace(
      /^.*?(hiring|vacancy|position)[:\-\s]*/i,
      ""
    )
    .trim();

  return best;
}

function normalizeJob(rawText) {
  const text =
    String(rawText || "").trim();

  const lines =
    text
      .split("\n")
      .map(clean)
      .filter(Boolean);

  const title =
    extractBestTitle(lines);

  const cityMatch =
    text.match(
      /lekki|ikeja|yaba|surulere|victoria island|ajah|lagos|abuja|ibadan|port harcourt|kano|enugu|ogun/i
    );

  const city =
    cityMatch
      ? capitalize(cityMatch[0])
      : "Unknown";

  const email =
    text.match(
      /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i
    );

  let salary = 0;
  const cleaned = text.replace(/\d+\s*[-\u2013]\s*\d+\s*(years|yrs|months)/gi, "");
  const range = cleaned.match(/[\u20a6#]\s*([\d,]+)\s*[-\u2013]\s*[\u20a6#]?\s*([\d,]+)/);
  const noDate = cleaned.replace(/\b(19|20)\d{2}\b/g, ""); const single = noDate.match(/(?:salary|pay)[^\d]*(\d{2,}[,\d]*)/i) || noDate.match(/[\u20a6N]\s*(\d[\d,]+)/i);

  if (range) {
    salary = Math.round((Number(range[1].replace(/,/g, "")) + Number(range[2].replace(/,/g, ""))) / 2);
  } else if (single) {
    salary = Number(single[1].replace(/,/g, ""));
  }

  return {
    id: generateId(text),
    title,
    city,

    mode:
      /remote/i.test(text)
        ? "Remote"
        : /hybrid/i.test(text)
        ? "Hybrid"
        : "Onsite",

    salary,

    applyLink:
      email
        ? email[0]
        : null,

    raw: text
  };
}

module.exports = {
  normalizeJob
};
