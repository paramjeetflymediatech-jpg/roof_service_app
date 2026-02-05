import apiClient from '../apiClient';

export const getBlogs = async () => {
    try {
        const response = await apiClient.get('/blogs');
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
        console.error('Error fetching blog detail:', error);
        return { success: false, data: null };
    }
};
