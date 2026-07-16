const axios = require("axios");

module.exports = async function () {

    try {

        const { data } = await axios.get(
            "https://remotive.com/api/remote-jobs",
            {
                timeout: 20000
            }
        );

        const jobs = data.jobs || [];

        return jobs.map(job => ({

            id: `remotive-${job.id}`,

            title: job.title,

            company: job.company_name,

            location: job.candidate_required_location || "Worldwide",

            country: "Global",

            mode: "Remote",

            visaSponsored: false,

            salary:
                job.salary || "Not specified",

            applyUrl: job.url,

            source: "Remotive"

        }));

    } catch (err) {

        console.error(
            "Remotive:",
            err.message
        );

        return [];

    }

};
