const manager = require("./jobSourceManager");
const arbeitnow = require("./api/arbeitnow");

// Register only implemented sources
manager.register(arbeitnow);

// Register these after you implement them
// manager.register(require("./rss/remoteok"));
// manager.register(require("./company/siemens"));

async function fetchAllJobs() {
    return await manager.fetchJobs();
}

module.exports = { fetchAllJobs };
