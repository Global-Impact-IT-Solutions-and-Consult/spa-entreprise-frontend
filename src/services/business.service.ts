import apiClient from '@/lib/api-client';

export interface Country {
    isoCode: string;
    name: string;
    phonecode: string;
    flag: string;
    currency: string;
    latitude: string;
    longitude: string;
    timezones: Array<{
        zoneName: string;
        gmtOffset: number;
        gmtOffsetName: string;
        abbreviation: string;
        tzName: string;
    }>;
}

export interface State {
    name: string;
    isoCode: string;
    countryCode: string;
    latitude: string;
    longitude: string;
}

export interface City {
    name: string;
    countryCode: string;
    stateCode: string;
    latitude: string;
    longitude: string;
}

export interface OperatingHours {
    [key: string]: {
        open: string;
        close: string;
        closed: boolean;
    };
}

export interface UpdateProfileDto {
    businessTypeCode?: string;
    businessName?: string;
    phone?: string;
    cacNumber?: string;
    description?: string;
    country?: Country;
    state?: State;
    city?: City;
    address?: string;
    addressNote?: string;
    amenities?: string[];
    operatingHours?: OperatingHours;
}

export interface RegisterBusinessDto {
    businessName: string;
    businessTypeCode: string;
    phone: string;
    email: string;
}

export interface CreateServiceDto {
    name: string;
    description: string;
    categoryId: string;
    price: number;
    duration: number;
    bufferTime?: number;
    deliveryType: 'IN_LOCATION_ONLY' | 'HOME_SERVICE_ONLY' | 'BOTH';
    homeServicePrice?: number;
    maxServiceRadius?: number;
}

export interface CreateStaffDto {
    name: string;
    serviceIds: string[];
    role: string;
    experience: string;
}

