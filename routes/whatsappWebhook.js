const express = require("express");
const { sendTextMessage } = require("../services/whatsapp");

const router = express.Router();

router.get("/", (req, res) => {
    console.log("Mode:", req.query["hub.mode"]);
    console.log("Token from Meta:", req.query["hub.verify_token"]);
    console.log("Token from ENV:", process.env.WHATSAPP_VERIFY_TOKEN);

    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (
        mode === "subscribe" &&
        token === process.env.WHATSAPP_VERIFY_TOKEN
    ) {
        console.log("✅ WhatsApp webhook verified");
        return res.status(200).send(challenge);
    }

    return res.sendStatus(403);
});

router.post("/", async (req, res) => {
    try {
        const message =
            req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

        if (message?.type === "text") {
            const from = message.from;
            const text = message.text.body;

            console.log(`${from}: ${text}`);

            await sendTextMessage(
                from,
                `You said: ${text}`
            );
        }

        res.sendStatus(200);
    } catch (err) {
        console.error(err.response?.data || err.message);
        res.sendStatus(500);
    }
});

module.exports = router;
