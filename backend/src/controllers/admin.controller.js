const {
  User,
  Lead,
  Service,
  SeoMeta,
  ServiceCategory,
  Gallery,
  Job,
  JobLog,
  Invoice,
  Estimate,
  JobWorkSession,
} = require("../models");
const moment = require("moment");
const fs = require("fs");
const path = require("path");
const { Op, fn, col, where: sequelizeWhere } = require("sequelize");
const sequelize = require("../config/mysql");
// GET /admin/login - Render login page
const getLogin = (req, res) => {
  if (req.session && req.session.userId) {
    return res.redirect("/admin/dashboard");
  }
  res.render("admin/login", {
    title: "Admin Login",
  });
};

// POST /admin/login - Handle login
const postLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      req.flash("error", "Please provide email and password");
      return res.redirect("/admin/login");
    }

    const user = await User.findOne({ where: { email, isActive: true } });

    if (!user) {
      req.flash("error", "Invalid credentials");
      return res.redirect("/admin/login");
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      req.flash("error", "Invalid credentials");
      return res.redirect("/admin/login");
    }

    if (user.role !== "admin") {
      req.flash("error", "Access denied. Admin privileges required.");
      return res.redirect("/admin/login");
    }

    // Set session
    req.session.userId = user.id;
    req.session.userRole = user.role;
    req.session.userName = user.name;

    // Save session before redirect
    req.session.save((err) => {
      if (err) {
        console.error("Session save error:", err);
        req.flash("error", "An error occurred during login");
        return res.redirect("/admin/login");
      }
      req.flash("success", "Login successful");
      res.redirect("/admin/dashboard");
    });
  } catch (error) {
    console.error("Login error:", error);
    req.flash("error", "An error occurred during login");
    res.redirect("/admin/login");
  }
};

// GET /admin/dashboard - Render dashboard
const getDashboard = async (req, res) => {
  try {
    const totalUsers = await User.count();
    const totalLeads = await Lead.count();
    const newLeads = await Lead.count({ where: { status: "new" } });
    const inProgressLeads = await Lead.count({
      where: { status: "in_progress" },
    });

    res.render("admin/dashboard", {
      title: "Dashboard",
      userName: req.session.userName,
      stats: {
        totalUsers,
        totalLeads,
        newLeads,
        inProgressLeads,
      },
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    req.flash("error", "Error loading dashboard");
    res.redirect("/admin/login");
  }
};

// GET /admin/logout - Handle logout
const getLogout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Logout error:", err);
    }
    res.redirect("/admin/login");
  });
};

// GET /admin/users - Render user list with pagination
const getUserList = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 12;
    const offset = (page - 1) * limit;

    const { search, role, isActive } = req.query;
    const where = {};

    if (search) {
      const parsedDate = moment(search, ["DD/MM/YYYY", "D/M/YYYY"], true);

      if (parsedDate.isValid()) {
        where.createdAt = {
          [Op.between]: [
            parsedDate.startOf("day").toDate(),
            parsedDate.endOf("day").toDate(),
          ],
        };
      } else {
        where[Op.or] = [
          { name: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } },
          { phone: { [Op.like]: `%${search}%` } },
        ];
      }
    }
    // if (search) {
    //   where[Op.or] = [
    //     { name: { [Op.like]: `%${search}%` } },
    //     { email: { [Op.like]: `%${search}%` } },
    //     { phone: { [Op.like]: `%${search}%` } },
    //     sequelizeWhere(fn("DATE_FORMAT", col("created_at"), "%d/%m/%Y"), {
    //       [Op.like]: `%${search}%`
    //     }),
    //   ];
    // }

    if (role) {
      where.role = role;
    }

    if (isActive !== undefined && isActive !== "") {
      where.isActive = isActive === "true";
    }

    const totalUsers = await User.count({ where });
    const users = await User.findAll({
      where,
      attributes: { exclude: ["password"] },
      order: [["createdAt", "DESC"]],
      limit: limit,
      offset: offset,
      raw: true,
    });

    const totalPages = Math.ceil(totalUsers / limit);

    // If AJAX request, return rendered partials
    if (req.xhr || req.query.ajax) {
      return res.render('admin/users/_table_rows', { users }, (err, tableHtml) => {
        res.render('admin/users/_cards', { users }, (err, cardHtml) => {
          res.render('admin/users/_pagination', { totalPages, currentPage: page, limit, totalItems: totalUsers, query: req.query }, (err, paginationHtml) => {
            return res.json({
              tableHtml,
              cardHtml,
              paginationHtml,
              query: req.query
            });
          });
        });
      });
    }

    res.render("admin/users/list", {
      title: "User List",
      userName: req.session.userName,
      users,
      currentPage: page,
      totalPages: totalPages,
      totalUsers: totalUsers,
      totalItems: totalUsers,
      limit: limit,
      query: req.query, // Pass query back to preserve form state
    });
  } catch (error) {
    console.error("User list error:", error);
    req.flash("error", "Error loading user list");
    res.redirect("/admin/dashboard");
  }
};

// GET /admin/leads - Render lead list with pagination
const getLeadList = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 12;
    const offset = (page - 1) * limit;

    const { search, status, leadType } = req.query;
    const where = {};

    if (search) {
      const parsedDate = moment(search, ["DD/MM/YYYY", "D/M/YYYY"], true);

      if (parsedDate.isValid()) {
        where.created_at = {
          [Op.between]: [
            parsedDate.startOf("day").toDate(),
            parsedDate.endOf("day").toDate(),
          ],
        };
      } else {
        where[Op.or] = [
          { name: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } },
          { phone: { [Op.like]: `%${search}%` } },
        ];
      }
    }

    if (status) {
      where.status = status;
    }

    if (leadType) {
      where.leadType = leadType;
    }
    let pendingLeadsCount = 0;
    let completedLeadsCount = 0;
    
    const { count: totalLeads, rows: leads } = await Lead.findAndCountAll({
      where,
      include: [
        { model: Estimate, as: "estimates", attributes: ["id", "status"] },
        { model: Invoice, as: "invoices", attributes: ["id", "status"] },
      ],
      order: [["createdAt", "DESC"]],
      limit: limit,
      offset: offset,
      distinct: true,
    });

    pendingLeadsCount = await Lead.count({
      where: {
        status: { [Op.in]: ["new", "pending"] },
      },
    });

    completedLeadsCount = await Lead.count({
      where: { status: "completed" },
    });

    console.log(`[getLeadList] Total: ${totalLeads}, Pending: ${pendingLeadsCount}, Completed: ${completedLeadsCount}`);

    const totalPages = Math.ceil(totalLeads / limit);

    // If AJAX request, return rendered partials
    if (req.xhr || req.query.ajax) {
      console.log(`[getLeadList] Rendering AJAX partials`);
      return res.render("admin/leads/_table_rows", { leads }, (err, tableHtml) => {
        if (err) console.error("AJAX _table_rows error:", err);
        res.render("admin/leads/_cards", { leads }, (err, cardHtml) => {
          if (err) console.error("AJAX _cards error:", err);
          res.render(
            "admin/leads/_pagination",
            {
              totalPages,
              currentPage: page,
              limit,
              totalItems: totalLeads,
              query: req.query,
            },
            (err, paginationHtml) => {
              if (err) console.error("AJAX _pagination error:", err);
              return res.json({
                tableHtml,
                cardHtml,
                paginationHtml,
                query: req.query,
              });
            },
          );
        });
      });
    }

    console.log(`[getLeadList] Rendering main list view`);
    res.render("admin/leads/list", {
      title: "Lead List",
      userName: req.session.userName,
      leads: leads.map((l) => l.get({ plain: false })),
      currentPage: page,
      totalPages,
      totalLeads,
      pendingLeadsCount,
      completedLeadsCount,
      limit,
      query: req.query,
    });
  } catch (error) {
    console.error("Lead list error:", error);
    req.flash("error", "Error loading lead list");
    res.redirect("/admin/dashboard");
  }
};

