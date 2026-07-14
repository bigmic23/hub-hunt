const fs = require("fs");

const MEMORY_FILE = "./data/cv-memory.json";

function loadMemory() {
  try {
    return JSON.parse(fs.readFileSync(MEMORY_FILE, "utf8"));
  } catch (e) {
    return {
      positive: {},
      negative: {},
      weights: {
        copywriter: 1,
        support: 1,
        remote: 1
      }
    };
  }
}

function saveMemory(memory) {
  fs.writeFileSync(MEMORY_FILE, JSON.stringify(memory, null, 2));
}

function extractFeatures(job) {
  const title = (job.title || "").toLowerCase();

  return {
    copywriter: title.includes("copywriter") ? 1 : 0,
    writer: title.includes("writer") ? 1 : 0,
    support: title.includes("support") ? 1 : 0,
    remote: (job.mode || "").toLowerCase() === "remote" ? 1 : 0
  };
}

function updateMemory(memory, job, decision) {
  const features = extractFeatures(job);

  const delta =
    decision === "APPLY"
      ? 0.2
      : decision === "DROP"
      ? -0.2
      : 0;

  for (const key in features) {
    if (!features[key]) continue;

    const current =
      memory.weights[key] ?? 1;

    memory.weights[key] =
      Math.max(
        0.5,
        Math.min(
          current + delta,
          3
        )
      );
  }

  return memory;
}

function getDynamicFitScore(job, memory) {
  const features = extractFeatures(job);

  let score = 0;

  for (const key in features) {
    if (!features[key]) continue;

    const weight =
      memory?.weights?.[key] ?? 1;

    score += weight * 100;
  }

  // role boost
  if (
    /support|customer/i.test(
      job.title || ""
    )
  ) {
    score += 250;
  }

  // remote boost
  if (
    (job.mode || "")
      .toLowerCase()
      .includes("remote")
  ) {
    score += 150;
  }

  // salary boost
  const salary =
    Number(job.salary) || 0;

  if (salary >= 300000) {
    score += 200;
  }

  return Math.min(
    1000,
    Math.round(score)
  );
}

module.exports = {
  loadMemory,
  saveMemory,
  extractFeatures,
  updateMemory,
  getDynamicFitScore
};
