const { Markup } = require("telegraf");

const sessionService = require("../services/sessionService");
const savedJobService = require("../services/savedJobService");
const jobFeedService = require("../services/jobFeedService");
const userProfileService = require("../services/userProfileService");
const pipeline = require("../services/jobPipelineService");
const {
 learnRanking
} = require("../services/jobRanker");

const extractProfileFromCV = require("../intelligence/cvParser");
const telegramService = require("../services/telegramService");
const feedMemory = require("../services/feedMemoryService");

const { generateApplication } = require("../services/ai/applicationBuilder");
const { recordAction } = require("../services/ai/memory/recruiterMemoryDB");

const { safeIngest } = require("../utils/safeIngest");
const { runBatchWorkflow } = require("../core/workflow/jobBatchProcessor");

console.log("JOB ROUTES LOADED");

module.exports = function (bot) {
  const SAVED_PAGE = new Map();
  const SAVED_SIZE = 5;

const jobFeedService = require("../services/jobFeedService");

function resolveJob(ctx, jobId) {
  const userId = String(ctx.from.id);

  const sessionJob = ctx.session?.lastJob;

  const feed = jobFeedService.getFeed(userId);
  const feedJob =
    feed?.jobs?.find(j => String(j.id) === String(jobId));

  return sessionJob || feedJob || null;
}

  bot.on("text", async (ctx) => {
  console.log("[TEXT RECEIVED]", ctx.message.text);
  console.log("[FROM USER]", ctx.from.id);

  const text = ctx.message.text;
  if (text.startsWith("/")) return;

    const userId = String(ctx.from.id);

    const session = await sessionService.getSession(userId);

    if (session?.step === "WAITING_CV") {
      const profile = extractProfileFromCV(text);

      await userProfileService.save(userId, profile);
      await sessionService.updateSession(userId, { step: null });

      return ctx.reply("CV saved");
    }

    const looksLikeJob =
      /salary|\d{5,7}|remote|hybrid|onsite|lagos|developer|support|engineer|analyst|intern/i.test(text);

    if (session?.step !== "WAITING_JOB" && !looksLikeJob) return;

    const { runBatchWorkflow } = require("../core/workflow/jobBatchProcessor");

const { safeIngest } = require("../utils/safeIngest");
const { safeRunWorkflow } = require("../core/workflow/safeRunWorkflow");

let result;

try {
  const input = safeIngest(ctx, "telegram");

  result = await safeRunWorkflow(input);

  console.log("[PIPELINE RESULT RAW]", result);

} catch (e) {
  console.error("[PIPELINE ERROR]", e);
  return ctx.reply("❌ Pipeline crashed safely");
}

if (!result?.job) {
  console.log("[PIPELINE EMPTY RESULT]");
  return ctx.reply("❌ No valid job extracted");
}

    if (!result?.job) {
      return ctx.reply("❌ Job processing failed");
    }

    await sessionService.updateSession(userId, {
      lastJob: result.job
    });

    const feedState = jobFeedService.getFeed(userId);
    const existing = Array.isArray(feedState?.jobs) ? feedState.jobs : [];

    const updatedFeed = jobFeedService.removeDuplicates([
      result.job,
      ...existing
    ]);

    jobFeedService.setFeed(userId, updatedFeed);

    return ctx.reply(
      `JOB

${result.job.title}
${result.job.city}
₦${result.job.salary}`,
      Markup.inlineKeyboard([
        [
          Markup.button.callback("💾 Save", `save_${result.job.id}`),
          Markup.button.callback("📤 Apply", `apply_${result.job.id}`),
          Markup.button.callback("🚫 Ignore", `ignore_${result.job.id}`)
        ],
        [Markup.button.callback("⏭ Next", `next_${userId}`)]
      ])
    );
  });

  // ---------------- SAVE ----------------
  bot.action(/save_(.+)/, async (ctx) => {
  const userId = String(ctx.from.id);
  const jobId = ctx.match[1];

  const job = resolveJob(ctx, jobId);
  if (!job) return ctx.reply("❌ Job not found");

  const session = await sessionService.getSession(userId);

  feedMemory.markSaved(userId, job.id);
  pipeline.setState(userId, job.id, "SAVED");
  learnRanking(job, "SAVED");

let profile = await userProfileService.get(userId);

if (!profile) {
  profile = {
    userId,
    cvProfile: {},
    weights: {
      skillMatch: 1,
      roleMatch: 1,
      salaryMatch: 1
    }
  };
}

const { adjustWeights } =
  require("../services/ai/adaptiveWeightsEngine");

const safeProfile = profile || {};

safeProfile.cvProfile = safeProfile.cvProfile || {};
safeProfile.weights = safeProfile.weights || {
  skillMatch: 1,
  roleMatch: 1,
  salaryMatch: 1
};

const updatedWeights = adjustWeights(
  safeProfile,
  {
    action: "SAVED",
    job: session?.lastJob || null
  }
);

safeProfile.weights =
  updatedWeights && typeof updatedWeights === "object"
    ? updatedWeights
    : safeProfile.weights;

await userProfileService.save(userId, safeProfile);

  const reward = await recordAction(userId, job, "SAVED", {
    cvMatchScore: job?.score?.score
  });

  const { updateCvProfileFromBehavior } =
    require("../services/ai/profile/cvLearningEngine");

  profile.cvProfile = updateCvProfileFromBehavior(
    profile.cvProfile,
    { type: "SAVED", job }
  );

  await userProfileService.save(userId, profile);

  await ctx.answerCbQuery("Saved");
  return ctx.reply("💾 Saved");
});

  // ---------------- APPLY ----------------
  bot.action(/apply_(.+)/, async (ctx) => {
  const userId = String(ctx.from.id);
  const jobId = ctx.match[1];

  const job = resolveJob(ctx, jobId);
  if (!job) return ctx.reply("❌ Job not found");

  const profile = await userProfileService.get(userId);

  const app = generateApplication(job, profile);

  feedMemory.markApplied(userId, job.id);
  pipeline.setState(userId, job.id, "APPLIED");
  learnRanking(job, "APPLIED");

  await recordAction(userId, job, "APPLIED", {});

  const { updateCvProfileFromBehavior } =
    require("../services/ai/profile/cvLearningEngine");

  profile.cvProfile = updateCvProfileFromBehavior(
    profile.cvProfile,
    { type: "APPLIED", job }
  );

  await userProfileService.save(userId, profile);

  await ctx.reply(`📩 APPLICATION READY

Subject: ${app.subject}

${app.body}`);

  await ctx.answerCbQuery("Applied");
  return ctx.reply("📤 Marked as APPLIED");
});

  // ---------------- IGNORE ----------------
  bot.action(/ignore_(.+)/, async (ctx) => {
  const userId = String(ctx.from.id);
  const jobId = ctx.match[1];

  const job = resolveJob(ctx, jobId);
  if (!job) return ctx.reply("❌ Job not found");

  feedMemory.markIgnored(userId, job.id);
  pipeline.setState(userId, job.id, "IGNORED");
  learnRanking(job, "IGNORED");

  await recordAction(userId, job, "REJECTED", {});

  const profile = await userProfileService.get(userId);

  const { updateCvProfileFromBehavior } =
    require("../services/ai/profile/cvLearningEngine");

  profile.cvProfile = updateCvProfileFromBehavior(
    profile.cvProfile,
    { type: "REJECTED", job }
  );

  await userProfileService.save(userId, profile);

  await ctx.answerCbQuery("Ignored");
  return ctx.reply("🚫 Ignored");
});

  // ---------------- NEXT ----------------
  bot.action(/next_(.+)/, async (ctx) => {
    const userId = String(ctx.from.id);

    const result = jobFeedService.getNextJob(userId);
    if (!result?.job) return ctx.reply("Feed empty");

    const job = result.job;

    return ctx.reply(
      `${job.title}\n${job.city}\n₦${job.salary}`,
      Markup.inlineKeyboard([
        [
          Markup.button.callback("💾 Save", `save_${job.id}`),
          Markup.button.callback("📤 Apply", `apply_${job.id}`),
          Markup.button.callback("🚫 Ignore", `ignore_${job.id}`)
        ],
        [Markup.button.callback("⏭ Next", `next_${userId}`)]
      ])
    );
  });

  const { scrapeJobsAndSend } = require("../services/jobFeedService");

  bot.command("jobs", async (ctx) => {
    const userId = String(ctx.from.id);
    await scrapeJobsAndSend(bot, userId);
  });

  bot.command("saved", async (ctx) => {
    const userId = String(ctx.from.id);
    const jobs = await savedJobService.getSavedJobs(userId);

    if (!jobs.length) return ctx.reply("No saved jobs");

    for (const job of jobs.slice(0, SAVED_SIZE)) {
      await ctx.reply(
        `${job.title}\n${job.city}\n₦${job.salary}`,
        Markup.inlineKeyboard([
          [Markup.button.callback("📤 Apply", `apply_${job.id}`)]
        ])
      );
    }
  });
};
