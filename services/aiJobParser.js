const { callLLM } = require("./aiClient");

async function parseJobWithAI(text) {
  const prompt = `
You are a job extraction engine.

Return ONLY valid JSON:

{
  "title": string,
  "mode": "Remote" | "Hybrid" | "On-site" | "Unknown",
  "city": string,
  "salary": number | null
}

RULES:
- title must be ONLY job role (no description, no emojis)
- mode must detect Remote/Hybrid/On-site
- city must be real city or "Global" if remote
- salary must be number only (remove commas, symbols)
- ignore job description content completely
- if unclear, use null or "Unknown"

TEXT:
"""${text}"""
`;

  const response = await callLLM(prompt);

  try {
    const parsed = JSON.parse(response);

    return {
      title: parsed.title || "Unknown Role",
      mode: parsed.mode || "Unknown",
      city: parsed.city || "Global",
      salary: parsed.salary ?? null
    };

  } catch (err) {
    return {
      title: "Unknown Role",
      mode: "Unknown",
      city: "Global",
      salary: null
    };
  }
}

module.exports = { parseJobWithAI };
