require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

const { initCleanupJob } = require('./utils/cleanup.job');
const { initScheduler } = require('./services/scheduler.service');

async function start() {
  await connectDB();

  // Initialize the account deletion background cleanup job
  initCleanupJob();

  // Initialize the scheduled tasks (Google Reviews sync)
  initScheduler();

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
