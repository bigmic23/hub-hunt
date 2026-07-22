const express = require("express");
const { Telegraf, session } = require("telegraf");

require("dotenv").config();

const bot = new Telegraf(process.env.BOT_TOKEN);

const { startDailyDigest } = require("./services/dailyDigestScheduler");
const { validateEnv } = require("./services/startupValidator");
const whatsappWebhook = require("./services/whatsapp/webhook");

const cron = require("node-cron");
const { scrapeJobsAndSend } = require("./services/jobFeedService");

cron.schedule("0 8 * * *", async () => {
  const chatId = process.env.TELEGRAM_CHANNEL_ID;
  await scrapeJobsAndSend(bot, chatId);
});

bot.use(session());

module.exports = bot;

require("./routes/jobRoutes")(bot);

validateEnv();

bot.launch();

require("./server");

console.log("Bot running...");

startDailyDigest(bot);

// -----------------------------
// WhatsApp Webhook Server
// -----------------------------
const app = express();

app.use(express.json());

app.use("/whatsapp", whatsappWebhook);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`[WHATSAPP] Listening on port ${PORT}`);
});
