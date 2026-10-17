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
export const getAllLocationServices = async () => {
  try {
    const response = await apiClient.get("/services/all-location-services");
    return response.data;
  } catch (error) {
    console.error("Error fetching services:", error?.message || error);
    return { success: false, items: [] };
  }
};

export const getServiceBySlug = async (slug, params = {}) => {
  try {
    const response = await apiClient.get(`/services/slug/${slug}`, { params });
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      return null;
    }
    console.error(`Error fetching service detail for slug "${slug}":`, error?.message || error);
    return null;
  }
};