// GET /admin/leads/create - Render create lead form
const getCreateLead = async (req, res) => {
  try {
    const services = await Service.findAll({ order: [["name", "ASC"]] });
    res.render("admin/leads/create", {
      title: "Add New Lead",
      userName: req.session.userName,
      services: services.map((s) => s.toJSON()),
    });
  } catch (error) {
    console.error("Create lead view error:", error);
    req.flash("error", "Error loading create lead view");
    res.redirect("/admin/leads");
  }
};

// POST /admin/leads - Create new lead
const postCreateLead = async (req, res) => {
  try {
    let userId = req.user.id || null;
    const {
      name,
      email,
      phone,
      leadType,
      address,
      city,
      province,
      serviceType,
      roofType,
      hearAboutUs,
      status = "pending",
      message,
      preferredDate,
      employeeStartTime,
      employeeEndTime,
    } = req.body;

    if (!name) {
      req.flash("error", "Name is required");
      return res.redirect("/admin/leads/create");
    }

    // Handle images
    let clientImages = [];
    if (req.files && req.files.length > 0) {
      clientImages = req.files.map((file) => ({
        url: `/uploads/leads/${file.filename}`,
        name: file.originalname,
        type: file.mimetype,
      }));
    }

    await Lead.create({
      name,
      email,
      phone,
      leadType,
      address,
      city,
      province,
      serviceType,
      roofType,
      hearAboutUs,
      userId,
      message,
      status,
      preferredDate: preferredDate || null,
      employeeStartTime,
      employeeEndTime,
      clientImages,
      source: "other", // Manual entry
    });
    req.flash("success", "Lead created successfully");
    res.redirect("/admin/leads");
  } catch (error) {
    console.error("Create lead error:", error);
    req.flash("error", "Error creating lead");
    res.redirect("/admin/leads/create");
  }
};

// GET /admin/leads/:id/edit - Render edit lead form
const getEditLead = async (req, res) => {
  try {
    const lead = await Lead.findByPk(req.params.id);
    const services = await Service.findAll({ order: [["name", "ASC"]] });

    if (!lead) {
      req.flash("error", "Lead not found");
      return res.redirect("/admin/leads");
    }
    res.render("admin/leads/edit", {
      title: "Edit Lead",
      userName: req.session.userName,
      lead: lead.dataValues || lead,
      services: services.map((s) => s.toJSON()),
    });
  } catch (error) {
    console.error("Edit lead error:", error);
    req.flash("error", "Error loading lead");
    res.redirect("/admin/leads");
  }
};

// POST /admin/leads/:id - Update lead
const postUpdateLead = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      leadType,
      address,
      city,
      province,
      serviceType,
      roofType,
      hearAboutUs,
      status,
      message,
      preferredDate,
      employeeStartTime,
      employeeEndTime,
    } = req.body;
    const leadId = req.params.id;

    const lead = await Lead.findByPk(leadId);
    if (!lead) {
      req.flash("error", "Lead not found");
      return res.redirect("/admin/leads");
    }

    // Handle new images
    let clientImages = lead.clientImages || [];
    // Ensure clientImages is an array
    if (typeof clientImages === "string") {
      try {
        clientImages = JSON.parse(clientImages);
      } catch (e) {
        clientImages = [];
      }
    }
    if (!Array.isArray(clientImages)) {
      clientImages = [];
    }

    // Add new uploaded images
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((file) => ({
        url: `/uploads/leads/${file.filename}`,
        name: file.originalname,
        type: file.mimetype,
      }));
      clientImages = [...clientImages, ...newImages];
    }

    // Handle image deletion
    if (req.body.deleteImages) {
      const imagesToDelete = Array.isArray(req.body.deleteImages)
        ? req.body.deleteImages
        : [req.body.deleteImages];

      clientImages = clientImages.filter((img) => {
        if (imagesToDelete.includes(img.url)) {
          // Delete file from filesystem
          try {
            const filePath = path.join(__dirname, "../../public", img.url);
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
            }
          } catch (err) {
            console.error("Error deleting image file:", err);
          }
          return false; // Remove from array
        }
        return true; // Keep in array
      });
    }

    await Lead.update(
      {
        name,
        email,
        phone,
        leadType,
        address,
        city,
        province,
        serviceType,
        roofType,
        hearAboutUs,
        status,
        message,
        preferredDate: preferredDate || null,
        employeeStartTime,
        employeeEndTime,
        clientImages,
      },
      { where: { id: leadId } },
    );

    req.flash("success", "Lead updated successfully");
    res.redirect("/admin/leads");
  } catch (error) {
    console.error("Update lead error:", error);
    req.flash("error", "Error updating lead");
    res.redirect(`/admin/leads/${req.params.id}/edit`);
  }
};

// POST /admin/leads/:id/delete - Delete lead
const deleteLead = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const leadId = req.params.id;
    // Fetch lead with associated jobs to get their images
    const lead = await Lead.findByPk(leadId, {
      include: [{ model: Job, as: "jobs" }],
    });

    if (!lead) {
      await transaction.rollback();
      req.flash("error", "Lead not found");
      return res.redirect("/admin/leads");
    }

    // Collect all image URLs to delete from filesystem
    let allImageUrls = [];

    // 1. Lead Client Images
    if (lead.clientImages) {
      try {
        const images = Array.isArray(lead.clientImages)
          ? lead.clientImages
          : JSON.parse(lead.clientImages);
        images.forEach((img) => {
          if (img.url) allImageUrls.push(img.url);
        });
      } catch (e) {
        console.error("Error parsing lead clientImages:", e);
      }
    }

    // 2. Lead Completion Images
    if (lead.completionImages) {
      try {
        const images = Array.isArray(lead.completionImages)
          ? lead.completionImages
          : JSON.parse(lead.completionImages);
        images.forEach((img) => {
          if (img.url) allImageUrls.push(img.url);
        });
      } catch (e) {
        console.error("Error parsing lead completionImages:", e);
      }
    }

    // 3. Associated Jobs Images
    if (lead.jobs && lead.jobs.length > 0) {
      lead.jobs.forEach((job) => {
        // Before Images
        if (job.beforeImages) {
          try {
            const images = Array.isArray(job.beforeImages)
              ? job.beforeImages
              : JSON.parse(job.beforeImages);
            images.forEach((img) => {
              if (img.url) allImageUrls.push(img.url);
            });
          } catch (e) {
            console.error("Error parsing job beforeImages:", e);
          }
        }
        // After Images
        if (job.afterImages) {
          try {
            const images = Array.isArray(job.afterImages)
              ? job.afterImages
              : JSON.parse(job.afterImages);
            images.forEach((img) => {
              if (img.url) allImageUrls.push(img.url);
            });
          } catch (e) {
            console.error("Error parsing job afterImages:", e);
          }
        }
      });
    }

    // Delete associated records in order
    // 1. JobWorkSessions
    await JobWorkSession.destroy({
      where: { leadId: leadId },
      transaction,
    });

    // 2. JobLogs
    await JobLog.destroy({
      where: { leadId: leadId },
      transaction,
    });

    // 3. Jobs
    await Job.destroy({
      where: { leadId: leadId },
      transaction,
    });

    // 4. Invoices
    await Invoice.destroy({
      where: { leadId: leadId },
      transaction,
    });

    // 5. Estimates
    await Estimate.destroy({
      where: { leadId: leadId },
      transaction,
    });

    // 6. Finally, delete the Lead
    await Lead.destroy({
      where: { id: leadId },
      transaction,
    });

    await transaction.commit();

    // After successful DB deletion, clean up files from filesystem
    for (const url of allImageUrls) {
      try {
        const filePath = path.join(__dirname, "../../public", url);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (err) {
        console.error(`Error deleting file ${url}:`, err);
      }
    }

    req.flash(
      "success",
      "Lead, associated records, and all images deleted successfully",
    );
    res.redirect("/admin/leads");
  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error("Delete lead error:", error);
    req.flash("error", "Error deleting lead: " + error.message);
    res.redirect("/admin/leads");
  }
};

