const arbeitnow = require("./sources/arbeitnow");
const adzuna = require("./sources/adzuna");
const remotive = require("./sources/remotive");
const remoteok = require("./sources/remoteok");
const myjobmag = require("./sources/myjobmag");

// Sources with no query support — safe to cache on a timer
async function fetchCachedJobs() {
  const results = await Promise.allSettled([
    arbeitnow(),
    remotive(),
    remoteok(),
    myjobmag()
  ]);

  let jobs = [];

  for (const result of results) {
    if (result.status === "fulfilled" && Array.isArray(result.value)) {
      jobs.push(...result.value);
    }
  }

  const seen = new Set();

  return jobs.filter(job => {
    if (!job.id) return false;
    if (seen.has(job.id)) return false;
    seen.add(job.id);
    return true;
  });
}

// Adzuna supports real search — always called live with the user's query
async function fetchAdzunaJobs(query) {
  try {
    return await adzuna(query);
  } catch (err) {
    console.error("Adzuna fetch failed:", err.message);
    return [];
  }
}

module.exports = {
  fetchCachedJobs,
  fetchAdzunaJobs
};
