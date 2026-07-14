const { extractJobFeatures } = require("./features/jobFeatureExtractor");

function recruiterBrain(job, scoreData) {
  const f = extractJobFeatures(job);

  let signal = [];

  if (f.isTech) signal.push("Tech role detected");
  if (f.isSupport) signal.push("Support/customer role");
  if (f.isAdmin) signal.push("Admin/operations role");
  if (f.isRemote) signal.push("Remote opportunity");
  if (f.isHighPay) signal.push("High salary bracket");

  let decision = "REVIEW";

  if (scoreData.score >= 800) decision = "ACCEPT";
  if (scoreData.score < 500) decision = "REJECT";

  return {
    decision,
    signals: f,
    notes: signal
  };
}

function formatRecruiterBrain(insight = {}) {
  const signals = insight.signals || {};

  return `
🧠 Job Fit Insight:
${insight.summary || "No summary"}

📊 Signals:
- Tech: ${signals.isTech ?? false}
- Support: ${signals.isSupport ?? false}
- Admin: ${signals.isAdmin ?? false}
- Entry: ${signals.isEntry ?? false}
- Senior: ${signals.isSenior ?? false}
- Remote: ${signals.isRemote ?? false}
`.trim();
}

module.exports = {
  formatRecruiterBrain
};
