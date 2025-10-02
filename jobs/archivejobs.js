const cron = require("node-cron");
const { transferArchiveChat } = require("../services/backup-chat-services");

// Schedule job to run every 24 hrs (midnight)
cron.schedule("0 0 * * *", async () => {
  console.log("Running daily archive job...");
  try {
    const result = await transferArchiveChat();
    console.log("Archive job done:", result);
  } catch (err) {
    console.error("Archive job failed:", err.message);
  }
});
