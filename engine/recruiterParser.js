const { OpenAI } = require("openai");
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function aiExtract(text) {
  const res = await AI.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `
Extract job data.

Return ONLY JSON:
{
  role: string | null,
  company: string | null,
  salary: string | null,
  location: string | null
}

Rules:
- role = job title
- company = employer
- salary = number only
- location = Remote if mentioned
- if missing → null
`
      },
      { role: "user", content: text }
    ],
    response_format: { type: "json_object" }
  });

  return JSON.parse(res.choices[0].message.content);
}

async function safeAI(fn, retries = 2) {
  for (let i = 0; i <= retries; i++) {
    try {
      return await fn();
    } catch (e) {
      if (i === retries) throw e;
      await new Promise(r => setTimeout(r, 500 * (i + 1)));
    }
  }
}

function fastExtract(text) {
  const lower = text.toLowerCase();

  const salary = text.match(/\d{3,}/)?.[0] || null;

  let role = null;
  let company = null;

  const rolePatterns = [
    /remote\s+(.+?)\s+at/i,
    /(.+?)\s+at/i,
    /for\s+(.+?)\s+at/i
  ];

  for (const pattern of rolePatterns) {
    const m = text.match(pattern);
    if (m) {
      role = m[1].replace(/salary.*$/i, "").trim();
      break;
    }
  }

  const companyMatch =
    text.match(/at\s+(.+?)(?:\s+salary|$)/i);

  if (companyMatch) {
    company = companyMatch[1].trim();
  }

  const isRemote = lower.includes("remote");

  return {
    role,
    company,
    salary,
    location: isRemote ? "Remote" : null
  };
}

module.exports = { fastExtract, aiExtract, safeAI };
