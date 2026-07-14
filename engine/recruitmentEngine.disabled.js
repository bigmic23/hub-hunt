const { analyzeJob } = require("../services/recruiterAI");
const { detectMissingFields } = require("./rules/missingFields");

async function processRecruitment({
  userId,
  text,
  state,
  sessionService,
  jobService
}) {
  const session = state?.data || {};
  const step = state?.step;
  const lastQuestion = state?.lastQuestion;

  const isReview = step === "REVIEW";

  /**
   * STEP 1 — HANDLE REVIEW FIRST
   */
  if (isReview && lastQuestion) {
    session[lastQuestion] = text;

    const missing = detectMissingFields(session);

    await sessionService.updateSession(userId, {
      data: session,
      step: missing.length ? "REVIEW" : "DONE",
      lastQuestion: missing[0] || null
    });

    if (missing.length) {
      return {
        reply: `🤖 Quick check: what is the ${missing[0]}?`,
        nextStep: "REVIEW"
      };
    }

    await jobService.createJob({ userId, ...session });

    return {
      reply: "✅ Job saved successfully!",
      nextStep: "DONE"
    };
  }

  /**
   * STEP 2 — AI PARSE ONLY FOR NEW INPUT
   */
  const ai = await analyzeJob({ text });

  const validated = ai.data;

  /**
   * STEP 3 — MERGE SAFE STATE
   */
  const merged = {
    company: session.company ?? validated.company ?? null,
    role: session.role ?? validated.role ?? null,
    location: session.location ?? validated.location ?? null,
    salary: session.salary ?? validated.salary ?? null,
    contact: session.contact ?? validated.contact ?? null,
    notes: session.notes ?? validated.notes ?? null
  };

  /**
   * STEP 4 — DETECT MISSING
   */
  const missing = detectMissingFields(merged);

  /**
   * STEP 5 — SAVE SESSION
   */
  await sessionService.updateSession(userId, {
    data: merged,
    step: missing.length ? "REVIEW" : "DONE",
    lastQuestion: missing[0] || null
  });

  /**
   * STEP 6 — RESPONSE
   */
  if (missing.length) {
    return {
      reply: `🤖 Quick check: what is the ${missing[0]}?`,
      nextStep: "REVIEW"
    };
  }

  return {
    reply: "✅ Job saved successfully!",
    nextStep: "DONE"
  };
}

module.exports = { processRecruitment };
