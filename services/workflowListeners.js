const eventBus = require("./eventBus");
const { formatResponse } = require("./responseService");
const sessionService = require("./sessionService");

// Example: scoring listener
eventBus.on("job.parsed", ({ job }) => {
  console.log("🧠 Parsed job:", job);
});

// Example: analytics hook
eventBus.on("job.saved", ({ userId }) => {
  console.log("💾 Job saved for:", userId);
});

// Example: future AI scoring hook
eventBus.on("job.completed", ({ job }) => {
  console.log("✅ Completed:", job.title);
});
