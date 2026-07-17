const { Markup } = require("telegraf");
const { discoverJobs } = require("./jobDiscoveryService");
const { summarizeJob } = require("./ai/jobSummaryService");

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
        feedState.set(userId, createState());
    }

    return feedState.get(userId);
}

function setFeed(userId, jobs = []) {
    const state = createState(jobs);
    feedState.set(userId, state);
    return state;
}

function resetFeed(userId) {
    feedState.set(userId, createState());
}

function getFeed(userId) {
    return getState(userId);
}

function setCurrentJob(userId, job) {
    const state = getState(userId);
    state.currentJob = job || null;
    state.updatedAt = Date.now();
}

function getCurrentJob(userId) {
    return getState(userId).currentJob;
}

function getNextJob(userId) {
    const state = getState(userId);

    if (state.index >= state.jobs.length) {
        return { done: true, job: null };
    }

    const job = state.jobs[state.index++];
    setCurrentJob(userId, job);

    return {
        done: false,
        job
    };
}

function pushJob(userId, job) {
    if (!job?.id) return;

    const state = getState(userId);

    if (state.jobs.some(j => j.id === job.id)) {
        return;
    }

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
    return feedState.get(userId);
}

async function scrapeJobsAndSend(bot, chatId) {
    const userId = String(chatId);

    const jobs = await discoverJobs(userId);

    console.log("Jobs:", jobs.length);

    if (!jobs.length) {
        return bot.telegram.sendMessage(
            chatId,
            "❌ No jobs found."
        );
    }

    setFeed(userId, jobs);

    const { done, job } = getNextJob(userId);

    if (done || !job) {
        return bot.telegram.sendMessage(
            chatId,
            "No more jobs available."
        );
    }

    const { summary } = summarizeJob(job);

    const message = `💼 ${job.title}

🏢 ${job.company}
📍 ${job.location}
💰 ${job.salary}

${summary}

🔗 ${job.applyUrl}`;

    try {
        await bot.telegram.sendMessage(
            chatId,
            message,
            Markup.inlineKeyboard([
                [
                    Markup.button.callback("💾 Save", "save"),
                    Markup.button.url(
                        "📤 Apply",
                        job.applyUrl || "https://example.com"
                    )
                ],
                [
                    Markup.button.callback("🚫 Ignore", "ignore"),
                    Markup.button.callback("⏭ Next", "next_job")
                ]
            ])
        );

        console.log("Job sent.");
    } catch (err) {
        console.error("Telegram send failed:");
        console.error(err);
    }
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
    scrapeJobsAndSend
};
