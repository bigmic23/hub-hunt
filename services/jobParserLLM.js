const { callLLM } = require("../aiClient");

async function parseJob(text) {
  const prompt = `
Extract job data STRICTLY as JSON:

{
  "title": "",
  "mode": "Remote|Hybrid|On-site|Unknown",
  "city": "",
  "salary": number|null,
  "company": ""
}

RULES:
- title = ONLY role name
- city = real city or "Global"
- ignore descriptions completely
- salary must be numeric only
- no emojis
- no explanations

TEXT:
"""${text}"""
`;

  const res = await callLLM(prompt);

  try {
    return JSON.parse(res);
  } catch {
    return {
      title: "Unknown Role",
      mode: "Unknown",
      city: "Global",
      salary: null,
      company: null
    };
  }
}

module.exports = { parseJob };
