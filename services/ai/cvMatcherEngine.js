const { userCvProfile } = require("./profile/userCvProfile");

function normalize(text = "") {
  return text.toLowerCase();
}

function matchJobToCV(job = {}) {
  const text = normalize(`${job.title || ""} ${job.raw || ""}`);

  let score = 0;
  let reasons = [];

  const profile = userCvProfile || {};

  // -------------------
  // 1. ROLE ALIGNMENT
  // -------------------
  const roles = profile.roles || [];

  const roleHit = roles.find(role => text.includes(role.toLowerCase()));

  if (roleHit) {
    score += 35;
    reasons.push(`Role match: ${roleHit}`);
  }

  // -------------------
  // 2. SKILL MATCH (WEIGHTED)
  // -------------------
  const skills = profile.skills || [];

  let skillHits = 0;

  for (const skill of skills) {
    if (text.includes(skill.toLowerCase())) {
      score += 12;
      skillHits++;
    }
  }

  if (skillHits > 0) {
    reasons.push(`${skillHits} skill match(es)`);
  }

  // -------------------
  // 3. WORK MODE ALIGNMENT
  // -------------------
  if (
    profile.preferredMode &&
    job.mode &&
    job.mode.toLowerCase() === profile.preferredMode.toLowerCase()
  ) {
    score += 20;
    reasons.push("Preferred work mode match");
  }

  // -------------------
  // 4. SALARY FIT (RANGE BASED)
  // -------------------
  const salary = Number(job.salary || 0);

  if (profile.salaryExpectation) {
    const expected = profile.salaryExpectation;

    if (salary >= expected) {
      score += 25;
      reasons.push("Meets salary expectation");
    } else if (salary < expected * 0.6) {
      score -= 20;
      reasons.push("Below expected salary range");
    }
  }

  // -------------------
  // 5. TITLE STRENGTH BOOST
  // -------------------
  if (text.includes("senior")) score += 5;
  if (text.includes("entry")) score += 10;
  if (text.includes("intern")) score += 15;

  // -------------------
  // FINAL OUTPUT
  // -------------------
  return {
    cvScore: Math.max(0, Math.min(100, score)),
    reasons
  };
}

module.exports = { matchJobToCV };
