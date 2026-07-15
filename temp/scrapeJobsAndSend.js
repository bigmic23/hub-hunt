async function scrapeJobsAndSend(bot, chatId) {
    const userId = String(chatId);

    const jobs = await discoverJobs(userId);

    if (!jobs.length) {
        return bot.telegram.sendMessage(chatId, "❌ No jobs found.");
    }

    setFeed(userId, jobs);

    const { job, done } = getNextJob(userId);

    if (done || !job) {
        return bot.telegram.sendMessage(chatId, "No more jobs available.");
    }

    setCurrentJob(userId, job);

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
