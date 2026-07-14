function normalize(job) {
  return {
    title: job.title?.trim() || "Unknown Role",
    mode: job.mode || "Unknown",
    city: job.city || "Global",
    salary: Number(job.salary) || null,
    company: job.company || "Unknown"
  };
}

module.exports = { normalize };
