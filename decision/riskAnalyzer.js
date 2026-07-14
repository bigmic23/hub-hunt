function analyzeRisk(job) {
  const flags = {
    missingSalary: !job.salary,
    missingCity: job.mode === "On-site" && !job.city,
    unknownTitle: job.title === "Unknown"
  };

  let penalty = 0;

  if (flags.missingSalary) penalty += 120;
  if (flags.missingCity) penalty += 150;
  if (flags.unknownTitle) penalty += 80;

  return { flags, penalty };
}

module.exports = { analyzeRisk };
