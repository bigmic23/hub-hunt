const { Markup } = require("telegraf");

const sessionService = require("../services/sessionService");
const jobWorkflow = require("../core/workflow/jobWorkflow");
const savedJobService = require("../services/savedJobService");
const jobFeedService = require("../services/jobFeedService");
const jobState = require("../services/feedStateService");

console.log("JOB ROUTES LOADED");

module.exports = function (bot) {

  const SAVED_PAGE = new Map();
  const SAVED_SIZE = 5;

  /* =========================
     /job COMMAND
  ========================= */
  bot.command("job", async (ctx) => {
    await sessionService.updateSession(String(ctx.from.id), {
      step: "WAITING_JOB"
    });

    return ctx.reply(
`📥 Send job details

Example:
Frontend Developer
Lagos
Remote
200000`
    );
  });

 /* =========================
     /CV COMMAND
  ========================= */
bot.command("cv", async (ctx) => {
  const userId = String(ctx.from.id);

  await sessionService.updateSession(userId, {
    step: "WAITING_CV"
  });

  return ctx.reply(
`📄 Send your CV text now.

Example:
- Customer support experience
- Excel, communication skills
- Remote jobs preferred
- Salary expectation: 100k`
  );
});

  /* =========================
     TEXT HANDLER
  ========================= */
bot.on("text", async (ctx) => {

  const text = ctx.message.text;
  if (text.startsWith("/")) return;

  const userId = String(ctx.from.id);

  const session = await sessionService.getSession(userId);
  const state = session;

  if (state?.step === "WAITING_CV") {
    const rawCV = text;

    const profile = extractProfileFromCV(rawCV);

    await userProfileService.save(userId, profile);

    await sessionService.updateSession(userId, {
      step: null
    });

    return ctx.reply("CV saved successfully");
  }

  const looksLikeJob =
    /salary|\d{5,7}|remote|hybrid|onsite|lagos|developer|support|engineer|analyst|intern/i
    .test(text);

  if (state?.step !== "WAITING_JOB" && !looksLikeJob) return;

  const { runBatchWorkflow } =
    require("../core/workflow/jobBatchProcessor");

  const result = await runBatchWorkflow({ userId, text });

  if (!result || !result.job) {
    return ctx.reply("❌ Job processing failed");
  }

  await sessionService.updateSession(userId, {
    lastJob: result.job
  });

  const existing = jobFeedService.getFeed(userId) || [];
  let updatedFeed = [result.job, ...existing];

  const profile = await userProfileService.get(userId);

  if (profile) {
    const { rankJobsForUser } =
      require("../services/personalRanker");

    updatedFeed = rankJobsForUser(updatedFeed, profile);
  }

  jobFeedService.setFeed(userId, updatedFeed);
  jobState.resetPointer(userId);

  return ctx.reply("JOB PROCESSED");
});

    return ctx.reply(

`📢 JOB ALERT

💼 ${result.job.title}
📍 ${result.job.city}
🏢 ${result.job.mode}
💰 ₦${result.job.salary}

📊 Score:
${result.score?.score || 0}
(${result.score?.grade || "C"})

🧠 Recruiter:
${result.recommendation.action}

📝 ${result.recommendation.reason}

${
result.job.applyLink
? `📩 Apply:
${result.job.applyLink}`
: ""
}`,

Markup.inlineKeyboard([
[
Markup.button.callback(
"💾 Save",
`save_${Date.now()}`
),
Markup.button.callback(
"⏭ Next",
`next_${userId}`
)
]
])

);
});

  /* =========================
     SAVE JOB
  ========================= */
  const pipeline = require("../services/jobPipelineService");

bot.action(/save_(.+)/, async (ctx) => {
  const userId = String(ctx.from.id);
  const jobId = ctx.match[1];

  const session = await sessionService.getSession(userId);

  if (!session?.lastJob) {
    return ctx.reply("❌ No job found");
  }

  await savedJobService.saveJob(userId, session.lastJob);

  pipeline.setState(userId, jobId, "SAVED");

  await ctx.answerCbQuery("Saved");

  return ctx.reply("💾 Saved");
});

