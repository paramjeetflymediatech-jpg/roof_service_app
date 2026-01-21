const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { isAuthenticated, isAdmin } = require('../middlewares/auth.middleware');

// Public routes
router.get('/login', adminController.getLogin);
router.post('/login', adminController.postLogin);

// Protected routes
router.get('/dashboard', isAuthenticated, isAdmin, adminController.getDashboard);
router.get('/logout', isAuthenticated, adminController.getLogout);

// User management routes
router.get('/users', isAuthenticated, isAdmin, adminController.getUserList);
router.get('/users/create', isAuthenticated, isAdmin, adminController.getCreateUser);
router.post('/users', isAuthenticated, isAdmin, adminController.postCreateUser);
router.get('/users/:id/edit', isAuthenticated, isAdmin, adminController.getEditUser);
router.post('/users/:id', isAuthenticated, isAdmin, adminController.postUpdateUser);
router.post('/users/:id/delete', isAuthenticated, isAdmin, adminController.deleteUser);

// Lead management routes
router.get('/leads', isAuthenticated, isAdmin, adminController.getLeadList);

module.exports = router;
