function cityResolver(job, detectedCity) {
  if (detectedCity) return detectedCity;

  if (job.mode === "Remote") return "Global";
  if (job.mode === "Hybrid") return "Multiple";
  if (job.mode === "On-site") return "Unknown";

  return "Unknown";
}

module.exports = { cityResolver };
