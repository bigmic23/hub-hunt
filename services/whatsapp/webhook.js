const express = require("express");
const { sendMessage } = require("./whatsappService");
const { handleText } = require("../conversation/jobConversation");

const router = express.Router();

router.get("/", (req, res) => {
  if (
    req.query["hub.mode"] === "subscribe" &&
    req.query["hub.verify_token"] === process.env.WHATSAPP_VERIFY_TOKEN
  ) {
    return res.send(req.query["hub.challenge"]);
  }

  res.sendStatus(403);
});

router.post("/", async (req, res) => {
  try {
    const message =
      req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

    if (!message) return res.sendStatus(200);

    if (message.type === "text") {
      const reply = await handleText(
        message.from,
        message.text.body
      );

      await sendMessage(message.from, reply);
    }

    res.sendStatus(200);

  } catch (err) {
    console.error(err.response?.data || err);
    res.sendStatus(500);
  }
});

module.exports = router;
