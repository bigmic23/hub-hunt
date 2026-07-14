const { Worker } = require("bullmq");
const Redis = require("ioredis");

const connection = new Redis(process.env.REDIS_URL);

const worker = new Worker(
  "telegram-jobs",
  async job => {
    const userId = String(job.data.userId || "");
    const text = String(job.data.text || "");

    const state = await sessionService.getSession(userId);

    const result = await processRecruitment({
      userId,
      text,
      state,
      session: sessionService,
      jobService,
      identityEngine,
      AI
    });

    return result;
  },
  { connection } );

// disabled worker (no redis dependency)
module.exports = {
  startWorker: () => {
    console.log("🚫 Worker disabled (no Redis / production-safe mode)");
  }
};
