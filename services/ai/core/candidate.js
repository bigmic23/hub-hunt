const { processRecruitment } = require("../../../engine/recruiterOrchestrator");

async function process(payload) {
  return processRecruitment({
    text: payload.text,
    userId: payload.userId,
    state: payload.state || {}
  });
}

module.exports = {
  process
};
