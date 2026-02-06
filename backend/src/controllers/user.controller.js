const { User } = require("../models");

// Get all users (optionally filtered by role)
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

// Create a new user (admin only)
exports.createUser = async (req, res, next) => {
  try {
    const { name, email, phone, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    const user = await User.create({
      name,
      email,
      phone: phone || null,
      password,
      role: role || "user",
    });

    const safeUser = user.toJSON();
    delete safeUser.password;

    res.status(201).json({ success: true, data: safeUser });
  } catch (err) {
    next(err);
  }
};

// Get single user by id (admin only)
exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const safeUser = user.toJSON();
    delete safeUser.password;

    res.json({ success: true, data: safeUser });
  } catch (err) {
    next(err);
  }
};

// Update user by id (admin only)
exports.updateUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const allowedFields = ["name", "email", "phone", "role", "isActive", "password"];
    const updates = {};
    allowedFields.forEach(field => {
      if (typeof req.body[field] !== "undefined") {
        updates[field] = req.body[field];
      }
    });

    // Normalize any legacy "client" role to "user" to match enum
    if (updates.role === "client") {
      updates.role = "user";
    }

    await user.update(updates);

    const safeUser = user.toJSON();
    delete safeUser.password;

    res.json({ success: true, data: safeUser, message: "User updated" });
  } catch (err) {
    next(err);
  }
};

// Delete user by id (admin only)
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    await user.destroy();
    res.json({ success: true, message: "User deleted" });
  } catch (err) {
    next(err);
  }
};

// Update current authenticated user's profile
exports.updateMe = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const allowedFields = ["name", "phone"]; // extend if you add more columns
    const updates = {};
    allowedFields.forEach(field => {
      if (typeof req.body[field] !== "undefined") {
        updates[field] = req.body[field];
      }
    });

    await user.update(updates);

    const safeUser = user.toJSON();
    delete safeUser.password;

    res.json({ success: true, data: safeUser, message: "Profile updated" });
  } catch (err) {
    next(err);
  }
};
