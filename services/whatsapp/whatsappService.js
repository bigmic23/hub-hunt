const axios = require("axios");

const TOKEN = process.env.WHATSAPP_ACCESSS_TOKEN;
const PHONE_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

async function sendMessage(to, payload) {
  return axios.post(
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
}

module.exports = {
  sendMessage
};