// GET /admin/leads/:id - View lead details
const getLeadDetail = async (req, res) => {
  try {
    const lead = await Lead.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: "assignedTo",
          attributes: ["name", "email", "phone"],
        },
        {
          model: Invoice,
          as: "invoices",
          attributes: ["id", "invoiceNumber"],
        },
        {
          model: Estimate,
          as: "estimates",
          attributes: ["id", "estimateNumber", "status", "total"],
        },
      ],
    });

    if (!lead) {
      req.flash("error", "Lead not found");
      return res.redirect("/admin/leads");
    }

    res.render("admin/leads/view", {
      title: "View Lead",
      userName: req.session.userName,
      lead: lead.dataValues || lead,
    });
  } catch (error) {
    console.error("View lead error:", error);
    req.flash("error", "Error loading lead");
    res.redirect("/admin/leads");
  }
};

// POST /admin/leads/:id/approve - Approve lead
const approveLead = async (req, res) => {
  try {
    const lead = await Lead.findByPk(req.params.id);

    if (!lead) {
      req.flash("error", "Lead not found");
      return res.redirect("/admin/leads");
    }

    lead.status = "approved";
    await lead.save();

    req.flash("success", "Lead approved successfully");
    res.redirect(`/admin/leads/${lead.id}`);
  } catch (error) {
    console.error("Approve lead error:", error);
    req.flash("error", "Error approving lead");
    res.redirect("/admin/leads");
  }
};

// POST /admin/leads/delete-all - Delete all leads
const deleteAllLeads = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    // 1️⃣ Deepest child first
    await JobWorkSession.destroy({
      where: {},
      transaction,
    });

    // 2️⃣ Then job logs
    await JobLog.destroy({
      where: {},
      transaction,
    });

    // 3️⃣ Then jobs
    await Job.destroy({
      where: {},
      transaction,
    });

    // 4️⃣ Finally leads
    await Lead.destroy({
      where: {},
      transaction,
    });

    await transaction.commit();

    req.flash("success", "All leads deleted successfully");
    res.redirect("/admin/leads");
  } catch (error) {
    await transaction.rollback();
    console.error("Delete all leads error:", error);
    req.flash("error", "Error deleting all leads");
    res.redirect("/admin/leads");
  }
};

// GET /admin/users/create - Render create user form
const getCreateUser = (req, res) => {
  res.render("admin/users/create", {
    title: "Create User",
    userName: req.session.userName,
  });
};

// POST /admin/users - Create new user
const postCreateUser = async (req, res) => {
  try {
    const { name, email, password, role, isActive, phone } = req.body;

    // Validation
    if (!name || !email || !password) {
      req.flash("error", "Name, email, and password are required");
      return res.redirect("/admin/users/create");
    }

    if (name.length < 3) {
      req.flash("error", "Name must be at least 3 characters long");
      return res.redirect("/admin/users/create");
    }

    if (phone && phone.length > 16) {
      req.flash("error", "Phone cannot exceed 16 characters");
      return res.redirect("/admin/users/create");
    }

    // Check if email already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      req.flash("error", "Email already exists");
      return res.redirect("/admin/users/create");
    }

    // Check if phone already exists
    if (phone) {
      if (!/^\d+$/.test(phone)) {
        req.flash("error", "Phone number must contain only numbers");
        return res.redirect("/admin/users/create");
      }
      const existingPhone = await User.findOne({ where: { phone } });
      if (existingPhone) {
        req.flash("error", "Phone number already exists");
        return res.redirect("/admin/users/create");
      }
    }

    // Create new user
    await User.create({
      name,
      email,
      password, // Will be hashed by pre-save hook
      role: role || "user",
      isActive: isActive === "on" ? true : false,
      phone,
    });

    req.flash("success", "User created successfully");
    res.redirect("/admin/users");
  } catch (error) {
    console.error("Create user error:", error);
    req.flash("error", "Error creating user");
    res.redirect("/admin/users/create");
  }
};

// GET /admin/users/:id/edit - Render edit user form
const getEditUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      req.flash("error", "User not found");
      return res.redirect("/admin/users");
    }

    res.render("admin/users/edit", {
      title: "Edit User",
      userName: req.session.userName,
      user: user.dataValues || user,
    });
  } catch (error) {
    console.error("Edit user error:", error);
    req.flash("error", "Error loading user");
    res.redirect("/admin/users");
  }
};

// POST /admin/users/:id - Update user
const postUpdateUser = async (req, res) => {
  try {
    const { name, email, password, role, isActive, phone } = req.body;
    const userId = req.params.id;

    // Validation
    if (!name || !email) {
      req.flash("error", "Name and email are required");
      return res.redirect(`/admin/users/${userId}/edit`);
    }

    if (name.length < 3) {
      req.flash("error", "Name must be at least 3 characters long");
      return res.redirect(`/admin/users/${userId}/edit`);
    }

    if (phone && phone.length > 16) {
      req.flash("error", "Phone cannot exceed 16 characters");
      return res.redirect(`/admin/users/${userId}/edit`);
    }

    // Check if email already exists (excluding current user)
    const existingUser = await User.findOne({
      where: { email, id: { [require("sequelize").Op.ne]: userId } },
    });
    if (existingUser) {
      req.flash("error", "Email already exists");
      return res.redirect(`/admin/users/${userId}/edit`);
    }

    // Check if phone already exists (excluding current user)
    if (phone) {
      if (!/^\d+$/.test(phone)) {
        req.flash("error", "Phone number must contain only numbers");
        return res.redirect(`/admin/users/${userId}/edit`);
      }
      const existingPhone = await User.findOne({
        where: { phone, id: { [require("sequelize").Op.ne]: userId } },
      });
      if (existingPhone) {
        req.flash("error", "Phone number already exists");
        return res.redirect(`/admin/users/${userId}/edit`);
      }
    }

    // Find and update user
    const user = await User.findByPk(userId);
    if (!user) {
      req.flash("error", "User not found");
      return res.redirect("/admin/users");
    }

    user.name = name;
    user.email = email;
    user.role = role || "user";
    user.isActive = isActive === "on" ? true : false;
    user.phone = phone;

    // Only update password if provided
    if (password && password.trim() !== "") {
      user.password = password; // Will be hashed by beforeUpdate hook
    }

    await user.save();

    req.flash("success", "User updated successfully");
    res.redirect("/admin/users");
  } catch (error) {
    console.error("Update user error:", error);
    req.flash("error", "Error updating user");
    res.redirect(`/admin/users/${req.params.id}/edit`);
  }
};

