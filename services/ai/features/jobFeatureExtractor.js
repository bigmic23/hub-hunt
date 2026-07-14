function extractJobFeatures(job) {
  const text = `${job.title} ${job.raw || ""}`.toLowerCase();

  return {
    isTech: /developer|engineer|software|data|it|backend|frontend/.test(text),
    isSupport: /support|customer|representative/.test(text),
    isAdmin: /admin|clerk|store|office/.test(text),
    isEntry: /intern|graduate|junior/.test(text),
    isRemote: job.mode === "Remote",
    isHighPay: (job.salary || 0) > 200000
  };
}

module.exports = { extractJobFeatures };
