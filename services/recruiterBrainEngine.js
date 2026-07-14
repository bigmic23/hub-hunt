function buildRecruiterBrain(saved, scoreData, recommendation, profile = null) {
  const score = scoreData?.score || 0;

  let decisionLabel = "REVIEW";
  let insight = [];

  // CORE DECISION LOGIC
  if (score >= 800) {
    decisionLabel = "STRONG MATCH";
    insight.push("High alignment with role requirements");
  } else if (score >= 600) {
    decisionLabel = "GOOD MATCH";
    insight.push("Moderate-to-strong compatibility");
  } else if (score >= 400) {
    decisionLabel = "WEAK MATCH";
    insight.push("Missing key requirements");
  } else {
    decisionLabel = "POOR MATCH";
    insight.push("Low relevance to user profile");
  }

  // SKILL GAP ANALYSIS (basic heuristic)
  if (saved.title?.toLowerCase().includes("engineer")) {
    insight.push("Technical competency required");
  }

  if (!saved.applyLink) {
    insight.push("No direct application email detected");
  }

  if (saved.salary === 0) {
    insight.push("Salary not specified (low transparency)");
  }

  // PROFILE ENHANCEMENT LAYER
  if (profile) {
    insight.push("Profile-based ranking applied");
  }

  return {
    label: decisionLabel,
    insight
  };
}

function formatBrainOutput(brain) {
  return (
    `🧠 AI Recruiter Insight:\n` +
    brain.insight.map(i => `• ${i}`).join("\n") +
    `\n\n📌 Verdict: ${brain.label}`
  );
}

module.exports = {
  buildRecruiterBrain,
  formatBrainOutput
};
