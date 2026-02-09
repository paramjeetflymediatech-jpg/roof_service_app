import apiClient from "../apiClient";

export const getServices = async (params = {}) => {
  try {
    const response = await apiClient.get("/services", { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching services:", error);
    return { success: false, items: [] };
  }
};

export const getServiceBySlug = async (slug) => {
  try {
    const response = await apiClient.get(`/services/slug/${slug}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching service detail:", error);
    return { success: false, data: null };
  }
};
