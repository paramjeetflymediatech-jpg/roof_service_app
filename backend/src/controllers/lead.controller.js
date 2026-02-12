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
exports.assignLead = async (req, res, next) => {
  // ... (keep existing implementation)
  try {
    const { employeeId, status, adminid, scheduledDate } = req.body;

    const lead = await Lead.findByPk(req.params.id);

    if (!lead) return res.status(404).json({ message: "Lead not found" });

    const employee = await User.findByPk(employeeId);

    if (!employee)
      return res.status(404).json({ message: "Employee not found" });

    // Optional scheduled date/time for this job
    let scheduled = null;
    if (scheduledDate) {
      const d = new Date(scheduledDate);
      if (!Number.isNaN(d.getTime())) {
        scheduled = d;
      }
    }

    // If a scheduled time was provided, ensure no clash for this employee
    if (scheduled) {
      const dayStart = new Date(scheduled);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(scheduled);
      dayEnd.setHours(23, 59, 59, 999);

      const existing = await Job.findAll({
        where: {
          employeeId,
          scheduledDate: { [Op.between]: [dayStart, dayEnd] },
          status: { [Op.in]: ["pending", "accepted", "in_progress"] },
        },
        raw: true,
      });

      const getSlot = (date) => {
        const h = date.getHours();
        if (h < 12) return "morning";
        if (h < 17) return "afternoon";
        return "evening";
      };

      const newSlot = getSlot(scheduled);
      const hasClash = existing.some((j) => {
        if (!j.scheduledDate) return false;
        const d = new Date(j.scheduledDate);
        return getSlot(d) === newSlot;
      });

      if (hasClash) {
        return res.status(400).json({
          success: false,
          message:
            "This employee already has a job in the selected time slot for that date.",
        });
      }
    }

    await lead.update({
      assignedToId: employeeId,
      status: status,
      preferredDate: scheduled || lead.preferredDate,
    });

    // 4️⃣ Create job record for this assignment
    // req.user may not be set for mobile/API calls, so fall back to null for assignedById
    const assignedBy = adminid || (req.user ? req.user.id : null);
    await Job.create({
      leadId: lead.id,
      employeeId: employeeId,
      assignedById: assignedBy,
      status: "pending",
      priority: "medium",
      scheduledDate: scheduled,
    });

    res.json({
      success: true,
      message: "Lead assigned successfully",
      lead: lead.dataValues || lead,
    });
  } catch (err) {
    next(err);
  }
};

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

    // 3. Filter employees
    const availableEmployees = employees.filter((employee) => {
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

      return !hasClash;
    });

    res.json({ success: true, items: availableEmployees });
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
