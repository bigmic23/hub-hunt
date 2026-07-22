const axios = require("axios");

const TOKEN = process.env.WHATSAPP_ACCESSS_TOKEN;
const PHONE_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

async function sendMessage(to, payload) {
  try {
    const res = await axios.post(
      `https://graph.facebook.com/v23.0/${PHONE_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to,
        ...payload
      },
      {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          "Content-Type": "application/json"
        }
      }
    );

    console.log("WHATSAPP SUCCESS:", res.data);
    return res.data;

  } catch (err) {
    console.log("WHATSAPP ERROR:");
    console.log(err.response?.data || err.message);
    throw err;
  }
}

module.exports = {
  sendMessage
};
