import apiClient from '../apiClient';

export const getBlogs = async (params = {}) => {
    try {
        const response = await apiClient.get('/blogs', { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching blogs:', error);
        return { success: false, data: [] };
    }
};

export const getBlogBySlug = async (slug) => {
    try {
        const response = await apiClient.get(`/blogs/${slug}`);
        return response.data;
    } catch (error) {
        if (error.response?.status === 404) {
            return { success: false, data: null };
        }
        console.error(`Error fetching blog detail for "${slug}":`, error?.message || error);
        return { success: false, data: null };
    }
};
