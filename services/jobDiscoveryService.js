const { fetchAllJobs } = require("./discovery");
const { rankJobs } = require("./jobRankingService");

async function discoverJobs(userId) {

    let jobs = await fetchAllJobs();

    // Remove duplicates
    const seen = new Set();

    jobs = jobs.filter(job => {

        if (!job.id) return false;

        if (seen.has(job.id)) return false;

        seen.add(job.id);

        return true;
    });


    // Basic quality filtering
    jobs = jobs.filter(job => {

        const title = (job.title || "").toLowerCase();

        return (
            title.includes("assistant") ||
            title.includes("support") ||
            title.includes("customer") ||
            title.includes("health") ||
            title.includes("care") ||
            title.includes("admin") ||
            title.includes("nurse") ||
            title.includes("developer") ||
            title.includes("engineer")
        );

    });


    // Keep only top 20 for now
    jobs = rankJobs(jobs, {
    skills: [
        "healthcare",
        "assistant",
        "care",
        "support",
        "customer service"
    ]
});


return jobs.slice(0,10);
}

module.exports = {
    discoverJobs
};
