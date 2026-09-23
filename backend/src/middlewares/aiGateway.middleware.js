/**
 * AI Gateway Authentication & Security Middleware
 * Verifies Bearer Token or X-API-KEY header against configured AI_GATEWAY_SECRET_KEY
 */

const verifyAiGatewayAuth = (req, res, next) => {
  const secretKey = process.env.AI_GATEWAY_SECRET_KEY || "roof_service_ai_gateway_secret_2026";

  const authHeader = req.headers["authorization"] || "";
  const apiKeyHeader = req.headers["x-api-key"] || "";

  let providedKey = "";

  if (authHeader.startsWith("Bearer ")) {
    providedKey = authHeader.slice(7).trim();
  } else if (authHeader) {
    providedKey = authHeader.trim();
  } else if (apiKeyHeader) {
    providedKey = apiKeyHeader.trim();
  }

  if (!providedKey || providedKey !== secretKey) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: Invalid or missing AI Gateway API Key / Bearer Token",
    });
  }

  next();
};

module.exports = {
  verifyAiGatewayAuth,
};
