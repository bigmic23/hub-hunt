const { Markup } = require("telegraf");

const sessionService = require("../services/sessionService");
const savedJobService = require("../services/savedJobService");
const jobFeedService = require("../services/jobFeedService");
const userProfileService = require("../services/userProfileService");
const pipeline = require("../services/jobPipelineService");
const { learnRanking } = require("../services/jobRanker");

const { extractProfileFromCV } = require("../intelligence/cvParser");
const telegramService = require("../services/telegramService");
const feedMemory = require("../services/feedMemoryService");

const { generateApplication } = require("../services/ai/applicationBuilder");
const { recordAction } = require("../services/ai/memory/recruiterMemoryDB");

const { safeIngest } = require("../utils/safeIngest");
const profileCommand = require("../commands/profile");
const { sendDailyDigest } = require("../services/dailyDigestService");

console.log("JOB ROUTES LOADED");

function cleanText(str) {
  if (!str) return "";
  // Remove lone surrogates that break UTF-8
  return str.replace(/[\uD800-\uDFFF]/g, "").trim();
}

module.exports = function (bot) {
  const SAVED_PAGE = new Map();
  const SAVED_SIZE = 5;

  function resolveJob(ctx, jobId) {
    const userId = String(ctx.from.id);
    const sessionJob = ctx.session?.lastJob;
    const feed = jobFeedService.getFeed(userId);
    const feedJob = feed?.jobs?.find(j => String(j.id) === String(jobId));
    return sessionJob || feedJob || null;
  }

bot.start(async (ctx) => {
  await ctx.reply(
`👋 Welcome to Hub Hunt!

Your AI Career Assistant.

Use these commands to get started:

/jobs - Find jobs
/cv - Save your CV
/mycvs - View saved CVs
/saved - View saved jobs`
  );
});

  // ─────────────────────────────────────────
  // /cv [name] — Save a CV
  // ─────────────────────────────────────────
  bot.command("cv", async (ctx) => {
    const userId = String(ctx.from.id);
    const args = ctx.message.text.split(" ").slice(1);
    const cvName = args[0] || "Default";

    await sessionService.updateSession(userId, {
      step: "WAITING_CV",
      cvName
    });

    return ctx.reply(
`📄 Send your CV text now for: *${cvName}*

Example:
Customer support experience
Excel, communication skills
Remote jobs preferred
Salary expectation: 150000`,
      { parse_mode: "Markdown" }
    );
  });

  // ─────────────────────────────────────────
  // /mycvs — View all saved CVs
  // ─────────────────────────────────────────
  bot.command("mycvs", async (ctx) => {
    const userId = String(ctx.from.id);
    const profile = await userProfileService.get(userId);
    const cvList = profile?.cvList;

    if (!cvList || !Object.keys(cvList).length) {
      return ctx.reply("No CVs saved yet.\n\nUse /cv to save one.\nUse /cv support to save one named 'support'.");
    }

    const lines = Object.entries(cvList).map(([name, cv]) => {
      const skills = (cv.skills || []).join(", ") || "none";
      const salary = cv.salaryExpectation ? `₦${cv.salaryExpectation}` : "not set";
      return `📄 *${name}*\nSkills: ${skills}\nExpected salary: ${salary}`;
    });

    return ctx.reply(lines.join("\n\n"), { parse_mode: "Markdown" });
  });

  // ─────────────────────────────────────────
  // /deletecv [name] — Delete a CV
  // ─────────────────────────────────────────
  bot.command("deletecv", async (ctx) => {
    const userId = String(ctx.from.id);
    const args = ctx.message.text.split(" ").slice(1);
    const cvName = args[0];

    if (!cvName) return ctx.reply("Usage: /deletecv [name]\nExample: /deletecv support");

    const profile = await userProfileService.get(userId) || {};
    const cvList = profile.cvList || {};

    if (!cvList[cvName]) return ctx.reply(`No CV named "${cvName}" found.\n\nUse /mycvs to see your saved CVs.`);

    delete cvList[cvName];
    profile.cvList = cvList;
    await userProfileService.save(userId, profile);

    return ctx.reply(`🗑 CV "${cvName}" deleted.`);
  });

// ─────────────────────────────────────────
  // /setprofile — Save name, email, phone
  // ─────────────────────────────────────────
  bot.command("setprofile", async (ctx) => {
    const userId = String(ctx.from.id);

    await sessionService.updateSession(userId, {
      step: "WAITING_PROFILE_INFO"
    });

    return ctx.reply(
`📝 Send your details in this exact format:

Name: John Doe
Email: john@example.com
Phone: +234 812 345 6789`
    );
  });

  // ─────────────────────────────────────────
  // /myprofile — View saved contact info
  // ─────────────────────────────────────────
  bot.command("myprofile", async (ctx) => {
    const userId = String(ctx.from.id);
    const profile = await userProfileService.get(userId) || {};

    if (!profile.name && !profile.email && !profile.phone) {
      return ctx.reply("No contact info saved yet.\n\nUse /setprofile to add your name, email, and phone.");
    }

    return ctx.reply(
`👤 *Your Contact Info*

Name: ${profile.name || "Not set"}
Email: ${profile.email || "Not set"}
Phone: ${profile.phone || "Not set"}

Use /setprofile to update.`,
      { parse_mode: "Markdown" }
    );
  });

  // ─────────────────────────────────────────
  // /jobs — Trigger job feed
  // ─────────────────────────────────────────
  bot.command("jobs", async (ctx) => {
    const userId = String(ctx.from.id);
    const { scrapeJobsAndSend } = require("../services/jobFeedService");
    await scrapeJobsAndSend(bot, userId);
  });

  // ─────────────────────────────────────────
  // /saved — View saved jobs
  // ─────────────────────────────────────────
  bot.command("saved", async (ctx) => {
    const userId = String(ctx.from.id);
    const jobs = await savedJobService.getSavedJobs(userId);

    if (!jobs.length) return ctx.reply("No saved jobs yet.");

    for (const job of jobs.slice(0, SAVED_SIZE)) {
      await ctx.reply(
        `💾 *${job.title}*\n📍 ${job.city}\n💰 ₦${job.salary}`,
        {
          parse_mode: "Markdown",
          ...Markup.inlineKeyboard([
            [Markup.button.callback("📤 Apply", `apply_${job.id}`)]
          ])
        }
      );
    }
  });

  // ── Profile  ──
  bot.command("profile", profileCommand);

  // ── Digest  ──
  bot.command("digest", async (ctx) => {
    await sendDailyDigest(bot, String(ctx.from.id));
  });

  // ─────────────────────────────────────────
  // TEXT HANDLER — CV saving + Job processing
  // ─────────────────────────────────────────
  bot.on("text", async (ctx) => {
    console.log("[TEXT RECEIVED]", ctx.message.text);
    console.log("[FROM USER]", ctx.from.id);

    const text = ctx.message.text;
    if (text.startsWith("/")) return;

    const userId = String(ctx.from.id);
    const session = await sessionService.getSession(userId);

  // ── Save profile info ──
    if (session?.step === "WAITING_PROFILE_INFO") {
      const nameMatch = text.match(/name:\s*(.+)/i);
      const emailMatch = text.match(/email:\s*(.+)/i);
      const phoneMatch = text.match(/phone:\s*(.+)/i);

      if (!nameMatch && !emailMatch && !phoneMatch) {
        return ctx.reply(
`⚠️ I couldn't read that. Please use this format:

Name: John Doe
Email: john@example.com
Phone: +234 812 345 6789`
        );
      }

      const existing = await userProfileService.get(userId) || {};

      await userProfileService.save(userId, {
        ...existing,
        name: nameMatch?.[1]?.trim() || existing.name,
        email: emailMatch?.[1]?.trim() || existing.email,
        phone: phoneMatch?.[1]?.trim() || existing.phone
      });

      await sessionService.updateSession(userId, { step: null });

      return ctx.reply("✅ Profile saved! You can now use /myprofile to view it, or /setprofile to update anytime.");
    }


    // ── Save CV ──
    if (session?.step === "WAITING_CV") {
      const cvName = session.cvName || "Default";
      const profile = extractProfileFromCV(text);

      const existing = await userProfileService.get(userId) || {};
      const cvList = existing.cvList || {};
      cvList[cvName] = profile;

      await userProfileService.save(userId, { ...existing, cvList });
      await sessionService.updateSession(userId, { step: null, cvName: null });

      return ctx.reply(
`✅ CV saved as *${cvName}*

Skills found: ${profile.skills?.join(", ") || "none detected"}
Salary expectation: ${profile.salaryExpectation ? "₦" + profile.salaryExpectation : "not detected"}

Tip: paste a job post now to test your match score!
Use /mycvs to view all your CVs.`,
        { parse_mode: "Markdown" }
      );
    }

    // ── Job processing ──
    const looksLikeJob =
      /salary|\d{5,7}|remote|hybrid|onsite|lagos|developer|support|engineer|analyst|intern/i.test(text);

    if (session?.step !== "WAITING_JOB" && !looksLikeJob) return;

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
      return ctx.reply("❌ No valid job extracted.\n\nMake sure the post includes a job title, salary, or location.");
    }

    await sessionService.updateSession(userId, { lastJob: result.job });

    const feedState = jobFeedService.getFeed(userId);
    const existing = Array.isArray(feedState?.jobs) ? feedState.jobs : [];
    const updatedFeed = jobFeedService.removeDuplicates([result.job, ...existing]);
    jobFeedService.setFeed(userId, updatedFeed);

    const score = result.job?.score;
    const reasons = score?.reasons || [];
    const matchedCv = result.job?.matchedCv || "Default";

    const scoreBar =
      score?.score >= 800 ? "🟢 Excellent match" :
      score?.score >= 600 ? "🟡 Good match" :
      score?.score >= 400 ? "🟠 Fair match" :
      "🔴 Poor match";

    return ctx.reply(
`💼 *${cleanText(result.job.title)}*
📍 ${result.job.city || "Location not stated"}
🏢 ${result.job.mode || "Mode not stated"}
💰 ₦${result.job.salary || "Not stated"}

📊 *${scoreBar}*
Score: ${score?.score || 0}/1000  Grade: ${score?.grade || "F"}
📄 CV matched: ${matchedCv}

${reasons.length ? reasons.join("\n") : "⚠️ No CV saved — type /cv to save your CV first"}`,
      {
        parse_mode: "Markdown",
        ...Markup.inlineKeyboard([
          [
            Markup.button.callback("💾 Save", "save"),
            result.job.applyLink && !result.job.applyLink.includes("@") ? Markup.button.url("📤 Apply", result.job.applyLink) : Markup.button.callback("📤 Apply", `apply_${result.job.id}`),
            Markup.button.callback("🚫 Ignore", "ignore")
          ],
          [Markup.button.callback("⏭ Next", "next_job")]
        ])
      }
    );
  });

  // ─────────────────────────────────────────
  // SAVE action
  // ─────────────────────────────────────────
  bot.action("save", async (ctx) => {
    const userId = String(ctx.from.id);

    const job = jobFeedService.getCurrentJob(userId);

    console.log("SAVE DEBUG:", {
      userId,
      currentJob: job
    });

    if (!job) {
        return ctx.answerCbQuery("No active job.");
    }

    const session = await sessionService.getSession(userId);

    feedMemory.markSaved(userId, job.id);
    pipeline.setState(userId, job.id, "SAVED");
    learnRanking(job, "SAVED");

    let profile = await userProfileService.get(userId);
    if (!profile) {
      profile = { userId, cvProfile: {}, weights: { skillMatch: 1, roleMatch: 1, salaryMatch: 1 } };
    }

    const { adjustWeights } = require("../services/ai/adaptiveWeightsEngine");
    const safeProfile = profile || {};
    safeProfile.cvProfile = safeProfile.cvProfile || {};
    safeProfile.weights = safeProfile.weights || { skillMatch: 1, roleMatch: 1, salaryMatch: 1 };

    const updatedWeights = adjustWeights(safeProfile, { action: "SAVED", job: session?.lastJob || null });
    safeProfile.weights = updatedWeights && typeof updatedWeights === "object" ? updatedWeights : safeProfile.weights;
    await userProfileService.save(userId, safeProfile);

    await recordAction(userId, job, "SAVED", { cvMatchScore: job?.score?.score });

    const { updateCvProfileFromBehavior } = require("../services/ai/profile/cvLearningEngine");
    profile.cvProfile = updateCvProfileFromBehavior(profile.cvProfile, { type: "SAVED", job });
    await userProfileService.save(userId, profile);

    await ctx.answerCbQuery("Saved ✅");
    return ctx.reply("💾 Job saved!");
  });

  // ─────────────────────────────────────────
  // APPLY action
  // ─────────────────────────────────────────
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

    const { updateCvProfileFromBehavior } = require("../services/ai/profile/cvLearningEngine");
    profile.cvProfile = updateCvProfileFromBehavior(profile.cvProfile, { type: "APPLIED", job });
    await userProfileService.save(userId, profile);

    await ctx.reply(
`📩 *APPLICATION READY*

*Subject:* ${app.subject}

${app.body}`,
      { parse_mode: "Markdown" }
    );

    await ctx.answerCbQuery("Applied ✅");
    return ctx.reply("📤 Marked as APPLIED");
  });

  // ─────────────────────────────────────────
  // IGNORE action
  // ─────────────────────────────────────────
  bot.action("ignore", async (ctx) => {
    const userId = String(ctx.from.id);

    const job = jobFeedService.getCurrentJob(userId);

    if (!job) {
        return ctx.answerCbQuery("No active job.");
    }

    feedMemory.markIgnored(userId, job.id);
    pipeline.setState(userId, job.id, "IGNORED");
    learnRanking(job, "IGNORED");
    await recordAction(userId, job, "REJECTED", {});

    const profile = await userProfileService.get(userId);
    const { updateCvProfileFromBehavior } = require("../services/ai/profile/cvLearningEngine");
    profile.cvProfile = updateCvProfileFromBehavior(profile.cvProfile, { type: "REJECTED", job });
    await userProfileService.save(userId, profile);

    await ctx.answerCbQuery("Ignored 🚫");
    return ctx.reply("🚫 Job ignored");
  });