// POST /admin/users/:id/delete - Delete user
const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    // Prevent deleting self
    if (userId === req.session.userId) {
      req.flash("error", "Cannot delete your own account");
      return res.redirect("/admin/users");
    }

    const user = await User.findByPk(userId);

    if (!user) {
      req.flash("error", "User not found");
      return res.redirect("/admin/users");
    }
    if (user.profilePicture) {
      let oldimage = user.profilePicture;
      try {
        const imagePath = path.join(__dirname, "..", "..", "public", oldimage);
        fs.unlinkSync(imagePath);
      } catch (error) {
        console.log(error);
      }
    }
    await User.destroy({ where: { id: userId } });

    req.flash("success", "User deleted successfully");
    res.redirect("/admin/users");
  } catch (error) {
    console.error("Delete user error:", error);
    req.flash("error", "Error deleting user");
    res.redirect("/admin/users");
  }
};

// POST /admin/users/delete-all - Delete all users except current
const deleteAllUsers = async (req, res) => {
  try {
    const currentUserId = req.session.userId;

    const users = await User.findAll({
      where: { id: { [require("sequelize").Op.ne]: currentUserId } },
    });

    users.forEach((user) => {
      if (user.profilePicture) {
        try {
          const imagePath = path.join(
            __dirname,
            "..",
            "..",
            "public",
            user.profilePicture,
          );
          fs.unlinkSync(imagePath);
        } catch (error) {
          console.log(error);
        }
      }
    });
    // Delete all users except the current admin
    await User.destroy({
      where: { id: { [require("sequelize").Op.ne]: currentUserId } },
    });

    req.flash("success", "All users deleted successfully (except yourself)");
    res.redirect("/admin/users");
  } catch (error) {
    console.error("Delete all users error:", error);
    req.flash("error", "Error deleting users");
    res.redirect("/admin/users");
  }
};

// GET /admin/seo - Render SEO list
const getSeoList = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = 12;
    const offset = (page - 1) * limit;
    const { search } = req.query;

    const { Op } = require("sequelize");
    const where = {};
    if (search) {
      const parsedDate = moment(search, ["DD/MM/YYYY", "D/M/YYYY"], true);
      if (parsedDate.isValid()) {
        where.updated_at = {
          [Op.between]: [
            parsedDate.startOf("day").toDate(),
            parsedDate.endOf("day").toDate(),
          ],
        };
      } else {
        where[Op.or] = [
          { pageName: { [Op.like]: `%${search}%` } },
          { pageTitle: { [Op.like]: `%${search}%` } },
          { metaDescription: { [Op.like]: `%${search}%` } },
        ];
      }
    }

    const { count, rows: seoPages } = await SeoMeta.findAndCountAll({
      where,
      order: [["updatedAt", "DESC"]],
      limit,
      offset,
      raw: true,
    });

    if (req.xhr || req.query.ajax) {
      return res.render("admin/seo/_table_rows", { seoPages }, (err, tableHtml) => {
        res.render("admin/seo/_cards", { seoPages }, (err, cardHtml) => {
          res.render("admin/seo/_pagination", {
            currentPage: page,
            totalPages: Math.ceil(count / limit),
            totalItems: count,
            limit,
            query: req.query,
          }, (err, paginationHtml) => {
            return res.json({
              success: true,
              tableHtml,
              cardHtml,
              paginationHtml,
              totalItems: count,
            });
          });
        });
      });
    }

    res.render("admin/seo/list", {
      title: "SEO Management",
      userName: req.session.userName,
      seoPages,
      currentPage: page,
      totalPages: Math.ceil(count / limit),
      totalItems: count,
      limit,
      query: req.query,
    });
  } catch (error) {
    console.error("SEO list error:", error);
    if (req.xhr || req.query.ajax) {
      return res.status(500).json({ success: false, message: "Error loading SEO pages" });
    }
    req.flash("error", "Error loading SEO pages");
    res.redirect("/admin/dashboard");
  }
};

// GET /admin/seo/create - Render create SEO form
const getCreateSeo = async (req, res) => {
  try {
    const services = await Service.findAll({ order: [["name", "ASC"]] });
    const categories = await ServiceCategory.findAll({
      order: [["name", "ASC"]],
    });

    res.render("admin/seo/create", {
      title: "Add New SEO Page",
      userName: req.session.userName,
      services,
      categories,
    });
  } catch (error) {
    console.error("Create SEO view error:", error);
    req.flash("error", "Error loading create SEO view");
    res.redirect("/admin/seo");
  }
};

// POST /admin/seo - Create new SEO page
// const postCreateSeo = async (req, res) => {
//   try {
//     const {
//       pageName,
//       pageTitle,
//       metaDescription,
//       metaRobots,
//       ogTitle,
//       ogDescription,
//       ogImage,
//       canonicalUrl,
//       schemaMarkup,
//       googleAnalyticsId,
//       googleTagManagerId,
//     } = req.body;

//     // Validation
//     if (!pageName || !pageTitle || !metaDescription) {
//       req.flash("error", "Page name, title, and description are required");
//       return res.redirect("/admin/seo/create");
//     }

//     // Check if page already exists
//     const existingPage = await SeoMeta.findOne({
//       where: { pageName: pageName.toLowerCase() },
//     });
//     if (existingPage) {
//       req.flash("error", "SEO for this page already exists");
//       return res.redirect("/admin/seo/create");
//     }

//     // Create new SEO entry
//     await SeoMeta.create({
//       pageName: pageName.toLowerCase(),
//       pageTitle,
//       metaDescription,
//       metaRobots: metaRobots || "index, follow",
//       ogTitle: ogTitle || pageTitle,
//       ogDescription: ogDescription || metaDescription,
//       ogImage: ogImage || "",
//       canonicalUrl: canonicalUrl || "",
//       schemaMarkup: schemaMarkup || "",
//       googleAnalyticsId: googleAnalyticsId || "",
//       googleTagManagerId: googleTagManagerId || "",
//     });

//     req.flash("success", "SEO page created successfully");
//     res.redirect("/admin/seo");
//   } catch (error) {
//     console.error("Create SEO error:", error);
//     req.flash("error", "Error creating SEO page");
//     res.redirect("/admin/seo/create");
//   }
// };

// POST /admin/seo - Create new SEO page
const postCreateSeo = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const {
      pageName,
      pageTitle,
      metaDescription,
      metaRobots,
      ogTitle,
      ogDescription,
      ogImage,
      canonicalUrl,
      schemaMarkup,
      googleAnalyticsId,
      googleTagManagerId,
    } = req.body;

    if (!pageName || !pageTitle || !metaDescription) {
      req.flash("error", "Page name, title, and description are required");
      return res.redirect("/admin/seo/create");
    }

    const formattedPageName = pageName.toLowerCase();

    // Check SEO already exists
    const existingPage = await SeoMeta.findOne({
      where: { pageName: formattedPageName },
    });

    if (existingPage) {
      req.flash("error", "SEO for this page already exists");
      return res.redirect("/admin/seo/create");
    }

    // Create SEO entry
    await SeoMeta.create(
      {
        pageName: formattedPageName,
        pageTitle,
        metaDescription,
        metaRobots: metaRobots || "index, follow",
        ogTitle: ogTitle || pageTitle,
        ogDescription: ogDescription || metaDescription,
        ogImage: ogImage || "",
        canonicalUrl: canonicalUrl || "",
        schemaMarkup: schemaMarkup || "",
        googleAnalyticsId: googleAnalyticsId || "",
        googleTagManagerId: googleTagManagerId || "",
      },
      { transaction },
    );

    // ✅ If it is a service page
    if (formattedPageName.startsWith("services/")) {
      const serviceSlug = formattedPageName.replace("services/", "").trim();

      const service = await Service.findOne({
        where: { slug: serviceSlug },
        transaction,
      });

      if (service) {
        await service.update(
          {
            seo: {
              pageTitle,
              metaDescription,
              metaRobots: metaRobots || "index, follow",
              ogTitle: ogTitle || pageTitle,
              ogDescription: ogDescription || metaDescription,
              ogImage: ogImage || "",
              canonicalUrl: canonicalUrl || "",
              schemaMarkup: schemaMarkup || "",
              googleAnalyticsId: googleAnalyticsId || "",
              googleTagManagerId: googleTagManagerId || "",
            },
          },
          { transaction },
        );
      }
    }
    await transaction.commit();

    req.flash("success", "SEO page created successfully");
    res.redirect("/admin/seo");
  } catch (error) {
    await transaction.rollback();
    console.error("Create SEO error:", error);
    req.flash("error", "Error creating SEO page");
    res.redirect("/admin/seo/create");
  }
};

