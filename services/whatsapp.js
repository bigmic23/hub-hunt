const axios = require("axios");

async function sendTextMessage(to, text) {
    const url = `https://graph.facebook.com/v25.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;

    await axios.post(
        url,
        {
            messaging_product: "whatsapp",
            to,
            type: "text",
            text: {
                body: text,
            },
        },
        {
            headers: {
                Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
                "Content-Type": "application/json",
            },
        }
    );
}

module.exports = {
    sendTextMessage,
};
