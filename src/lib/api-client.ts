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
                        // Only use secure flag in production (HTTPS), not in development (HTTP localhost)
                        const isProduction = typeof window !== 'undefined' && process.env.NODE_ENV === 'production' && window.location.protocol === 'https:';
                        Cookies.set('accessToken', accessToken, { secure: isProduction, sameSite: 'strict' });
                        Cookies.set('refreshToken', newRefreshToken, { secure: isProduction, sameSite: 'strict' });

                        // Retry original request with new token
                        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                        return apiClient(originalRequest);
                    }
                } catch (refreshError) {
                    // Token refresh failed, clear tokens and redirect to login
                    console.error('Token refresh failed:', refreshError);
                    Cookies.remove('accessToken');
                    Cookies.remove('refreshToken');
                    // Clear auth store if available
                    if (typeof window !== 'undefined') {
                        // Redirect to login with a message about session expiration
                        const currentPath = window.location.pathname;
                        if (!currentPath.includes('/auth/login')) {
                            window.location.href = '/auth/login?expired=true';
                        }
                    }
                    return Promise.reject(refreshError);
                }
            } else {
                // No refresh token available - token expired
                console.warn('No refresh token available, redirecting to login');
                Cookies.remove('accessToken');
                Cookies.remove('refreshToken');
                // Redirect to login only if not already there to avoid loops
                if (typeof window !== 'undefined') {
                    const currentPath = window.location.pathname;
                    if (!currentPath.includes('/auth/login') && !currentPath.includes('/auth/register')) {
                        window.location.href = '/auth/login?expired=true';
                    }
                }
            }
        }
        return Promise.reject(error);
    }
);

export default apiClient;
