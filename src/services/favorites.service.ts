import apiClient from '@/lib/api-client';

export interface FavoriteResponse {
    message?: string;
}

export interface FavoriteCheckResponse {
    isFavorite: boolean;
}

export const favoritesService = {
    /**
     * Add a business or service to favorites
     */
    addFavorite: async (data: { businessId?: string; serviceId?: string }): Promise<FavoriteResponse> => {
        const response = await apiClient.post<FavoriteResponse>('/favorites', data);
        return response.data;
    },

    /**
     * Remove a business from favorites
     */
    removeBusinessFavorite: async (businessId: string): Promise<FavoriteResponse> => {
        const response = await apiClient.delete<FavoriteResponse>(`/favorites/${businessId}`);
        return response.data;
    },

    /**
     * Check if a business is in favorites
     */
    checkBusinessFavorite: async (businessId: string): Promise<boolean> => {
        try {
            const response = await apiClient.get<FavoriteCheckResponse | boolean>(`/favorites/${businessId}/check`);
            // Handle both object { isFavorite: true } and boolean responses just in case
            if (typeof response.data === 'boolean') {
                return response.data;
            }
            return response.data.isFavorite === true;
        } catch (error) {
            console.error('Error checking business favorite status:', error);
            return false;
        }
    },

    /**
     * Remove a service from favorites
     */
    removeServiceFavorite: async (serviceId: string): Promise<FavoriteResponse> => {
        const response = await apiClient.delete<FavoriteResponse>(`/favorites/service/${serviceId}`);
        return response.data;
    },

    /**
     * Check if a service is in favorites
     */
    checkServiceFavorite: async (serviceId: string): Promise<boolean> => {
        try {
            const response = await apiClient.get<FavoriteCheckResponse | boolean>(`/favorites/check/service/${serviceId}`);
            if (typeof response.data === 'boolean') {
                return response.data;
            }
            return response.data.isFavorite === true;
        } catch (error) {
            console.error('Error checking service favorite status:', error);
            return false;
        }
    },

    /**
     * Get all user favorites (businesses and services)
     */
    getUserFavorites: async () => {
        const response = await apiClient.get('/favorites');
        return response.data;
    }
};
