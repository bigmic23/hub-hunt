const { Telegraf, session } = require("telegraf");

require("dotenv").config();

const bot = new Telegraf(
  process.env.BOT_TOKEN
);

const { startDailyDigest } = require("./services/dailyDigestScheduler");
const { validateEnv } = require("./services/startupValidator");

const cron = require("node-cron");
const { scrapeJobsAndSend } = require("./services/jobFeedService");

cron.schedule("0 8 * * *", async () => {
  const chatId = process.env.TELEGRAM_CHANNEL_ID;
  await scrapeJobsAndSend(bot, chatId);
});

bot.use(session());

// export FIRST
module.exports = bot;

// load routes AFTER export
require("./routes/jobRoutes")(bot);

// validate
validateEnv();

// launch LAST
bot.launch();

console.log("Bot running...");

startDailyDigest(bot);