/* =========================
     APPLY FEED
  ========================= */
bot.action(/apply_(.+)/, async (ctx) => {
  const userId = String(ctx.from.id);
  const jobId = ctx.match[1];

  const pipeline = require("../services/jobPipelineService");

  pipeline.setState(userId, jobId, "APPLIED");

  await ctx.answerCbQuery("Applied");

  return ctx.reply("📤 Marked as APPLIED");
});

/* =========================
     IGNORE FEED
  ========================= */
bot.action(/ignore_(.+)/, async (ctx) => {
  const userId = String(ctx.from.id);
  const jobId = ctx.match[1];

  const pipeline = require("../services/jobPipelineService");

  pipeline.setState(userId, jobId, "IGNORED");

  await ctx.answerCbQuery("Ignored");

  return ctx.reply("🚫 Job ignored");
});

  /* =========================
     NEXT FEED
  ========================= */
  bot.action(/next_(.+)/, async (ctx) => {
  const userId = String(ctx.from.id);

  const result = jobState.getNextJob(userId);

  if (!result || !result.job) {
    return ctx.reply("📭 Feed empty");
  }

  if (result.done) {
    return ctx.reply("📭 End of feed");
  }

  const job = result.job;

  return ctx.reply(
`📢 FEED JOB

💼 ${job.title}
📍 ${job.city}
🏢 ${job.mode}
💰 ₦${job.salary}

📊 Score:
${job.score?.score ?? 0}
(${job.score?.grade ?? "C"})`,
    Markup.inlineKeyboard([
      [
        Markup.button.callback("💾 Save", `save_${job.id}`),
        Markup.button.callback("📤 Apply", `apply_${job.id}`),
        Markup.button.callback("🚫 Ignore", `ignore_${job.id}`)
      ],
      [
        Markup.button.callback("⏭ Next", `next_${userId}`)
      ]
    ])
  );
});

  /* =========================
     SAVED JOBS
  ========================= */
  bot.command("saved", async (ctx) => {
    const userId = String(ctx.from.id);

    SAVED_PAGE.set(userId, 0);

    return renderSaved(ctx, userId);
  });

  bot.action(/saved_next_(.+)/, async (ctx) => {
    const userId = String(ctx.from.id);

    const current = SAVED_PAGE.get(userId) || 0;
    SAVED_PAGE.set(userId, current + 1);

    await ctx.answerCbQuery();

    return renderSaved(ctx, userId);
  });

  bot.action(/saved_prev_(.+)/, async (ctx) => {
    const userId = String(ctx.from.id);

    const current = SAVED_PAGE.get(userId) || 0;
    SAVED_PAGE.set(userId, Math.max(0, current - 1));

    await ctx.answerCbQuery();

    return renderSaved(ctx, userId);
  });

  async function renderSaved(ctx, userId) {
    const jobs = await savedJobService.getSavedJobs(userId);

    if (!jobs.length) {
      return ctx.reply("📭 No saved jobs yet");
    }

    const page = SAVED_PAGE.get(userId) || 0;
    const start = page * SAVED_SIZE;

    const chunk = jobs.slice(start, start + SAVED_SIZE).reverse();

    if (!chunk.length) {
      SAVED_PAGE.set(userId, 0);
      return ctx.reply("📭 End of saved jobs");
    }

    for (const job of chunk) {
      await ctx.reply(
`💾 SAVED JOB

💼 ${job.title}
📍 ${job.city}
🏢 ${job.mode}
💰 ₦${job.salary}

🕒 Saved:
${new Date(job.savedAt).toLocaleDateString()}`,

        Markup.inlineKeyboard([
          [
            Markup.button.callback("🗑 Delete", `delete_${job.id}`),
            Markup.button.callback("📤 Apply", `apply_${job.id}`)
          ]
        ])
      );
    }

    return ctx.reply(
      `📄 Page ${page + 1}`,
      Markup.inlineKeyboard([
        [
          Markup.button.callback("⬅️ Prev", `saved_prev_${userId}`),
          Markup.button.callback("➡️ Next", `saved_next_${userId}`)
        ]
      ])
    );
  }
};