// GET /admin/seo/:id/edit - Render edit SEO form
const getEditSeo = async (req, res) => {
  try {
    const seoPage = await SeoMeta.findByPk(req.params.id);

    if (!seoPage) {
      req.flash("error", "SEO page not found");
      return res.redirect("/admin/seo");
    }

    const services = await Service.findAll({ order: [["name", "ASC"]] });
    const categories = await ServiceCategory.findAll({
      order: [["name", "ASC"]],
    });

    res.render("admin/seo/edit", {
      title: "Edit SEO Meta Tags",
      userName: req.session.userName,
      seoPage: seoPage.dataValues || seoPage,
      services,
      categories,
    });
  } catch (error) {
    console.error("Edit SEO error:", error);
    req.flash("error", "Error loading SEO page");
    res.redirect("/admin/seo");
  }
};

// POST /admin/seo/:id - Update SEO meta tags
// const postUpdateSeo = async (req, res) => {
//   try {
//     const {
//       pageName,
//       pageTitle,
//       metaDescription,
//       metaRobots,
//       ogTitle,
//       ogDescription,
//       ogImage,
//       canonicalUrl,
//       schemaMarkup,
//       googleAnalyticsId,
//       googleTagManagerId,
//     } = req.body;
//     const seoId = req.params.id;

//     // Validation
//     if (!pageName || !pageTitle || !metaDescription) {
//       req.flash("error", "Page name, title and meta description are required");
//       return res.redirect(`/admin/seo/${seoId}/edit`);
//     }

//     // Find and update SEO page
//     const seoPage = await SeoMeta.findByPk(seoId);
//     if (!seoPage) {
//       req.flash("error", "SEO page not found");
//       return res.redirect("/admin/seo");
//     }

//     // Check if new pageName already exists for other records
//     if (pageName.toLowerCase() !== seoPage.pageName.toLowerCase()) {
//       const existingPage = await SeoMeta.findOne({
//         where: {
//           pageName: pageName.toLowerCase(),
//           id: { [Op.ne]: seoId },
//         },
//       });
//       if (existingPage) {
//         req.flash("error", "SEO for this page already exists");
//         return res.redirect(`/admin/seo/${seoId}/edit`);
//       }
//     }

//     await SeoMeta.update(
//       {
//         pageName: pageName.toLowerCase(),
//         pageTitle,
//         metaDescription,
//         metaRobots: metaRobots || "index, follow",
//         ogTitle: ogTitle || pageTitle,
//         ogDescription: ogDescription || metaDescription,
//         ogImage: ogImage || "",
//         canonicalUrl: canonicalUrl || "",
//         schemaMarkup: schemaMarkup || "",
//         googleAnalyticsId: googleAnalyticsId || "",
//         googleTagManagerId: googleTagManagerId || "",
//       },
//       { where: { id: seoId } },
//     );

//     req.flash("success", "SEO meta tags updated successfully");
//     res.redirect("/admin/seo");
//   } catch (error) {
//     console.error("Update SEO error:", error);
//     req.flash("error", "Error updating SEO meta tags");
//     res.redirect(`/admin/seo/${req.params.id}/edit`);
//   }
// };
const postUpdateSeo = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const {
      pageName,
      pageTitle,
      metaDescription,
      metaRobots,
      ogTitle,
      ogDescription,
      ogImage,
      canonicalUrl,
      schemaMarkup,
      googleAnalyticsId,
      googleTagManagerId,
    } = req.body;

    const seoId = req.params.id;

    if (!pageName || !pageTitle || !metaDescription) {
      req.flash("error", "Page name, title and meta description are required");
      return res.redirect(`/admin/seo/${seoId}/edit`);
    }

    const formattedPageName = pageName.toLowerCase();

    const seoPage = await SeoMeta.findByPk(seoId);
    if (!seoPage) {
      req.flash("error", "SEO page not found");
      return res.redirect("/admin/seo");
    }

    // Check duplicate pageName
    if (formattedPageName !== seoPage.pageName.toLowerCase()) {
      const existingPage = await SeoMeta.findOne({
        where: {
          pageName: formattedPageName,
          id: { [Op.ne]: seoId },
        },
      });

      if (existingPage) {
        req.flash("error", "SEO for this page already exists");
        return res.redirect(`/admin/seo/${seoId}/edit`);
      }
    }

    // Save old values before update
    const oldPageName = seoPage.pageName;

    // Update SeoMeta
    await seoPage.update(
      {
        pageName: formattedPageName,
        pageTitle,
        metaDescription,
        metaRobots: metaRobots || "index, follow",
        ogTitle: ogTitle || pageTitle,
        ogDescription: ogDescription || metaDescription,
        ogImage: ogImage || "",
        canonicalUrl: canonicalUrl || "",
        schemaMarkup: schemaMarkup || "",
        googleAnalyticsId: googleAnalyticsId || "",
        googleTagManagerId: googleTagManagerId || "",
      },
      { transaction },
    );

    // ✅ SERVICE SYNC LOGIC
    if (
      formattedPageName.startsWith("services/") ||
      oldPageName.startsWith("services/")
    ) {
      const serviceSlug = formattedPageName.replace("services/", "").trim();

      const service = await Service.findOne({
        where: { slug: serviceSlug },
        transaction,
      });

      if (service) {
        await service.update(
          {
            seo: {
              pageTitle,
              metaDescription,
              metaRobots: metaRobots || "index, follow",
              ogTitle: ogTitle || pageTitle,
              ogDescription: ogDescription || metaDescription,
              ogImage: ogImage || "",
              canonicalUrl: canonicalUrl || "",
              schemaMarkup: schemaMarkup || "",
              googleAnalyticsId: googleAnalyticsId || "",
              googleTagManagerId: googleTagManagerId || "",
            },
          },
          { transaction },
        );
      }
    }

    await transaction.commit();

    req.flash("success", "SEO meta tags updated successfully");
    res.redirect("/admin/seo");
  } catch (error) {
    await transaction.rollback();
    console.error("Update SEO error:", error);
    req.flash("error", "Error updating SEO meta tags");
    res.redirect(`/admin/seo/${req.params.id}/edit`);
  }
};

// POST /admin/seo/:id/delete - Delete SEO page
const deleteSeo = async (req, res) => {
  try {
    const seoId = req.params.id;
    const seoPage = await SeoMeta.findByPk(seoId);

    if (!seoPage) {
      req.flash("error", "SEO page not found");
      return res.redirect("/admin/seo");
    }

    await SeoMeta.destroy({ where: { id: seoId } });

    req.flash("success", "SEO page deleted successfully");
    res.redirect("/admin/seo");
  } catch (error) {
    console.error("Delete SEO error:", error);
    req.flash("error", "Error deleting SEO page");
    res.redirect("/admin/seo");
  }
};

