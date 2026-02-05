const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// Public routes
router.post('/login', authController.login);
router.post('/register', authController.register);

// Protected routes
router.get('/me', authController.getMe);
router.post('/logout', authController.logout);

module.exports = router;
