import apiClient from "../apiClient";

export const submitLead = async (data) => {
  try {
    const config = {};
    if (data instanceof FormData) {
      config.headers = { "Content-Type": "multipart/form-data" };
    }
    const response = await apiClient.post("/leads", data, config);
    return response.data;
  } catch (error) {
    console.error("Error submitting lead:", error);
    throw error;
  }
};
