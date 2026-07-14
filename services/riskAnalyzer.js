function analyzeRisk(job) {
  const flags = {
    missingSalary: !job.salary,
    missingCity: job.mode === "On-site" && !job.city,
    vagueTitle: job.title.includes("Unknown")
  };

  let penalty = 0;

  if (flags.missingSalary) penalty += 100;
  if (flags.missingCity) penalty += 150;
  if (flags.vagueTitle) penalty += 80;

  return { flags, penalty };
}

module.exports = { analyzeRisk };
