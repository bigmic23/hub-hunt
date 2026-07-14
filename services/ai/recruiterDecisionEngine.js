const { extractJobFeatures } = require("./features/jobFeatureExtractor");
const { buildCvProfile } = require("./profile/userCvProfile");

async function recruiterBrain(
  job,
  scoreData,
  userId,
  cvMatch = {},
  stats = {},
  memory = {}
) {
  const profile = buildCvProfile(memory);
  const f = extractJobFeatures(job);

  let bias = 0;

  // memory bias (safe fallback)
  if (stats.saved > stats.rejected) bias += 50;
  if (stats.rejected > stats.saved) bias -= 30;

  // CV bias
  if (cvMatch.cvScore > 60) bias += 70;
  if (cvMatch.cvScore < 30) bias -= 50;

  // CV profile bias
  if (profile.preferredRemote && job.mode === "Remote") bias += 40;

  if (job.salary >= profile.minSalary) bias += 30;

  if (job.salary > profile.maxSalary) bias -= 80;

  if (
    profile.blacklistKeywords?.some((k) =>
      job.title?.toLowerCase().includes(k.toLowerCase())
    )
  ) {
    bias -= 200;
  }

  // feature bias
  if (f.isRemote) bias += 10;
  if (f.isSupport) bias += 20;
  if (f.isHighPay) bias += 30;

  const base = Number(scoreData?.score || 0);
  const finalScore = base + bias;

  let decision = "CONSIDER";

  if (finalScore >= 800) decision = "APPLY";
  else if (finalScore < 500) decision = "SKIP";

  return {
    decision,
    bias,
    stats,
    cvMatch,
    finalScore
  };
}

module.exports = { recruiterBrain };
