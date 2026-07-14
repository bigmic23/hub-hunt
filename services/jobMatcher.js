function matchJob(profile, job) {
  let score = 0;

  // skill match
  profile.skills.forEach(skill => {
    if (job.title.toLowerCase().includes(skill)) {
      score += 20;
    }
  });

  // location match
  if (job.city === profile.location) {
    score += 15;
  }

  // salary fit
  if (job.salary >= profile.salaryExpectation) {
    score += 10;
  }

  return score;
}
