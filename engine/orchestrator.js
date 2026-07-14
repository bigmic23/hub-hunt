const { extractJob } = require("./parser");
const { scoreJob } = require("./scorer");
const { getSession, updateSession } = require("./state");
const { log } = require("../utils/logger");

async function orchestrator(ctx) {
  try {
    let text = ctx.message?.text || "";
    if (typeof text !== "string") return;

    text = text.toLowerCase();

    log("INPUT", text);

    const job = await extractJob(text);
    const scored = scoreJob(job);

    updateSession(ctx.from.id, {
      lastJob: job,
      lastScore: scored
    });

    return {
      job,
      scored
    };

  } catch (err) {
    log("ERROR", err.message);
    return { error: true };
  }
}

module.exports = { orchestrator };
