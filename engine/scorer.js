function scoreJob(job) {
  let score = 0;

  if (job.role) score += 200;
  if (job.company) score += 200;
  if (job.salary > 50000) score += 300;
  if (job.location === "Remote") score += 300;

  return {
    score, // 0 - 1000 baseline
    grade:
      score > 800 ? "A" :
      score > 600 ? "B" :
      score > 400 ? "C" : "D"
  };
}

module.exports = { scoreJob };
