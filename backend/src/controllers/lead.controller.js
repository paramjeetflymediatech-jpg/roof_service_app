const { Lead, Job, User } = require("../models");
const { Op } = require("sequelize");
const fs = require("fs");
const path = require("path");
const {
  sendLeadNotification,
  sendCustomerConfirmation,
  sendAssignmentEmail,
} = require("../../services/emailService");

// ... existing createLead ...
exports.createLead = async (req, res, next) => {
  // ... (keep existing implementation)
  try {
    const payload = { ...req.body };

    // If authenticated user exists, attach userId so we can filter leads per client
    if (!req.user && !req.user?.id) {
      const existingUser = await User.findOne({
        where: { email: req.body.email },
      });
      if (existingUser) {
        return res.status(400).json({
          message: "User already exists please use app to submit quote",
        });
      } else {
        let password =
          req.body.name.slice(0, 4) +
          req.body.phone.slice(
            req.body.phone.length - 4,
            req.body.phone.length,
          );
        const user = await User.create({
          name: req.body.name,
          email: req.body.email,
          phone: req.body.phone,
          password: password,
        });
        payload.userId = user.id;
      }
    } else {
      payload.userId = req.user.id;
    }

    if (!payload.name) {
      return res.status(400).json({ message: "Name is required" });
    }

    if (!payload.source) payload.source = "website";

    if (payload.leadType === "quote") {
      payload.status = "pending";
    }

    // 1️⃣ Prepare image metadata
    let clientImages = [];

    if (req.files && req.files.length > 0) {
      clientImages = req.files.map((file) => ({
        filename: file.filename,
        url: `uploads/leads/${file.filename}`,
        mimeType: file.mimetype,
        size: file.size,
      }));
    }

    // 2️⃣ Attach images to payload
    payload.clientImages = clientImages.length > 0 ? clientImages : null;
    // 3️⃣ Create lead
    const lead = await Lead.create(payload);

    // 4️⃣ Fire emails async
    sendLeadNotification(lead).catch((err) =>
      console.error("Email notification error:", err),
    );
    sendCustomerConfirmation(lead).catch((err) =>
      console.error("Customer email error:", err),
    );

    res.status(201).json({
      success: true,
      message: "Thank you! We will contact you soon.",
      lead,
    });
  } catch (err) {
    if (
      err.name === "SequelizeUniqueConstraintError" &&
      err.errors?.[0]?.path === "email"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "This email has already been submitted. Please use a different email or contact us directly.",
      });
    }
    next(err);
  }
};

exports.createLeadByApp = async (req, res, next) => {
  // ... (keep existing implementation)
  try {
    const payload = { ...req.body };

    // If authenticated user exists, attach userId so we can filter leads per client
    if (req.user && req.user.id) {
      payload.userId = req.user.id;
    }

    if (!payload.name) {
      return res.status(400).json({ message: "Name is required" });
    }

    if (!payload.source) payload.source = "mobile_app";

    if (payload.leadType === "quote") {
      payload.status = "pending";
    }

    // 1️⃣ Prepare image metadata
    let clientImages = [];

    if (req.files && req.files.length > 0) {
      clientImages = req.files.map((file) => ({
        filename: file.filename,
        url: `uploads/leads/${file.filename}`,
        mimeType: file.mimetype,
        size: file.size,
      }));
    }

    // 2️⃣ Attach images to payload
    payload.clientImages = clientImages.length > 0 ? clientImages : null;
    // 3️⃣ Create lead
    const lead = await Lead.create(payload);

    // 4️⃣ Fire emails async
    sendLeadNotification(lead).catch((err) =>
      console.error("Email notification error:", err),
    );
    sendCustomerConfirmation(lead).catch((err) =>
      console.error("Customer email error:", err),
    );

    res.status(201).json({
      success: true,
      message: "Thank you! We will contact you soon.",
      lead,
    });
  } catch (err) {
    if (
      err.name === "SequelizeUniqueConstraintError" &&
      err.errors?.[0]?.path === "email"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "This email has already been submitted. Please use a different email or contact us directly.",
      });
    }
    next(err);
  }
};

