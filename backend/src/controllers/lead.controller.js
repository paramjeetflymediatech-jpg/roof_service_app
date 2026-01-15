const Lead = require('../models/Lead');

// Create new lead (contact / quote)
exports.createLead = async (req, res, next) => {
  try {
    const payload = { ...req.body };

    if (!payload.name) {
      return res.status(400).json({ message: 'Name is required' });
    }

    const lead = await Lead.create(payload);
    res.status(201).json(lead);
  } catch (err) {
    next(err);
  }
};

// Get leads (basic pagination + optional filters)
exports.getLeads = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.leadType) filter.leadType = req.query.leadType;

    const [items, total] = await Promise.all([
      Lead.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
      Lead.countDocuments(filter),
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
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    res.json(lead);
  } catch (err) {
    next(err);
  }
};
