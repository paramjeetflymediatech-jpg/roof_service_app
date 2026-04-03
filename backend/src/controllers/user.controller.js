const { User, sequelize } = require("../models");
const { Op } = require("sequelize");
const fs = require("fs");
const path = require("path");
// Get all users (optionally filtered by role)
exports.getallusers = async (req, res, next) => {
  try {
    const { role } = req.query;

    const where = {};
    if (role) where.role = role;

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const offset = (page - 1) * limit;

    const { count, rows } = await User.findAndCountAll({
      where,
      attributes: {
        include: [
          [
            sequelize.literal(
              "(SELECT COUNT(*) FROM leads WHERE leads.user_id = User.id)",
            ),
            "leadsCount",
          ],
        ],
      },
      order: [["createdAt", "DESC"]],
      limit,
      offset,
      raw: true,
    });

    res.json({
      success: true,
      items: rows,
      total: count,
      page,
      pages: Math.ceil(count / limit),
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
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
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
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const allowedFields = [
      "name",
      "email",
      "phone",
      "role",
      "isActive",
      "password",
    ];

    allowedFields.forEach((field) => {
      if (typeof req.body[field] !== "undefined") {
        user[field] = req.body[field];
      }
    });

    // Normalize any legacy "client" role to "user" to match enum
    if (user.role === "client") {
      user.role = "user";
    }

    await user.save();

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
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (user.profilePicture) {
      let oldimage = user.profilePicture;
      if (oldimage) {
        try {
          const imagePath = path.join(
            __dirname,
            "..",
            "..",
            "public",
            oldimage,
          );
          fs.unlinkSync(imagePath);
        } catch (error) {
          console.log(error);
        }
      }
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
      return res
        .status(401)
        .json({ success: false, message: "Not authenticated" });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const allowedFields = ["name", "phone"]; // extend if you add more columns
    const updates = {};
    allowedFields.forEach((field) => {
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

// Upload profile picture for authenticated user
exports.uploadProfilePicture = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "Not authenticated" });
    }

    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded" });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (req.file || req.files) {
      let oldimage = user.profilePicture;
      if (oldimage) {
        try {
          const imagePath = path.join(
            __dirname,
            "..",
            "..",
            "public",
            oldimage,
          );
          fs.unlinkSync(imagePath);
        } catch (error) {
          console.log(error);
        }
      }
    }
    // Store relative path (the file is already saved by multer)
    let profilePicturePath;
    if (user.role === "user") {
      profilePicturePath = `/uploads/profiles/${req.file.filename}`;
    } else if (user.role === "employee") {
      profilePicturePath = `/uploads/employees/${req.file.filename}`;
    } else if (user.role === "admin") {
      profilePicturePath = `/uploads/admins/${req.file.filename}`;
    }

    await user.update({ profilePicture: profilePicturePath });

    const safeUser = user.toJSON();
    delete safeUser.password;

    res.json({
      success: true,
      data: safeUser,
      message: "Profile picture uploaded successfully",
    });
  } catch (err) {
    next(err);
  }
};

// Delete current authenticated user's account and all associated data
exports.deleteMyAccount = async (req, res, next) => {
  const { Lead, Job, JobLog } = require("../models");

  try {
    const userId = req.user?.id;
    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "Not authenticated" });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Helper function to delete image files
    const deleteImageFile = (imagePath) => {
      if (!imagePath) return;
      try {
        const fullPath = path.join(__dirname, "..", "..", "public", imagePath);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      } catch (error) {
        console.log("Error deleting image:", imagePath, error);
      }
    };

    // Helper function to delete images from JSON array
    const deleteImagesFromArray = (imagesArray) => {
      if (!imagesArray || !Array.isArray(imagesArray)) return;
      imagesArray.forEach((img) => {
        if (typeof img === "string") {
          deleteImageFile(img);
        } else if (img && img.uri) {
          deleteImageFile(img.uri);
        }
      });
    };

    // 1. Find all leads created by or assigned to the user
    const userLeads = await Lead.findAll({
      where: {
        [Op.or]: [{ userId: userId }, { assignedToId: userId }],
      },
    });

    const leadIds = userLeads.map((lead) => lead.id);

    // 2. Find all jobs - both jobs referencing user's leads AND jobs where user is employee/assigned by
    const whereConditions = [{ employeeId: userId }, { assignedById: userId }];

    if (leadIds.length > 0) {
      whereConditions.push({ leadId: leadIds });
    }

    const userJobs = await Job.findAll({
      where: {
        [Op.or]: whereConditions,
      },
    });

    // Delete job-related images
    for (const job of userJobs) {
      deleteImagesFromArray(job.beforeImages);
      deleteImagesFromArray(job.afterImages);
      if (job.clientSignature) {
        deleteImageFile(job.clientSignature);
      }
    }

    // 3. Delete job logs associated with all these jobs
    const jobIds = userJobs.map((job) => job.id);
    if (jobIds.length > 0) {
      await JobLog.destroy({
        where: { jobId: jobIds },
      });
    }

    // 4. Delete all the jobs
    await Job.destroy({
      where: {
        [Op.or]: whereConditions,
      },
    });

    // 5. Delete lead-related images
    for (const lead of userLeads) {
      deleteImagesFromArray(lead.clientImages);
      deleteImagesFromArray(lead.completionImages);
    }

    // 6. Delete the leads (now safe since all referencing jobs are deleted)
    await Lead.destroy({
      where: {
        [Op.or]: [{ userId: userId }, { assignedToId: userId }],
      },
    });

    // 7. Delete user's profile picture
    if (user.profilePicture) {
      deleteImageFile(user.profilePicture);
    }

    // 8. Finally, delete the user account
    await user.destroy();

    if (res) {
      res.json({
        success: true,
        message: "Account and all associated data deleted successfully",
      });
    }
  } catch (err) {
    console.error("Error deleting account:", err);
    if (next) next(err);
  }
};

// Request account deletion (sets status to pending_deletion and logs timestamp)
exports.requestAccountDeletion = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Password verification is done on the frontend by re-authenticating with the login endpoint,
    // so we can proceed with marking the account for deletion.
    user.status = "pending_deletion";
    user.deletionRequestedAt = new Date();
    await user.save();

    res.json({
      success: true,
      message: "Account deletion request submitted. Your account will be deleted in 24-48 hours.",
      status: user.status,
      deletionRequestedAt: user.deletionRequestedAt,
    });
  } catch (err) {
    next(err);
  }
};

// Cancel account deletion (sets status back to active and clears timestamp)
exports.cancelAccountDeletion = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.status = "active";
    user.deletionRequestedAt = null;
    await user.save();

    res.json({
      success: true,
      message: "Account deletion request cancelled successfully.",
      status: user.status,
    });
  } catch (err) {
    next(err);
  }
};
