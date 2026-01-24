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
router.get('/users/new', isAuthenticated, isAdmin, adminController.getCreateUser); // Alias requesting by user
router.post('/users/delete-all', isAuthenticated, isAdmin, adminController.deleteAllUsers);
router.post('/users', isAuthenticated, isAdmin, adminController.postCreateUser);
router.get('/users/:id/edit', isAuthenticated, isAdmin, adminController.getEditUser);
router.post('/users/:id', isAuthenticated, isAdmin, adminController.postUpdateUser);
router.post('/users/:id/delete', isAuthenticated, isAdmin, adminController.deleteUser);

// Lead management routes
router.get('/leads', isAuthenticated, isAdmin, adminController.getLeadList);
router.get('/leads/create', isAuthenticated, isAdmin, adminController.getCreateLead);
router.post('/leads/delete-all', isAuthenticated, isAdmin, adminController.deleteAllLeads); // Must be before /:id
router.post('/leads', isAuthenticated, isAdmin, adminController.postCreateLead);

router.get('/leads/:id/edit', isAuthenticated, isAdmin, adminController.getEditLead);
router.post('/leads/:id', isAuthenticated, isAdmin, adminController.postUpdateLead);
router.post('/leads/:id/delete', isAuthenticated, isAdmin, adminController.deleteLead);

// SEO management routes
router.get('/seo', isAuthenticated, isAdmin, adminController.getSeoList);
router.get('/seo/create', isAuthenticated, isAdmin, adminController.getCreateSeo);
router.post('/seo', isAuthenticated, isAdmin, adminController.postCreateSeo);
router.get('/seo/:id/edit', isAuthenticated, isAdmin, adminController.getEditSeo);
router.post('/seo/:id', isAuthenticated, isAdmin, adminController.postUpdateSeo);
router.post('/seo/:id/delete', isAuthenticated, isAdmin, adminController.deleteSeo);

module.exports = router;
