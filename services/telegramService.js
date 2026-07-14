const bot = require("../bot");

function getApplyUrl(job) {
  const link = job?.applyLink;

  if (!link) return "https://t.me";

  if (link.startsWith("http://") || link.startsWith("https://")) {
    return link;
  }

  // fallback for email or raw text
  return "https://t.me";
}

function buildButtons(job) {
  return {
    inline_keyboard: [
      [
        {
          text: "📩 Apply",
          url: getApplyUrl(job)
        }
      ],
      [
        {
          text: "💾 Save",
          callback_data: `save_${job?.id}`
        },
        {
          text: "❌ Reject",
          callback_data: `reject_${job?.id}`
        }
      ]
    ]
  };
}

async function sendJob(channelId, message, job) {
  try {
    if (!channelId || typeof channelId !== "string") {
      console.error("Invalid TELEGRAM_CHANNEL_ID:", channelId);
      return;
    }

    if (
      !channelId.startsWith("@") &&
      !channelId.startsWith("-100")
    ) {
      console.error("Channel ID format invalid:", channelId);
      return;
    }

    await bot.telegram.sendMessage(channelId, message, {
      parse_mode: "HTML",
      reply_markup: buildButtons(job)
    });

    console.log("[CHANNEL SENT]");
  } catch (err) {
    console.error(
      "Telegram sendJob failed:",
      err.message
    );
  }
}

module.exports = {
  sendJob
};
