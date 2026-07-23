// Channel-agnostic conversation engine.
// WhatsApp, Telegram, or any future channel all call handleMessage()
// and get back a plain, channel-neutral response.
// This file knows nothing about WhatsApp or Telegram message formats.

const AI = require("../../services/ai/core");

async function handleMessage({ userId, text, state }) {
  // processRecruitment already returns { nextStep, data, reply }
  // in a plain, channel-neutral shape — we just pass it through.
  const result = await AI.process({
    platform: "whatsapp",
    text,
    userId,
    state
});

  return result;
}

module.exports = {
  handleMessage
};
