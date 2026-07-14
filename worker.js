const { initDB, loadDB, saveDB } = require("./db");

async function startWorker() {
  await initDB();

  console.log("Worker started");

  setInterval(async () => {
    const db = loadDB();
    const now = Date.now();

    const reminders = db.reminders || [];

    const due = reminders.filter(r => r.runAt <= now);

    for (const r of due) {
      console.log("Sending:", r.message);
    }

    db.reminders = reminders.filter(r => r.runAt > now);

    await saveDB();
  }, 2000);
}

startWorker();
