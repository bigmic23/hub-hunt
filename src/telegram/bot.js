const TelegramBot = require("node-telegram-bot-api");
const { handleMessage } = require("../services/messageService");

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

bot.on("message", async (msg) => {
  try {
    await handleMessage(msg, bot);
  } catch (err) {
    console.error("Telegram handler error:", err);
    bot.sendMessage(msg.chat.id, "Error processing request.");
  }
});

module.exports = bot;
