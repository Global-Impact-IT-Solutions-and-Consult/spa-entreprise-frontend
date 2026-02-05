import apiClient from '@/lib/api-client';

export interface RegisterBusinessDto {
    businessName: string;
    email: string;
    phone: string;
    city: string;
    address: string;
    businessTypeCode: string;
    description: string;
}

export interface UpdateProfileDto {
    description?: string;
    address?: string;
    amenities?: string[];
    operatingHours?: any; // Define strict type if needed
}

export interface CreateServiceDto {
    name: string;
    description: string;
    categoryId: string;
    price: number;
    duration: number;
    deliveryType: 'in_location_only' | 'home_service' | 'both';
}

export interface Business {
    id: string;
    businessName: string;
    status: string;
}

export interface ServiceCategory {
    id: string;
    name: string;
}

export const businessService = {
    // Register Business
    register: async (data: RegisterBusinessDto) => {
        const response = await apiClient.post<Business>('/spas/register', data);
        return response.data;
    },

    // Update Business Profile
    updateProfile: async (id: string, data: UpdateProfileDto) => {
        const response = await apiClient.put(`/spas/${id}/profile`, data);
        return response.data;
    },

    // Get Service Categories
    getServiceCategories: async () => {
        const response = await apiClient.get<ServiceCategory[]>('/service-categories');
        return response.data;
    },

    // Create Service
    createService: async (businessId: string, data: CreateServiceDto) => {
        const response = await apiClient.post(`/spas/${businessId}/services`, data);
        return response.data;
    },

    // Upload Image
    uploadImage: async (businessId: string, file: File, isPrimary: boolean = false) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('isPrimary', isPrimary.toString());
        formData.append('caption', 'Business Logo');

        const response = await apiClient.post(`/spas/${businessId}/images`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    }
};
