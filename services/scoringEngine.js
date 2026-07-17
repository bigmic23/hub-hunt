const feedMemory = require("./feedMemoryService");
const {
  getUserWeights,
  applyWeights
} = require("./ai/adaptiveWeightsEngine");
const {
  applyDecay
} = require("./ai/memoryDecayEngine");

function extractSkills(profile) {
  return [
    ...(profile?.skills || []),
    ...(profile?.roles || [])
  ].map(s => String(s).toLowerCase());
}

function buildComponents(job, profile) {
  const title = (job?.title || "").toLowerCase();
  const city = (job?.city || "").toLowerCase();

  const skills = extractSkills(profile);

  let skillMatch = 0;
  let roleMatch = 0;
  let salaryMatch = 0;
  let behavior = 0;

  // ---------------- SKILL MATCH ----------------
  for (const skill of skills) {
    if (title.includes(skill)) {
      skillMatch += 1;
    }
    if (title.includes(skill)) {
      roleMatch += 1;
    }
  }

  // ---------------- SALARY ----------------
  if (profile?.preferences?.salary && job?.salary) {
    salaryMatch =
      job.salary >= profile.preferences.salary ? 1 : 0;
  } else {
    salaryMatch = job?.salary ? 0.5 : 0;
  }

  // ---------------- BEHAVIOR ----------------
  const signals =
    feedMemory.getSignals?.(profile?.userId);

  if (signals && job?.id) {
    if (signals.saved?.has(job.id)) behavior += 1;
    if (signals.applied?.has(job.id)) behavior += 2;
    if (signals.ignored?.has(job.id)) behavior -= 2;
  }

  return {
    skillMatch,
    roleMatch,
    salaryMatch,
    behavior
  };
}

function scoreJobForUser(job, profile = {}) {
   profile = applyDecay(profile);
  const components = buildComponents(job, profile);

  const weights = getUserWeights(profile);

  const weightedScore =
    applyWeights(components, weights);

  const finalScore = Math.min(
    1000,
    Math.round(weightedScore * 100)
);

  let grade = "C";
  if (finalScore >= 800) grade = "A";
  else if (finalScore >= 650) grade = "B";
  else if (finalScore >= 500) grade = "C";
  else grade = "D";

  return {
    ...job,
    score: {
      score: finalScore,
      grade
    }
  };
}

function rankJobsForUser(jobs = [], profile = {}) {
  return jobs
    .filter(Boolean)
    .map(job => scoreJobForUser(job, profile))
    .sort((a, b) => b.score.score - a.score.score);
}

module.exports = {
  scoreJobForUser,
  rankJobsForUser
};
