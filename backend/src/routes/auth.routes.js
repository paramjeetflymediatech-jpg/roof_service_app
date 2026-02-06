const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { jwtAuth } = require('../middlewares/auth.middleware');

// Public routes
router.post('/login', authController.login);
router.post('/register', authController.register);

// Protected routes
router.get('/me', jwtAuth, authController.getMe);
router.post('/logout', jwtAuth, authController.logout);

module.exports = router;
