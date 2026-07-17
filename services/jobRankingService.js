const { getUserStats } = require("./ai/memory/recruiterMemoryDB");

const STOP_WORDS = new Set([
    "remote",
    "hybrid",
    "onsite",
    "on-site",
    "full",
    "stack",
    "senior",
    "junior",
    "manager",
    "lead",
    "director",
    "the",
    "and",
    "job",
    "position",
    "role",
    "mwd",
    "mw",
    "wmd"
]);

const DEMAND_FIELDS = [
    "software",
    "developer",
    "engineer",
    "backend",
    "frontend",
    "fullstack",
    "node",
    "node.js",
    "javascript",
    "typescript",
    "python",
    "java",
    "php",
    "react",
    "vue",
    "angular",
    "sql",
    "cloud",
    "aws",
    "azure",
    "docker",
    "kubernetes",
    "devops",
    "ai",
    "data",
    "analyst",
    "security",
    "cybersecurity",
    "customer",
    "support",
    "success",
    "sales",
    "marketing",
    "finance",
    "product",
    "operations"
];

function tokenize(text = "") {
    return new Set(
        text
            .toLowerCase()
            .replace(/[^a-z0-9+#.\- ]/g, " ")
            .split(/\s+/)
            .filter(Boolean)
    );
}

async function rankJobs(jobs = [], profile = {}) {

    const stats = await getUserStats(profile.userId);

    const skills = (profile.skills || [])
        .map(s => s.toLowerCase().trim())
        .filter(s => s.length > 2)
        .filter(s => !STOP_WORDS.has(s));


    const learnedRoles = profile.preferredRoles || {};


    return jobs.map(job => {

        let score = 0;
        const reasons = [];

        const text = [
            job.title,
            job.company,
            job.location,
            job.country,
            job.mode
        ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();


        const words = tokenize(text);


        // Learned skill match
        for (const skill of skills) {

            if (words.has(skill)) {

                score += 25;
                reasons.push(`Matches skill: ${skill}`);
            }
        }


        // AI memory preference boost
        for (const role of Object.keys(learnedRoles)) {

            if (
                words.has(role) &&
                learnedRoles[role] > 0
            ) {

                const boost = Math.min(
                    learnedRoles[role] * 5,
                    35
                );

                score += boost;

                reasons.push(
                    `Learning preference: ${role}`
                );
            }
        }


        // Demand signals
        for (const keyword of DEMAND_FIELDS) {

            if (words.has(keyword)) {

                score += 10;

                reasons.push(
                    `High-demand field: ${keyword}`
                );

                break;
            }
        }


        // Remote preference
        if (words.has("remote")) {

            score += 25;
            reasons.push("Remote opportunity");

        } else if (words.has("hybrid")) {

            score += 15;
            reasons.push("Hybrid opportunity");
        }


        // Visa
        if (
            text.includes("visa") ||
            text.includes("sponsor") ||
            text.includes("relocation")
        ) {

            score += 25;
            reasons.push("Visa sponsorship");
        }


        // Salary
        if (
            job.salary &&
            job.salary !== "Not specified"
        ) {

            score += 5;
            reasons.push("Salary provided");
        }


        // Location
        const location =
            `${job.location || ""} ${job.country || ""}`
            .toLowerCase();


        if (
            location.includes("nigeria") ||
            location.includes("lagos")
        ) {

            score += 15;
            reasons.push("Nigeria opportunity");
        }


        const globalCountries = [
            "germany",
            "canada",
            "usa",
            "united states",
            "uk",
            "united kingdom",
            "ireland",
            "netherlands",
            "sweden",
            "norway"
        ];


        for (const country of globalCountries) {

            if (location.includes(country)) {

                score += 10;

                reasons.push(
                    `Global opportunity: ${country}`
                );

                break;
            }
        }


        // Behaviour reinforcement
        score += (stats.saved || 0);
        score += (stats.applied || 0) * 5;


        score = Math.min(
            0,
            Math.round(score)
        );


        return {
            ...job,
            score,
            reasons: [...new Set(reasons)]
        };

    })
    .sort((a,b)=>b.score-a.score);
}


module.exports = {
    rankJobs
};