// ... existing getLeads ...
exports.getLeads = async (req, res, next) => {
  // ... (keep existing implementation)
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const offset = (page - 1) * limit;

    const where = {};
    if (req.query.status) where.status = req.query.status;
    if (req.query.leadType) where.leadType = req.query.leadType;
    if (req.query.assignedToId) where.assignedToId = req.query.assignedToId;
    if (req.query.userId) where.userId = req.query.userId;

    // Filter by date (createdAt) - kept from original
    if (req.query.date) {
      const filterDate = new Date(req.query.date);
      if (!Number.isNaN(filterDate.getTime())) {
        const startOfDay = new Date(filterDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(filterDate);
        endOfDay.setHours(23, 59, 59, 999);
        where.createdAt = { [Op.between]: [startOfDay, endOfDay] };
      }
    }

    // Filter by preferredDate - kept from original
    if (req.query.preferredDate) {
      const prefDate = new Date(req.query.preferredDate);
      if (!Number.isNaN(prefDate.getTime())) {
        const startOfDay = new Date(prefDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(prefDate);
        endOfDay.setHours(23, 59, 59, 999);
        where.preferredDate = { [Op.between]: [startOfDay, endOfDay] };
      }
    }

    // Filter by inTime and outTime - kept from original
    if (req.query.inTime) {
      const inTimeDate = new Date(req.query.inTime);
      if (!Number.isNaN(inTimeDate.getTime())) {
        where.inTime = { [Op.gte]: inTimeDate };
      }
    }
    if (req.query.outTime) {
      const outTimeDate = new Date(req.query.outTime);
      if (!Number.isNaN(outTimeDate.getTime())) {
        where.outTime = { [Op.lte]: outTimeDate };
      }
    }

    // Filter by date range (createdAt) - kept from original
    if (req.query.startDate && req.query.endDate) {
      const startDate = new Date(req.query.startDate);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(req.query.endDate);
      endDate.setHours(23, 59, 59, 999);
      if (
        !Number.isNaN(startDate.getTime()) &&
        !Number.isNaN(endDate.getTime())
      ) {
        where.createdAt = { [Op.between]: [startDate, endDate] };
      }
    }

    // Search functionality - kept from original
    if (req.query.search) {
      const searchTerm = req.query.search.trim();
      const searchConditions = [
        { name: { [Op.like]: `%${searchTerm}%` } },
        { email: { [Op.like]: `%${searchTerm}%` } },
        { phone: { [Op.like]: `%${searchTerm}%` } },
        { address: { [Op.like]: `%${searchTerm}%` } },
        { city: { [Op.like]: `%${searchTerm}%` } },
        { serviceType: { [Op.like]: `%${searchTerm}%` } },
      ];

      // Check if search term is a valid date (YYYY-MM-DD format)
      const dateMatch = searchTerm.match(/^\d{4}-\d{2}-\d{2}$/);
      if (dateMatch) {
        const searchDate = new Date(searchTerm);
        if (!Number.isNaN(searchDate.getTime())) {
          const startOfDay = new Date(searchDate);
          startOfDay.setHours(0, 0, 0, 0);
          const endOfDay = new Date(searchDate);
          endOfDay.setHours(23, 59, 59, 999);
          searchConditions.push(
            { createdAt: { [Op.between]: [startOfDay, endOfDay] } },
            { preferredDate: { [Op.between]: [startOfDay, endOfDay] } },
          );
        }
      }

      where[Op.or] = searchConditions;
    }

    const [leads, total] = await Promise.all([
      Lead.findAll({
        where,
        order: [["createdAt", "DESC"]],
        limit,
        offset,
        include: [
          {
            model: User,
            as: "assignedTo",
            attributes: ["id", "name", "email", "phone"],
          },
          {
            model: User,
            as: "user",
            attributes: ["id", "name", "email"],
          },
        ],
      }),
      Lead.count({ where }),
    ]);

    const items = leads.map((lead) => {
      const json = lead.toJSON();
      if (json.assignedTo) {
        json.assignedEmployee = {
          id: json.assignedTo.id,
          name: json.assignedTo.name,
          email: json.assignedTo.email,
          phone: json.assignedTo.phone,
        };
      }
      if (json.user) {
        json.clientUser = {
          id: json.user.id,
          name: json.user.name,
          email: json.user.email,
        };
      }
      return json;
    });

    res.json({
      items,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    next(err);
  }
};

// ... existing getLeadById ...
exports.getLeadById = async (req, res, next) => {
  // ... (keep existing implementation)
  try {
    const lead = await Lead.findByPk(req.params.id);
    if (!lead) return res.status(404).json({ message: "Lead not found" });
    res.json(lead.dataValues || lead);
  } catch (err) {
    next(err);
  }
};

// ... existing updateLead ...
exports.updateLead = async (req, res, next) => {
  // ... (keep existing implementation)
  try {
    const lead = await Lead.findByPk(req.params.id);
    if (!lead) return res.status(404).json({ message: "Lead not found" });
    // 1️⃣ Prepare image metadata
    let completionImages = [];
    if (req.files && req.files.length > 0) {
      completionImages = req.files.map((file) => ({
        filename: file.filename,
        url: `uploads/leads/${file.filename}`,
        mimeType: file.mimetype,
        size: file.size,
      }));
    }

    // 2️⃣ Attach images to payload
    req.body.completion_images =
      completionImages.length > 0 ? completionImages : null;
    await lead.update(req.body);

    res.json({
      success: true,
      message: "Lead updated successfully",
      lead: lead.dataValues || lead,
    });
  } catch (err) {
    next(err);
  }
};

// ... existing assignLead ...
const TIME_SLOTS = {
  morning: { start: 9, end: 12 },
  afternoon: { start: 13, end: 17 },
  evening: { start: 17, end: 20 },
};

const getSlotFromDate = (date) => {
  const hour = date.getHours();

  for (const [slot, range] of Object.entries(TIME_SLOTS)) {
    if (hour >= range.start && hour < range.end) {
      return slot;
    }
  }

  return null;
};
exports.assignLead = async (req, res, next) => {
  console.log(req.body, "req.body");
  try {
    const { employeeId, status, adminid, scheduledDate, timeSlot } = req.body;
    console.log(req.params.id, "req.params.id");
    const lead = await Lead.findByPk(req.params.id);
    console.log(lead, "lead");
    if (!lead) return res.status(404).json({ message: "Lead not found" });

    const employee = await User.findByPk(employeeId);
    console.log(employee, "employee");
    if (!employee)
      return res.status(404).json({ message: "Employee not found" });

    if (!scheduledDate) {
      return res.status(400).json({
        success: false,
        message: "Scheduled date is required",
      });
    }

    const scheduled = new Date(scheduledDate);
    console.log(scheduled, "scheduled");
    if (Number.isNaN(scheduled.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid scheduled date",
      });
    }

    // Use explicit timeSlot if provided, otherwise fallback to deriving from date
    const newSlot = timeSlot || getSlotFromDate(scheduled);
    console.log(newSlot, "newSlot");
    if (!newSlot) {
      return res.status(400).json({
        success: false,
        message: "Scheduled time slot is required or invalid",
      });
    }

    // Same day range
    const dayStart = new Date(scheduled);
    dayStart.setHours(0, 0, 0, 0);

    const dayEnd = new Date(scheduled);
    dayEnd.setHours(23, 59, 59, 999);
    console.log(dayStart, "dayStart");
    console.log(dayEnd, "dayEnd");
    const existingJobs = await Job.findAll({
      where: {
        employeeId,
        scheduledDate: { [Op.between]: [dayStart, dayEnd] },
        status: { [Op.in]: ["pending", "accepted", "in_progress"] },
      },
      raw: true,
    });
    console.log(existingJobs, "existingJobs");
    const hasClash = existingJobs.some((job) => {
      // Prioritize explicit timeSlot field in database, fallback to deriving from scheduled_date
      const existingSlot =
        job.timeSlot ||
        (job.scheduledDate
          ? getSlotFromDate(new Date(job.scheduledDate))
          : null);
      return existingSlot === newSlot;
    });
    console.log(hasClash, "hasclashj");

    if (hasClash) {
      return res.status(400).json({
        success: false,
        message:
          "This employee already has a job in this time slot for the selected date.",
      });
    }

    await lead.update({
      assignedToId: employeeId,
      status: status,
      preferredDate: scheduled,
    });

    const assignedBy = adminid || (req.user ? req.user.id : null);

    await Job.create({
      leadId: lead.id,
      employeeId,
      assignedById: assignedBy,
      status: "pending",
      priority: "medium",
      scheduledDate: scheduled,
      timeSlot: newSlot,
    });

    res.json({
      success: true,
      message: "Lead assigned successfully",
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
};
// exports.assignLead = async (req, res, next) => {
//   // ... (keep existing implementation)
//   try {
//     const { employeeId, status, adminid, scheduledDate } = req.body;

//     const lead = await Lead.findByPk(req.params.id);

//     if (!lead) return res.status(404).json({ message: "Lead not found" });

//     const employee = await User.findByPk(employeeId);

//     if (!employee)
//       return res.status(404).json({ message: "Employee not found" });

//     // Optional scheduled date/time for this job
//     let scheduled = null;
//     if (scheduledDate) {
//       const d = new Date(scheduledDate);
//       if (!Number.isNaN(d.getTime())) {
//         scheduled = d;
//       }
//     }

//     // If a scheduled time was provided, ensure no clash for this employee
//     if (scheduled) {
//       const dayStart = new Date(scheduled);
//       dayStart.setHours(0, 0, 0, 0);
//       const dayEnd = new Date(scheduled);
//       dayEnd.setHours(23, 59, 59, 999);

//       const existing = await Job.findAll({
//         where: {
//           employeeId,
//           scheduledDate: { [Op.between]: [dayStart, dayEnd] },
//           status: { [Op.in]: ["pending", "accepted", "in_progress"] },
//         },
//         raw: true,
//       });

//       const getSlot = (date) => {
//         const h = date.getHours();
//         if (h < 12) return "morning";
//         if (h < 17) return "afternoon";
//         return "evening";
//       };

//       const newSlot = getSlot(scheduled);
//       const hasClash = existing.some((j) => {
//         if (!j.scheduledDate) return false;
//         const d = new Date(j.scheduledDate);
//         return getSlot(d) === newSlot;
//       });

//       if (hasClash) {
//         return res.status(400).json({
//           success: false,
//           message:
//             "This employee already has a job in the selected time slot for that date.",
//         });
//       }
//     }

//     await lead.update({
//       assignedToId: employeeId,
//       status: status,
//       preferredDate: scheduled || lead.preferredDate,
//     });

//     // 4️⃣ Create job record for this assignment
//     // req.user may not be set for mobile/API calls, so fall back to null for assignedById
//     const assignedBy = adminid || (req.user ? req.user.id : null);
//     await Job.create({
//       leadId: lead.id,
//       employeeId: employeeId,
//       assignedById: assignedBy,
//       status: "pending",
//       priority: "medium",
//       scheduledDate: scheduled,
//     });

//     res.json({
//       success: true,
//       message: "Lead assigned successfully",
//       lead: lead.dataValues || lead,
//     });
//   } catch (err) {
//     next(err);
//   }
// };
// exports.assignLead = async (req, res, next) => {
//   try {
//     const { employeeId, status, adminid, scheduledDate } = req.body;

//     // 1️⃣ Validate Lead
//     const lead = await Lead.findByPk(req.params.id);
//     if (!lead) {
//       return res.status(404).json({ message: "Lead not found" });
//     }

//     // 2️⃣ Validate Employee
//     const employee = await User.findByPk(employeeId);
//     if (!employee) {
//       return res.status(404).json({ message: "Employee not found" });
//     }

//     // 3️⃣ Parse Scheduled Date
//     let scheduled = null;
//     if (scheduledDate) {
//       const parsedDate = new Date(scheduledDate);
//       if (!Number.isNaN(parsedDate.getTime())) {
//         scheduled = parsedDate;
//       } else {
//         return res.status(400).json({
//           success: false,
//           message: "Invalid scheduled date format",
//         });
//       }
//     }

//     // 4️⃣ Helper: Get Time Slot
//     const getTimeSlot = (date) => {
//       const hour = date.getHours();

//       if (hour >= 6 && hour < 12) return "morning";
//       if (hour >= 12 && hour < 17) return "afternoon";
//       if (hour >= 17 && hour < 21) return "evening";
//       return "night";
//     };

//     // 5️⃣ If scheduled, check clash
//     let timeSlot = null;

//     if (scheduled) {
//       timeSlot = getTimeSlot(scheduled);

//       const dayStart = new Date(scheduled);
//       dayStart.setHours(0, 0, 0, 0);

//       const dayEnd = new Date(scheduled);
//       dayEnd.setHours(23, 59, 59, 999);

//       const existingJob = await Job.findOne({
//         where: {
//           employeeId,
//           scheduledDate: {
//             [Op.between]: [dayStart, dayEnd],
//           },
//           timeSlot,
//           status: {
//             [Op.in]: ["pending", "accepted", "in_progress"],
//           },
//         },
//       });

//       if (existingJob) {
//         return res.status(400).json({
//           success: false,
//           message:
//             "This employee already has a job in the selected time slot for that date.",
//         });
//       }
//     }

//     // 6️⃣ Update Lead
//     await lead.update({
//       assignedToId: employeeId,
//       status: status || lead.status,
//       preferredDate: scheduled || lead.preferredDate,
//     });

//     // 7️⃣ Create Job
//     const assignedBy = adminid || (req.user ? req.user.id : null);

//     const job = await Job.create({
//       leadId: lead.id,
//       employeeId,
//       assignedById: assignedBy,
//       status: "pending",
//       priority: "medium",
//       scheduledDate: scheduled,
//       timeSlot: timeSlot || null,
//     });

//     return res.json({
//       success: true,
//       message: "Lead assigned successfully",
//       job,
//     });
//   } catch (err) {
//     next(err);
//   }
// };

// exports.assignLead = async (req, res, next) => {
//   try {
//     const { employeeId, status, adminid, scheduledDate } = req.body;

//     // 1️⃣ Validate Lead
//     const lead = await Lead.findByPk(req.params.id);
//     if (!lead) {
//       return res.status(404).json({ message: "Lead not found" });
//     }

//     // 2️⃣ Validate Employee
//     const employee = await User.findByPk(employeeId);
//     if (!employee) {
//       return res.status(404).json({ message: "Employee not found" });
//     }

//     // 3️⃣ Parse Scheduled Date
//     let scheduled = null;
//     if (scheduledDate) {
//       const parsed = new Date(scheduledDate);
//       if (!Number.isNaN(parsed.getTime())) {
//         scheduled = parsed;
//       } else {
//         return res.status(400).json({
//           success: false,
//           message: "Invalid scheduled date format",
//         });
//       }
//     }

//     // 4️⃣ Time Slot Helper
//     const getTimeSlot = (date) => {
//       const hour = date.getHours();

//       if (hour >= 6 && hour < 12) return "morning";
//       if (hour >= 12 && hour < 17) return "afternoon";
//       if (hour >= 17 && hour < 21) return "evening";
//       return "night";
//     };

//     // 5️⃣ Check clash if scheduled provided
//     if (scheduled) {
//       const newSlot = getTimeSlot(scheduled);

//       // Get all jobs for that employee on same day
//       const dayStart = new Date(scheduled);
//       dayStart.setHours(0, 0, 0, 0);

//       const dayEnd = new Date(scheduled);
//       dayEnd.setHours(23, 59, 59, 999);

//       const existingJobs = await Job.findAll({
//         where: {
//           employeeId,
//           scheduledDate: {
//             [Op.between]: [dayStart, dayEnd],
//           },
//           status: {
//             [Op.in]: ["pending", "accepted", "in_progress"],
//           },
//         },
//         raw: true,
//       });

//       // Compare time slots dynamically
//       const hasClash = existingJobs.some((job) => {
//         if (!job.scheduledDate) return false;

//         const existingDate = new Date(job.scheduledDate);
//         const existingSlot = getTimeSlot(existingDate);

//         return existingSlot === newSlot;
//       });

//       if (hasClash) {
//         return res.status(400).json({
//           success: false,
//           message:
//             "This employee already has a job in the selected time slot for that date.",
//         });
//       }
//     }

//     // 6️⃣ Update Lead
//     await lead.update({
//       assignedToId: employeeId,
//       status: status || lead.status,
//       preferredDate: scheduled || lead.preferredDate,
//     });

//     // 7️⃣ Create Job
//     const assignedBy = adminid || (req.user ? req.user.id : null);

//     const job = await Job.create({
//       leadId: lead.id,
//       employeeId,
//       assignedById: assignedBy,
//       status: "pending",
//       priority: "medium",
//       scheduledDate: scheduled,
//     });

//     return res.json({
//       success: true,
//       message: "Lead assigned successfully",
//       job,
//     });

//   } catch (err) {
//     next(err);
//   }
// };

// ... existing getEmployeeLeads ...
exports.getEmployeeLeads = async (req, res, next) => {
  // ... (keep existing implementation)
  try {
    const { employeeId } = req.params;

    const leads = await Lead.findAll({
      where: { assignedToId: employeeId },
      order: [["createdAt", "DESC"]],
      raw: true,
    });

    res.json({
      success: true,
      items: leads,
    });
  } catch (err) {
    next(err);
  }
};

// ... existing getAvailableEmployees ...
exports.getAvailableEmployees = async (req, res, next) => {
  // ... (keep existing implementation)
  try {
    const { date, slot } = req.query;

    if (!date || !slot) {
      return res
        .status(400)
        .json({ success: false, message: "Date and slot are required" });
    }

    const scheduledDate = new Date(date);
    if (isNaN(scheduledDate.getTime())) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid date format" });
    }

    // Define time ranges for slots
    const slotTimes = {
      morning: { start: 9, end: 12 }, // 9 AM - 12 PM
      afternoon: { start: 12, end: 17 }, // 12 PM - 5 PM
      evening: { start: 17, end: 20 }, // 5 PM - 8 PM
    };

    if (!slotTimes[slot]) {
      return res.status(400).json({
        success: false,
        message: "Invalid slot. Use morning, afternoon, or evening.",
      });
    }

    const { start, end } = slotTimes[slot];

    // creating start and end time for the query
    const startOfDay = new Date(scheduledDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(scheduledDate);
    endOfDay.setHours(23, 59, 59, 999);

    // 1. Get all employees
    const employees = await User.findAll({
      where: { role: "employee", isActive: true },
      attributes: ["id", "name", "email", "phone"],
      raw: true,
    });

    if (employees.length === 0) {
      return res.json({ success: true, items: [] });
    }

    // 2. Get all jobs for the date
    const jobs = await Job.findAll({
      where: {
        scheduledDate: { [Op.between]: [startOfDay, endOfDay] },
        status: { [Op.in]: ["pending", "accepted", "in_progress"] },
      },
      raw: true,
    });

    // 3. Map employees with availability status
    const employeeAvailability = employees.map((employee) => {
      // Check if employee has a job in the requested slot
      const hasClash = jobs.some((job) => {
        if (job.employeeId !== employee.id) return false;
        if (!job.scheduledDate) return false;

        const jobDate = new Date(job.scheduledDate);
        const jobHour = jobDate.getHours();

        let jobSlot = "";
        if (jobHour < 12) jobSlot = "morning";
        else if (jobHour < 17) jobSlot = "afternoon";
        else jobSlot = "evening";

        return jobSlot === slot;
      });

      return {
        ...employee,
        isAvailable: !hasClash,
      };
    });

    res.json({ success: true, items: employeeAvailability });
  } catch (error) {
    console.error("Get available employees error:", error);
    next(error);
  }
};

// NEW: Delete lead by client (only if pending)
exports.deleteLead = async (req, res, next) => {
  try {
    const lead = await Lead.findByPk(req.params.id);

    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    // Check ownership
    if (lead.userId !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this lead" });
    }

    // Check status
    if (lead.status !== "pending") {
      return res
        .status(400)
        .json({ message: "Cannot delete a lead that is not pending" });
    }

    if (lead.completion_images || lead.completionImages) {
      const oldImages = lead.completion_images || lead.completionImages;
      if (Array.isArray(oldImages)) {
        oldImages.forEach((img) => {
          const oldImagePath = path.join(
            __dirname,
            "..",
            "..",
            "public",
            img.url,
          );
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        });
      }
    }

    if (lead.clientImages || lead.client_images) {
      const oldImages = lead.clientImages || lead.client_images;
      if (Array.isArray(oldImages)) {
        oldImages.forEach((img) => {
          const oldImagePath = path.join(
            __dirname,
            "..",
            "..",
            "public",
            img.url,
          );
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        });
      }
    }

    await lead.destroy();
    res.json({ success: true, message: "Quote deleted successfully" });
  } catch (err) {
    next(err);
  }
};

// NEW: Update lead by client (only if pending)
exports.updateMyLead = async (req, res, next) => {
  try {
    const lead = await Lead.findByPk(req.params.id);

    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    // Check ownership
    if (lead.userId !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this lead" });
    }

    // Check status
    if (lead.status !== "pending") {
      return res
        .status(400)
        .json({ message: "Cannot update a lead that is not pending" });
    }

    const updateData = { ...req.body };
    delete updateData.status; // Prevent status update by client
    delete updateData.userId; // Prevent transferring ownership

    // Handle kept images (for deletion/retention)
    // Handle kept images (for deletion/retention)
    let finalImages = [];
    let keptImagesArray = [];

    // Parse keptImages from request
    if (Object.prototype.hasOwnProperty.call(req.body, "keptImages")) {
      try {
        keptImagesArray =
          typeof req.body.keptImages === "string"
            ? JSON.parse(req.body.keptImages)
            : req.body.keptImages;
        if (!Array.isArray(keptImagesArray)) keptImagesArray = [];
      } catch (e) {
        keptImagesArray = [];
      }
    } else {
      // If keptImages not provided, assuming we keep existing ones logic?
      // Or if not provided, maybe it means keep none?
      // Usually form sends what is kept. If implied "keep all if not sent", strict check needed.
      // But typically a form submission includes the field if it's handling images.
      // Let's assume if it's missing, we default to keeping existing (safest).
      // However, client app sends "keptImages" as stringified JSON of images to keep.
      // If user deletes all, it sends empty array.
      if (lead.clientImages) {
        keptImagesArray = lead.clientImages;
      }
    }

    // Identify images to delete
    const currentImages = lead.clientImages || [];
    if (Array.isArray(currentImages)) {
      const imagesToDelete = currentImages.filter(
        (img) => !keptImagesArray.some((kept) => kept.url === img.url),
      );

      imagesToDelete.forEach((img) => {
        try {
          const oldImagePath = path.join(
            __dirname,
            "../../", // Adjusted path: controllers -> src -> backend -> public (assuming structure)
            // Wait, looking at lines 591-597 in deleteLead:
            // path.join(__dirname, "..", "..", "public", img.url)
            // lead.clientImages urls likely start with "uploads/" or just filename?
            // createLead says: url: `uploads/leads/${file.filename}`
            // So public/uploads/leads/... is the path?
            // line 680 in original code: path.join(__dirname, "..", "..", "public/uploads", img.url)
            // If img.url is "uploads/leads/foo.jpg", joining "public/uploads" + "uploads/leads/..." duplicates uploads?
            // createLead: url: `uploads/leads/${file.filename}`.
            // If public is static root.
            // Let's check deleteLead (lines 591-597): path.join(__dirname, "..", "..", "public", img.url)
            // This suggests img.url includes "uploads/..."
            // So: path.join(..., "public", "uploads/leads/foo.jpg") -> .../public/uploads/leads/foo.jpg
            "public",
            img.url,
          );
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        } catch (err) {
          console.error("Error deleting image:", err);
        }
      });
    }

    finalImages = [...keptImagesArray];

    // Handle new images if any
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((file) => ({
        filename: file.filename,
        url: `uploads/leads/${file.filename}`,
        mimeType: file.mimetype,
        size: file.size,
      }));

      finalImages = [...finalImages, ...newImages];
    }

    updateData.clientImages = finalImages;

    await lead.update(updateData);
    res.json({
      success: true,
      message: "Quote updated successfully",
      lead: lead,
    });
  } catch (err) {
    next(err);
  }
};
