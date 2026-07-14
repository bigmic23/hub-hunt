function detectFalseJob(text = "") {
  const lower = text.toLowerCase();

  let risk = 0;

  // 🚨 scam / vague patterns
  if (/we are currently hiring for:/i.test(lower)) risk += 25;
  if (/no experience required/i.test(lower)) risk += 10;
  if (/work from home.*earn/i.test(lower)) risk += 25;
  if (/urgent hiring now|limited slots/i.test(lower)) risk += 20;

  // 🚨 missing structure signals
  if (!/salary|₦|ngn|range/i.test(lower)) risk += 15;
  if (!/location|based in|office/i.test(lower)) risk += 10;

  // 🚨 too vague titles
  if (/job opportunity|career opportunity|vacancy/i.test(lower)) risk += 15;

  // 🚨 contact-only posts (common spam pattern)
  if (/whatsapp|telegram|dm me/i.test(lower)) risk += 20;

  // 🚨 missing role clarity
  const hasRole =
    /manager|assistant|officer|support|customer|developer|writer|coordinator/i.test(lower);

  if (!hasRole) risk += 25;

  // clamp
  risk = Math.min(100, risk);

  return {
    risk,
    isFalse: risk >= 60,
    level:
      risk >= 80 ? "CRITICAL" :
      risk >= 60 ? "HIGH" :
      risk >= 40 ? "MEDIUM" : "LOW"
  };
}

module.exports = {
  detectFalseJob
};
