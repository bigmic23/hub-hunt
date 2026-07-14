// production-safe dummy queue (no Redis)
async function addJob(job) {
  return Promise.resolve({ status: "queued", job });
}

module.exports = {
  addJob
};
