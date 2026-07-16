const axios = require("axios");

async function remoteok() {

    try {

        const { data } = await axios.get(
            "https://remoteok.com/api",
            {
                headers: {
                    "User-Agent": "HubHunt"
                }
            }
        );

        if (!Array.isArray(data)) {
            return [];
        }

        return data
            .filter(job => job.id)
            .map(job => ({

                id:
                    `remoteok-${job.id}`,

                title:
                    job.position || "",

                company:
                    job.company || "",

                description:
                    job.description || "",

                location:
                    job.location || "Remote",

                country:
                    "Global",

                salary:
                    job.salary_min && job.salary_max
                        ? `$${job.salary_min} - $${job.salary_max}`
                        : "Not specified",

                mode:
                    "remote",

                visaSponsorship:
                    false,

                applyUrl:
                    job.apply_url ||
                    job.url,

                source:
                    "RemoteOK",

                postedAt:
                    job.date

            }));

    }

    catch (err) {

        console.error(
            "RemoteOK:",
            err.message
        );

        return [];

    }

}

module.exports = remoteok;
