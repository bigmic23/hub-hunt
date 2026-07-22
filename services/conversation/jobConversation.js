const session = require("../state/sessionManager");
const { processRecruitment } = require("../../engine/recruiterOrchestrator");

async function handleText(phone, text) {
  const state = session.get(phone);

  const result = await processRecruitment({
    userId: phone,
    text,
    state
  });

  session.set(phone, state);

  return {
    type: "text",
    text: {
      body: result.reply
    }
  };
}

module.exports = {
  handleText
};
