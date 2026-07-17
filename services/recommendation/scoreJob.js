module.exports = function scoreJob(job, profile = {}) {
  let score = 0;
  const reasons = [];

  // Remote preference
  if (
    profile.remoteOnly &&
    String(job.mode).toLowerCase().includes("remote")
  ) {
    score += 25;
    reasons.push("Matches your remote preference");
  }

  // Preferred country
  if (
    profile.country &&
    job.country &&
    profile.country.toLowerCase() === job.country.toLowerCase()
  ) {
    score += 20;
    reasons.push(`Located in ${job.country}`);
  }

  // Visa sponsorship
  if (profile.needVisa && job.visaSponsored) {
    score += 20;
    reasons.push("Visa sponsorship available");
  }

  // Skill matching
  if (Array.isArray(profile.skills)) {
    const title = (job.title || "").toLowerCase();

    for (const skill of profile.skills) {
      if (title.includes(skill.toLowerCase())) {
        score += 10;
        reasons.push(`Matches ${skill}`);
      }
    }
  }

  // Salary available
  if (
    job.salary &&
    job.salary !== "Not specified"
  ) {
    score += 5;
    reasons.push("Salary listed");
  }

  return {
    score: Math.min(score, 100),
    reasons
  };
};
