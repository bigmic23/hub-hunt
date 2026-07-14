const { client } = require("../ai/client");

async function extractJob(text) {
  const res = await client.chat.completions.create({
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
  salary: number | null,
  location: string | null
}

Rules:
- role = job title
- company = employer
- salary = number only
- location = Remote if mentioned
        `
      },
      { role: "user", content: text }
    ],
    response_format: { type: "json_object" }
  });

  return JSON.parse(res.choices[0].message.content);
}

module.exports = { extractJob };
