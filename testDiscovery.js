const { fetchAllJobs } = require("./services/discovery");

(async () => {
    const jobs = await fetchAllJobs();

    console.log("\nJobs Found:");
    console.log(jobs);
})();
