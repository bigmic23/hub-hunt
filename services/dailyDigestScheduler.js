const cron = require("node-cron");
const { sendDailyDigest } = require("./dailyDigestService");
const userProfileService = require("./userProfileService");

const HOUR = Number(process.env.DIGEST_HOUR || 7);
const MINUTE = Number(process.env.DIGEST_MINUTE || 0);

function startDailyDigest(bot) {
  cron.schedule(`${MINUTE} ${HOUR} * * *`, async () => {
    try {
      const users = await userProfileService.getAllUsers();

      for (const user of users) {
        try {
          await sendDailyDigest(bot, String(user.userId));
        } catch (err) {
          console.error("[DIGEST]", user.userId, err.message);
        }
      }

      console.log("[DIGEST] Daily digest completed.");
    } catch (err) {
      console.error("[DIGEST SCHEDULER]", err);
    }
  });

  console.log(`[DIGEST] Scheduled for ${HOUR}:${String(MINUTE).padStart(2, "0")} daily`);
}

module.exports = { startDailyDigest };
