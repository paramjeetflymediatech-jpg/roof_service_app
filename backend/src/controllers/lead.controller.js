const { Lead, Service, User } = require('../models');
const { sendLeadNotification, sendCustomerConfirmation, sendAssignmentEmail } = require('../../services/emailService');

// Create new lead (contact / quote)
exports.createLead = async (req, res, next) => {
  try {
    const payload = { ...req.body };

    if (!payload.name) {
      return res.status(400).json({ message: 'Name is required' });
    }

    // Set source to mobile_app if not specified
    if (!payload.source) {
      payload.source = 'mobile_app';
    }

    // Set initial status for quotes
    if (payload.leadType === 'quote') {
      payload.status = 'pending';
    }

    // Create lead
    const lead = await Lead.create(payload);

    // Send emails (don't wait for them to complete)
    sendLeadNotification(lead).catch(err => console.error('Email notification error:', err));
    sendCustomerConfirmation(lead).catch(err => console.error('Customer email error:', err));

    res.status(201).json({
      success: true,
      message: 'Thank you! We will contact you soon.',
      lead: lead.dataValues || lead,
    });
  } catch (err) {
    // Handle unique constraint error (SequelizeValidationError or SequelizeUniqueConstraintError)
    if (err.name === 'SequelizeUniqueConstraintError' && err.errors && err.errors[0] && err.errors[0].path === 'email') {
      return res.status(400).json({
        success: false,
        message: 'This email has already been submitted. Please use a different email or contact us directly.',
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

    const [items, total] = await Promise.all([
      Lead.findAll({
        where,
        order: [['createdAt', 'DESC']],
        limit: limit,
        offset: offset,
        raw: true,
      }),
      Lead.count({ where }),
    ]);

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
    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    res.json(lead.dataValues || lead);
  } catch (err) {
    next(err);
  }
};

// Update lead (admin review, approve, reject)
exports.updateLead = async (req, res, next) => {
  try {
    const lead = await Lead.findByPk(req.params.id);
    if (!lead) return res.status(404).json({ message: 'Lead not found' });

    await lead.update(req.body);

    res.json({
      success: true,
      message: 'Lead updated successfully',
      lead: lead.dataValues || lead,
    });
  } catch (err) {
    next(err);
  }
};

// Assign lead to employee
exports.assignLead = async (req, res, next) => {
  try {
    const { employeeId } = req.body;
    const lead = await Lead.findByPk(req.params.id);
    
    if (!lead) return res.status(404).json({ message: 'Lead not found' });

    const employee = await User.findByPk(employeeId);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });

    await lead.update({
      assignedToId: employeeId,
      status: 'assigned',
    });

    // Send email notification to employee
    sendAssignmentEmail(employee, lead).catch(err => console.error('Assignment email error:', err));

    res.json({
      success: true,
      message: 'Lead assigned successfully',
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
      order: [['createdAt', 'DESC']],
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
