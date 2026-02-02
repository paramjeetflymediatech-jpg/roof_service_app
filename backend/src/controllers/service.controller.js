const { Service } = require('../models');

// Create new service
exports.createService = async (req, res, next) => {
  try {
    const service = await Service.create(req.body);
    res.status(201).json(service.dataValues || service);
  } catch (err) {
    next(err);
  }
};

// Get all services (with basic pagination)
exports.getServices = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const offset = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Service.findAll({
        order: [['createdAt', 'DESC']],
        limit: limit,
        offset: offset,
        raw: true,
      }),
      Service.count(),
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

// Get single service by id
exports.getServiceById = async (req, res, next) => {
  try {
    const service = await Service.findByPk(req.params.id);
    if (!service) return res.status(404).json({ message: 'Service not found' });
    res.json(service.dataValues || service);
  } catch (err) {
    next(err);
  }
};

// Update service
exports.updateService = async (req, res, next) => {
  try {
    const service = await Service.findByPk(req.params.id);
    if (!service) return res.status(404).json({ message: 'Service not found' });

    await Service.update(req.body, { where: { id: req.params.id } });

    const updatedService = await Service.findByPk(req.params.id);
    res.json(updatedService.dataValues || updatedService);
  } catch (err) {
    next(err);
  }
};

// Delete service
exports.deleteService = async (req, res, next) => {
  try {
    const service = await Service.findByPk(req.params.id);
    if (!service) return res.status(404).json({ message: 'Service not found' });

    await Service.destroy({ where: { id: req.params.id } });
    res.json({ message: 'Service deleted' });
  } catch (err) {
    next(err);
  }
};
