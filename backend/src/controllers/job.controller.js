const { Op } = require("sequelize");
const { Job, JobLog, Lead, User, JobWorkSession, sequelize } = require("../models");

const combineDateWithTime = (date, hhmm) => {
  if (!hhmm || !date) return date;
  const newDate = new Date(date);
  const [h, m] = hhmm.split(':').map(Number);
  newDate.setHours(h, m, 0, 0);
  return newDate;
};

// Create job by employee (self-assignment)
exports.createSelfJob = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const {
      name,
      address,
      phone,
      serviceType,
      notes,
    } = req.body;

    if (!name || !address || !serviceType) {
      if (transaction) await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "Name, address, and service type are required",
      });
    }

    // Check if employee already has an active work session
    const activeSession = await JobWorkSession.findOne({
      where: {
        userId: req.user.id,
        endTime: null,
      },
    });

    if (activeSession) {
      if (transaction) await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "You already have an active job. Please pause or complete it before creating a new one.",
      });
    }

    // 1. Create a Lead
    let clientImages = null;
    if (req.files && req.files.length > 0) {
      clientImages = req.files.map((file) => ({
        filename: file.filename,
        url: `uploads/leads/${file.filename}`,
        mimeType: file.mimetype,
        size: file.size,
      }));
    }

    const lead = await Lead.create({
      name,
      address,
      phone,
      serviceType,
      message: notes,
      status: "in_progress",
      assignedToId: req.user.id,
      source: "mobile_app",
      leadType: "appointment",
      clientImages: clientImages,
    }, { transaction });

    // 2. Create a Job
    const job = await Job.create({
      leadId: lead.id,
      employeeId: req.user.id,
      assignedById: req.user.id, // Self-assigned
      status: "in_progress",
      priority: "medium",
      scheduledDate: new Date(),
      notes: notes,
    }, { transaction });

    // 3. Create a work session (start work immediately)
    const now = new Date();
    await JobWorkSession.create({
      jobId: job.id,
      leadId: lead.id,
      userId: req.user.id,
      startTime: now,
    }, { transaction });

    // Update lead with start time
    const hhmm = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    await lead.update({
      inTime: now,
      employeeStartTime: hhmm,
    }, { transaction });

    // 4. Create job log
    await JobLog.create({
      jobId: job.id,
      leadId: lead.id,
      userId: req.user.id,
      action: "job_started",
      oldStatus: "pending",
      newStatus: "in_progress",
      notes: "Self-created job by employee",
    }, { transaction });

    await transaction.commit();

    const createdJob = await Job.findByPk(job.id, {
      include: [
        { model: Lead, as: "lead" },
        { model: User, as: "employee", attributes: ["id", "name"] },
      ],
    });
   
    res.status(201).json({
      success: true,
      data: createdJob,
      message: "Job created and started successfully",
    });
  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error("Create self job error:", error);
    res.status(500).json({ success: false, message: "Failed to create job" });
  }
};

