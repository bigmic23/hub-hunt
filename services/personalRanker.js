function scoreJobForUser(job, profile) {
  const base = job?.score?.score || 0;

  const policy = profile?.policy || {
    salaryWeight: 1,
    remoteWeight: 1,
    skillWeight: 1
  };

  const title = normalize(job?.title);
  const city = normalize(job?.city);

  const skills = extractSkills(profile);

  const signals =
    typeof feedMemory.getSignals === "function"
      ? feedMemory.getSignals(profile?.userId || job?.userId)
      : null;

  const skillScore =
    computeSkillScore(title, skills) * policy.skillWeight;

  const locationScore =
    computeLocationScore(city, normalize(profile?.location));

  const salaryScore =
    computeSalaryScore(job?.salary, profile?.salaryExpectation) *
    policy.salaryWeight;

  const behaviorScore =
    computeBehaviorScore(signals, job?.id);

  const tierScore =
    computeTierBonus(job?.salary);

  const cv = profile?.cvProfile || {};

const weights = profile?.weights || {
  skillMatch: 1,
  roleMatch: 1,
  salaryMatch: 1
};

const skillBoost =
  Object.entries(cv.skillStrength || {})
    .reduce((acc, [k, v]) =>
      acc + (title.includes(k) ? v * 20 : 0),
      0
    ) * weights.skillMatch;

const roleBoost =
  Object.entries(cv.rolePreference || {})
    .reduce((acc, [k, v]) =>
      acc + (title.includes(k) ? v * 30 : 0),
      0
    ) * weights.roleMatch;

const cv = profile?.cvProfile || {};

const rejectPenalty = Object.entries(cv.rejectionReasons || {})
  .reduce((acc, [k, v]) => acc + (title.includes(k) ? v * 40 : 0), 0);

const salaryTarget = cv.salaryExpectation || 0;

const salaryBoost =
  salaryTarget && job?.salary
    ? job.salary >= salaryTarget
      ? 80 * weights.salaryMatch
      : -30 * weights.salaryMatch
    : 0;

const weights = profile?.weights || {
  skillMatch: 1,
  roleMatch: 1,
  salaryMatch: 1
};

const cvBoost =
  (skillBoost * weights.skillMatch) +
  (roleBoost * weights.roleMatch);

const finalScore =
  base +
  cvBoost +
  salaryBoost +
  computeLocationScore(city, normalize(profile?.location)) +
  computeBehaviorScore(signals, job?.id) +
  computeTierBonus(job?.salary) -
  rejectPenalty;

  return {
    ...job,
    score: {
      ...(job.score || {}),
      finalScore
    }
  };
}
+
