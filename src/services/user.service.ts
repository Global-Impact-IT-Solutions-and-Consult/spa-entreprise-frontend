import apiClient from '@/lib/api-client';
import { User } from './auth.service';

export interface UpdateProfileDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  bio?: string;
}

export interface DeleteAccountDto {
  confirmationText: string;
  currentPassword?: string;
}

export interface SecuritySettings {
  mfaEnabled: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
  lastLoginAt: string | null;
  hasPassword: boolean;
}

export const userService = {
  // PATCH /api/v1/users/me/profile
  updateProfile: async (data: UpdateProfileDto): Promise<User> => {
    const response = await apiClient.patch<User>('/users/me/profile', data);
    return response.data;
  },

  // POST /api/v1/users/me/profile-picture
  uploadProfilePicture: async (
    file: File,
  ): Promise<{ profilePicture: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post<{ profilePicture: string }>(
      '/users/me/profile-picture',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return response.data;
  },

  // PUT /api/v1/users/me/password
  changePassword: async (data: {
    currentPassword: string;
    newPassword: string;
  }) => {
    const response = await apiClient.put('/users/me/password', data);
    return response.data;
  },

  // DELETE /api/v1/users/me
  deleteAccount: async (data: DeleteAccountDto): Promise<{ message: string }> => {
    const response = await apiClient.delete<{ message: string }>('/users/me', { data });
    return response.data;
  },

  // GET /api/v1/users/me/security
  getSecuritySettings: async (): Promise<SecuritySettings> => {
    const response = await apiClient.get<SecuritySettings>('/users/me/security');
    return response.data;
  },

  // PUT /api/v1/users/me/mfa
  toggleMfa: async (data: { mfaEnabled: boolean }): Promise<{ mfaEnabled: boolean, message: string }> => {
    const response = await apiClient.put<{ mfaEnabled: boolean, message: string }>('/users/me/mfa', data);
    return response.data;
  },
};
