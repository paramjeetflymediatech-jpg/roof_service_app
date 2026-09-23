import axios from "axios";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb",
    },
  },
};

export default async function handler(req, res) {
  // CORS Headers for OpenAI Custom GPT Actions
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-API-KEY");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const { path, ...queryParams } = req.query;
  const pathSegments = Array.isArray(path) ? path.join("/") : path || "";

  const backendBaseUrl = process.env.BACKEND_INTERNAL_URL || process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001";
  const targetUrl = `${backendBaseUrl}/api/ai-gateway/${pathSegments}`;

  try {
    const headers = {
      "Content-Type": req.headers["content-type"] || "application/json",
      ...(req.headers["authorization"] && { Authorization: req.headers["authorization"] }),
      ...(req.headers["x-api-key"] && { "X-API-KEY": req.headers["x-api-key"] }),
    };

    const response = await axios({
      method: req.method,
      url: targetUrl,
      params: queryParams,
      data: ["POST", "PATCH", "PUT"].includes(req.method) ? req.body : undefined,
      headers,
      validateStatus: () => true, // Pass through status codes
    });

    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error("AI Gateway Proxy Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "AI Gateway Proxy Error: " + error.message,
    });
  }
}
