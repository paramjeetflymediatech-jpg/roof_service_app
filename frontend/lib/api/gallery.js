import apiClient from "../apiClient";

export const getGalleryItems = async () => {
  try {
    const response = await apiClient.get("/gallery");
    return response.data;
  } catch (error) {
    console.error("Error fetching gallery items:", error);
    return [];
  }
};

export const createGalleryItem = async (formData) => {
  try {
    const response = await apiClient.post("/gallery", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error creating gallery item:", error);
    throw error;
  }
};

export const deleteGalleryItem = async (id) => {
  try {
    const response = await apiClient.delete(`/gallery/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting gallery item:", error);
    throw error;
  }
};
