function isSpamJob(job) {
  const text = `${job.title} ${job.city} ${job.mode}`.toLowerCase();

  const spamSignals = [
    "earn money fast",
    "work from home typing",
    "no experience needed unlimited salary",
    "click to apply",
    "crypto",
    "investment",
    "trading",
    "binary",
    "forex",
    "gift card"
  ];

  return spamSignals.some(s => text.includes(s));
}

function isTooVague(job) {
  const bad =
    !job.title ||
    job.title === "Unknown Role" ||
    (!job.city || job.city === "Unknown");

  return bad;
}

function qualityGate(job) {
  if (isSpamJob(job)) {
    return {
      pass: false,
      reason: "Spam indicators detected"
    };
  }

  if (isTooVague(job)) {
    return {
      pass: false,
      reason: "Incomplete job data"
    };
  }

  return {
    pass: true,
    reason: "OK"
  };
}

module.exports = { qualityGate };
