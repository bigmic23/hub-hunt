const fs = require("fs");
const axios = require("axios");
const FormData = require("form-data");

/* =========================
   VOICE → TEXT (Whisper)
========================= */
async function voiceToText(ctx, client) {
  try {
    const file = await ctx.telegram.getFile(ctx.message.voice.file_id);

    const url =
      `https://api.telegram.org/file/bot${process.env.BOT_TOKEN}/${file.file_path}`;

    const audio = await axios.get(url, {
      responseType: "arraybuffer"
    });

    const form = new FormData();
    form.append("file", Buffer.from(audio.data), "voice.ogg");
    form.append("model", "whisper-1");

    const res = await client.audio.transcriptions.create({
      file: form,
      model: "whisper-1"
    });

    return res.text;
  } catch (err) {
    console.error("VOICE ERROR:", err);
    return null;
  }
}

/* =========================
   IMAGE → TEXT (VISION OCR)
========================= */
async function imageToText(imageUrl, client) {
  try {
    const res = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Extract ALL job-related text from the image. Be accurate."
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Extract job posting details"
            },
            {
              type: "image_url",
              image_url: { url: imageUrl }
            }
          ]
        }
      ]
    });

    return res.choices[0].message.content;
  } catch (err) {
    console.error("IMAGE ERROR:", err);
    return null;
  }
}

module.exports = {
  voiceToText,
  imageToText
};
