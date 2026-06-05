const { Service, Location } = require("../models");
const fs = require("fs");
const path = require("path");

// Create new service
// Create new service
exports.createService = async (req, res, next) => {
  try {
    let serviceData = { ...req.body };

    if (req.file) {
      serviceData.featuredImageUrl = `/uploads/services/${req.file.filename}`;
    }

    const service = await Service.create(serviceData);
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
        order: [["createdAt", "DESC"]],
        limit: limit,
        offset: offset,
        include: [{ model: Location, as: "locations", attributes: ["id"] }],
      }),
      Service.count(),
    ]);

    const serializedItems = items.map((item) => {
      const plain = item.get({ plain: true });
      plain.locationIds = (plain.locations || []).map((l) => l.id);
      return plain;
    });

    res.json({
      items: serializedItems,
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
    const service = await Service.findByPk(req.params.id, {
      include: [
        "category",
        { model: Location, as: "locations", attributes: ["id"] },
      ],
    });
    if (!service) return res.status(404).json({ message: "Service not found" });
    const serviceJson = service.toJSON();
    serviceJson.locationIds = (service.locations || []).map((l) => l.id);
    res.json(serviceJson);
  } catch (err) {
    next(err);
  }
};

// Get single service by slug
exports.getServiceBySlug = async (req, res, next) => {
  try {
    const service = await Service.findOne({
      where: { slug: req.params.slug },
      include: [
        "category",
        { model: Location, as: "locations", attributes: ["id"] },
      ],
    });

    if (!service) return res.status(404).json({ message: "Service not found" });
    const serviceJson = service.toJSON();
    serviceJson.locationIds = (service.locations || []).map((l) => l.id);
    res.json(serviceJson);
  } catch (err) {
    next(err);
  }
};

// Update service
exports.updateService = async (req, res, next) => {
  try {
    const service = await Service.findByPk(req.params.id);
    if (!service) return res.status(404).json({ message: "Service not found" });

    let updateData = { ...req.body };
    if (req.file) {
      updateData.featuredImageUrl = `/uploads/services/${req.file.filename}`;
      if (service.featuredImageUrl) {
        const oldImagePath = path.join(
          __dirname,
          "..",
          "..",
          "public",
          service.featuredImageUrl,
        );
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
    }

    await Service.update(updateData, { where: { id: req.params.id } });

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
    if (!service) return res.status(404).json({ message: "Service not found" });

    if (service.featuredImageUrl) {
      const oldImagePath = path.join(
        __dirname,
        "..",
        "..",
        "public",
        service.featuredImageUrl,
      );
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    await Service.destroy({ where: { id: req.params.id } });
    res.json({ message: "Service deleted" });
  } catch (err) {
    next(err);
  }
};
