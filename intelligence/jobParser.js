function generateId(text) {
  return require("crypto")
    .createHash("md5")
    .update(text)
    .digest("hex");
}

function collapseToSingleJobBlock(text) {
  const blocks = text
    .split(/\n\s*\n/) // split by paragraph
    .map(b => b.trim())
    .filter(Boolean);

  // keep only meaningful blocks
  const filtered = blocks.filter(b => {
    const lower = b.toLowerCase();

    return (
      b.length > 25 &&
      !lower.includes("requirements:") &&
      !lower.includes("qualifications:") &&
      !lower.includes("perks") &&
      !lower.startsWith("apply")
    );
  });

  // FORCE SINGLE SOURCE OF TRUTH
  return filtered.join("\n");
}

function normalizeJob(rawText) {
  const text = collapseToSingleJobBlock(String(rawText || "").trim());

  if (!text) {
    return emptyJob(text);
  }

  const rawLines = text
  .split("\n")
  .map(l => l.trim())
  .filter(Boolean)

function collapseSegments(lines) {
  return lines
    .map(l => l.trim())
    .filter(Boolean)
    .filter(l =>
      l.length > 8 &&                         // NOT 20 (too strict)
      !/^requirements|perks|apply|open positions|qualifications/i.test(l)
    )
    .slice(0, 8);                             // allow more context
}

const lines = collapseSegments(rawLines);

  const clean = (s) =>
    String(s || "")
      .replace(/^[-•*]\s*/, "")
      .replace(/\s+/g, " ")
      .trim();

  // 1. explicit patterns
const ROLE_WORDS =
/developer|engineer|intern|manager|analyst|officer|assistant|support|designer|admin|representative|coordinator|corps member/i;

const BAD_TITLE =
/hiring|recruitment|vacancy|consulting|apply|requirements|benefits|location|salary/i;

titleLine =
  lines.find(line => {
    const l = clean(line).toLowerCase();

    return (
      ROLE_WORDS.test(l) &&
      !BAD_TITLE.test(l)
    );
  });

if (!titleLine) {
  titleLine =
    lines.find(line => {
      const l = clean(line).toLowerCase();

      return (
        l.length > 8 &&
        !BAD_TITLE.test(l)
      );
    }) ||
    "";
}

// 2. first meaningful line
if (!titleLine) {
  titleLine = lines.find(l => /[a-zA-Z]{3,}/.test(l));
}

// 3. longest meaningful line fallback
if (!titleLine) {
  titleLine = lines
    .slice()
    .sort((a, b) => b.length - a.length)[0];
}

// CLEAN TITLE
let title = clean(titleLine || "");

title = title
.replace(/^hiring[:\-\s]*/i, "")
.replace(/\(remote\)/ig, "")
.replace(/\*/g, "")
.trim();

if (
/recruitment|consulting/i.test(title)
) {
title =
lines.find(l =>
/corps member/i.test(l)
) || "Unknown Role";
}

/* =========================
   STEP 2 — HARD TITLE FILTER (COMPATIBLE VERSION)
========================= */

const BAD_TITLE = /job summary|requirements|perks|apply|open positions|qualifications|job type|location:|salary:/i;

// 1. strong signal line
const ROLE_WORDS =
/developer|engineer|assistant|support|officer|intern|analyst|manager|designer|representative|corps member|graduate/i;

titleLine =
  lines.find(l =>
    ROLE_WORDS.test(l.toLowerCase()) &&
    !/recruitment|consulting|vacancy|hiring/i.test(l.toLowerCase())
  );

// 2. fallback meaningful line
if (!titleLine || BAD_TITLE.test(titleLine)) {
  titleLine =
    lines.find(l =>
      l.length > 20 &&
      !BAD_TITLE.test(l)
    ) ||
    lines[0];
}

// 3. final enforcement
if (
  BAD_TITLE.test(title) ||
  /recruitment|consulting/i.test(title) ||
  title.length < 5
) {
  title =
    lines.find(l => ROLE_WORDS.test(l.toLowerCase()))
    || "Unknown Role";
}

const cityMatch =
  text.match(
    /lagos|abuja|ibadan|port harcourt/i
  );

const city =
  cityMatch
    ? capitalize(cityMatch[0])
    : "Unknown";

const normalizedSalary =
  text
    .replace(/[₦N#,]/gi, "")
    .replace(/incentives?:/gi, "")
    .replace(/stipend:/gi, "");

const range =
  normalizedSalary.match(
    /(\d{5,9})\s*[-–]\s*(\d{5,9})/
  );

let salary = 0;

if (range) {
  salary =
    Math.round(
      (
        Number(range[1]) +
        Number(range[2])
      ) / 2
    );
} else {

const salaryMatch =
text.match(
/(?:salary|incentives?|stipend)[^\d]*(\d{2,3},?\d{3,6})/i
);

salary =
salaryMatch
? Number(
salaryMatch[1]
.replace(/,/g,"")
)
: 0;
}

const email =
  String(rawText || "").match(
    /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i
  );

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

function emptyJob(text) {
  return {
    id: generateId(text),
    title: "EMPTY_INPUT",
    city: "Unknown",
    mode: "Onsite",
    salary: 0,
    applyLink: null,
    raw: text
  };
}

function capitalize(v) {
  if (!v) return "";
  return v.charAt(0).toUpperCase() + v.slice(1).toLowerCase();
}

function recoverTitleFromEmail(text, currentTitle) {
  if (currentTitle && currentTitle.length >= 8) return currentTitle;

  const emailMatch = text.match(
    /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/
  );

  if (!emailMatch) return currentTitle;

  // infer job intent from surrounding text
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);

  const meaningful = lines.find(l =>
    /developer|engineer|assistant|support|manager|writer|designer|hiring/i.test(l)
  );

  return meaningful || "Untitled Role";
}

module.exports = { normalizeJob };
