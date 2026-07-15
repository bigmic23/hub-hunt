bot.action("next_job", async (ctx) => {
    const userId = String(ctx.from.id);

    const { job, done } = jobFeedService.getNextJob(userId);

    if (done || !job) {
        return ctx.answerCbQuery("No more jobs.");
    }

    jobFeedService.setCurrentJob(userId, job);

    await ctx.editMessageText(
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

    await ctx.answerCbQuery();
});
