const AI = require("../services/recruiterAI");

function cleanData(data) {
  const cleaned = {};

  for (const [k, v] of Object.entries(data || {})) {
    if (v !== null && v !== undefined && v !== "") {
      cleaned[k] = v;
    }
  }

  return cleaned;
}

async function processAIRecruiter({
  userId,
  text,
  state,
  ctx,
  session,
  jobService
}) {
  console.log("🧠 AI RECRUITER ACTIVE");

  const existing = state.data || {};

  // STEP 1: AI EXTRACT EVERYTHING
  const result = await AI.extractFullJob(text, existing);

  const data = cleanData(result.data);
  const confidence = result.confidence || 0;

  const merged = {
    ...existing,
    ...data
  };

  console.log("AI DATA:", merged);
  console.log("CONFIDENCE:", confidence);

  // STEP 2: AUTO SAVE IF HIGH CONFIDENCE
  if (confidence >= 0.85) {
    await jobService.createJob({
      telegram_id: userId,
      ...merged,
      status: "APPLIED"
    });

    await session.clearSession(userId);

    return {
      reply: `💼 Job saved automatically\nConfidence: ${confidence}`
    };
  }

  // STEP 3: KEEP SESSION FOR IMPROVEMENT
  await session.updateSession(userId, {
    step: "AI_MODE",
    data: merged
  });

  // STEP 4: AI DECIDES NEXT QUESTION
  const followUp = await AI.generateFollowUp(merged);

  return {
    reply:
      followUp ||
      "Got it. Anything else about this job?"
  };
}

module.exports = {
  processAIRecruiter
};