// GET /admin/categories - Render category list
const getCategoryList = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = 12;
    const offset = (page - 1) * limit;
    const { search } = req.query;

    const { Op } = require("sequelize");
    const where = {};
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { slug: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
      ];
    }

    const { count, rows: categories } = await ServiceCategory.findAndCountAll({
      where,
      include: [{ model: Service, as: "services" }],
      order: [["name", "ASC"]],
      limit,
      offset,
      distinct: true,
    });

    if (req.xhr || req.query.ajax) {
      return res.render("admin/categories/_table_rows", { categories }, (err, tableHtml) => {
        // Categories typically don't have separate mobile cards in the current design, 
        // but we'll try to render if it exists or return empty
        res.render("admin/categories/_cards", { categories }, (err, cardHtml) => {
          res.render("admin/categories/_pagination", {
            currentPage: page,
            totalPages: Math.ceil(count / limit),
            totalItems: count,
            limit,
            query: req.query,
          }, (err, paginationHtml) => {
            return res.json({
              success: true,
              tableHtml,
              cardHtml: cardHtml || "",
              paginationHtml,
              totalItems: count,
            });
          });
        });
      });
    }

    res.render("admin/categories/list", {
      title: "Category Management",
      userName: req.session.userName,
      categories,
      currentPage: page,
      totalPages: Math.ceil(count / limit),
      totalItems: count,
      limit,
      query: req.query,
    });
  } catch (error) {
    console.error("Category list error:", error);
    if (req.xhr || req.query.ajax) {
      return res.status(500).json({ success: false, message: "Error loading categories" });
    }
    req.flash("error", "Error loading categories");
    res.redirect("/admin/dashboard");
  }
};

// GET /admin/categories/create - Render create category form
const getCreateCategory = (req, res) => {
  res.render("admin/categories/create", {
    title: "Add New Category",
    userName: req.session.userName,
  });
};

// POST /admin/categories - Create new category
const postCreateCategory = async (req, res) => {
  try {
    const { name, slug, description, icon } = req.body;

    if (!name || !slug) {
      req.flash("error", "Name and slug are required");
      return res.redirect("/admin/categories/create");
    }

    const existingCategory = await ServiceCategory.findOne({ where: { slug } });
    if (existingCategory) {
      req.flash("error", "Category with this slug already exists");
      return res.redirect("/admin/categories/create");
    }

    await ServiceCategory.create({
      name,
      slug: slug.toLowerCase(),
      description,
      icon,
    });

    req.flash("success", "Category created successfully");
    res.redirect("/admin/categories");
  } catch (error) {
    console.error("Create category error:", error);
    req.flash("error", "Error creating category");
    res.redirect("/admin/categories/create");
  }
};

// GET /admin/categories/:id/edit - Render edit category form
const getEditCategory = async (req, res) => {
  try {
    const category = await ServiceCategory.findByPk(req.params.id);
    if (!category) {
      req.flash("error", "Category not found");
      return res.redirect("/admin/categories");
    }

    res.render("admin/categories/edit", {
      title: "Edit Category",
      userName: req.session.userName,
      category: category.toJSON(),
    });
  } catch (error) {
    console.error("Edit category error:", error);
    req.flash("error", "Error loading category");
    res.redirect("/admin/categories");
  }
};

// POST /admin/categories/:id - Update category
const postUpdateCategory = async (req, res) => {
  try {
    const { name, slug, description, icon } = req.body;
    const categoryId = req.params.id;

    if (!name || !slug) {
      req.flash("error", "Name and slug are required");
      return res.redirect(`/admin/categories/${categoryId}/edit`);
    }

    const category = await ServiceCategory.findByPk(categoryId);
    if (!category) {
      req.flash("error", "Category not found");
      return res.redirect("/admin/categories");
    }

    // Check unique slug
    const existingCategory = await ServiceCategory.findOne({
      where: {
        slug: slug.toLowerCase(),
        id: { [require("sequelize").Op.ne]: categoryId },
      },
    });

    if (existingCategory) {
      req.flash("error", "Category with this slug already exists");
      return res.redirect(`/admin/categories/${categoryId}/edit`);
    }

    await ServiceCategory.update(
      {
        name,
        slug: slug.toLowerCase(),
        description,
        icon,
      },
      { where: { id: categoryId } },
    );

    req.flash("success", "Category updated successfully");
    res.redirect("/admin/categories");
  } catch (error) {
    console.error("Update category error:", error);
    req.flash("error", "Error updating category");
    res.redirect(`/admin/categories/${req.params.id}/edit`);
  }
};

// POST /admin/categories/:id/delete - Delete category
const deleteCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;

    // Check for associated services
    const servicesCount = await Service.count({ where: { categoryId } });
    if (servicesCount > 0) {
      req.flash("error", "Cannot delete category with associated services");
      return res.redirect("/admin/categories");
    }

    await ServiceCategory.destroy({ where: { id: categoryId } });
    req.flash("success", "Category deleted successfully");
    res.redirect("/admin/categories");
  } catch (error) {
    console.error("Delete category error:", error);
    req.flash("error", "Error deleting category");
    res.redirect("/admin/categories");
  }
};

// GET /admin/services - Render service list
const getServiceList = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 12;
    const offset = (page - 1) * limit;
    const { search, categoryId } = req.query;

    const where = {};
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { slug: { [Op.like]: `%${search}%` } },
      ];
    }
    if (categoryId) {
      where.categoryId = categoryId;
    }

    const { count, rows: services } = await Service.findAndCountAll({
      where,
      include: [{ model: ServiceCategory, as: "category" }],
      order: [["name", "ASC"]],
      limit,
      offset,
    });

    const categories = await ServiceCategory.findAll({ order: [["name", "ASC"]] });

    if (req.xhr || req.query.ajax) {
      return res.render("admin/services/_table_rows", { services }, (err, tableHtml) => {
        res.render("admin/services/_cards", { services }, (err, cardHtml) => {
          res.render("admin/services/_pagination", {
            currentPage: page,
            totalPages: Math.ceil(count / limit),
            totalItems: count,
            limit,
          }, (err, paginationHtml) => {
            return res.json({
              success: true,
              tableHtml,
              cardHtml: cardHtml || "",
              paginationHtml,
              totalItems: count,
            });
          });
        });
      });
    }

    res.render("admin/services/list", {
      title: "Service Management",
      userName: req.session.userName,
      services,
      categories,
      currentPage: page,
      totalPages: Math.ceil(count / limit),
      totalItems: count,
      limit,
      query: req.query,
    });
  } catch (error) {
    console.error("Service list error:", error);
    if (req.xhr || req.query.ajax) {
      return res.status(500).json({ success: false, message: "Error loading services" });
    }
    req.flash("error", "Error loading services");
    res.redirect("/admin/dashboard");
  }
};

// GET /admin/services/create - Render create service form
const getCreateService = async (req, res) => {
  try {
    const categories = await ServiceCategory.findAll({
      order: [["name", "ASC"]],
    });
    res.render("admin/services/create", {
      title: "Add New Service",
      userName: req.session.userName,
      categories: categories.map((c) => c.toJSON()),
    });
  } catch (error) {
    console.error("Create service view error:", error);
    req.flash("error", "Error loading create service view");
    res.redirect("/admin/services");
  }
};

