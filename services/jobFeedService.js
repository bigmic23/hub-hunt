const { Markup } = require("telegraf");
const { discoverJobs } = require("./jobDiscoveryService");

const feedState = new Map();

function createState(jobs = []) {
    return {
        jobs: Array.isArray(jobs) ? jobs.filter(Boolean) : [],
        index: 0,
        currentJob: null,
        updatedAt: Date.now()
    };
}

function getState(userId) {
    if (!feedState.has(userId)) {
        feedState.set(userId, createState([]));
    }

    const state = feedState.get(userId);

    if (!Array.isArray(state.jobs)) state.jobs = [];
    if (typeof state.index !== "number") state.index = 0;

    return state;
}

function setFeed(userId, jobs = []) {
    const state = createState(jobs);
    feedState.set(userId, state);
    return state;
}

function resetFeed(userId) {
    feedState.set(userId, createState([]));
}

function getFeed(userId) {
    const state = getState(userId);

    return {
        jobs: [...state.jobs],
        index: state.index,
        currentJob: state.currentJob,
        updatedAt: state.updatedAt
    };
}

function getNextJob(userId) {
    const state = getState(userId);

    if (state.index >= state.jobs.length) {
        return { done: true, job: null };
    }

    const job = state.jobs[state.index];

    state.index += 1;
    state.currentJob = job;
    state.updatedAt = Date.now();
    setCurrentJob(userId, job);

    return {
        done: false,
        job
    };
}

function setCurrentJob(userId, job) {
    const state = getState(userId);

    state.currentJob = job || null;
    state.updatedAt = Date.now();

    feedState.set(userId, state);
}

function getCurrentJob(userId) {
    return getState(userId).currentJob || null;
}

function pushJob(userId, job) {
    if (!job?.id) return;

    const state = getState(userId);

    if (state.jobs.some(j => j.id === job.id)) return;

    state.jobs.unshift(job);
    state.updatedAt = Date.now();
}

function removeDuplicates(jobs = []) {
    const seen = new Set();

    return jobs.filter(job => {
        if (!job?.id) return false;
        if (seen.has(job.id)) return false;

        seen.add(job.id);
        return true;
    });
}

function debug(userId) {
    return feedState.get(userId) || null;
}

async function scrapeJobsAndSend(bot, chatId) {
    const userId = String(chatId);

    const jobs = await discoverJobs(userId);

    if (!jobs.length) {
        return bot.telegram.sendMessage(
            chatId,
            "❌ No jobs found."
        );
    }

    setFeed(userId, jobs);

    const { job, done } = getNextJob(userId);

    if (done || !job) {
        return bot.telegram.sendMessage(
            chatId,
            "No more jobs available."
        );
    }

    await bot.telegram.sendMessage(
        chatId,
`💼 ${job.title}
🏢 ${job.company}
📍 ${job.location}
💰 ${job.salary}

${job.applyUrl}`,
        {
            ...Markup.inlineKeyboard([
                [
                    Markup.button.callback("💾 Save", "save"),
                    Markup.button.url("📤 Apply", job.applyUrl)
                ],
                [
                    Markup.button.callback("🚫 Ignore", "ignore"),
                    Markup.button.callback("⏭ Next", "next_job")
                ]
            ])
        }
    );
}

module.exports = {
    setFeed,
    getFeed,
    resetFeed,
    getNextJob,
    setCurrentJob,
    getCurrentJob,
    pushJob,
    removeDuplicates,
    debug,
    scrapeJobsAndSend,
    setCurrentJob,
    getCurrentJob
};
