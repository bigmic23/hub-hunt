const memoryService = require("./memoryService");
const aiService = require("./aiService");

async function handleMessage(msg, bot) {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (!text) return;

  // 1. Load user memory
  const memory = await memoryService.getUser(chatId);

  // 2. Process with AI / logic
  const response = await aiService.process(text, memory);

  // 3. Save updated memory if needed
  await memoryService.updateUser(chatId, response.updatedMemory);

  // 4. Respond
  await bot.sendMessage(chatId, response.reply);
}

module.exports = { handleMessage };
