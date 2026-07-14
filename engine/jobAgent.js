const AI = require("../services/recruiterAI");

async function runJobAgent({
  userId,
  text,
  state,
  ctx,
  session,
  jobService
}) {
  console.log("🤖 AUTONOMOUS AGENT ACTIVE");

  const memory = state.data || {};

  // STEP 1: AI UNDERSTANDS EVERYTHING
  const result = await AI.analyzeJobIntent(text, memory);

  const data = result.data || {};
  const confidence = result.confidence || 0;
  const intent = result.intent; // "save" | "update" | "ignore"

  const merged = {
    ...memory,
    ...data
  };

  console.log("INTENT:", intent);
  console.log("CONFIDENCE:", confidence);

  // STEP 2: DECISION ENGINE

  // CASE 1: IGNORE (not job-related)
  if (intent === "ignore") {
    return null;
  }

  // CASE 2: AUTO SAVE (high confidence)
  if (intent === "save" && confidence >= 0.8) {
    await jobService.createJob({
      telegram_id: userId,
      ...merged,
      status: "APPLIED"
    });

    await session.clearSession(userId);

    return {
      reply: "💼 Saved automatically by AI agent"
    };
  }

  // CASE 3: UPDATE MEMORY ONLY
  await session.updateSession(userId, {
    step: "AGENT",
    data: merged
  });

  // STEP 3: NO QUESTIONS BY DEFAULT
  return {
    reply: null
  };
}

module.exports = {
  runJobAgent
};
