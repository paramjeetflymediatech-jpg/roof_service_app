const GoogleReviewsService = require('../services/googleReviews.service');
const { Review } = require('../models');

class ReviewController {
    // Public: Fetch visible reviews for the website
    static async getPublicReviews(req, res) {
        try {
            const reviews = await Review.findAll({
                where: { isVisible: true },
                order: [['time', 'DESC']],
                limit: 10
            });
            res.json({ success: true, reviews });
        } catch (error) {
            console.error('Error fetching public reviews:', error);
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }

    // Admin: Trigger manual sync with Google
    static async syncReviews(req, res) {
        try {
            const result = await GoogleReviewsService.syncReviews();
            res.json({ 
                success: true, 
                message: `Synced ${result.count} new reviews from Google.`,
                totalFetched: result.totalFetched
            });
        } catch (error) {
            console.error('Error in syncReviews controller:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // Admin: List all reviews (for management)
    static async getAdminReviews(req, res) {
        try {
            const reviews = await Review.findAll({
                order: [['time', 'DESC']]
            });
            res.render('admin/reviews/index', { 
                reviews,
                title: 'Manage Reviews',
                active: 'reviews'
            });
        } catch (error) {
            console.error('Error fetching admin reviews:', error);
            res.status(500).send('Internal Server Error');
        }
    }

    // Admin: Toggle visibility
    static async toggleVisibility(req, res) {
        try {
            const { id } = req.params;
            const review = await Review.findByPk(id);
            if (!review) {
                return res.status(404).json({ success: false, message: 'Review not found' });
            }
            review.isVisible = !review.isVisible;
            await review.save();
            res.json({ success: true, isVisible: review.isVisible });
        } catch (error) {
            console.error('Error toggling review visibility:', error);
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }
}

module.exports = ReviewController;
