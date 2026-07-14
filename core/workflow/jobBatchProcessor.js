const { runJobWorkflow } = require("./jobWorkflow");

const { segmentJobs } = require("../../intelligence/jobSegmenter");
const { removeDuplicates } = require("../../intelligence/jobDeduplicator");
const { rankJobs } = require("../../services/jobRanker");

const {
  loadMemory,
  updateMemory,
  saveMemory
} = require("../../services/cvMemoryEngine");

const {
  detectFalseJob
} = require("../../intelligence/falseJobDetector");
const { sanitizeJob } = require("../../intelligence/safety/jobSanitizer");

const { getDecision } = require("../decision/jobDecisionEngine");
const {
  stabilizeDecision,
  stabilizeMemoryWeights
} = require("../decision/pipelineStabilizer");

function trace(stage, payload) {
  console.log(`[PIPELINE:${stage}]`, JSON.stringify(payload, null, 2));
}

function isValidJob(job) {
  if (!job?.title) return false;
  if (job.title.length < 4) return false;
  if (/apply|send|cv|email|requirements/i.test(job.title.toLowerCase())) return false;
  return true;
}

async function processSegment(userId, text) {
  const result = await runJobWorkflow({ text, userId });
  trace("WORKFLOW", { title: result?.job?.title });
  return result;
}

async function runBatchWorkflow({ userId, text }) {
  trace("START", { userId });

  const safeInput = String(text || "").trim();
  if (!safeInput) {
    return {
      type: "job",
      job: null,
      score: { score: 0, grade: "F" },
      recommendation: {
        action: "DROP",
        label: "INVALID INPUT",
        reason: "Empty input"
      }
    };
  }

  const fraud = detectFalseJob(safeInput);
  trace("FRAUD_CHECK", fraud);

  if (fraud?.risk >= 70 || fraud?.isFalse) {
    return {
      type: "job",
      job: null,
      score: { score: 0, grade: "F" },
      recommendation: {
        action: "DROP",
        label: "FALSE JOB"
      }
    };
  }

  const segments = segmentJobs(safeInput);
  const input = segments?.length ? segments : [safeInput];

  const jobs = [];

  for (const segment of input) {
    const result = await processSegment(userId, segment);
    if (!result?.job) continue;

    const safeJob = sanitizeJob(result.job);
    if (!safeJob) continue;

    if (isValidJob(safeJob)) jobs.push(safeJob);
  }

  const unique = removeDuplicates(jobs);
  const ranked = rankJobs(unique);

  const top = ranked[0];

  if (!top) {
    return {
      type: "job",
      job: null,
      score: { score: 0, grade: "F" },
      recommendation: {
        action: "SKIP",
        label: "EMPTY"
      }
    };
  }

  const recommendation = stabilizeDecision(
    getDecision(top),
    top?.score?.score || 0
  );

  const memory = loadMemory();
  updateMemory(memory, top, recommendation.action);

  memory.weights = stabilizeMemoryWeights(memory.weights || {});
  saveMemory(memory);

  return {
    type: "job",
    job: top,
    score: top.score,
    recommendation
  };
}

module.exports = { runBatchWorkflow };
