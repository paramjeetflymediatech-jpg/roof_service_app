require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

const fs = require('fs');
const path = require('path');
const { initCleanupJob } = require('./utils/cleanup.job');
const { initScheduler } = require('./services/scheduler.service');

// Ensure upload directories exist
const ensureUploadDirs = () => {
  const dirs = [
    'public/uploads/profiles',
    'public/uploads/employees',
    'public/uploads/admins',
    'public/uploads/gallery',
    'public/uploads/leads',
    'public/uploads/jobs',
    'public/uploads/services',
    'public/uploads/estimates',
    'public/uploads/invoices',
  ];

  dirs.forEach((dir) => {
    const fullPath = path.join(__dirname, '..', dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      console.log(`📁 Created directory: ${dir}`);
    }
  });
};

async function start() {
  // Create upload folders if they don't exist
  ensureUploadDirs();

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
