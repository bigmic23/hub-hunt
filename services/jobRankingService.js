const { getUserStats } = require("./ai/memory/recruiterMemoryDB");

async function rankJobs(jobs = [], profile = {}) {

    const stats = await getUserStats(profile.userId);

    const skills = (profile.skills || []).map(s => s.toLowerCase());

    return jobs
        .map(job => {

            let score = 0;

            const title = (job.title || "").toLowerCase();
            const company = (job.company || "").toLowerCase();
            const location = (
                job.location ||
                job.country ||
                ""
            ).toLowerCase();

            const text =
                title +
                " " +
                company +
                " " +
                location;

            //--------------------------------------------------
            // Learned interests
            //--------------------------------------------------

            skills.forEach(skill => {

                if (text.includes(skill))
                    score += 18;

            });

            //--------------------------------------------------
            // Remote / Hybrid / On-site
            //--------------------------------------------------

            if (text.includes("remote"))
                score += 35;

            if (text.includes("hybrid"))
                score += 25;

            if (
                text.includes("on-site") ||
                text.includes("onsite")
            )
                score += 12;

            //--------------------------------------------------
            // Visa sponsorship
            //--------------------------------------------------

            if (
                text.includes("visa") ||
                text.includes("relocation") ||
                text.includes("sponsorship")
            )
                score += 45;

            //--------------------------------------------------
            // High-demand industries
            //--------------------------------------------------

            const demand = [

                "software",
                "developer",
                "engineer",
                "data",
                "ai",
                "cloud",

                "customer support",
                "customer success",
                "sales",

                "marketing",
                "digital marketing",

                "finance",
                "accountant",

                "healthcare",
                "nurse",
                "care",

                "teacher",
                "education",

                "project manager",

                "product manager",

                "cybersecurity",

                "devops",

                "hr",

                "recruiter",

                "business analyst",

                "administration",

                "operations",

                "logistics",

                "supply chain"

            ];

            demand.forEach(keyword => {

                if (text.includes(keyword))
                    score += 10;

            });

            //--------------------------------------------------
            // Nigeria boost
            //--------------------------------------------------

            if (
                location.includes("nigeria") ||
                location.includes("lagos") ||
                location.includes("abuja") ||
                location.includes("port harcourt")
            )
                score += 25;

            //--------------------------------------------------
            // Global countries
            //--------------------------------------------------

            [
                "canada",
                "germany",
                "netherlands",
                "united kingdom",
                "uk",
                "ireland",
                "usa",
                "united states",
                "australia",
                "new zealand",
                "sweden",
                "norway",
                "denmark",
                "finland",
                "switzerland",
                "austria"
            ].forEach(country => {

                if (location.includes(country))
                    score += 20;

            });

            //--------------------------------------------------
            // Learn from behaviour
            //--------------------------------------------------

            score +=
                (stats.saved || 0) * 2 +
                (stats.applied || 0) * 5;

            return {

                ...job,
                score

            };

        })
        .sort((a, b) => b.score - a.score);

}

module.exports = {

    rankJobs

};
