const jobService = require("./jobService");

function hoursUntil(dateStr) {
  const now = Date.now();
  const target = new Date(dateStr).getTime();
  return (target - now) / (1000 * 60 * 60);
}

async function checkInterviewReminders(bot) {
  const interviews = await jobService.getUpcomingInterviews();

  for (const i of interviews) {
    if (!i.telegram_id) continue;

    const hrs = hoursUntil(i.interview_date);

    // 🔔 24H REMINDER
    if (hrs <= 24 && hrs > 23 && !i.reminder_24h_sent) {
      await bot.telegram.sendMessage(
        i.telegram_id,
        `🔔 Interview Tomorrow\n\nType: ${i.interview_type}\nLocation: ${i.location}`
      );

      await require("./jobService").pool.query(
        `UPDATE interviews SET reminder_24h_sent = true WHERE id = $1`,
        [i.id]
      );
    }

    // 🔔 3H REMINDER
    if (hrs <= 3 && hrs > 2 && !i.reminder_3h_sent) {
      await bot.telegram.sendMessage(
        i.telegram_id,
        `⏰ Interview in 3 Hours\n\nType: ${i.interview_type}\nLocation: ${i.location}`
      );

      await require("./jobService").pool.query(
        `UPDATE interviews SET reminder_3h_sent = true WHERE id = $1`,
        [i.id]
      );
    }
  }
}

module.exports = {
  checkInterviewReminders
};
