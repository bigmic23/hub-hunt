const { analyzeJob } = require("../../services/recruiterAI");
const { mergeState } = require("./mergeState");
const { detectMissingFields } = require("./detectMissingFields");
const { handleReviewAnswer } = require("./reviewHandler");

async function processRecruitment({
  userId,
  text,
  state,
  session: sessionService,
  jobService,
  identityEngine
}) {
  const sessionData = state?.data || {};
  const step = state?.step;

  // 1. AI parse
  const aiResult = await analyzeJob({
    text,
    userId,
    state
  });

  // 2. merge
  let merged = mergeState(sessionData, aiResult?.data || {});

  // 3. fix review answer
  merged = handleReviewAnswer(state, text, merged);

  // 4. detect missing
  const missing = detectMissingFields(merged);

  // 5. save session
  await sessionService.updateSession(userId, {
    data: merged,
    step: missing.length ? "REVIEW" : "DONE",
    lastQuestion: missing[0] || null,
    intent: aiResult.intent
  });

  // 6. ask next question
  if (missing.length) {
    identityEngine.updateIdentity(userId, {
      intent: "recruiter",
      outcome: "collecting"
    });

    return {
      reply: `🤖 Quick check: what is the ${missing[0]}?`,
      nextStep: "REVIEW"
    };
  }

  // 7. finalize
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

module.exports = { processRecruitment };
