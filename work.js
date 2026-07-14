const { initDB, loadDB, saveDB } = require("./db");

async function startWorker() {
  await initDB();

  console.log("Worker started");

  setInterval(() => {
    const db = loadDB();
    const now = Date.now();

    const result = db.exec("SELECT * FROM reminders");

    if (!result.length) return;

    const rows = result[0].values;

    for (const r of rows) {
      const id = r[0];
      const chatId = r[1];
      const message = r[2];
      const runAt = r[3];

      if (runAt <= now) {
        console.log("Sending:", message);

        db.run(`DELETE FROM reminders WHERE id = ${id}`);
      }
    }

    saveDB();
  }, 2000);
}

startWorker();
