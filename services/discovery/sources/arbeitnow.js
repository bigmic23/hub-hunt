const axios = require("axios");

module.exports = async function () {

    try {

        const { data } = await axios.get(
            "https://www.arbeitnow.com/api/job-board-api",
            {
                timeout: 20000
            }
        );

        const jobs = data.data || [];

        return jobs.map(job => ({

            id: `arbeitnow-${job.slug}`,

            title: job.title,

            company: job.company_name,

            location: job.location || "Germany",

            country: "Germany",

            mode:
                job.remote ? "Remote" : "On-site",

            visaSponsored: false,

            salary:
                job.salary || "Not specified",

            applyUrl: job.url,

            source: "Arbeitnow"

        }));

    } catch (err) {

        console.error(
            "Arbeitnow:",
            err.message
        );

        return [];

    }

};
