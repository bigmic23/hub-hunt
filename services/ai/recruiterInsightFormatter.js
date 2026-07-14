function formatInsight(insight) {
  return (
    `🧠 Recruiter Insight:\n` +
    `Decision: ${insight.decision}\n\n` +
    `📊 Signals:\n- ${insight.notes.join("\n- ") || "No signals"}`
  );
}

module.exports = { formatInsight };
