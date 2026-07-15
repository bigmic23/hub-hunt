const { discoverJobs } = require("./services/jobDiscoveryService");

(async () => {
    const jobs = await discoverJobs("test-user");

    console.log("Jobs discovered:", jobs.length);

    console.log(jobs.slice(0, 5));
})();
