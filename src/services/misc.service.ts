import apiClient from '@/lib/api-client';

export const miscService = {
    // POST /api/v1/newsletter/subscribe
    subscribeNewsletter: async (email: string) => {
        const response = await apiClient.post('/newsletter/subscribe', { email });
        return response.data;
    },
};
