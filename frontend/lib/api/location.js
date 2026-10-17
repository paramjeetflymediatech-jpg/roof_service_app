import apiClient from "../apiClient";

export const getLocations = async (params = {}) => {
  try {
    const response = await apiClient.get("/locations", { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching locations:", error);
    return { success: false, items: [], total: 0 };
  }
};

export const getLocationBySlug = async (slug) => {
  try {
    const response = await apiClient.get(`/locations/slug/${slug}`);
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      return null;
    }
    console.error(`Error fetching location detail for "${slug}":`, error?.message || error);
    return null;
  }
};
