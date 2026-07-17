const { fetchAllJobs } = require("./discovery");
const { rankJobsForUser } = require("./scoringEngine");
const { buildPreferenceProfile } = require("./ai/learning/preferenceEngine");
const userProfileService = require("./userProfileService");

const CACHE = {
    jobs: [],
    updated: 0,
    refreshing: false
};

const CACHE_TTL = 1000 * 60 * 15;

async function refreshCache() {
    if (CACHE.refreshing) return;

    CACHE.refreshing = true;

    try {
        let jobs = await fetchAllJobs();

        const seen = new Set();

        jobs = jobs.filter(job => {
            const key = [
                (job.title || "")
                    .toLowerCase()
                    .replace(/[^\w ]/g, "")
                    .replace(/\s+/g, " ")
                    .trim(),
                (job.company || "")
                    .toLowerCase()
                    .trim()
            ].join("|");

            if (!key || seen.has(key)) return false;

            seen.add(key);
            return true;
        });

        CACHE.jobs = jobs;
        CACHE.updated = Date.now();

        console.log(`[CACHE REFRESH] ${jobs.length} jobs`);
    } catch (err) {
        console.error("[CACHE REFRESH ERROR]", err.message);
    } finally {
        CACHE.refreshing = false;
    }
}

async function loadJobs() {
    if (!CACHE.jobs.length) {
        await refreshCache();
        return CACHE.jobs;
    }

    if (Date.now() - CACHE.updated > CACHE_TTL) {
        refreshCache(); // refresh in background
    }

    return CACHE.jobs;
}

async function discoverJobs(userId) {

    const learnedProfile =
        await buildPreferenceProfile(userId);

    const profile =
        await userProfileService.get(userId) || {};

    const mergedProfile = {
        ...profile,
        ...learnedProfile,
        userId
    };

    const jobs = await loadJobs();

    return rankJobsForUser(jobs, mergedProfile);
}

function clearCache() {
    CACHE.jobs = [];
    CACHE.updated = 0;
}

module.exports = {
    discoverJobs,
    clearCache
};
