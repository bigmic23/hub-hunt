// services/discovery/jobSourceManager.js

class JobSourceManager {
    constructor() {
        this.sources = [];
    }

    register(source) {
        if (!source || typeof source.fetchJobs !== "function") {
            throw new Error("Invalid job source.");
        }

        this.sources.push(source);
    }

    async fetchJobs() {
        const jobs = [];

        for (const source of this.sources) {
            try {
                console.log(`Fetching jobs from ${source.name}...`);

                const results = await source.fetchJobs();

                if (Array.isArray(results)) {
                    jobs.push(...results);
                }

            } catch (err) {
                console.error(
                    `Failed fetching from ${source.name}:`,
                    err.message
                );
            }
        }

        return jobs;
    }
}

module.exports = new JobSourceManager();
