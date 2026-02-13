// Controller to handle data deletion requests from web
exports.submitDataDeletionRequest = async (req, res, next) => {
  const { DataDeletionRequest } = require("../models");

  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: "Name and email are required",
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    // Create the deletion request in database
    const deletionRequest = await DataDeletionRequest.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      status: "pending",
      requestedAt: new Date(),
    });

    // Log the deletion request
    console.log("Data deletion request created:", {
      id: deletionRequest.id,
      name,
      email,
      timestamp: deletionRequest.requestedAt,
    });

    // In a production app, you would also:
    // 1. Send an email to admin/support
    // 2. Send confirmation email to the user
    // 3. Create a ticket in your support system

    res.json({
      success: true,
      message:
        "Data deletion request received. We will process your request within 30 days and send you a confirmation email.",
      requestId: deletionRequest.id,
    });
  } catch (err) {
    console.error("Error submitting data deletion request:", err);
    next(err);
  }
};