// Get all jobs (admin)
exports.getAllJobs = async (req, res) => {
  try {
    const { status, priority, employeeId, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const where = {};

    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (employeeId) where.employeeId = employeeId;

    const { count, rows } = await Job.findAndCountAll({
      where,
      include: [
        {
          model: Lead,
          as: "lead",
          attributes: [
            "id",
            "name",
            "email",
            "phone",
            "address",
            "city",
            "serviceType",
            "message",
          ],
        },
        {
          model: User,
          as: "employee",
          attributes: ["id", "name", "email", "phone"],
        },
        {
          model: User,
          as: "assignedBy",
          attributes: ["id", "name"],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit: parseInt(limit),
      offset: offset,
    });

    res.json({
      success: true,
      data: rows,
      total: count,
      page: parseInt(page),
      pages: Math.ceil(count / limit),
    });
  } catch (error) {
    console.error("Get all jobs error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch jobs" });
  }
};

// Get job by ID
exports.getJobById = async (req, res) => {
  try {
    const job = await Job.findByPk(req.params.id, {
      include: [
        {
          model: Lead,
          as: "lead",
          attributes: [
            "id",
            "name",
            "email",
            "phone",
            "address",
            "serviceType",
            "message",
            "clientImages",
          ],
        },
        {
          model: User,
          as: "employee",
          attributes: ["id", "name", "email", "phone"],
        },
        {
          model: User,
          as: "assignedBy",
          attributes: ["id", "name"],
        },
        {
          model: JobLog,
          as: "logs",
          include: [{ model: User, as: "user", attributes: ["id", "name"] }],
          order: [["createdAt", "DESC"]],
        },
        {
          model: JobWorkSession,
          as: "workSessions",
          order: [["startTime", "ASC"]],
        },
      ],
    });

    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    // Calculate actualHours from sessions if not a final value yet or for consistency
    const allSessions = await JobWorkSession.findAll({
      where: { jobId: job.id },
    });
    const totalDuration = allSessions.reduce(
      (sum, session) => sum + (parseFloat(session.duration) || 0),
      0
    );

    // Create a plain object to add calculated field
    const jobData = job.get({ plain: true });
    jobData.actualHours = job.status === 'completed' ? (job.actualHours || totalDuration.toFixed(2)) : totalDuration.toFixed(2);
    jobData.actual_hours = jobData.actualHours; // Provide alias for user

    res.json({ success: true, data: jobData });
  } catch (error) {
    console.error("Get job error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch job" });
  }
};

// Create/Assign job to employee
exports.createJob = async (req, res) => {
  try {
    const {
      leadId,
      employeeId,
      priority,
      scheduledDate,
      timeSlot,
      notes,
      estimatedHours,
    } = req.body;

    if (!leadId || !employeeId) {
      return res.status(400).json({
        success: false,
        message: "Lead ID and Employee ID are required",
      });
    }

    // Verify employee exists and has employee role
    const employee = await User.findByPk(employeeId);
    if (!employee || employee.role !== "employee") {
      return res
        .status(400)
        .json({ success: false, message: "Invalid employee" });
    }

    // Verify lead exists
    const lead = await Lead.findByPk(leadId);
    if (!lead) {
      return res
        .status(400)
        .json({ success: false, message: "Lead not found" });
    }

    const job = await Job.create({
      leadId,
      employeeId,
      assignedById: req.user.id,
      priority: priority || "medium",
      scheduledDate,
      timeSlot,
      notes,
      estimatedHours,
    });

    // Update lead status to assigned
    await lead.update({ status: "assigned", assignedToId: employeeId });

    // Create job log
    await JobLog.create({
      jobId: job.id,
      userId: req.user.id,
      action: "job_created",
      newStatus: "pending",
      notes: `Job assigned to ${employee.name}`,
    });

    // Fetch the created job with associations
    const createdJob = await Job.findByPk(job.id, {
      include: [
        {
          model: Lead,
          as: "lead",
          attributes: ["id", "name", "email", "phone"],
        },
        { model: User, as: "employee", attributes: ["id", "name", "email"] },
        { model: User, as: "assignedById", attributes: ["id", "name"] },
      ],
    });

    res.status(201).json({
      success: true,
      data: createdJob,
      message: "Job assigned successfully",
    });
  } catch (error) {
    console.error("Create job error:", error);
    res.status(500).json({ success: false, message: "Failed to create job" });
  }
};

// Update job
exports.updateJob = async (req, res) => {
  try {
    const job = await Job.findByPk(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }
    console.log(req.body);

    await job.update(req.body);

    const updatedJob = await Job.findByPk(req.params.id, {
      include: [
        { model: Lead, as: "lead" },
        { model: User, as: "employee", attributes: ["id", "name", "email"] },
        { model: User, as: "assignedBy", attributes: ["id", "name"] },
      ],
    });

    res.json({
      success: true,
      data: updatedJob,
      message: "Job updated successfully",
    });
  } catch (error) {
    console.error("Update job error:", error);
    res.status(500).json({ success: false, message: "Failed to update job" });
  }
};

// Update job status
exports.updateJobStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const validStatuses = [
      "pending",
      "accepted",
      "in_progress",
      "completed",
      "cancelled",
    ];

    if (!validStatuses.includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid status" });
    }

    const job = await Job.findByPk(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    const oldStatus = job.status;
    await job.update({ status });

    // Create job log
    await JobLog.create({
      jobId: job.id,
      userId: req.user.id,
      action: "status_change",
      oldStatus,
      newStatus: status,
      notes,
    });

    // Update lead status based on job status
    const leadStatusMap = {
      accepted: "assigned",
      in_progress: "in_progress",
      completed: "completed",
      cancelled: "cancelled",
    };

    if (leadStatusMap[status]) {
      await Lead.update(
        { status: leadStatusMap[status] },
        { where: { id: job.leadId } },
      );
    }

    const updatedJob = await Job.findByPk(req.params.id, {
      include: [
        { model: Lead, as: "lead" },
        { model: User, as: "employee", attributes: ["id", "name"] },
      ],
    });

    res.json({
      success: true,
      data: updatedJob,
      message: "Job status updated",
    });
  } catch (error) {
    console.error("Update job status error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to update job status" });
  }
};

