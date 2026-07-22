const axios = require("axios");

const TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const PHONE_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

console.log("TOKEN exists:", !!TOKEN);
console.log("PHONE_ID env:", process.env.WHATSAPP_PHONE_NUMBER_ID);
console.log("PHONE_ID constant:", PHONE_ID);

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
    console.log("===== WHATSAPP ERROR =====");
    console.log(JSON.stringify(err.response?.data, null, 2));
    throw err;
  }

}

module.exports = {
  sendMessage
};
