function normalizeInput(payload = {}) {
  const text = typeof payload.text === "string" ? payload.text : "";
  const userId = String(payload.userId || "");
  const state = payload.state || {};

  return { text, userId, state };
}

function parseJobText(text = "") {
  const clean = String(text).trim();

  const salaryMatch =
    clean.match(/salary\s*:?\s*(\d+)/i) ||
    clean.match(/\b(\d{4,7})\b/);

  const locationMatch = clean.match(
    /\b(?:in|at)\s+([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)*)/i
  );

  let location = "";

  if (/\bremote\b/i.test(clean)) {
    location = "Remote";
  } else if (/\bhybrid\b/i.test(clean)) {
    location = "Hybrid";
  } else if (/\bon[- ]?site\b/i.test(clean)) {
    location = "On-site";
  } else if (locationMatch) {
    location = locationMatch[1];
  }

  let title = clean
    .replace(/\b(i need|looking for|searching for|find me)\b/ig, "")
    .replace(/\b(remote|hybrid|on[- ]?site)\b/ig, "")
    .replace(/\b(?:in|at)\s+[A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)*/ig, "")
    .replace(/salary\s*:?\s*\d+/ig, "")
    .replace(/\b\d{4,7}\b/g, "")
    .replace(/\s+/g, " ")
    .trim();

  return {
    title,
    salary: salaryMatch?.[1] || "",
    location
  };
}

// MAIN ENTRY (THIS IS WHAT BOT CALLS)
async function processRecruitment(payload) {
  try {
    const { text, userId, state } = normalizeInput(payload);

    if (!text) {
      return {
        nextStep: "INPUT",
        data: state.data || {},
        reply: "❌ Please send valid job text."
      };
    }

    const lowerText = String(text || "").toLowerCase(); // FIXES YOUR CRASH SAFELY

    console.log("🧠 ORCHESTRATOR ACTIVE");
    console.log("📌 [INPUT]", text);
    console.log("📌 [STATE]", state);

    // STEP 1: Extract job info (safe placeholder logic)
const parsed = parseJobText(text);

const merged = {
  title: parsed.title || state.data?.title || "",
  salary: parsed.salary || state.data?.salary || "",
  location: parsed.location || state.data?.location || ""
};

const missingFields = [];

const location = String(merged.location || "").trim().toLowerCase();
const salary = String(merged.salary || "").trim();
const title = String(merged.title || "").trim();
state.data = {
  title: merged.title,
  salary: merged.salary,
  location: merged.location
};

// LOCATION CHECK (only required if not remote job)
const isRemote = location.includes("remote");

if (!location && !isRemote) {
  missingFields.push("location");
}

// TITLE CHECK
if (!title) {
  missingFields.push("title");
}

// Salary is optional
if (!salary) {
  merged.salary = "Negotiable";
}

    // SIMPLE RESPONSE LOGIC
if (missingFields.length) {
  return {
    nextStep: "INPUT",
    data: merged,
    reply: `⚠️ Missing: ${missingFields.join(", ")}`
  };
}

const { discoverJobs } = require("../services/jobDiscoveryService");

const jobs = await discoverJobs(userId);

console.log("TOTAL JOBS:", jobs.length);

if (jobs.length) {
  console.log("FIRST JOB:", JSON.stringify(jobs[0], null, 2));
}

const keywords = merged.title
  .toLowerCase()
  .replace(/\b(a|an|the|job|jobs|need|looking|for)\b/g, "")
  .split(/\W+/)
  .filter(Boolean);

const matches = jobs.filter(job => {
  const titleWords = (job.title || "")
    .toLowerCase()
    .split(/\W+/);

  const titleMatch = keywords.some(k => titleWords.includes(k));

  const place =
    `${job.location || ""} ${job.country || ""}`.toLowerCase();

  const locationMatch =
    !merged.location ||
    place.includes(merged.location.toLowerCase());

  console.log("QUERY LOCATION:", merged.location);
  console.log("JOB PLACE:", place);

  console.log({
  title: job.title,
  titleMatch,
  locationMatch
});

return titleMatch && locationMatch;
});

if (!matches.length) {
  return {
    nextStep: "DONE",
    data: merged,
    reply: "❌ No matching jobs found."
  };
}

return {
  nextStep: "DONE",
  data: merged,
  reply:
`🎯 Found ${matches.length} matching jobs

📌 ${matches[0].title}
🏢 ${matches[0].company}
📍 ${matches[0].location}`
};

} catch (err) {
    console.error("ORCHESTRATOR ERROR:", err);

    return {
      nextStep: "INPUT",
      data: {},
      reply: "❌ Processing failed"
    };
  }
}

module.exports = {
  processRecruitment
};
