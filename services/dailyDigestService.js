const { discoverJobs } = require("./jobDiscoveryService");

async function sendDailyDigest(bot, userId) {
  try {
    const jobs = await discoverJobs(userId);

    if (!jobs.length) {
      return bot.telegram.sendMessage(
        userId,
        "🌅 Daily Digest\n\nNo matching jobs today."
      );
    }

    const top = jobs.slice(0, 5);

    let text = "🌅 *Your Daily Recruiter Digest*\n\n";
    text += `Found *${jobs.length}* matching jobs.\n\n`;

    top.forEach((job, i) => {
      text += `${i + 1}. *${job.title}*\n`;
      text += `🏢 ${job.company || "Unknown"}\n`;
      text += `📊 ${job.score.score}/1000 (${job.score.grade})\n\n`;
    });

    text += "Type /jobs to browse the full feed.";

    await bot.telegram.sendMessage(userId, text, {
      parse_mode: "Markdown"
    });

  } catch (err) {
    console.error("[DIGEST]", err);
  }
}

module.exports = {
  sendDailyDigest
};
