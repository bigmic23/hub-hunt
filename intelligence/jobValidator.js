function validateJob(job) {
  if (!job) return false;

  if (!job.title) return false;

  if (job.title.toLowerCase().includes("unknown")) return false;

  if (job.salary === 0) return false;

  return true;
}

module.exports = { validateJob };
