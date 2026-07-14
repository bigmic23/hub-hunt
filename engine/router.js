const AI = require("../services/recruiterAI");

async function routeMessage(text = "", session = null) {
  const input = text.trim();

  // STEP 1: GUARD CLAUSE
  if (!input) return "recruiter";

  // STEP 2: CONTEXT LOAD (MEMORY + PROFILE)
  const memory = session?.memory || [];
  const profile = session?.profile || {};

  try {
    // STEP 3: AI DECISION (MEMORY + PROFILE AWARE)
    const result = await AI.classifyIntent(input, memory, profile);

    if (!result?.intent) return "recruiter";

    return result.intent;
  } catch (err) {
    console.error("ROUTER AI ERROR:", err);
    return "recruiter";
  }
}

module.exports = {
  routeMessage
};
