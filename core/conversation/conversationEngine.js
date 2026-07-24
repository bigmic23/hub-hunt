// Channel-agnostic conversation engine.
// WhatsApp, Telegram, or any future channel all call handleMessage()
// and get back a plain, channel-neutral response.
// This file knows nothing about WhatsApp or Telegram message formats.

const AI = require("../../services/ai/core");

async function handleMessage({ platform, userId, text, state }) {
  const result = await AI.process({
    platform,
    text,
    userId,
    state
  });

  console.log("🔥 AI CORE reached", platform, text);

  return result;
}

module.exports = {
  handleMessage
};
