import apiClient from '@/lib/api-client';

export interface CreateSupportMessageDto {
    name: string;
    email: string;
    message: string;
}

export interface SupportMessageResponse {
    id: string;
    name: string;
    email: string;
    message: string;
    isRead: boolean;
    userId: string | null;
    createdAt: string;
    updatedAt: string;
}

export const supportService = {
    submitMessage: async (payload: CreateSupportMessageDto): Promise<SupportMessageResponse> => {
        const response = await apiClient.post<SupportMessageResponse>('/support', payload);
        return response.data;
    },
};
