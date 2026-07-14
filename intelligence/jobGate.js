function isValidTitle(title = "") {
  if (!title) return false;

  const bad = [
    /job summary/i,
    /requirements/i,
    /perks/i,
    /apply/i,
    /location:/i,
    /salary:/i,
    /open positions/i
  ];

  return (
    title.length >= 6 &&
    !bad.some(p => p.test(title))
  );
}

function hasApplySignal(job) {
  return Boolean(job.applyLink || job.raw?.match(/@|apply|send cv/i));
}

function hasSalary(job) {
  return job.salary && job.salary > 0;
}

function hasCoreStructure(job) {
  return (
    isValidTitle(job.title) &&
    job.city &&
    job.mode
  );
}

/**
 * MAIN DECISION ENGINE
 */
function classifyJob(job) {
  if (!job) return "DROP";

  const titleOk = isValidTitle(job.title);
  const applyOk = hasApplySignal(job);
  const salaryOk = hasSalary(job);
  const structureOk = hasCoreStructure(job);

  // 🔥 APPLY: fully usable job
  if (titleOk && applyOk && (salaryOk || job.salary === 0) && structureOk) {
    return "APPLY";
  }

  // ⚠️ REVIEW: promising but incomplete
  if (titleOk && (applyOk || salaryOk)) {
    return "REVIEW";
  }

  // ❌ EVERYTHING ELSE
  return "DROP";
}

module.exports = {
  classifyJob
};
