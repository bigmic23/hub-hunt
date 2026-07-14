const sessionService = require("../services/sessionService");

async function buildContext(userId) {
  const session = await sessionService.getSession(userId);

  return {
    preferredMode: session?.preferredMode || null,
    minSalary: session?.minSalary || 0,
    history: session?.history || []
  };
}

module.exports = { buildContext };
