const session = require("../state/sessionManager");

async function handleText(phone, text) {
  const state = session.get(phone);

  if (!state.step) {
    session.set(phone, {
      step: "SEARCH",
      query: text
    });

    return {
      type: "text",
      text: {
        body: `🔍 Searching jobs for:\n\n${text}`
      }
    };
  }

  return {
    type: "text",
    text: {
      body: "Conversation engine active."
    }
  };
}

module.exports = {
  handleText
};
