const { ServiceCategory, Service } = require("../models");

// Create new category
exports.createCategory = async (req, res, next) => {
  try {
    const category = await ServiceCategory.create(req.body);
    res.status(201).json(category.dataValues || category);
  } catch (err) {
    next(err);
  }
};

// Get all categories
exports.getCategories = async (req, res, next) => {
  try {
    const categories = await ServiceCategory.findAll({
      order: [["name", "ASC"]],
      raw: true,
    });
    res.json(categories);
  } catch (err) {
    next(err);
  }
};

// Get single category by id
exports.getCategoryById = async (req, res, next) => {
  try {
    const category = await ServiceCategory.findByPk(req.params.id);
    if (!category)
      return res.status(404).json({ message: "Category not found" });
    res.json(category.dataValues || category);
  } catch (err) {
    next(err);
  }
};

// Update category
exports.updateCategory = async (req, res, next) => {
  try {
    const category = await ServiceCategory.findByPk(req.params.id);
    if (!category)
      return res.status(404).json({ message: "Category not found" });

    await ServiceCategory.update(req.body, { where: { id: req.params.id } });

    const updatedCategory = await ServiceCategory.findByPk(req.params.id);
    res.json(updatedCategory.dataValues || updatedCategory);
  } catch (err) {
    next(err);
  }
};

// Delete category
exports.deleteCategory = async (req, res, next) => {
  try {
    const category = await ServiceCategory.findByPk(req.params.id);
    if (!category)
      return res.status(404).json({ message: "Category not found" });

    // Check if category has services
    const servicesCount = await Service.count({
      where: { categoryId: req.params.id },
    });
    if (servicesCount > 0) {
      return res
        .status(400)
        .json({ message: "Cannot delete category with associated services" });
    }

    await ServiceCategory.destroy({ where: { id: req.params.id } });
    res.json({ message: "Category deleted" });
  } catch (err) {
    next(err);
  }
};
