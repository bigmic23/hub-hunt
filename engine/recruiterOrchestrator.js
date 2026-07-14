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

  const location =
    /\bremote\b/i.test(clean)
      ? "Remote"
      : /\bhybrid\b/i.test(clean)
      ? "Hybrid"
      : /\bon[- ]?site\b/i.test(clean)
      ? "On-site"
      : "";

  let title = clean
    .replace(/\bremote\b/ig, "")
    .replace(/\bhybrid\b/ig, "")
    .replace(/\bon[- ]?site\b/ig, "")
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

// SALARY CHECK
if (!salary) {
  missingFields.push("salary");
}

    // SIMPLE RESPONSE LOGIC (STABLE FOR TESTING)
    return {
  nextStep: missingFields.length ? "INPUT" : "DONE",

  data: {
    title: merged.title,
    salary: merged.salary,
    location: merged.location
  },

  reply:
    missingFields.length
      ? `⚠️ Missing: ${missingFields.join(", ")}`
      : `✅ Saved

📌 Title: ${merged.title}
📍 Location: ${merged.location}
💰 Salary: ${merged.salary}`
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