// POST /admin/services - Create new service
const postCreateService = async (req, res) => {
  try {
    const {
      name,
      slug,
      categoryId,
      shortDescription,
      longDescription,
      icon,
      basePrice,
      status,
      whyChooseUs,
    } = req.body;

    if (!name || !slug) {
      req.flash("error", "Name and slug are required");
      return res.redirect("/admin/services/create");
    }

    const whyChooseUsArray = whyChooseUs
      ? whyChooseUs
        .split("\n")
        .map((item) => item.trim())
        .filter((item) => item.length > 0)
      : [];

    const existingService = await Service.findOne({ where: { slug } });
    if (existingService) {
      req.flash("error", "Service with this slug already exists");
      return res.redirect("/admin/services/create");
    }

    let featuredImageUrl = req.body.featuredImageUrl;
    if (req.file) {
      featuredImageUrl = `/uploads/services/${req.file.filename}`;
    }

    await Service.create({
      name,
      slug: slug.toLowerCase(),
      categoryId: categoryId || null,
      shortDescription,
      longDescription,
      icon,
      basePrice: basePrice || null,
      status: status || "draft",
      featuredImageUrl,
      whyChooseUs: whyChooseUsArray,
    });

    req.flash("success", "Service created successfully");
    res.redirect("/admin/services");
  } catch (error) {
    console.error("Create service error:", error);
    req.flash("error", "Error creating service");
    res.redirect("/admin/services/create");
  }
};

// GET /admin/services/:id/edit - Render edit service form
const getEditService = async (req, res) => {
  try {
    const service = await Service.findByPk(req.params.id);
    const categories = await ServiceCategory.findAll({
      order: [["name", "ASC"]],
    });

    if (!service) {
      req.flash("error", "Service not found");
      return res.redirect("/admin/services");
    }

    res.render("admin/services/edit", {
      title: "Edit Service",
      userName: req.session.userName,
      service: service.toJSON(),
      categories: categories.map((c) => c.toJSON()),
    });
  } catch (error) {
    console.error("Edit service error:", error);
    req.flash("error", "Error loading service");
    res.redirect("/admin/services");
  }
};

// POST /admin/services/:id - Update service
const postUpdateService = async (req, res) => {
  try {
    const {
      name,
      slug,
      categoryId,
      shortDescription,
      longDescription,
      icon,
      basePrice,
      status,
      whyChooseUs,
    } = req.body;
    const serviceId = req.params.id;

    if (!name || !slug) {
      req.flash("error", "Name and slug are required");
      return res.redirect(`/admin/services/${serviceId}/edit`);
    }

    const whyChooseUsArray = whyChooseUs
      ? whyChooseUs
        .split("\n")
        .map((item) => item.trim())
        .filter((item) => item.length > 0)
      : [];

    const service = await Service.findByPk(serviceId);
    if (!service) {
      req.flash("error", "Service not found");
      return res.redirect("/admin/services");
    }

    const existingService = await Service.findOne({
      where: {
        slug: slug.toLowerCase(),
        id: { [require("sequelize").Op.ne]: serviceId },
      },
    });

    if (existingService) {
      req.flash("error", "Service with this slug already exists");
      return res.redirect(`/admin/services/${serviceId}/edit`);
    }

    let featuredImageUrl = req.body.featuredImageUrl; // Keep existing if not updating, or use hidden input value
    if (req.file) {
      featuredImageUrl = `/uploads/services/${req.file.filename}`;
      if (service.featuredImageUrl) {
        try {
          const oldImagePath = path.join(
            __dirname,
            "../../public",
            service.featuredImageUrl,
          );
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        } catch (err) {
          console.error("Error deleting old image:", err);
        }
      }
    } else if (!featuredImageUrl && service.featuredImageUrl) {
      featuredImageUrl = service.featuredImageUrl;
    }

    await Service.update(
      {
        name,
        slug: slug.toLowerCase(),
        categoryId: categoryId || null,
        shortDescription,
        longDescription,
        icon,
        basePrice: basePrice || null,
        status: status || "draft",
        featuredImageUrl,
        whyChooseUs: whyChooseUsArray,
      },
      { where: { id: serviceId } },
    );

    req.flash("success", "Service updated successfully");
    res.redirect("/admin/services");
  } catch (error) {
    console.error("Update service error:", error);
    req.flash("error", "Error updating service");
    res.redirect(`/admin/services/${req.params.id}/edit`);
  }
};

// POST /admin/services/:id/delete - Delete service
const deleteService = async (req, res) => {
  try {
    const serviceId = req.params.id;
    const service = await Service.findByPk(serviceId);
    if (!service) {
      req.flash("error", "Service not found");
      return res.redirect("/admin/services");
    }
    await Service.destroy({ where: { id: serviceId } });

    req.flash("success", "Service deleted successfully");
    res.redirect("/admin/services");
  } catch (error) {
    console.error("Delete service error:", error);
    req.flash("error", "Error deleting service");
    res.redirect("/admin/services");
  }
};

// Gallery management routes
const getGalleryList = async (req, res) => {
  try {
    const { location, category, search } = req.query;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = 12;
    const offset = (page - 1) * limit;

    const { Op } = require("sequelize");
    const where = {};
    if (location) where.location = location;
    if (category) where.category = category;
    if (search) where.title = { [Op.like]: `%${search}%` };

    let viewMode = "folders";
    let items = [];
    let breadcrumbs = [{ name: "Gallery", url: "/admin/gallery" }];
    let count = 0;

    if (location && category) {
      // Level 3: Images
      viewMode = "images";
      const { count: imgCount, rows } = await Gallery.findAndCountAll({
        where: { location, category },
        order: [["createdAt", "DESC"]],
        limit,
        offset,
      });
      items = rows;
      count = imgCount;
      breadcrumbs.push({
        name: location,
        url: `/admin/gallery?location=${encodeURIComponent(location)}`,
      });
      breadcrumbs.push({ name: category, url: "#" });
    } else if (location) {
      // Level 2: Categories (Subfolders)
      viewMode = "subfolders";
      const categories = await Gallery.findAll({
        attributes: [
          "category",
          [sequelize.fn("COUNT", sequelize.col("id")), "count"],
        ],
        where: { location },
        group: ["category"],
        raw: true,
      });
      items = categories.map((c) => ({
        name: c.category || "Uncategorized",
        count: parseInt(c.count),
        url: `/admin/gallery?location=${encodeURIComponent(
          location,
        )}&category=${encodeURIComponent(c.category || "Uncategorized")}`,
      }));
      breadcrumbs.push({ name: location, url: "#" });
    } else {
      // Level 1: Locations (Folders)
      viewMode = "folders";
      const locations = await Gallery.findAll({
        attributes: [
          "location",
          [sequelize.fn("COUNT", sequelize.col("id")), "count"],
        ],
        group: ["location"],
        raw: true,
      });
      items = locations.map((l) => ({
        name: l.location || "Unknown",
        count: parseInt(l.count),
        url: `/admin/gallery?location=${encodeURIComponent(
          l.location || "Unknown",
        )}`,
      }));
      totalItems = items.length; // Count of locations
    }

    if (req.xhr || req.query.ajax) {
      return res.render("admin/gallery/_items", { items, viewMode, location: location || "", category: category || "" }, (err, itemsHtml) => {
        res.render("admin/gallery/_pagination", {
          currentPage: page, totalPages: Math.ceil(totalItems / limit), totalItems, limit, location: location || "", category: category || "", query: req.query
        }, (err, paginationHtml) => {
          return res.json({
            success: true,
            cardHtml: itemsHtml,
            paginationHtml,
            totalItems: totalItems
          });
        });
      });
    }

    res.render("admin/gallery/index", {
      title: "Gallery Management",
      userName: req.session.userName,
      items,
      viewMode,
      breadcrumbs,
      location: location || "",
      category: category || "",
      currentPage: page,
      totalPages: Math.ceil(totalItems / limit),
      totalItems: totalItems,
      limit: limit,
      query: req.query,
    });
  } catch (error) {
    console.error("Gallery list error:", error);
    req.flash("error", "Error loading gallery list");
    res.redirect("/admin/dashboard");
  }
};

