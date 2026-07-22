require("dotenv").config();

const { sendTextMessage } = require("./services/whatsapp");

(async () => {
    try {
        await sendTextMessage(
            "2348083858774",
            "🎉 Hub Hunt is talking to WhatsApp!"
        );

        console.log("Message sent successfully!");
    } catch (err) {
        console.error(
            err.response?.data || err.message
        );
    }
})();
