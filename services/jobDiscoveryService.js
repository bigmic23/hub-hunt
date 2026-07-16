const { fetchAllJobs } = require("./discovery");
const { rankJobs } = require("./jobRankingService");
const { buildPreferenceProfile } = require("./ai/learning/preferenceEngine");
const userProfileService = require("./userProfileService");

async function discoverJobs(userId) {
    let jobs = await fetchAllJobs();

    const learnedProfile = await buildPreferenceProfile(userId);

    const userProfile =
        await userProfileService.get(userId) || {};

    const location =
        (userProfile.location || "global").toLowerCase();

    const preferredModes =
        userProfile.workModes || [
            "remote",
            "hybrid",
            "onsite"
        ];

    const visaRequired =
        userProfile.visaSponsorship || false;

    // remove duplicates
    const seen = new Set();

    jobs = jobs.filter(job => {

        if (!job.id) return false;

        if (seen.has(job.id)) return false;

        seen.add(job.id);

        return true;

    });

    // location filtering
    jobs = jobs.filter(job => {

        const country =
            (job.country || "").toLowerCase();

        const mode =
            (
                job.mode ||
                job.workplace ||
                ""
            ).toLowerCase();

        const remote =
            mode.includes("remote");

        const hybrid =
            mode.includes("hybrid");

        const onsite =
            mode.includes("onsite") ||
            mode.includes("on-site");

        const visa =
            Boolean(job.visaSponsorship);

        // Remote jobs are always allowed
        if (remote) return true;

        // Nigerian users should see Nigerian jobs
        if (
            location === "nigeria" &&
            country === "nigeria"
        ) {
            return true;
        }

        // Global mode
        if (
            location === "global"
        ) {

            if (
                visaRequired &&
                visa
            ) return true;

            if (
                preferredModes.includes("hybrid") &&
                hybrid
            ) return true;

            if (
                preferredModes.includes("onsite") &&
                onsite &&
                visa
            ) return true;
        }

        return false;

    });

    jobs = rankJobs(
        jobs,
        learnedProfile
    );

    return jobs.slice(0,30);
}

module.exports = {
    discoverJobs
};
