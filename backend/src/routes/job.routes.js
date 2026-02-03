const express = require('express');
const router = express.Router();
const jobController = require('../controllers/job.controller');
const { jwtAuth, isAdmin, isEmployeeOrAdmin } = require('../middlewares/auth.middleware');

// Admin routes
router.get('/', jwtAuth, isAdmin, jobController.getAllJobs);
router.post('/', jwtAuth, isAdmin, jobController.createJob);
router.delete('/:id', jwtAuth, isAdmin, jobController.deleteJob);

// Employee routes
router.get('/employee/:employeeId', jwtAuth, isEmployeeOrAdmin, jobController.getEmployeeJobs);
router.get('/my-jobs', jwtAuth, isEmployeeOrAdmin, jobController.getEmployeeJobs);
router.get('/stats/:employeeId?', jwtAuth, isEmployeeOrAdmin, jobController.getEmployeeStats);

// Job operations (employee and admin)
router.get('/:id', jwtAuth, isEmployeeOrAdmin, jobController.getJobById);
router.put('/:id', jwtAuth, isEmployeeOrAdmin, jobController.updateJob);
router.put('/:id/status', jwtAuth, isEmployeeOrAdmin, jobController.updateJobStatus);
router.post('/:id/start', jwtAuth, isEmployeeOrAdmin, jobController.startJob);
router.post('/:id/complete', jwtAuth, isEmployeeOrAdmin, jobController.completeJob);
router.get('/:id/logs', jwtAuth, isEmployeeOrAdmin, jobController.getJobLogs);

module.exports = router;
