const express = require('express');
const router = express.Router();
const jobController = require('../controllers/job.controller');
const { jwtAuth, isAdmin, isEmployeeOrAdmin } = require('../middlewares/auth.middleware');

// Admin routes
router.get("/", isAdmin, jobController.getAllJobs);
router.post("/", isAdmin, jobController.createJob);
router.delete("/:id", isAdmin, jobController.deleteJob);

// Employee routes
router.get("/employee/:employeeId", isEmployeeOrAdmin, jobController.getEmployeeJobs);
router.get("/my-jobs", isEmployeeOrAdmin, jobController.getEmployeeJobs);
router.get("/stats/:employeeId?", isEmployeeOrAdmin, jobController.getEmployeeStats);

// Job operations (employee and admin)
router.get("/:id", isEmployeeOrAdmin, jobController.getJobById);
router.put("/:id", isEmployeeOrAdmin, jobController.updateJob);
router.put("/:id/status", isEmployeeOrAdmin, jobController.updateJobStatus);
router.post("/:id/start", isEmployeeOrAdmin, jobController.startJob);
router.post("/:id/pause", isEmployeeOrAdmin, jobController.pauseJob);
router.post("/:id/resume", isEmployeeOrAdmin, jobController.resumeJob);
router.post("/:id/complete", isEmployeeOrAdmin, jobController.completeJob);
router.get("/:id/logs", isEmployeeOrAdmin, jobController.getJobLogs);

module.exports = router;
