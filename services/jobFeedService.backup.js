const feedState = new Map();
const { fetchAllJobs } = require("./discovery");
const { Markup } = require("telegraf");
const { discoverJobs } = require("./jobDiscoveryService");

/**
 * CREATE SAFE STATE
 */
function createState(jobs = []) {
  return {
    jobs: Array.isArray(jobs) ? jobs.filter(Boolean) : [],
    index: 0,
    updatedAt: Date.now()
  };
}

/**
 * GET OR INITIALIZE STATE
 */
function getState(userId) {
  if (!feedState.has(userId)) {
    const fresh = createState([]);
    feedState.set(userId, fresh);
    return fresh;
  }

  const state = feedState.get(userId);

  if (!Array.isArray(state.jobs)) state.jobs = [];
  if (typeof state.index !== "number") state.index = 0;

  return state;
}

/**
 * SET FEED (FULL REPLACE)
 */
function setFeed(userId, jobs = []) {
  const state = createState(jobs);
  feedState.set(userId, state);
  return state;
}

/**
 * RESET FEED
 */
function resetFeed(userId) {
  const state = createState([]);
  feedState.set(userId, state);
  return state;
}

/**
 * GET FEED (READ ONLY SAFE SNAPSHOT)
 */
function getFeed(userId) {
  const state = getState(userId);

  return {
    jobs: [...state.jobs],
    index: state.index,
    updatedAt: state.updatedAt
  };
}

/**
 * NEXT JOB (CONTROLLED ADVANCEMENT)
 */
function getNextJob(userId) {
  const state = getState(userId);

  if (!state.jobs.length) {
    return { done: true, job: null };
  }

  if (state.index >= state.jobs.length) {
    return { done: true, job: null };
  }

  const job = state.jobs[state.index];

  state.index += 1;
  state.updatedAt = Date.now();

  return {
    done: false,
    job: job || null
  };
}

/**
 * PUSH JOB (DEDUP + SAFE INSERT)
 */
function pushJob(userId, job) {
  if (!job?.id) return;

  const state = getState(userId);

  const exists = state.jobs.some(j => j?.id === job.id);
  if (exists) return;

  state.jobs.unshift(job);
  state.updatedAt = Date.now();

  feedState.set(userId, state);
}

/**
 * REMOVE DUPLICATES (PURE FUNCTION)
 */
function removeDuplicates(jobs = []) {
  const seen = new Set();

  return (jobs || []).filter(j => {
    if (!j?.id) return true;

    if (seen.has(j.id)) return false;

    seen.add(j.id);
    return true;
  });
}

/**
 * DEBUG
 */
function debug(userId) {
  return feedState.get(userId) || null;
}

async function scrapeJobsAndSend(bot, chatId) {
    const jobs = await fetchAllJobs();

    if (!jobs.length) {
        return bot.telegram.sendMessage(
            chatId,
            "❌ No jobs found."
        );
    }

    setFeed(String(chatId), jobs);

    const firstJob = jobs[0];

    await bot.telegram.sendMessage(
        chatId,
`💼 ${firstJob.title}
🏢 ${firstJob.company}
📍 ${firstJob.location}
💰 ${firstJob.salary}

${firstJob.applyUrl}`
    );
}

async function scrapeJobsAndSend(bot, chatId) {
    const jobs = await discoverJobs(chatId);

    if (!jobs.length) {
        return bot.telegram.sendMessage(chatId, "No jobs found.");
    }

    setFeed(chatId, jobs);

    const first = jobs[0];

    await bot.telegram.sendMessage(
        chatId,
`💼 ${first.title}
🏢 ${first.company}
📍 ${first.location}
💰 ${first.salary}

${first.applyUrl}`
    );
}

async function scrapeJobsAndSend(bot, chatId) {
    const userId = String(chatId);

    const jobs = await discoverJobs(userId);

    if (!jobs.length) {
        return bot.telegram.sendMessage(chatId, "❌ No jobs found.");
    }

    // Save the entire feed
    setFeed(userId, jobs);

    // Get the first job only
    const { job, done } = getNextJob(userId);

    if (done || !job) {
        return bot.telegram.sendMessage(chatId, "No more jobs available.");
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
                    Markup.button.callback("💾 Save", `save_${job.id}`),
                    Markup.button.url("📤 Apply", job.applyUrl)
                ],
                [
                    Markup.button.callback("🚫 Ignore", `ignore_${job.id}`),
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
  pushJob,
  removeDuplicates,
  debug,
  scrapeJobsAndSend
};
