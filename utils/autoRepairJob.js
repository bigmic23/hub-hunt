module.exports = function autoRepairJob(job) {
  if (!job) return {};

  // Fix "Remote role at Acme Health"
  if (job.role && job.role.includes(" at ") && !job.company) {
    const parts = job.role.split(" at ");
    job.role = parts[0].trim();
    job.company = parts[1].trim();
  }

  // Clean noise
  const noiseWords = ["remote", "role", "job"];
  if (job.role) {
    noiseWords.forEach((w) => {
      job.role = job.role.replace(new RegExp(w, "gi"), "").trim();
    });
  }

  return job;
};
