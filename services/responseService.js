function formatResponse(job, score) {
  if (!job) return "❌ Could not extract job";

  return `
📌 Title: ${job.title || "N/A"}
📍 Mode: ${job.mode}
🌍 City: ${job.city}
🌍 City: ${job.city} ${job.cityConfidence ? `(${job.cityConfidence})` : ""}
💰 Salary: ${job.salary || "N/A"}

📊 Score: ${score.score}/1000
🏷 Grade: ${score.grade}
`;
}

module.exports = { formatResponse };
