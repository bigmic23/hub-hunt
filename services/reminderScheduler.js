const { pool } = require("../db");

async function runReminderScheduler(bot) {
  const now = Date.now();

  const res = await pool.query(`
    SELECT *
    FROM reminder_jobs
    WHERE status = 'PENDING'
    AND run_at <= $1
  `, [now]);

  for (const job of res.rows) {
    try {
      await bot.telegram.sendMessage(
        job.telegram_id,
        `🔔 Interview Reminder (${job.type})

You have an upcoming interview.`
      );

      await pool.query(
        `UPDATE reminder_jobs SET status = 'SENT' WHERE id = $1`,
        [job.id]
      );

    } catch (err) {
      console.error("Reminder failed:", err);
    }
  }
}

module.exports = {
  runReminderScheduler
};
