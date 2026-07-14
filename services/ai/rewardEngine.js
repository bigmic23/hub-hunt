function computeReward(action, job, context = {}) {
  let reward = 0;

  // base action signals
  switch (action) {
    case "APPLIED":
      reward += 10;
      break;
    case "SAVED":
      reward += 5;
      break;
    case "IGNORED":
      reward -= 8;
      break;
  }

  // quality alignment signals
  if (job?.salary >= 200000) reward += 2;
  if (job?.mode === "Remote") reward += 2;
  if (job?.title?.toLowerCase().includes("intern")) reward -= 1;

  // CV match bonus (if available)
  if (context?.cvMatchScore) {
    reward += context.cvMatchScore / 100;
  }

  return reward;
}

module.exports = { computeReward };
