module.exports = {
  apps: [
    {
      name: "api-bot",
      script: "bot.js",
      env: {
        BOT_TOKEN: process.env.BOT_TOKEN,
        DATABASE_URL: process.env.DATABASE_URL
      }
    }
  ]
};
