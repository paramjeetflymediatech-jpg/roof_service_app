import apiClient from '../apiClient';

export const getSeoData = async (pageName) => {
    try {
        const response = await apiClient.get(`/seo/${pageName}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching SEO data:', error);
        throw error;
    }
};
