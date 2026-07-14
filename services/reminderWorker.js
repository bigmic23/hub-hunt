const { pool } = require("../db");

async function runQueueWorker(bot) {
  const now = Date.now();

  try {
    // recover stale processing jobs
    await pool.query(`
      UPDATE reminder_jobs
      SET
        status = 'PENDING',
        locked_by = NULL,
        locked_until = NULL
      WHERE status = 'PROCESSING'
        AND locked_until IS NOT NULL
        AND locked_until < $1
    `, [now]);

    const leaseUntil = now + 60000;

    const res = await pool.query(`
      UPDATE reminder_jobs
      SET
        status = 'PROCESSING',
        locked_by = 'worker_1',
        locked_until = $2
      WHERE id IN (
        SELECT id
        FROM reminder_jobs
        WHERE status = 'PENDING'
          AND run_at <= $1
        ORDER BY run_at ASC
        LIMIT 10
      )
      RETURNING *
    `, [now, leaseUntil]);

    const jobs = res.rows;

    if (jobs.length) {
  console.log(`Worker: processing ${jobs.length} job(s)`);
}

    for (const job of jobs) {
      try {
        console.log("Processing reminder:", job.id);

        await bot.telegram.sendMessage(
          job.telegram_id,
          `🔔 Interview Reminder (${job.type})`
        );

        await pool.query(`
          UPDATE reminder_jobs
          SET
            status = 'DONE',
            locked_by = NULL,
            locked_until = NULL
          WHERE id = $1
        `, [job.id]);

        console.log("Reminder sent:", job.id);

      } catch (err) {
        console.error("Reminder failed:", err.message);

        await pool.query(`
          UPDATE reminder_jobs
          SET
            attempts = attempts + 1,
            status = CASE
              WHEN attempts + 1 >= 3
              THEN 'FAILED'
              ELSE 'PENDING'
            END,
            locked_by = NULL,
            locked_until = NULL
          WHERE id = $1
        `, [job.id]);
      }
    }

  } catch (err) {
    console.error("Worker crashed:", err);
  }
}

module.exports = {
  runQueueWorker
};
