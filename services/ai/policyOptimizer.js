function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

/**
 * Adjusts ranking weights based on accumulated reward signals
 */
function updatePolicy(profile = {}, rewardSignal = 0) {
  profile.policy = profile.policy || {
    salaryWeight: 1,
    remoteWeight: 1,
    skillWeight: 1,
    stability: 1
  };

  const p = profile.policy;

  // learning rate (small but stable updates)
  const lr = 0.05;

  // positive reward strengthens exploration of similar patterns
  if (rewardSignal > 0) {
    p.salaryWeight += lr * rewardSignal * 0.2;
    p.remoteWeight += lr * rewardSignal * 0.1;
    p.skillWeight += lr * rewardSignal * 0.3;
  }

  // negative reward penalizes current strategy
  if (rewardSignal < 0) {
    p.salaryWeight -= lr * Math.abs(rewardSignal) * 0.3;
    p.remoteWeight -= lr * Math.abs(rewardSignal) * 0.2;
    p.skillWeight -= lr * Math.abs(rewardSignal) * 0.1;
  }

  // stabilization to prevent drift explosion
  p.salaryWeight = clamp(p.salaryWeight, 0.2, 3);
  p.remoteWeight = clamp(p.remoteWeight, 0.2, 3);
  p.skillWeight = clamp(p.skillWeight, 0.2, 3);

  return profile;
}

module.exports = { updatePolicy };
