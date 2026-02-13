const { DataDeletionRequest, User, Lead, Job, JobLog } = require("../models");

// GET /admin/deletion-requests - List all deletion requests
exports.getDeletionRequestList = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;

    const totalRequests = await DataDeletionRequest.count();
    const requests = await DataDeletionRequest.findAll({
      order: [["requestedAt", "DESC"]],
      limit,
      offset,
      raw: true,
    });

    const totalPages = Math.ceil(totalRequests / limit);

    res.render("admin/deletion_requests/list", {
      title: "Data Deletion Requests",
      userName: req.session.userName,
      requests,
      currentPage: page,
      totalPages,
      totalRequests,
    });
  } catch (error) {
    console.error("Deletion requests list error:", error);
    req.flash("error", "Error loading deletion requests");
    res.redirect("/admin/dashboard");
  }
};

// GET /admin/deletion-requests/:id - View request details
exports.getRequestDetail = async (req, res) => {
  try {
    const requestId = req.params.id;
    const request = await DataDeletionRequest.findByPk(requestId);

    if (!request) {
      req.flash("error", "Request not found");
      return res.redirect("/admin/deletion-requests");
    }

    // Find user by email
    const user = await User.findOne({
      where: { email: request.email },
      attributes: { exclude: ["password"] },
    });

    let userStats = null;
    if (user) {
      // Get user statistics
      const leadCount = await Lead.count({ where: { userId: user.id } });
      const jobCount = await Job.count({ where: { employeeId: user.id } });
      const assignedJobCount = await Job.count({
        where: { assignedById: user.id },
      });

      userStats = {
        leadCount,
        jobCount,
        assignedJobCount,
        totalJobs: jobCount + assignedJobCount,
      };
    }

    res.render("admin/deletion_requests/detail", {
      title: "Deletion Request Details",
      userName: req.session.userName,
      request: request.dataValues || request,
      user: user ? user.dataValues || user : null,
      userStats,
    });
  } catch (error) {
    console.error("Request detail error:", error);
    req.flash("error", "Error loading request details");
    res.redirect("/admin/deletion-requests");
  }
};

// POST /admin/deletion-requests/:id/approve - Approve and process deletion
exports.approveDeletionRequest = async (req, res) => {
  try {
    const requestId = req.params.id;
    const request = await DataDeletionRequest.findByPk(requestId);

    if (!request) {
      req.flash("error", "Request not found");
      return res.redirect("/admin/deletion-requests");
    }

    if (request.status !== "pending") {
      req.flash("error", "Request has already been processed");
      return res.redirect("/admin/deletion-requests");
    }

    // Find user by email
    const user = await User.findOne({ where: { email: request.email } });

    if (!user) {
      // User not found - mark as completed anyway
      await DataDeletionRequest.update(
        {
          status: "completed",
          processedAt: new Date(),
          processedBy: req.session.userId,
          notes: "User account not found in system",
        },
        { where: { id: requestId } },
      );
      req.flash(
        "success",
        "Request marked as completed (user account not found)",
      );
      return res.redirect("/admin/deletion-requests");
    }

    // Delete user account using the existing controller logic
    const userController = require("./user.controller");

    // Create a mock request/response for the user controller
    try {
      await userController.deleteMyAccount(
        { user: { id: user.id } },
        {
          json: () => {},
          status: () => ({ json: () => {} }),
        },
        () => {},
      );
    } catch (err) {
      console.error("Error deleting user account:", err);
      req.flash("error", "Error deleting user account: " + err.message);
      return res.redirect(`/admin/deletion-requests/${requestId}`);
    }

    // Update request status
    await DataDeletionRequest.update(
      {
        status: "completed",
        processedAt: new Date(),
        processedBy: req.session.userId,
        notes: `User account deleted successfully. Email: ${user.email}`,
      },
      { where: { id: requestId } },
    );

    req.flash("success", "Deletion request approved and user account deleted");
    res.redirect("/admin/deletion-requests");
  } catch (error) {
    console.error("Approve deletion error:", error);
    req.flash("error", "Error processing deletion request");
    res.redirect("/admin/deletion-requests");
  }
};

// POST /admin/deletion-requests/:id/reject - Reject deletion request
exports.rejectDeletionRequest = async (req, res) => {
  try {
    const requestId = req.params.id;
    const { notes } = req.body;

    const request = await DataDeletionRequest.findByPk(requestId);

    if (!request) {
      req.flash("error", "Request not found");
      return res.redirect("/admin/deletion-requests");
    }

    if (request.status !== "pending") {
      req.flash("error", "Request has already been processed");
      return res.redirect("/admin/deletion-requests");
    }

    await DataDeletionRequest.update(
      {
        status: "rejected",
        processedAt: new Date(),
        processedBy: req.session.userId,
        notes: notes || "Rejected by administrator",
      },
      { where: { id: requestId } },
    );

    req.flash("success", "Deletion request rejected");
    res.redirect("/admin/deletion-requests");
  } catch (error) {
    console.error("Reject deletion error:", error);
    req.flash("error", "Error rejecting deletion request");
    res.redirect("/admin/deletion-requests");
  }
};
