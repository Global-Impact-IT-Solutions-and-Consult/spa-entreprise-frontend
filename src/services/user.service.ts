import apiClient from '@/lib/api-client';
import { User } from './auth.service';

export interface UpdateProfileDto {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
}

export const userService = {
    // PATCH /api/v1/users/me/profile
    updateProfile: async (data: UpdateProfileDto): Promise<User> => {
        const response = await apiClient.patch<User>('/users/me/profile', data);
        return response.data;
    },

    // POST /api/v1/users/me/profile-picture
    uploadProfilePicture: async (file: File): Promise<{ profilePicture: string }> => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await apiClient.post<{ profilePicture: string }>(
            '/users/me/profile-picture',
            formData,
            { headers: { 'Content-Type': 'multipart/form-data' } }
        );
        return response.data;
    },

    // PUT /api/v1/users/me/password
    changePassword: async (data: { currentPassword: string; newPassword: string }) => {
        const response = await apiClient.put('/users/me/password', data);
        return response.data;
    },
};
