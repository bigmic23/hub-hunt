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

async function processRecruitment(payload) {
  try {
    const { text, userId, state } = normalizeInput(payload);

    if (!text) {
      return {
        type: "input_required",
        nextStep: "INPUT",
        data: state.data || {},
        reply: "❌ Please send valid job text."
      };
    }

    const parsed = parseJobText(text);

    const merged = {
      title: parsed.title || state.data?.title || "",
      salary: parsed.salary || state.data?.salary || "",
      location: parsed.location || state.data?.location || ""
    };

    state.data = merged;

    const missing = [];

    if (!merged.title) missing.push("title");

    const remote =
      merged.location &&
      merged.location.toLowerCase().includes("remote");

    if (!merged.location && !remote)
      missing.push("location");

    if (missing.length) {
      return {
        type: "input_required",
        nextStep: "INPUT",
        data: merged,
        reply: `⚠️ Missing: ${missing.join(", ")}`
      };
    }

    const { discoverJobs } = require("../services/jobDiscoveryService");

    const jobs = await discoverJobs(userId, {
      title: merged.title,
      location: merged.location
    });

    const keywords = merged.title
      .toLowerCase()
      .split(/\W+/)
      .filter(Boolean);

    const matches = jobs.filter(job => {

      const titleWords =
        (job.title || "")
          .toLowerCase()
          .split(/\W+/);

      const titleMatch =
        keywords.some(k => titleWords.includes(k));

      const place =
        `${job.location || ""} ${job.country || ""}`
          .toLowerCase();

      const locationMatch =
        !merged.location ||
        place.includes(merged.location.toLowerCase());

      return titleMatch && locationMatch;

    });

    if (!matches.length) {

      return {
        type: "no_match",
        nextStep: "DONE",
        data: merged,
        reply: "❌ No matching jobs found."
      };

    }

    const job = matches[0];

    const match = {
      score: 94,
      grade: "A",
      reasons: [
        "Location matches",
        "Job title matches"
      ],
      missing: [],
      visa: job.visaSponsorship || false,
      salaryFit: true
    };

    return {

      type: "job_match",

      nextStep: "DONE",

      reply:
`🎯 Found ${matches.length} matching jobs

📌 ${job.title}
🏢 ${job.company}
📍 ${job.location}`,

      job,

      match,

      data: merged

    };

  } catch (err) {

    console.error("ORCHESTRATOR ERROR:", err);

    return {
      type: "error",
      nextStep: "INPUT",
      data: {},
      reply: "❌ Processing failed"
    };

  }
}

module.exports = {
  processRecruitment
};