// Get jobs for employee
exports.getEmployeeJobs = async (req, res) => {
  try {
    const employeeId = req.params.employeeId || req.user.id;
    const { status, isSelfCreated, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const where = { employeeId };
    if (status) where.status = status;
    if (isSelfCreated === 'true') {
      where.assignedById = employeeId;
    } else if (isSelfCreated === 'false') {
      where.assignedById = { [Op.ne]: employeeId };
    }

    const { count, rows } = await Job.findAndCountAll({
      where,
      include: [
        {
          model: Lead,
          as: "lead",
          attributes: [
            "id",
            "name",
            "email",
            "phone",
            "address",
            "city",
            "serviceType",
            "inTime",
            "outTime",
            "employee_notes",
            "message",
            "clientImages",
            "completionImages",
          ],
        },
        {
          model: User,
          as: "assignedBy",
          attributes: ["id", "name"],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit: parseInt(limit),
      offset: offset,
    });

    // Calculate actualHours for each job
    const jobsWithHours = await Promise.all(rows.map(async (job) => {
      const allSessions = await JobWorkSession.findAll({
        where: { jobId: job.id },
      });
      const totalDuration = allSessions.reduce(
        (sum, session) => sum + (parseFloat(session.duration) || 0),
        0
      );

      const jobData = job.get({ plain: true });
      jobData.actualHours = job.status === 'completed' ? (job.actualHours || totalDuration.toFixed(2)) : totalDuration.toFixed(2);
      jobData.actual_hours = jobData.actualHours; // Alias
      return jobData;
    }));

    res.json({
      success: true,
      data: jobsWithHours,
      total: count,
      page: parseInt(page),
      pages: Math.ceil(count / limit),
    });
  } catch (error) {
    console.error("Get employee jobs error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch employee jobs" });
  }
};

// Start job (employee)
exports.startJob = async (req, res) => {
  try {
    const job = await Job.findByPk(req.params.id);

    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    // Verify employee owns this job
    if (job.employeeId !== req.user.id && req.user.role !== "admin") {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    const oldStatus = job.status;
    const now = new Date();
    const { startTime } = req.body; // Accept manual start time HH:MM
    const startTimeDate = startTime ? combineDateWithTime(now, startTime) : now;
    const hhmm = startTime || `${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes(),
    ).padStart(2, "0")}`;

    // Prevent multiple active sessions for the same user across any job
    const activeSession = await JobWorkSession.findOne({
      where: { userId: req.user.id, endTime: null }
    });
    
    if (activeSession) {
      return res.status(400).json({ 
        success: false, 
        message: "You already have another job in progress. Please pause or complete it first." 
      });
    }

    // Create a new work session
    await JobWorkSession.create({
        jobId: job.id,
        leadId: job.leadId,
        userId: req.user.id,
        startTime: startTimeDate,
      });

    await job.update({
      status: "in_progress",
      startTime: job.startTime || startTimeDate,
    });

    // Create job log
    await JobLog.create({
      jobId: job.id,
      leadId: job.leadId,
      userId: req.user.id,
      action: "job_started",
      oldStatus,
      newStatus: "in_progress",
      notes: job.startTime ? `Employee started the job (manual time: ${job.startTime})` : "Employee started the job",
    });

    // Update lead status
    await Lead.update(
      {
        status: "in_progress",
        inTime: job.startTime || startTimeDate,
        employeeStartTime: hhmm,
      },
      { where: { id: job.leadId } },
    );

    const updatedJob = await Job.findByPk(req.params.id, {
      include: [
        { model: Lead, as: "lead" },
        { model: User, as: "employee", attributes: ["id", "name"] },
      ],
    });

    res.json({ success: true, data: updatedJob, message: "Job started" });
  } catch (error) {
    console.error("Start job error:", error);
    res.status(500).json({ success: false, message: "Failed to start job" });
  }
};

// Pause job (employee)
exports.pauseJob = async (req, res) => {
  try {
    const job = await Job.findByPk(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    if (job.employeeId !== req.user.id && req.user.role !== "admin") {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    if (job.status === "paused") {
      return res.json({ success: true, data: job, message: "Job already paused" });
    }

    if (job.status !== "in_progress") {
      return res
        .status(400)
        .json({ success: false, message: "Job is not in progress" });
    }

    const now = new Date();
    const oldStatus = job.status;

    // Find the active session
    const activeSession = await JobWorkSession.findOne({
      where: {
        jobId: job.id,
        endTime: null,
      },
      order: [["startTime", "DESC"]],
    });

    if (activeSession) {
      const startTime = new Date(activeSession.startTime);
      const durationMs = now - startTime;
      const durationSeconds = Math.floor(durationMs / 1000);
      await activeSession.update({
        endTime: now,
        duration: durationSeconds,
      });
    }
    const allSessions = await JobWorkSession.findAll({
      where: { jobId: job.id },
    });

    const totalDuration = allSessions.reduce(
      (sum, session) => sum + (parseFloat(session.duration) || 0),
      0
    );

    const calculatedHours = Number(totalDuration.toFixed(2));

    await job.update({ status: "paused", actualHours: calculatedHours });

    // Create job log
    await JobLog.create({
      jobId: job.id,
      leadId: job.leadId,
      userId: req.user.id,
      action: "job_paused",
      oldStatus,
      newStatus: "paused",
      notes: `Employee paused the job ${now}`,
    });

    // Update lead status
    await Lead.update(
      { status: "paused" },
      { where: { id: job.leadId } }
    );

    const updatedJob = await Job.findByPk(req.params.id, {
      include: [
        { model: Lead, as: "lead" },
        { model: User, as: "employee", attributes: ["id", "name"] },
        { model: JobWorkSession, as: "workSessions" },
      ],
    });

    res.json({ success: true, data: updatedJob, message: "Job paused" });
  } catch (error) {
    console.error("Pause job error:", error);
    res.status(500).json({ success: false, message: "Failed to pause job" });
  }
};

// Resume job (employee)
exports.resumeJob = async (req, res) => {
  try {
    const job = await Job.findByPk(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    if (job.employeeId !== req.user.id && req.user.role !== "admin") {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    if (job.status === "in_progress") {
      return res.json({ success: true, data: job, message: "Job already in progress" });
    }

    if (job.status !== "paused") {
      return res
        .status(400)
        .json({ success: false, message: "Job is not paused" });
    }

    // Prevent multiple active sessions
    const activeSession = await JobWorkSession.findOne({
      where: { userId: req.user.id, endTime: null }
    });

    if (activeSession) {
      return res.status(400).json({ 
        success: false, 
        message: "You already have another job in progress. Please pause or complete it first." 
      });
    }

    const now = new Date();
    const oldStatus = job.status;

    await job.update({ status: "in_progress" });

    // Create a new work session
    await JobWorkSession.create({
      jobId: job.id,
      leadId: job.leadId,
      userId: req.user.id,
      startTime: now,
    });

    // Create job log
    await JobLog.create({
      jobId: job.id,
      leadId: job.leadId,
      userId: req.user.id,
      action: "job_resumed",
      oldStatus,
      newStatus: "in_progress",
      notes: `Employee resumed the job ${now}`,
    });

    // Update lead status
    await Lead.update(
      { status: "in_progress" },
      { where: { id: job.leadId } }
    );

    const updatedJob = await Job.findByPk(req.params.id, {
      include: [
        { model: Lead, as: "lead" },
        { model: User, as: "employee", attributes: ["id", "name"] },
        { model: JobWorkSession, as: "workSessions" },
      ],
    });

    res.json({ success: true, data: updatedJob, message: "Job resumed" });
  } catch (error) {
    console.error("Resume job error:", error);
    res.status(500).json({ success: false, message: "Failed to resume job" });
  }
};

// Complete job (employee)
exports.completeJob = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const job = await Job.findByPk(req.params.id, { transaction });

    if (!job) {
      await transaction.rollback();
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    if (job.employeeId !== req.user.id && req.user.role !== "admin") {
      await transaction.rollback();
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    const {
      completionNotes,
      afterImages,
      materialsUsed,
      laborCost,
      materialCost,
      manualInTime,   // HH:MM
      manualOutTime,  // HH:MM
    } = req.body;

    const oldStatus = job.status;
    const now = new Date();

    const totalCost =
      (parseFloat(laborCost) || 0) +
      (parseFloat(materialCost) || 0);

    // 🟢 Determine completion time
    const completionTime = manualOutTime
      ? combineDateWithTime(now, manualOutTime)
      : now;

    // ----------------------------------------------------
    // 1️⃣ Close Active Session (if any)
    // ----------------------------------------------------
    const activeSession = await JobWorkSession.findOne({
      where: { jobId: job.id, endTime: null },
      order: [["startTime", "DESC"]],
      transaction,
    });

    if (activeSession) {
      const startTime = new Date(activeSession.startTime);
      const durationMs = completionTime - startTime;
      const durationSeconds = Math.floor(durationMs / 1000);

      await activeSession.update(
        {
          endTime: completionTime,
          duration: durationSeconds,
        },
        { transaction }
      );
    }

    // ----------------------------------------------------
    // 2️⃣ Adjust First Session Start Time (Manual In Time)
    // ----------------------------------------------------
    if (manualInTime) {
      const firstSession = await JobWorkSession.findOne({
        where: { jobId: job.id },
        order: [["startTime", "ASC"]],
        transaction,
      });

      if (firstSession) {
        const adjustedStart = combineDateWithTime(
          new Date(firstSession.startTime),
          manualInTime
        );
        const endTime = firstSession.endTime
          ? new Date(firstSession.endTime)
          : completionTime;
        const durationMs = endTime - adjustedStart;
        const durationSeconds = Math.floor(durationMs / 1000);
        await firstSession.update(
          {
            startTime: adjustedStart,
            duration: durationSeconds,
          },
          { transaction }
        );
      } else {
        // If no session exists, create one
        const adjustedStart = combineDateWithTime(now, manualInTime);
        const durationMs = completionTime - adjustedStart;
        const durationSeconds = Math.floor(durationMs / 1000);

        await JobWorkSession.create(
          {
            jobId: job.id,
            leadId: job.leadId,
            userId: req.user.id,
            startTime: adjustedStart,
            endTime: completionTime,
            duration: durationSeconds,
            notes: "Auto-created from manual time override",
          },
          { transaction }
        );
      }
    }

    // ----------------------------------------------------
    // 3️⃣ Recalculate Total Hours
    // ----------------------------------------------------
    const allSessions = await JobWorkSession.findAll({
      where: { jobId: job.id },
      transaction,
    });

    const totalDuration = allSessions.reduce(
      (sum, session) => sum + (parseFloat(session.duration) || 0),
      0
    );

    const calculatedHours = Number(totalDuration.toFixed(2));

    // ----------------------------------------------------
    // 4️⃣ Update Job
    // ----------------------------------------------------
    await job.update(
      {
        status: "completed",
        endTime: completionTime,
        completionNotes,
        afterImages,
        actualHours: calculatedHours,
        materialsUsed,
        laborCost,
        materialCost,
        totalCost,
      },
      { transaction }
    );

    // ----------------------------------------------------
    // 5️⃣ Create Job Log
    // ----------------------------------------------------
    await JobLog.create(
      {
        jobId: job.id,
        leadId: job.leadId,
        userId: req.user.id,
        action: "job_completed",
        oldStatus,
        newStatus: "completed",
        notes: completionNotes || "Job completed",
      },
      { transaction }
    );

    // ----------------------------------------------------
    // 6️⃣ Update Lead
    // ----------------------------------------------------
    await Lead.update(
      {
        status: "completed",
        outTime: completionTime,
        completionImages: afterImages,
        employeeNotes: completionNotes || null,
        employeeEndTime:
          manualOutTime ||
          `${String(completionTime.getHours()).padStart(2, "0")}:${String(
            completionTime.getMinutes()
          ).padStart(2, "0")}`,
      },
      {
        where: { id: job.leadId },
        transaction,
      }
    );

    await transaction.commit();

    const updatedJob = await Job.findByPk(req.params.id, {
      include: [
        { model: Lead, as: "lead" },
        { model: User, as: "employee", attributes: ["id", "name"] },
        { model: JobWorkSession, as: "workSessions" },
      ],
    });

    return res.json({
      success: true,
      data: updatedJob,
      message: "Job completed successfully",
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Complete job error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to complete job",
    });
  }
};

// Get job logs
exports.getJobLogs = async (req, res) => {
  try {
    const logs = await JobLog.findAll({
      where: { jobId: req.params.id },
      include: [{ model: User, as: "user", attributes: ["id", "name"] }],
      order: [["createdAt", "DESC"]],
    });

    res.json({ success: true, data: logs });
  } catch (error) {
    console.error("Get job logs error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch job logs" });
  }
};

// Get employee stats
exports.getEmployeeStats = async (req, res) => {
  try {
    const employeeId = req.params.employeeId || req.user.id;

    const jobs = await Job.findAll({
      where: { employeeId },
      attributes: ["status", "actualHours", "clientRating"],
    });

    const stats = {
      totalJobs: jobs.length,
      completedJobs: jobs.filter((j) => j.status === "completed").length,
      inProgressJobs: jobs.filter((j) => j.status === "in_progress").length,
      pendingJobs: jobs.filter((j) => j.status === "pending").length,
      avgRating:
        jobs
          .filter((j) => j.clientRating)
          .reduce((sum, j) => sum + j.clientRating, 0) /
        (jobs.filter((j) => j.clientRating).length || 1),
      totalHours: jobs.reduce(
        (sum, j) => sum + (parseFloat(j.actualHours) || 0),
        0,
      ),
    };

    res.json({ success: true, data: stats });
  } catch (error) {
    console.error("Get employee stats error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch employee stats" });
  }
};

// Delete job (admin only)
exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findByPk(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    await job.destroy();
    res.json({ success: true, message: "Job deleted successfully" });
  } catch (error) {
    console.error("Delete job error:", error);
    res.status(500).json({ success: false, message: "Failed to delete job" });
  }
};
