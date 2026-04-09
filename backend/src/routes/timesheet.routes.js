const express = require("express");
const router = express.Router();
const timesheetController = require("../controllers/timesheet.controller");
const { jwtAuth } = require("../middlewares/auth.middleware");

// All timesheet routes are protected
router.use(jwtAuth);

router.get("/employee/:employeeId", timesheetController.getEmployeeTimesheet);

module.exports = router;
