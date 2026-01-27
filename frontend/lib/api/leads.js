import apiClient from '../apiClient';

export const submitLead = async (data) => {
    try {
        const response = await apiClient.post('/leads', data);
        return response.data;
    } catch (error) {
        console.error('Error submitting lead:', error);
        throw error;
    }
};
