import apiClient from '@/lib/api-client';
import { User } from './auth.service';

export interface UpdateUserDto {
    firstName?: string;
    lastName?: string;
    phone?: string;
}

export const userService = {
    updateProfile: async (data: UpdateUserDto, userId: string) => {
        const response = await apiClient.patch<User>(`/users/${userId}`, data);
        return response.data;
    },

    changePassword: async (data: { currentPassword?: string; newPassword?: string }) => {
        const response = await apiClient.put('/users/me/password', data);
        return response.data;
    }
};
