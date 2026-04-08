const express = require('express');
const router = express.Router();
const ReviewController = require('../controllers/review.controller');
const { isAuthenticated, isAdmin } = require('../middlewares/auth.middleware');

// Public route for frontend
router.get('/public', ReviewController.getPublicReviews);

// Admin routes
router.get('/admin', isAuthenticated, isAdmin, ReviewController.getAdminReviews);
router.post('/sync', isAuthenticated, isAdmin, ReviewController.syncReviews);
router.post('/:id/toggle-visibility', isAuthenticated, isAdmin, ReviewController.toggleVisibility);

module.exports = router;
