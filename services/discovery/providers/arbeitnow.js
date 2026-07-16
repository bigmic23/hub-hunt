const axios = require("axios");

async function arbeitnow() {

    try {

        const { data } = await axios.get(
            "https://www.arbeitnow.com/api/job-board-api"
        );

        const jobs =
            data.data || [];

        return jobs.map(job => ({

            id:
                job.slug,

            title:
                job.title,

            company:
                job.company_name,

            description:
                job.description || "",

            location:
                job.location || "",

            country:
                "Germany",

            salary:
                job.salary || "Not specified",

            mode:
                job.remote
                    ? "remote"
                    : "onsite",

            visaSponsorship:
                false,

            applyUrl:
                job.url,

            source:
                "Arbeitnow",

            postedAt:
                job.created_at

        }));

    }

    catch (err) {

        console.error(
            "Arbeitnow:",
            err.message
        );

        return [];

    }

}

module.exports = arbeitnow;
