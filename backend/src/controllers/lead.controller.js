const { Lead, Job, User } = require("../models");
const { Op } = require("sequelize");
const {
  sendLeadNotification,
  sendCustomerConfirmation,
  sendAssignmentEmail,
} = require("../../services/emailService");

// Create new lead (contact / quote)
exports.createLead = async (req, res, next) => {
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
        url: `/public/leads_images/${file.filename}`,
        mimeType: file.mimetype,
        size: file.size,
      }));
    }

    // 2️⃣ Attach images to payload
    payload.clientImages = clientImages.length > 0 ? clientImages : null;
    console.log(payload, "---payload");
    // 3️⃣ Create lead
    const lead = await Lead.create(payload);
    console.log(lead, "lead------------");

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

// Get leads (basic pagination + optional filters)
exports.getLeads = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const offset = (page - 1) * limit;

    const where = {};
    if (req.query.status) where.status = req.query.status;
    if (req.query.leadType) where.leadType = req.query.leadType;
    if (req.query.assignedToId) where.assignedToId = req.query.assignedToId;
    if (req.query.userId) where.userId = req.query.userId;

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
      // Expose assigned employee basic info if available
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

// Get single lead by id
exports.getLeadById = async (req, res, next) => {
  try {
    const lead = await Lead.findByPk(req.params.id);
    if (!lead) return res.status(404).json({ message: "Lead not found" });
    res.json(lead.dataValues || lead);
  } catch (err) {
    next(err);
  }
};

// Update lead (admin review, approve, reject)
exports.updateLead = async (req, res, next) => {
  try {
    const lead = await Lead.findByPk(req.params.id);
    if (!lead) return res.status(404).json({ message: "Lead not found" });
    console.log(req.body, "----req.body");
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

// Assign lead to employee
exports.assignLead = async (req, res, next) => {
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
    await Job.create({
      leadId: lead.id,
      employeeId: employeeId,
      assignedById: adminid || null,
      status: "pending",
      priority: "medium",
      scheduledDate: scheduled,
    });

    // Send email notification to employee
    // sendAssignmentEmail(employee, lead).catch((err) =>
    //   console.error("Assignment email error:", err),
    // );

    res.json({
      success: true,
      message: "Lead assigned successfully",
      lead: lead.dataValues || lead,
    });
  } catch (err) {
    next(err);
  }
};

// Get leads assigned to employee
exports.getEmployeeLeads = async (req, res, next) => {
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
