const { runBatchWorkflow } = require("./jobBatchProcessor");

async function safeRunWorkflow(input) {
  try {
    if (!input?.text) {
      return {
        type: "job",
        job: null,
        score: { score: 0, grade: "F" },
        recommendation: {
          action: "DROP",
          label: "❌ INVALID INPUT",
          reason: "Empty text payload"
        }
      };
    }

    return await runBatchWorkflow(input);
  } catch (err) {
    console.error("[WORKFLOW CRASH BLOCKED]", err);

    return {
      type: "job",
      job: null,
      score: { score: 0, grade: "F" },
      recommendation: {
        action: "DROP",
        label: "❌ SYSTEM ERROR",
        reason: "Pipeline failed safely"
      }
    };
  }
}

module.exports = { safeRunWorkflow };
