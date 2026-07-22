const express = require("express");

const app = express();

app.use(express.json());

const whatsappWebhook = require("./services/whatsapp/webhook");

app.use("/webhook/whatsapp", whatsappWebhook);

app.get("/", (req, res) => {
  res.send("Hub Hunt API running");
});

// Temporary route to test WhatsApp sending
app.get("/test-whatsapp", async (req, res) => {
  try {
    await sendTextMessage(
      "2348083858774", // Replace with your WhatsApp number in international format
      "🚀 Hub Hunt test from Railway!"
    );

    res.send("Message sent!");
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json(err.response?.data || err.message);
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
