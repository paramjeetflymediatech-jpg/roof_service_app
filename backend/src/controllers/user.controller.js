const { User } = require("../models");

// Get leads assigned to employee
exports.getallusers = async (req, res, next) => {
  try {
    const { role } = req.query;

    const where = {};
    if (role) where.role = role;

    const users = await User.findAll({
      where,
      order: [["createdAt", "DESC"]],
      raw: true,
    });

    res.json({
      success: true,
      items: users,
    });
  } catch (err) {
    next(err);
  }
};
