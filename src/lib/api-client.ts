import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://spa-entreprise-api.onrender.com/api/v1';

const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor for API calls
apiClient.interceptors.request.use(
    (config) => {
        const token = Cookies.get('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for API calls
apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // Handle 401 response and refresh token
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            const refreshToken = Cookies.get('refreshToken');

            if (refreshToken) {
                try {
                    const response = await axios.post(`${API_URL}/auth/refresh`, {
                        refreshToken,
                    });

                    if (response.status === 200 || response.status === 201) {
                        const { accessToken, refreshToken: newRefreshToken } = response.data;
                        Cookies.set('accessToken', accessToken, { secure: true, sameSite: 'strict' });
                        Cookies.set('refreshToken', newRefreshToken, { secure: true, sameSite: 'strict' });

                        // Retry original request with new token
                        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                        return apiClient(originalRequest);
                    }
                } catch (refreshError) {
                    // Token refresh failed, redirect to login or handle logout
                    Cookies.remove('accessToken');
                    Cookies.remove('refreshToken');
                    window.location.href = '/auth/login';
                    return Promise.reject(refreshError);
                }
            } else {
                // No refresh token available
                Cookies.remove('accessToken');
                Cookies.remove('refreshToken');
                // Redirect to login only if not already there to avoid loops
                if (typeof window !== 'undefined' && !window.location.pathname.includes('/auth/login')) {
                    window.location.href = '/auth/login';
                }
            }
        }
        return Promise.reject(error);
    }
);

export default apiClient;
