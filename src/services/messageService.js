const { handleMessage: conversation } = require("../../core/conversation/conversationEngine");

async function handleMessage(msg, bot) {
  const chatId = String(msg.chat.id);
  const text = msg.text;

  if (!text) return;

  const result = await conversation({
    userId: chatId,
    text,
    state: {}
  });

// 2. Respond
  await bot.sendMessage(chatId, result.reply);
}

module.exports = {
  handleMessage
};
