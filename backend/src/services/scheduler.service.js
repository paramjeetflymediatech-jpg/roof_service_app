const cron = require('node-cron');
const GoogleReviewsService = require('./googleReviews.service');

const initScheduler = () => {
    // Schedule Google Reviews sync at midnight (00:00) every day
    cron.schedule('0 0 * * *', async () => {
        console.log('[Scheduler] Starting automated Google Reviews sync...');
        try {
            const result = await GoogleReviewsService.syncReviews();
            console.log(`[Scheduler] Google Reviews sync completed. Synced ${result.count} reviews.`);
        } catch (error) {
            console.error('[Scheduler] Error during Google Reviews sync:', error.message);
        }
    });

    console.log('[Scheduler] Midnight sync job scheduled.');
};

module.exports = { initScheduler };
