const { jobParser } = require("../intelligence/jobParser");
const { normalize } = require("../intelligence/jobNormalizer");

const { analyzeRisk } = require("../decision/riskAnalyzer");
const { scoreJob } = require("../decision/scoringEngine");
const { decide } = require("../decision/recruiterAgent");

const jobService = require("../domain/job/job.service");
const sessionService = require("../domain/session/session.service");

const eventBus = require("../services/eventBus");

async function run({ userId, text }) {
  try {
    const session = await sessionService.getSession(userId);

    if (!session || session.step !== "INPUT") {
      return null;
    }

    // 1. PARSE (AI extraction)
    const raw = await jobParser(text);

    // 2. NORMALIZE (clean structure)
    const job = normalize(raw);

    eventBus.emit("job.parsed", { userId, job });

    // 3. RISK
    const risk = analyzeRisk(job);

    // 4. SCORE
    const scoreData = scoreJob(job, risk);

    const score = scoreData.score ?? 0;
    const grade = scoreData.grade ?? "C";

    // 5. DECISION
    const recommendation = decide(job, scoreData);

    // 6. SAVE
    const saved = await jobService.create(userId, job);

    eventBus.emit("job.saved", { userId, job: saved });

    // 7. RESET SESSION
    await sessionService.reset(userId);

    eventBus.emit("job.completed", { userId, job: saved });

    // 8. RESPONSE
    return {
      type: "job",
      job,
      score,
      grade,
      recommendation,
      saved
    };

  } catch (err) {
    console.log("Workflow error:", err);

    return {
      type: "error",
      message: "❌ Workflow failed. Check logs."
    };
  }
}

module.exports = { run };
