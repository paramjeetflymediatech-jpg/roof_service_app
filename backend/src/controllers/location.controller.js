const { Location } = require("../models");

// Create new location
exports.createLocation = async (req, res, next) => {
  try {
    const location = await Location.create(req.body);
    res.status(201).json(location.dataValues || location);
  } catch (err) {
    next(err);
  }
};

// Get all locations
exports.getLocations = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 100; // default 100 for routing listing
    const offset = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Location.findAll({
        order: [["name", "ASC"]],
        limit: limit,
        offset: offset,
        raw: true,
      }),
      Location.count(),
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

// Get single location by id
exports.getLocationById = async (req, res, next) => {
  try {
    const location = await Location.findByPk(req.params.id);
    if (!location) return res.status(404).json({ message: "Location not found" });
    res.json(location.dataValues || location);
  } catch (err) {
    next(err);
  }
};

// Get single location by slug
exports.getLocationBySlug = async (req, res, next) => {
  try {
    const location = await Location.findOne({
      where: { slug: req.params.slug },
    });
    if (!location) return res.status(404).json({ message: "Location not found" });
    res.json(location.dataValues || location);
  } catch (err) {
    next(err);
  }
};

// Update location
exports.updateLocation = async (req, res, next) => {
  try {
    const location = await Location.findByPk(req.params.id);
    if (!location) return res.status(404).json({ message: "Location not found" });

    await Location.update(req.body, { where: { id: req.params.id } });

    const updatedLocation = await Location.findByPk(req.params.id);
    res.json(updatedLocation.dataValues || updatedLocation);
  } catch (err) {
    next(err);
  }
};

// Delete location
exports.deleteLocation = async (req, res, next) => {
  try {
    const location = await Location.findByPk(req.params.id);
    if (!location) return res.status(404).json({ message: "Location not found" });

    await Location.destroy({ where: { id: req.params.id } });
    res.json({ message: "Location deleted" });
  } catch (err) {
    next(err);
  }
};
