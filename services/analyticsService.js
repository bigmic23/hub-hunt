function buildAnalytics(jobs = []) {
  const total = jobs.length;

  const remote =
    jobs.filter(j =>
      String(j.location || "")
        .toLowerCase()
        .includes("remote")
    ).length;

  const hybrid =
    jobs.filter(j =>
      String(j.location || "")
        .toLowerCase()
        .includes("hybrid")
    ).length;

  const salaries =
    jobs
      .map(j =>
        Number(
          String(j.salary || "")
            .replace(/[^\d]/g, "")
        )
      )
      .filter(Boolean);

  const averageSalary =
    salaries.length
      ? Math.round(
          salaries.reduce(
            (a, b) => a + b,
            0
          ) / salaries.length
        )
      : 0;

  return {
    total,
    remote,
    hybrid,
    averageSalary
  };
}

module.exports = {
  buildAnalytics
};
