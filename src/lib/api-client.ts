import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    paramsSerializer: {
        indexes: null, // serializes query arrays as categoryIds=val instead of categoryIds[]=val
    },
});

// Request interceptor for API calls
apiClient.interceptors.request.use(
    (config) => {
        const token = Cookies.get('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Add location headers if available (Client-side only)
        if (typeof window !== 'undefined') {
            try {
                const cachedLocation = localStorage.getItem('user_location_cache');
                if (cachedLocation) {
                    const parsed = JSON.parse(cachedLocation);
                    if (parsed.latitude) config.headers['X-User-Latitude'] = parsed.latitude.toString();
                    if (parsed.longitude) config.headers['X-User-Longitude'] = parsed.longitude.toString();
                    if (parsed.city) config.headers['X-User-City'] = parsed.city;
                    if (parsed.state) config.headers['X-User-State'] = parsed.state;
                    config.headers['X-User-Max-Distance'] = '15'; // Default distance
                }
            } catch (e) {
                // Ignore silent errors for location headers
            }
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
                        localStorage.removeItem('auth-storage');
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
                    localStorage.removeItem('auth-storage');
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
