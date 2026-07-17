const REQUIRED = [
  "BOT_TOKEN",
];

function validateEnv() {
  const missing = REQUIRED.filter(k => !process.env[k]);

  if (missing.length) {
    console.error("\n❌ Missing environment variables:");
    missing.forEach(v => console.error(` - ${v}`));
    process.exit(1);
  }

  console.log("✅ Environment validated");
}

module.exports = { validateEnv };
