import apiClient from '@/lib/api-client';
import Cookies from 'js-cookie';

// Types (You might want to move these to a separate types file)
export interface LoginDto {
    email: string;
    password?: string;
    mfaCode?: string;
}

export interface RegisterDto {
    email: string;
    password?: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
    role?: 'customer' | 'business' | 'admin';
}

export interface VerifyEmailDto {
    email: string;
    otp: string;
}

export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    emailVerified: boolean;
    business?: any;
    businesses?: any[];
    mfaEnabled?: boolean;
}

export interface AuthResponse {
    accessToken?: string;
    refreshToken?: string;
    user?: User;
    message?: string;
}

export const authService = {
    // Login
    login: async (data: LoginDto) => {
        // If MFA code is present, use verify-mfa endpoint, else standard login
        const endpoint = data.mfaCode ? '/auth/verify-mfa' : '/auth/login';
        const response = await apiClient.post<AuthResponse>(endpoint, data);

        // If login successful (and not just an MFA challenge intermediate step if API worked that way, 
        // but here standard login returns tokens directly)
        if (response.data.accessToken) {
            // Only use secure flag in production (HTTPS), not in development (HTTP localhost)
            const isProduction = process.env.NODE_ENV === 'production' && window.location.protocol === 'https:';
            Cookies.set('accessToken', response.data.accessToken, { 
                secure: isProduction, 
                sameSite: 'strict' 
            });
            Cookies.set('refreshToken', response.data.refreshToken!, { 
                secure: isProduction, 
                sameSite: 'strict' 
            });
        }
        return response.data;
    },

    // Register
    register: async (data: RegisterDto) => {
        const response = await apiClient.post('/auth/register', data);
        return response.data;
    },

    // Verify Email
    verifyEmail: async (data: VerifyEmailDto) => {
        const response = await apiClient.post('/auth/verify-email', data);
        return response.data;
    },

    // Resend Verification
    resendVerification: async (email: string) => {
        const response = await apiClient.post('/auth/resend-verification', { email });
        return response.data;
    },

    // Forgot Password
    forgotPassword: async (email: string) => {
        const response = await apiClient.post('/auth/forgot-password', { email });
        return response.data;
    },

    // Reset Password
    resetPassword: async (data: any) => {
        const response = await apiClient.post('/auth/reset-password', data);
        return response.data;
    },

    // Logout
    logout: async () => {
        try {
            await apiClient.post('/auth/logout');
        } catch (error) {
            console.error("Logout API call failed", error);
        } finally {
            Cookies.remove('accessToken');
            Cookies.remove('refreshToken');
        }
    },

    // Setup MFA
    setupMfa: async () => {
        const response = await apiClient.post<{ secret: string; qrCode: string; backupCodes: string[] }>('/auth/mfa/setup');
        return response.data;
    },

    // Enable MFA (Verify Setup)
    enableMfa: async (otp: string) => {
        const response = await apiClient.post('/auth/mfa/verify', { code: otp });
        return response.data;
    },

    // Verify MFA for Login
    // Note: The API requires email, password AND mfaCode.
    // This implies we need the password again, or this endpoint is a direct login replacement.
    verifyMfaLogin: async (data: Required<LoginDto>) => {
        const response = await apiClient.post<AuthResponse>('/auth/verify-mfa', {
            email: data.email,
            password: data.password,
            mfaCode: data.mfaCode
        });

        if (response.data.accessToken) {
            Cookies.set('accessToken', response.data.accessToken, { secure: true, sameSite: 'strict' });
            Cookies.set('refreshToken', response.data.refreshToken!, { secure: true, sameSite: 'strict' });
        }
        return response.data;
    },

    // Setup MFA (Unverified - Post Register)
    setupMfaUnverified: async (data: LoginDto) => {
        const response = await apiClient.post<{ secret: string; qrCode: string; backupCodes: string[] }>('/auth/mfa/setup-unverified', data);
        return response.data;
    },

    // Verify MFA (Unverified - Confirm Setup)
    verifyMfaUnverified: async (data: LoginDto & { code: string }) => {
        const response = await apiClient.post('/auth/mfa/verify-unverified', data);
        return response.data;
    },

    // Google OAuth - Initiate
    googleLogin: () => {
        // Redirect to backend Google OAuth endpoint
        window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
    },

    // Get Current User
    getCurrentUser: async () => {
        const response = await apiClient.get<User>('/users/me');
        return response.data;
    }
};
