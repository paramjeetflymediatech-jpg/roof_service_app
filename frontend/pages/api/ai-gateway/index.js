import axios from "axios";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-API-KEY");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const backendBaseUrl = process.env.BACKEND_INTERNAL_URL || process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001";
  const targetUrl = `${backendBaseUrl}/api/ai-gateway`;

  try {
    const response = await axios.get(targetUrl, {
      validateStatus: () => true,
    });
    return res.status(response.status).json(response.data);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "AI Gateway Proxy Error: " + error.message,
    });
  }
}
