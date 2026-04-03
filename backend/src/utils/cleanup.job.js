const { User } = require("../models");
const { deleteMyAccount } = require("../controllers/user.controller");
const { Op } = require("sequelize");

/**
 * Background job to permanently delete accounts that have been in 
 * 'pending_deletion' state for more than 24 hours.
 */
const runCleanupJob = async () => {
  console.log("🧹 Running account deletion cleanup job...");
  
  try {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    // Find users who requested deletion more than 24 hours ago
    const usersToDelete = await User.findAll({
      where: {
        status: "pending_deletion",
        deletionRequestedAt: {
          [Op.lte]: twentyFourHoursAgo,
        },
      },
    });

    if (usersToDelete.length === 0) {
      console.log("✅ No accounts scheduled for permanent deletion at this time.");
      return;
    }

    console.log(`🗑️ Found ${usersToDelete.length} accounts to permanently delete.`);

    for (const user of usersToDelete) {
      try {
        console.log(`Deleting user ID: ${user.id} (${user.email})...`);
        
        // Call the internal deletion logic
        // We pass a mock req object and no res/next to use the refactored controller logic
        await deleteMyAccount({ user: { id: user.id } }, null, null);
        
        console.log(`✅ Successfully deleted user ID: ${user.id}`);
      } catch (userErr) {
        console.error(`❌ Failed to delete user ID: ${user.id}:`, userErr);
      }
    }
    
    console.log("✨ Cleanup job completed.");
  } catch (err) {
    console.error("❌ Error in cleanup job:", err);
  }
};

// Start the periodic cleanup (e.g., every hour)
const initCleanupJob = () => {
  // Run once on startup
  runCleanupJob();
  
  // Then run every hour
  setInterval(runCleanupJob, 60 * 60 * 1000);
};

module.exports = { initCleanupJob };
