const { discoverJobs } = require("../jobDiscoveryService");

async function searchJobs(query, userId = "whatsapp") {
  const jobs = await discoverJobs(userId);

  if (!query) return jobs;

  const q = query.toLowerCase();

  return jobs.filter(job => {
    return (
      (job.title || "").toLowerCase().includes(q) ||
      (job.location || "").toLowerCase().includes(q) ||
      (job.company || "").toLowerCase().includes(q)
    );
  });
}

module.exports = {
  searchJobs
};
