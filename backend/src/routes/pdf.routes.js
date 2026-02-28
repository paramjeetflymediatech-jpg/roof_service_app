const express = require("express");
const router = express.Router();
const pdfController = require("../controllers/pdf.controller");
const jwt = require("jsonwebtoken");

// Middleware that accepts token from header OR ?token= query param
const pdfAuth = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token =
            (authHeader && authHeader.startsWith("Bearer ")
                ? authHeader.slice(7)
                : null) || req.query.token;
        if (!token) return res.status(401).json({ message: "Unauthorized" });
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "roof-service-jwt-secret-123");
        req.user = decoded;
        next();
    } catch (e) {
        return res.status(401).json({ message: "Invalid token" });
    }
};

// GET /api/estimates/:id/pdf?token=<jwt>
router.get("/estimates/:id/pdf", pdfAuth, pdfController.getEstimatePDF);

// GET /api/invoices/:id/pdf?token=<jwt>
router.get("/invoices/:id/pdf", pdfAuth, pdfController.getInvoicePDF);

module.exports = router;
