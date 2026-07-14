function log(tag, data) {
  console.log(`📌 [${tag}]`, data);
}

function error(tag, err) {
  console.error(`🚨 [${tag}]`, err?.message || err);
}

module.exports = { log, error };
