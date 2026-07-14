const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function process(text, memory) {
  const res = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "You are a job assistant bot." },
      { role: "user", content: text }
    ]
  });

  return {
    reply: res.choices[0].message.content,
    updatedMemory: memory // placeholder
  };
}

module.exports = { process };
