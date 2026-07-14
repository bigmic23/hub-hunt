function buildUserProfile(memory = []) {
  let savedSalary = [];
  let rejectedSalary = [];

  let remoteCount = 0;
  let onsiteCount = 0;

  for (const m of memory) {
    if (m.action === "SAVED") {
      savedSalary.push(m.metadata?.salary || 0);
    }

    if (m.action === "REJECTED") {
      rejectedSalary.push(m.metadata?.salary || 0);
    }

    if (m.metadata?.mode === "Remote") remoteCount++;
    if (m.metadata?.mode === "Onsite") onsiteCount++;
  }

  const avgSavedSalary =
    savedSalary.length
      ? savedSalary.reduce((a, b) => a + b, 0) / savedSalary.length
      : 0;

  const avgRejectedSalary =
    rejectedSalary.length
      ? rejectedSalary.reduce((a, b) => a + b, 0) / rejectedSalary.length
      : 0;

  return {
    preferredSalary: avgSavedSalary,
    rejectedSalary: avgRejectedSalary,
    prefersRemote: remoteCount > onsiteCount
  };
}

module.exports = { buildUserProfile };