const getCreateGallery = async (req, res) => {
  const categories = await ServiceCategory.findAll({
    order: [["name", "ASC"]],
  });
  res.render("admin/gallery/create", {
    title: "Add New Gallery Image",
    userName: req.session.userName,
    categories: categories.map((c) => c.toJSON()),
  });
};

const postCreateGallery = async (req, res) => {
  try {
    const { title, category, location } = req.body;

    if (!req.file) {
      req.flash("error", "Image is required");
      return res.redirect("/admin/gallery/create");
    }

    const imageUrl = `/uploads/gallery/${req.file.filename}`;

    await Gallery.create({
      title,
      category,
      imageUrl,
      location,
    });

    req.flash("success", "Image added to gallery successfully");
    res.redirect("/admin/gallery");
  } catch (error) {
    console.error("Create gallery error:", error);
    req.flash("error", "Error adding image to gallery");
    res.redirect("/admin/gallery/create");
  }
};

const deleteGallery = async (req, res) => {
  try {
    const galleryId = req.params.id;
    const gallery = await Gallery.findByPk(galleryId);

    if (!gallery) {
      req.flash("error", "Image not found");
      return res.redirect("/admin/gallery");
    }

    // Delete file from filesystem
    try {
      const filePath = path.join(__dirname, "../../public", gallery.imageUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (err) {
      console.error("Error deleting gallery file:", err);
    }

    await Gallery.destroy({ where: { id: galleryId } });

    req.flash("success", "Image deleted from gallery");
    res.redirect("/admin/gallery");
  } catch (error) {
    console.error("Delete gallery error:", error);
    req.flash("error", "Error deleting image");
    res.redirect("/admin/gallery");
  }
};

// Job management routes
const getJobList = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = 12;
    const offset = (page - 1) * limit;
    const { search, status } = req.query;

    const where = {};
    if (status) {
      where.status = status;
    }

    const jobWhere = { ...where };
    if (search) {
      const parsedDate = moment(search, ["DD/MM/YYYY", "D/M/YYYY"], true);

      if (parsedDate.isValid()) {
        jobWhere.scheduled_date = {
          [Op.between]: [
            parsedDate.startOf("day").toDate(),
            parsedDate.endOf("day").toDate(),
          ],
        };
      } else {
        jobWhere[Op.or] = [
          { id: { [Op.like]: `%${search}%` } },
          { '$lead.name$': { [Op.like]: `%${search}%` } },
          { '$lead.email$': { [Op.like]: `%${search}%` } },
          { '$employee.name$': { [Op.like]: `%${search}%` } },
        ];
      }
    }

    const { count, rows } = await Job.findAndCountAll({
      where: jobWhere,
      include: [
        {
          model: Lead,
          as: "lead",
          attributes: ["id", "name", "email", "phone", "address"],
        },
        {
          model: User,
          as: "employee",
          attributes: ["id", "name", "email", "phone"],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit,
      offset,
      distinct: true,
    });

    if (req.xhr || req.query.ajax) {
      return res.render("admin/jobs/_table_rows", { jobs: rows }, (err, tableHtml) => {
        res.render("admin/jobs/_cards", { jobs: rows }, (err, cardHtml) => {
          res.render("admin/jobs/_pagination", {
            currentPage: page,
            totalPages: Math.ceil(count / limit),
            totalItems: count,
            limit,
            query: req.query
          }, (err, paginationHtml) => {
            return res.json({
              success: true,
              tableHtml,
              cardHtml: cardHtml || "",
              paginationHtml,
              totalItems: count,
            });
          });
        });
      });
    }

    res.render("admin/jobs/index", {
      title: "Job Management",
      userName: req.session.userName,
      jobs: rows,
      currentPage: page,
      totalPages: Math.ceil(count / limit),
      totalItems: count,
      limit,
      query: req.query,
    });
  } catch (error) {
    console.error("Get job list error:", error);
    if (req.xhr || req.query.ajax) {
      return res.status(500).json({ success: false, message: "Error loading job list" });
    }
    req.flash("error", "Error loading job list");
    res.redirect("/admin/dashboard");
  }
};

const getJobDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const job = await Job.findByPk(id, {
      include: [
        {
          model: Lead,
          as: "lead",
          include: [{ model: Service, as: "service" }],
        },
        {
          model: User,
          as: "employee",
        },
        {
          model: User,
          as: "assignedBy",
          attributes: ["id", "name"],
        },
        {
          model: JobLog,
          as: "logs",
          include: [{ model: User, as: "user", attributes: ["name"] }],
        },
      ],
      order: [[{ model: JobLog, as: "logs" }, "createdAt", "DESC"]],
    });

    if (!job) {
      req.flash("error", "Job not found");
      return res.redirect("/admin/jobs");
    }

    res.render("admin/jobs/view", {
      title: `Job #${job.id} Details`,
      userName: req.session.userName,
      job,
    });
  } catch (error) {
    console.error("Get job detail error:", error);
    req.flash("error", "Error loading job details");
    res.redirect("/admin/jobs");
  }
};

const deleteJob = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;

    const job = await Job.findByPk(id, { transaction });

    if (!job) {
      await transaction.rollback();
      req.flash("error", "Job not found");
      return res.redirect("/admin/jobs");
    }

    // 1️⃣ Delete deepest children first
    await JobWorkSession.destroy({
      where: { job_id: id },
      transaction,
    });

    // 2️⃣ Delete job logs
    await JobLog.destroy({
      where: { job_id: id },
      transaction,
    });

    // 3️⃣ Delete job
    await job.destroy({ transaction });

    await transaction.commit();

    req.flash("success", "Job deleted successfully");
    res.redirect("/admin/jobs");
  } catch (error) {
    await transaction.rollback();
    console.error("Delete job error:", error);
    req.flash("error", "Error deleting job");
    res.redirect("/admin/jobs");
  }
};

module.exports = {
  getLogin,
  postLogin,
  getDashboard,
  getLogout,
  getUserList,
  getLeadList,
  getCreateLead,
  postCreateLead,
  getEditLead,
  postUpdateLead,
  deleteLead,
  deleteAllLeads,
  getCreateUser,
  postCreateUser,
  getEditUser,
  postUpdateUser,
  deleteUser,
  deleteAllUsers,
  getSeoList,
  getCreateSeo,
  postCreateSeo,
  getEditSeo,
  postUpdateSeo,
  deleteSeo,
  getCategoryList,
  getCreateCategory,
  postCreateCategory,
  getEditCategory,
  postUpdateCategory,
  deleteCategory,
  getServiceList,
  getCreateService,
  postCreateService,
  getEditService,
  postUpdateService,
  deleteService,
  getGalleryList,
  getCreateGallery,
  postCreateGallery,
  deleteGallery,
  getLeadDetail,
  approveLead,
  getJobList,
  getJobDetail,
  deleteJob,
};
