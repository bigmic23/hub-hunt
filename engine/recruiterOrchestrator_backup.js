const session = require("../sessions/jobsSession");
const jobService = require("../services/jobService");
const identityEngine = require("../services/identityEngine");
const { analyzeJob } = require("../services/recruiterAI");

/**
 * SIMPLE HELPERS
 */
function validateJob(data) {
  return {
    company: data.company || null,
    role: data.role || null,
    location: data.location || null,
    salary: data.salary || null,
    contact: data.contact || null,
    notes: data.notes || null
  };
}

function autoRepairJob(job) {
  if (job.role && job.role.includes(" at ") && !job.company) {
    const parts = job.role.split(" at ");
    job.role = parts[0].trim();
    job.company = parts[1].trim();
  }

  return job;
}

function detectMissingFields(job) {
  const required = ["company", "role", "location", "salary", "contact"];
  return required.filter((f) => !job[f]);
}

/**
 * MAIN ORCHESTRATOR
 */
async function processRecruitment({
  userId,
  text,
  state,
  ctx,
  session: sessionService,
  jobService,
  inputAI
}) {

  console.log("🧠 ORCHESTRATOR ACTIVE");
  console.log("🚀 ORCH INPUT RECEIVED:", text);

  const sessionData = state?.data || {};
  const step = state?.step || null;
  const lastQuestion = state?.lastQuestion || null;

  const isReviewMode = step === "REVIEW";

if (state?.step && text) {
  const step = state.step;
  const input = text.trim();

  state.step = null;

  if (step === "company") state.data.company = input;
  if (step === "role") state.data.role = input;
  if (step === "location") state.data.location = input;
  if (step === "salary") state.data.salary = input;
  if (step === "contact") state.data.contact = input;
}
  /**
   * STEP 1 — AI ONLY WHEN NOT IN REVIEW MODE
   */
  let aiResult;

const isSingleField =
  /^[₦$]?\d+/.test(text) || text.length < 25;

// STEP 1 — if session already knows context, trust session first
if (isSingleField && state?.data) {
  aiResult = {
    data: {},
    confidence: 0.3,
    intent: state.intent || "recruiter"
  };
} else {
  aiResult = await analyzeJob({
    text,
    userId,
    state
  });
}

  console.log("🤖 AI RESULT:", aiResult);

  /**
   * STEP 2 — VALIDATION + REPAIR
   */
  const validatedRaw = validateJob(aiResult.data);
  let validated = autoRepairJob(validatedRaw);

  console.log("🧪 VALIDATED:", validated);

  /**
   * FIX: remove "role at company" leakage
   */
  if (validated.role && validated.role.includes(" at ") && validated.company) {
    validated.role = validated.role.replace(/at\s+.*/i, "").trim();
  }

  /**
   * STEP 3 — REVIEW PATCH INPUT
   */
  let updated = {};

  if (isReviewMode && lastQuestion) {
    updated[lastQuestion] = text;
  }

  /**
   * STEP 4 — MERGE STATE (SINGLE SOURCE OF TRUTH)
   */
  const merged = {
  company: validated.company ?? state?.data?.company ?? null,
  role: validated.role ?? state?.data?.role ?? null,
  location: validated.location ?? state?.data?.location ?? null,
  salary: validated.salary ?? state?.data?.salary ?? null,
  contact: validated.contact ?? state?.data?.contact ?? null,
  notes: validated.notes ?? state?.data?.notes ?? null
};

// 🔥 FORCE APPLY LAST USER INPUT (THIS IS WHAT YOU ARE MISSING)
if (state?.lastQuestion && text) {
  merged[state.lastQuestion] = text;
}

  // prevent wrong field injection
  const isClean =
    !(value.includes(" at ") || value.length > 40);

  if (isClean) {
    merged[lastQuestion] = value;
  }
}

  console.log("🔗 MERGED STATE:", merged);

  /**
   * STEP 5 — DETECT MISSING FIELDS
   */
  const missingFields = [];

if (!merged.company) missingFields.push("company");
if (!merged.role) missingFields.push("role");

if (
  !merged.location &&
  !String(merged.role || "").toLowerCase().includes("remote")
) {
  missingFields.push("location");
}

if (!merged.salary) missingFields.push("salary");

  console.log("📌 MISSING FIELDS:", missingFields);

  // STEP 6 X
  const isReviewAnswer =
    state?.step === "REVIEW" && state?.lastQuestion;

  if (isReviewAnswer && text) {
    merged[state.lastQuestion] = text;
  }

  await sessionService.updateSession(userId, {
    data: merged,
    step: missingFields.length ? "REVIEW" : "DONE",
    lastQuestion: missingFields[0] || null,
    intent: aiResult.intent
  });

  /**
   * STEP 7 — REVIEW ENGINE RESPONSE
   */
  if (missingFields.length > 0) {
    identityEngine.updateIdentity(userId, {
      intent: "recruiter",
      outcome: "collecting"
    });

    return {
      reply: `🤖 Quick check: what is the ${missingFields[0]}?`,
      nextStep: "REVIEW"
    };
  }

  /**
   * STEP 8 — FINAL SAVE
   */
  await jobService.createJob({
    userId,
    ...merged
  });

  identityEngine.updateIdentity(userId, {
    intent: "recruiter",
    outcome: "completed"
  });

  return {
    reply: "✅ Job saved successfully!",
    nextStep: "DONE"
  };
}

console.log("🧾 ORCH EXIT REACHED");

module.exports = {
  processRecruitment
};
