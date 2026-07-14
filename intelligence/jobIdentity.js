const crypto = require("crypto");

function createJobId(job) {
  const base = `${job.title}|${job.city}|${job.salary}|${job.applyLink || ""}`;
  
  return crypto
    .createHash("md5")
    .update(base.toLowerCase().trim())
    .digest("hex");
}

module.exports = {
  createJobId
};
