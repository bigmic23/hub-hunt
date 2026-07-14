function scoreJob(job, risk) {
  let score = 500;

  if (job.mode === "Remote") score += 120;
  if (job.mode === "Hybrid") score += 80;

  if (job.salary && job.salary > 100000) score += 200;

  score -= risk.penalty;

  const grade =
    score >= 850 ? "S" :
    score >= 750 ? "A" :
    score >= 650 ? "B" : "C";

  return { score, grade };
}

module.exports = { scoreJob };
