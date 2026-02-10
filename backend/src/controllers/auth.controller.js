const jwt = require("jsonwebtoken");
const User = require("../models/User");
const {
  sendAssignmentEmail,
  sendPasswordResetEmail,
} = require("../../services/emailService");
const crypto = require("crypto");

const JWT_SECRET = process.env.JWT_SECRET || "roof-service-jwt-secret-123";

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email and password are required" });
    }

    // For demo purposes, create user if not exists
    let user = await User.findOne({ where: { email: email } });

    if (!user) {
      // Create demo user based on email
      return res
        .status(404)
        .json({ success: false, message: "User Not Found" });
    }
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res
        .status(404)
        .json({ success: false, message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" },
    );

    return res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
        },
        token,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ success: false, message: "Login failed" });
  }
};

// Register user
exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, address, role = "client" } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ where: { email: email } });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      phone,
      password,
      role,
    });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
        },
        token,
      },
    });
  } catch (error) {
    console.error("Registration error:", error.errors[0].message);
    res.status(500).json({
      success: false,
      message:
        error.errors[0].message || error.message || "Registration failed",
    });
  }
};

// Get current authenticated user (based on JWT)
exports.getMe = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res
        .status(401)
        .json({ success: false, message: "Not authenticated" });
    }

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    delete user.password;
    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Get me error:", error);
    res.status(500).json({ success: false, message: "Failed to get user" });
  }
};

// Logout (for mobile, mainly client-side)
exports.logout = async (req, res) => {
  res.json({ success: true, message: "Logged out successfully" });
};

// Forgot Password
exports.forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ where: { email: req.body.email } });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Email not found" });
    }

    // Generate 6-digit OTP
    const resetToken = Math.floor(100000 + Math.random() * 900000).toString();

    // Set token and expiry (10 minutes)
    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    await user.save();

    try {
      await sendPasswordResetEmail(user, resetToken);

      res.status(200).json({
        success: true,
        message: "Email sent with reset code",
      });
    } catch (err) {
      user.resetPasswordToken = null;
      user.resetPasswordExpire = null;
      await user.save();

      return res.status(500).json({
        success: false,
        message: "Email could not be sent",
      });
    }
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Reset Password
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, password } = req.body;

    // Hash the OTP to compare
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(otp.toString())
      .digest("hex");

    const user = await User.findOne({
      where: {
        email: email,
        resetPasswordToken: resetPasswordToken,
        resetPasswordExpire: { [require("sequelize").Op.gt]: Date.now() },
      },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    // Update password
    user.password = password; // Will be hashed by beforeSave hook
    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;

    // Explicitly update changed fields if necessary, but saving should trigger hook
    // However, since we are using Sequelize model instance, updating property sets it as changed.
    // Wait, we need to make sure the hook runs.
    // User.update vs user.save()
    // user.save() runs hooks.

    await user.save();

    // Provide a token for immediate logic if needed, or just success
    res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