// ─────────────────────────────────────────
  // NEXT JOB action
  // ─────────────────────────────────────────
bot.action("next_job", async (ctx) => {
    const userId = String(ctx.from.id);

    console.log("FEED DEBUG:", jobFeedService.debug(userId));

    const { job, done } = jobFeedService.getNextJob(userId);

    if (done || !job) {
        return ctx.answerCbQuery("No more jobs.");
    }

    await ctx.reply(
        `💼 ${job.title}
🏢 ${job.company}
📍 ${job.location}
💰 ${job.salary}

${job.applyUrl}`,
        {
            ...Markup.inlineKeyboard([
                [
                    Markup.button.callback("💾 Save", "save"),
                    Markup.button.url("📤 Apply", job.applyUrl)
                ],
                [
                    Markup.button.callback("🚫 Ignore", "ignore"),
                    Markup.button.callback("⏭ Next", "next_job")
                ]
            ])
        }
    );

    await ctx.answerCbQuery();
});

  // ─────────────────────────────────────────
  // NEXT action
  // ─────────────────────────────────────────
  bot.action(/next_(.+)/, async (ctx) => {
    const userId = String(ctx.from.id);
    const result = jobFeedService.getNextJob(userId);

    if (!result?.job) return ctx.reply("📭 No more jobs in feed");

    const job = result.job;
    const score = job.score;

    return ctx.reply(
`💼 *${cleanText(job.title)}*
📍 ${job.city}
🏢 ${job.mode}
💰 ₦${job.salary}
📊 Score: ${score?.score || 0}/1000 (${score?.grade || "?"})`,
      {
        parse_mode: "Markdown",
        ...Markup.inlineKeyboard([
          [
            Markup.button.callback("💾 Save", "save"),
            Markup.button.callback("📤 Apply", `apply_${job.id}`),
            Markup.button.callback("🚫 Ignore", "ignore")
          ],
          [Markup.button.callback("⏭ Next", "next_job")]
        ])
      }
    );
  });
};
