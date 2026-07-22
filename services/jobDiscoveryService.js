const { fetchCachedJobs, fetchAdzunaJobs } = require("./discovery");
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
        const jobs = await fetchCachedJobs();

        CACHE.jobs = jobs;
        CACHE.updated = Date.now();

        console.log(`[CACHE REFRESH] ${jobs.length} jobs`);
    } catch (err) {
        console.error("[CACHE REFRESH ERROR]", err.message);
    } finally {
        CACHE.refreshing = false;
    }
}

async function loadCachedJobs() {
    if (!CACHE.jobs.length) {
        await refreshCache();
        return CACHE.jobs;
    }

    if (Date.now() - CACHE.updated > CACHE_TTL) {
        refreshCache(); // refresh in background
    }

    return CACHE.jobs;
}

async function discoverJobs(userId, query = {}) {

    const learnedProfile =
        await buildPreferenceProfile(userId);

    const profile =
        await userProfileService.get(userId) || {};

    const mergedProfile = {
        ...profile,
        ...learnedProfile,
        userId
    };

    const [cachedJobs, adzunaJobs] = await Promise.all([
        loadCachedJobs(),
        fetchAdzunaJobs(query)
    ]);

    const seen = new Set();
    const jobs = [...cachedJobs, ...adzunaJobs].filter(job => {
        if (!job.id) return false;
        if (seen.has(job.id)) return false;
        seen.add(job.id);
        return true;
    });

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
