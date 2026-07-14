async function aiExtract(text, AI) {
  const res = await AI.client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `
Return ONLY JSON:
{
  role: string | null,
  company: string | null,
  salary: string | null,
  location: string | null
}
`
      },
      { role: "user", content: text }
    ],
    response_format: { type: "json_object" }
  });

  return JSON.parse(res.choices[0].message.content);
}

module.exports = { aiExtract };
