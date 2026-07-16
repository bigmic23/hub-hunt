const axios = require("axios");

module.exports = async function () {

    try {

        const { data } = await axios.get(
            "https://remoteok.com/api",
            {
                headers: {
                    "User-Agent": "Hub-Hunt"
                },
                timeout: 20000
            }
        );

        return data
            .filter(job => job.id)
            .map(job => ({

                id: `remoteok-${job.id}`,

                title: job.position,

                company: job.company,

                location:
                    job.location || "Worldwide",

                country: "Global",

                mode: "Remote",

                visaSponsored: false,

                salary:
                    job.salary_min && job.salary_max
                        ? `${job.salary_min}-${job.salary_max}`
                        : "Not specified",

                applyUrl:
                    job.apply_url ||
                    `https://remoteok.com/remote-jobs/${job.id}`,

                source: "RemoteOK"

            }));

    } catch (err) {

        console.error(
            "RemoteOK:",
            err.message
        );

        return [];

    }

};
