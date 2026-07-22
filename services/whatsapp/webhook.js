const express = require("express");

const { sendMessage } = require("./whatsappService");
const session = require("../state/sessionManager");

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

    const message =
      req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

    if (!message) return res.sendStatus(200);

    const phone = message.from;

    if (message.type === "text") {
      session.clear(phone);

      await sendMessage(phone, {
        type: "text",
        text: {
          body:
            "👋 Welcome to Hub Hunt AI.\n\nWhat kind of job are you looking for?"
        }
      });
    }

    res.sendStatus(200);

  } catch (err) {
    console.error("[WHATSAPP]", err.response?.data || err);
    res.sendStatus(500);
  }
});

module.exports = router;