export interface AddressRelation {
    id: string;
    businessId: string;
    country: Country;
    state: State;
    city: City;
    address: string;
    note?: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface Business {
    id: string;
    businessName: string;
    status: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
    userId: string;
    businessTypeCode?: string;
    phone?: string;
    cacNumber?: string;
    description?: string;
    // New addressRelation structure (preferred)
    addressRelation?: AddressRelation | null;
    // Legacy fields (for backward compatibility)
    country?: Country;
    state?: State;
    city?: City;
    address?: string;
    addressNote?: string;
    // Onboarding completion tracking (from backend)
    onboardingCompleted?: boolean;
    onboardingCompletedAt?: string | null;
    averageRating?: string;
    totalReviews?: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface ServiceCategory {
    id: string;
    name: string;
}

export interface Service {
    id: string;
    name: string;
    description: string;
    categoryId: string;
    price: number;
    duration: number;
    bufferTime?: number;
    deliveryType: 'IN_LOCATION_ONLY' | 'HOME_SERVICE_ONLY' | 'BOTH';
    homeServicePrice?: number;
    serviceRadius?: number;
}

export interface Staff {
    id: string;
    name: string;
    role: string;
    experience: string;
    serviceIds?: string[];
}

export interface SearchSpasParams {
    city?: string;
    page?: number;
    limit?: number;
    serviceTypes?: string[];
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    sortBy?: 'rating' | 'price' | 'newest' | 'name';
    sortOrder?: 'asc' | 'desc';
}

export interface SpaSearchResult {
    id: string;
    businessName: string;
    city: string;
    address: string;
    averageRating: number | null;
    totalReviews: number;
    primaryImageUrl: string | null;
    // Added for compatibility with existing UI
    name?: string;
    location?: string;
    image?: string;
    rating?: number;
    reviews?: number;
}

export interface PaginationMeta {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface SearchSpasResponse {
    data: SpaSearchResult[];
    meta: PaginationMeta;
}

export interface BusinessImage {
    id: string;
    businessId: string;
    url: string;
    caption?: string;
    category?: 'profile' | 'gallery' | 'activities' | 'facilities' | 'services';
    displayOrder: number;
    isPrimary: boolean;
    createdAt: string;
}

export interface DashboardUpcomingBooking {
    id: string;
    customerName: string;
    serviceName: string;
    duration: number;
    startTime: string;
    endTime: string;
    status: string;
    price: number;
    isHomeService: boolean;
    location: string;
}

export interface DashboardData {
    todaysRevenue: {
        amount: number;
        changeFromYesterday: number;
    };
    todaysBookings: {
        total: number;
        completed: number;
    };
    averageRating: {
        rating: number;
        label: string;
    };
    staffOnline: {
        online: number;
        total: number;
        onHomeService: number;
    };
    weeklyRevenue: {
        day: string;
        revenue: number;
    }[];
    upcomingBookings: DashboardUpcomingBooking[];
}

export const businessService = {
    // Get My Businesses
    getMyBusinesses: async () => {
        const response = await apiClient.get<Business[]>('/spas/my-businesses');
        return response.data;
    },

    // Get Business by ID
    getBusiness: async (id: string) => {
        const response = await apiClient.get<Business>(`/spas/${id}`);
        return response.data;
    },

    // Get Business profile b   y ID
    getBusinessProfile: async (id: string) => {
        const response = await apiClient.get<Business>(`/spas/${id}/profile`);
        return response.data;
    },

    // Get Business Status
    getBusinessStatus: async (id: string) => {
        const response = await apiClient.get<{ status: string }>(`/spas/${id}/status`);
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

    // List all Spas (Public)
    listSpas: async (params?: { page?: number; limit?: number; sortBy?: string; sortOrder?: string }) => {
        const response = await apiClient.get<SearchSpasResponse>('/spas', { params });
        return response.data;
    },

    // Search Spas by location and filters (Public)
    searchSpas: async (params: SearchSpasParams) => {
        const response = await apiClient.get<SearchSpasResponse>('/spas/search', { params });
        return response.data;
    },

    // Get Services for a Business
    getServices: async (businessId: string) => {
        const response = await apiClient.get<Service[]>(`/spas/${businessId}/services`);
        return response.data;
    },

    // Create Service
    createService: async (businessId: string, data: CreateServiceDto) => {
        const response = await apiClient.post(`/spas/${businessId}/services`, data);
        return response.data;
    },

    // Update Service
    updateService: async (businessId: string, serviceId: string, data: Partial<CreateServiceDto>) => {
        const response = await apiClient.put(`/spas/${businessId}/services/${serviceId}`, data);
        return response.data;
    },

    // Delete Service
    deleteService: async (businessId: string, serviceId: string) => {
        const response = await apiClient.delete(`/spas/${businessId}/services/${serviceId}`);
        return response.data;
    },

    // Get Staff for a Service
    getServiceStaff: async (businessId: string, serviceId: string) => {
        const response = await apiClient.get<Staff[]>(`/spas/${businessId}/services/${serviceId}/staff`);
        return response.data;
    },

    // Get All Staff for a Business
    getAllStaff: async (businessId: string) => {
        const response = await apiClient.get<Staff[] | { data: Staff[] }>(`/spas/${businessId}/staff`);
        // Handle cases where response might be wrapped in { data: [...] } or direct array
        if (Array.isArray(response.data)) {
            return response.data as Staff[];
        } else if (response.data && Array.isArray(response.data.data)) {
            return response.data.data as Staff[];
        }
        return [] as Staff[];
    },

    // Create Staff Member (new endpoint - staff can be assigned to multiple services)
    createStaff: async (businessId: string, data: CreateStaffDto) => {
        const response = await apiClient.post(`/spas/${businessId}/staff`, data);
        return response.data;
    },

    // Update Staff Member
    updateStaff: async (businessId: string, staffId: string, data: Partial<CreateStaffDto>) => {
        const response = await apiClient.put(`/spas/${businessId}/staff/${staffId}`, data);
        return response.data;
    },

    // Delete Staff Member
    deleteStaff: async (businessId: string, staffId: string) => {
        const response = await apiClient.delete(`/spas/${businessId}/staff/${staffId}`);
        return response.data;
    },

    // Upload Image
    uploadImage: async (businessId: string, file: File, isPrimary: boolean = false, caption?: string, category: string = 'gallery'): Promise<BusinessImage> => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('isPrimary', isPrimary.toString());
        formData.append('caption', caption || 'Business Image');
        formData.append('category', category);

        const response = await apiClient.post(`/spas/${businessId}/images`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    // Get Business Images
    getImages: async (businessId: string, category?: string) => {
        const response = await apiClient.get<BusinessImage[]>(`/spas/${businessId}/images`, {
            params: category ? { category } : undefined
        });
        return response.data;
    },

    // Get Gallery Images (activities, facilities, services, gallery)
    getGalleryImages: async (businessId: string): Promise<BusinessImage[]> => {
        const response = await apiClient.get<BusinessImage[]>(`/spas/${businessId}/gallery`);
        return response.data;
    },

    // Delete Image
    deleteImage: async (businessId: string, imageId: string) => {
        const response = await apiClient.delete(`/spas/${businessId}/images/${imageId}`);
        return response.data;
    },

    // Set Primary Image
    setPrimaryImage: async (businessId: string, imageId: string) => {
        const response = await apiClient.put(`/spas/${businessId}/images/${imageId}/set-primary`);
        return response.data;
    },

    // Upload Document
    uploadDocument: async (businessId: string, file: File, documentType: string) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('documentType', documentType);

        const response = await apiClient.post(`/spas/${businessId}/documents`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    // Set Availability
    setAvailability: async (businessId: string, availability: OperatingHours) => {
        const response = await apiClient.put(`/spas/${businessId}/operating-hours`, availability);
        return response.data;
    },

    // Get Dashboard Data
    getDashboard: async (businessId: string): Promise<DashboardData> => {
        const response = await apiClient.get(`/spas/${businessId}/dashboard`);
        return response.data;
    }
};
