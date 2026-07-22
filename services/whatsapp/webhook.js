const express = require("express");

const { sendMessage } = require("./whatsappService");
const {
  buildHomeMessage,
  buildJobMessage
} = require("./messageBuilder");

const { discoverJobs } = require("../jobDiscoveryService");

const router = express.Router();

router.get("/", (req, res) => {
  const VERIFY = process.env.WHATSAPP_VERIFY_TOKEN;

  if (
    req.query["hub.mode"] === "subscribe" &&
    req.query["hub.verify_token"] === VERIFY
  ) {
    return res.send(req.query["hub.challenge"]);
  }

  res.sendStatus(403);
});

router.post("/", async (req, res) => {
  try {

    console.log(JSON.stringify(req.body, null, 2));

    const entry = req.body.entry?.[0];
    const change = entry?.changes?.[0];
    const message = change?.value?.messages?.[0];

    if (!message) return res.sendStatus(200);

    const phone = message.from;

    // Text message
    if (message.type === "text") {
      await sendMessage(
        phone,
        buildHomeMessage("Recruiter")
      );
    }

    // Button reply
    if (
      message.type === "interactive" &&
      message.interactive?.button_reply
    ) {
      const id = message.interactive.button_reply.id;

      if (
        id === "browse_jobs" ||
        id === "recommended"
      ) {
        const jobs = await discoverJobs(phone);

        if (jobs.length) {
          await sendMessage(
            phone,
            buildJobMessage(jobs[0])
          );
        }
      }
    }

    res.sendStatus(200);
  } catch (err) {
    console.error("[WHATSAPP]", err);
    res.sendStatus(500);
  }
});

module.exports = router;
