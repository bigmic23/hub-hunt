const router = require("./router");

async function process(payload) {
  return router.route(payload);
}

module.exports = {
  process
};
