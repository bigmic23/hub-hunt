function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function decayValue(value, ageDays, halfLifeDays = 14) {
  if (!value) return 0;

  const decayFactor =
    Math.pow(0.5, ageDays / halfLifeDays);

  return value * decayFactor;
}

function daysAgo(timestamp) {
  if (!timestamp) return 999;

  const diff =
    Date.now() - new Date(timestamp).getTime();

  return diff / (1000 * 60 * 60 * 24);
}

/**
 * Applies memory decay to CV patterns
 */
function applyDecay(profile = {}) {
  const updated = { ...profile };

  const history =
    Array.isArray(updated.history)
      ? updated.history
      : [];

  const roles = {};
  const skills = {};

  for (const event of history) {
    const age = daysAgo(event.at);

    const weight =
      decayValue(1, age);

    const title = event.title;

    if (event.type === "APPLIED" || event.type === "SAVED") {
      if (title) {
        roles[title] =
          (roles[title] || 0) + weight;
      }
    }

    if (event.skills) {
      for (const s of event.skills) {
        skills[s] =
          (skills[s] || 0) + weight;
      }
    }
  }

  updated.decayed = {
    roles,
    skills
  };

  return updated;
}

module.exports = {
  applyDecay
};
