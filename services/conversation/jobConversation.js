const session = require("../state/sessionManager");
const { handleMessage } = require("../../core/conversation/conversationEngine");

// WhatsApp-specific adapter: translates the engine's plain response
// into WhatsApp's expected message shape.
async function handleText(phone, text) {
  const state = session.get(phone);

  const result = await handleMessage({
    platform: "whatsapp",
    userId: phone,
    text,
    state
  });

  session.set(phone, state);

  return {
    type: "text",
    text: {
      body: result.reply
    }
  };
}

module.exports = {
  handleText
};
