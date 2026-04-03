const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET || "roof-service-jwt-secret-123";

// JWT auth for API routes (expects Authorization: Bearer <token>)
const jwtAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ success: false, message: "No token provided" });
    }
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.id) {
      const user = await User.findByPk(decoded.id);
      if (!user) {
        return res
          .status(401)
          .json({ success: false, message: "User not found" });
      }
    }

    req.user = decoded;
    
    // Attach full user object for status checking if needed
    if (!req.fullUser) {
      req.fullUser = await User.findByPk(decoded.id);
    }
    
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, message: "Token expired" });
    }
    console.error("Auth middleware error (JWT):", error);
    res.status(401).json({ success: false, message: "Invalid token" });
  }
};

// Session-based auth for admin panel (uses req.session)
const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.userId) {
    req.user = {
      id: req.session.userId,
      role: req.session.userRole,
      name: req.session.userName,
    };
    return next();
  }

  // For admin pages, redirect to login with flash message
  if (req.originalUrl && req.originalUrl.startsWith("/admin")) {
    if (req.flash) {
      req.flash("error", "Please log in to continue");
    }
    return res.redirect("/admin/login");
  }

  // Fallback JSON response for API-style calls
  return res.status(401).json({ success: false, message: "Not authenticated" });
};

// Check if user is admin (from session or JWT)
const isAdmin = (req, res, next) => {
  const role =
    (req.session && req.session.userRole) || (req.user && req.user.role);

  if (role === "admin") {
    return next();
  }

  console.log(`[AUTH] Access denied for user role: ${role || "none"} on ${req.originalUrl}`);

  if (req.originalUrl && req.originalUrl.startsWith("/admin")) {
    if (req.flash) {
      req.flash("error", "Access denied. Admin only.");
    }
    return res.redirect("/admin/login");
  }

  return res
    .status(403)
    .json({ 
      success: false, 
      message: "Access denied. Admin only.",
      debug: { role, path: req.originalUrl }
    });
};

// Check if user is employee or admin
const isEmployeeOrAdmin = (req, res, next) => {
  const role =
    (req.session && req.session.userRole) || (req.user && req.user.role);

  if (role === "employee" || role === "admin") {
    return next();
  }

  return res.status(403).json({ success: false, message: "Access denied." });
};

// Check for restricted account status (pending_deletion)
const checkAccountStatus = async (req, res, next) => {
  const userId = req.user?.id;
  if (!userId) return next();

  const user = req.fullUser || (await User.findByPk(userId));
  
  if (user && user.status === "pending_deletion") {
    const currentUrl = req.originalUrl.split('?')[0].replace(/\/$/, "");
    
    // Explicitly allow auth routes for registration and login
    if (currentUrl.includes("/auth/")) {
      return next();
    }

    // List of allowed paths even for pending_deletion status
    const allowedPaths = [
      "/users/me",
      "/users/me/cancel-deletion",
      "/users/me/profile-picture",
      "/auth/logout",
      "/auth/me"
    ];
    
    const isAllowed = allowedPaths.some(path => currentUrl.endsWith(path));
    
    if (!isAllowed) {
      console.log(`[AUTH] Blocking user ${userId} (status: ${user.status}) on ${currentUrl}`);
      return res.status(403).json({
        success: false,
        message: "Your account is scheduled for deletion. Please cancel the request to restore full access.",
        isPendingDeletion: true,
        debug: { path: currentUrl, status: user.status }
      });
    }
  }
  
  next();
};

// Export both styles of auth
module.exports = {
  auth: jwtAuth, // backward-compatible name
  jwtAuth,
  isAuthenticated,
  isAdmin,
  isEmployeeOrAdmin,
  checkAccountStatus,
};
