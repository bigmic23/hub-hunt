const OpenAI = require("openai");
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function callLLM(prompt) {
  const res = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }]
  });

  return res.choices[0].message.content;
}

module.exports.callLLM = async (text) => {
  return {
    title: null,
    mode: null,
    city: null,
    salary: null,
    raw: text
  };
};
