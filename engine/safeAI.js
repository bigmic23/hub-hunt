async function safeAI(fn) {
  try {
    return await fn();
  } catch (e) {
    console.log("AI ERROR:", e.message);
    return { role: null, company: null, salary: null, location: null };
  }
}

module.exports = { safeAI };
