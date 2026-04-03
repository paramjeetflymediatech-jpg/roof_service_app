require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

const { initCleanupJob } = require('./utils/cleanup.job');

async function start() {
  await connectDB();

  // Initialize the account deletion background cleanup job
  initCleanupJob();

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
