function updateCvProfileFromBehavior(profile = {}, event = {}) {
  const updated = { ...profile };

  updated.history = updated.history || [];
  updated.cvProfile = updated.cvProfile || {};

  const cv = updated.cvProfile;

  cv.skillStrength = cv.skillStrength || {};
  cv.rolePreference = cv.rolePreference || {};
  cv.rejectionReasons = cv.rejectionReasons || {};
  cv.embeddingHints = cv.embeddingHints || {
    topTitles: [],
    topSkills: []
  };

  updated.history.push(event);

  const job = event.job || {};
  const title = (job.title || "").toLowerCase();
  const salary = job.salary || 0;

  if (event.type === "SAVED" || event.type === "APPLIED") {
    cv.rolePreference[title] =
      (cv.rolePreference[title] || 0) + 1;

    const words = title.split(" ");
    for (const w of words) {
      if (w.length > 3) {
        cv.skillStrength[w] = (cv.skillStrength[w] || 0) + 1;
      }
    }

    cv.embeddingHints.topTitles.push(title);
  }

  if (event.type === "REJECTED") {
    cv.rejectionReasons[title] =
      (cv.rejectionReasons[title] || 0) + 1;
  }

  if (salary) {
    cv.salaryExpectation =
      Math.round(
        ((cv.salaryExpectation || salary) + salary) / 2
      );
  }

  return updated;
}

module.exports = { updateCvProfileFromBehavior };
