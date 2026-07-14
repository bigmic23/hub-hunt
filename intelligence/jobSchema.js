function createJob(job = {}) {
  return {
    title: job.title || null,
    city: job.city || "Unknown",
    mode: job.mode || "Unknown",
    salary: Number(job.salary) || 0,

    applyLink: job.applyLink || null,
    applyType: job.applyType || inferApplyType(job.applyLink),

    raw: job.raw || null,

    score: job.score || { score: 0, grade: "C" }
  };
}

function inferApplyType(link) {
  if (!link) return null;
  if (link.includes("@")) return "email";
  if (link.startsWith("http")) return "url";
  return "unknown";
}

module.exports = { createJob };
