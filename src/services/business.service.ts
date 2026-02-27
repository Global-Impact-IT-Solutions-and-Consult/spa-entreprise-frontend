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
    deliveryType: 'IN_LOCATION_ONLY' | 'HOME_SERVICE' | 'BOTH';
    homeServicePrice?: number;
    maxServiceRadius?: number;
}

export interface CreateStaffDto {
    name: string;
    serviceIds: string[];
    role: string;
    experience: string;
    phone?: string;
    about?: string;
    profilePicture?: string;
}

export interface AddressDetails {
    country: Country;
    state: State;
    city: City;
    address: string;
    note?: string | null;
}

export interface AddressRelation extends AddressDetails {
    id: string;
    businessId: string;
    createdAt: string;
    updatedAt: string;
}

export interface BusinessOwner {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string | null;
}

export interface Business {
    id: string;
    businessName: string;
    status?: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
    userId?: string;
    businessTypeCode?: string;
    businessType?: {
        id: string;
        code: string;
        name: string;
    };
    phone?: string;
    email?: string;
    cacNumber?: string;
    description?: string;
    addressDetails?: AddressDetails | null;
    addressRelation?: AddressRelation | null;
    // Legacy fields (for backward compatibility)
    country?: Country;
    state?: State;
    city?: string | City;
    address?: string;
    addressNote?: string;
    // Onboarding completion tracking (from backend)
    onboardingCompleted?: boolean;
    onboardingCompletedAt?: string | null;
    averageRating?: string | number;
    totalReviews?: number;
    primaryImageUrl?: string | null;
    coverImage?: string | null;
    amenities?: string[] | null;
    operatingHours?: OperatingHours;
    owner?: BusinessOwner;
    createdAt?: string;
    updatedAt?: string;
}

export interface ServiceCategory {
    id: string;
    name: string;
    businessTypeCodes: string[];
}

export interface BusinessType {
    id: string;
    code: string;
    name: string;
}

export interface Service {
    id: string;
    name: string;
    description: string;
    categoryId?: string; // Keep for backward compatibility in some components
    category: {
        id: string;
        name: string;
    };
    price: number;
    duration: number;
    bufferTime?: number;
    deliveryType: 'in_location_only' | 'home_service_only' | 'both' | string;
    homeServicePrice?: number;
    serviceRadius?: number;
    imageUrl?: string;
}

export interface Staff {
    id: string;
    businessId?: string;
    name: string;
    role: string;
    experience: string;
    phone?: string | null;
    about?: string | null;
    serviceIds?: string[];
    profilePicture?: string | null;
    createdAt?: string;
    updatedAt?: string;
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
    description: string;
    city: string;
    address: string;
    addressDetails?: AddressDetails;
    averageRating: string | number | null;
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

export interface EnrichedService extends Omit<Service, 'id'> {
    id: string;
    businessName: string;
    businessId: string;
    rating: number | string;
    reviews: number;
    location: string;
    distance?: string;
    image: string;
}

export interface SearchServicesResponse {
    data: EnrichedService[];
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

export interface CityWithCount {
    city: string;
    businessCount: number;
}

export interface BusinessReview {
    id: string;
    rating: number;
    comment: string;
    createdAt: string;
    user: {
        id: string;
        firstName: string;
        lastName: string;
    };
    service?: {
        id: string;
        name: string;
    };
    staff?: {
        id: string;
        name: string;
    };
}

export interface ReviewsResponse {
    data: BusinessReview[];
    meta: PaginationMeta;
    averageRating: number;
    ratingDistribution: { stars: number; count: number }[];
}

// Utility: check if a business is currently open based on operating hours
export function isBusinessOpen(operatingHours?: OperatingHours): boolean {
    if (!operatingHours) return false;
    const now = new Date();
    const dayName = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const todayHours = operatingHours[dayName];
    if (!todayHours || todayHours.closed) return false;

    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    return currentTime >= todayHours.open && currentTime <= todayHours.close;
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
        const response = await apiClient.get<ServiceCategory[]>('/spas/service-categories');
        return response.data;
    },

    // Get Business Types (e.g., Spa, Barbershop)
    getBusinessTypes: async () => {
        const response = await apiClient.get<BusinessType[]>('/spas/business-types');
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

    // Search Spas with starting prices enriched in parallel
    searchSpasWithEnrichment: async (params: SearchSpasParams) => {
        // 1. Get search results
        // Use /spas/search ONLY if city is provided, otherwise fallback to /spas
        const endpoint = params.city || params.serviceTypes ? '/spas/search' : '/spas';
        const searchResponse = await apiClient.get<SearchSpasResponse>(endpoint, { params });
        const businesses = searchResponse.data.data;
        const meta = searchResponse.data.meta;

        // 2. Fetch full business details and services for each business in parallel
        const enrichedData = await Promise.all(
            businesses.map(async (business) => {
                try {
                    // Fetch full business and services in parallel for efficiency
                    const [fullBusinessRes, servicesRes] = await Promise.all([
                        apiClient.get<Business>(`/spas/${business.id}`),
                        apiClient.get<Service[]>(`/spas/${business.id}/services`)
                    ]);

                    const fullBusiness = fullBusinessRes.data;
                    const services = servicesRes.data;

                    // Find lowest price
                    let startingPrice = "---";
                    if (services && services.length > 0) {
                        const minPrice = Math.min(...services.map(s => s.price));
                        startingPrice = minPrice.toLocaleString();
                    }

                    return {
                        ...business,
                        ...fullBusiness,
                        startingPrice
                    };
                } catch (error) {
                    console.error(`Failed to enrich business ${business.id}:`, error);
                    return {
                        ...business,
                        startingPrice: "---"
                    };
                }
            })
        );

        return {
            data: enrichedData,
            meta
        };
    },

    // Get All Services (from GET /spas/services — no server-side filtering/pagination)
    getAllServices: async (): Promise<EnrichedService[]> => {
        const response = await apiClient.get('/spas/services');
        const rawServices = Array.isArray(response.data) ? response.data : (response.data?.data || []);

        // Map to EnrichedService format
        return rawServices.map((service: any) => ({
            id: service.id,
            name: service.name,
            description: service.description || '',
            category: service.category || { id: '', name: 'General' },
            duration: service.duration || 0,
            bufferTime: service.bufferTime || 0,
            price: service.price || 0,
            homeServicePrice: service.homeServicePrice || null,
            deliveryType: service.deliveryType || 'IN_LOCATION_ONLY',
            isActive: service.isActive ?? true,
            businessName: service.businessName || service.spa?.businessName || 'Wellness Business',
            businessId: service.businessId || service.spa?.id || service.spaId || '',
            rating: service.spa?.averageRating || service.rating || 0,
            reviews: service.spa?.totalReviews || service.reviews || 0,
            location: service.business?.city,
            image: service.imageUrl,
        }));
    },

    // Get Featured Businesses with starting prices (Parallel enrichment)
    getFeaturedBusinesses: async (limit: number = 4) => {
        // 1. Get businesses
        const businessesResponse = await apiClient.get<SearchSpasResponse>('/spas', {
            params: { limit, sortBy: 'rating', sortOrder: 'desc' }
        });
        const businesses = businessesResponse.data.data;

        // 2. Fetch services for each business in parallel to get starting prices
        const enrichedBusinesses = await Promise.all(
            businesses.map(async (business) => {
                try {
                    const servicesResponse = await apiClient.get<Service[]>(`/spas/${business.id}/services`);
                    const services = servicesResponse.data;

                    // Find lowest price
                    let startingPrice = "---";
                    if (services && services.length > 0) {
                        const minPrice = Math.min(...services.map(s => s.price));
                        startingPrice = minPrice.toLocaleString();
                    }

                    return {
                        ...business,
                        startingPrice,
                        // Add compatibility fields
                        image: business.primaryImageUrl || "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&q=80",
                        location: business.addressDetails?.city?.name || (typeof business.city === 'string' ? business.city : (business.city as any)?.name) || "Lagos",
                        rating: typeof business.averageRating === 'string' ? parseFloat(business.averageRating) : (business.averageRating || 0),
                        reviews: business.totalReviews
                    };
                } catch (error) {
                    console.error(`Failed to fetch services for business ${business.id}:`, error);
                    return {
                        ...business,
                        startingPrice: "---",
                        image: business.primaryImageUrl || "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&q=80",
                        location: business.addressDetails?.city?.name || (typeof business.city === 'string' ? business.city : (business.city as any)?.name) || "Lagos",
                        rating: typeof business.averageRating === 'string' ? parseFloat(business.averageRating) : (business.averageRating || 0),
                        reviews: business.totalReviews
                    };
                }
            })
        );

        return enrichedBusinesses;
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
        const response = await apiClient.get<Staff[]>(`/spas/${businessId}/staff`);
        return Array.isArray(response.data) ? response.data : [];
    },

    // Get All Staff for a Business -- Public route
    getAllStaffPublic: async (businessId: string) => {
        const response = await apiClient.get<Staff[]>(`/spas/public/${businessId}/staff`);
        return Array.isArray(response.data) ? response.data : [];
    },

    // Create Staff Member
    createStaff: async (businessId: string, data: CreateStaffDto) => {
        const response = await apiClient.post<Staff>(`/spas/${businessId}/staff`, data);
        return response.data;
    },

    // Update Staff Member
    updateStaff: async (businessId: string, staffId: string, data: Partial<CreateStaffDto>) => {
        const response = await apiClient.put<Staff>(`/spas/${businessId}/staff/${staffId}`, data);
        return response.data;
    },

    // Delete Staff Member
    deleteStaff: async (businessId: string, staffId: string) => {
        const response = await apiClient.delete(`/spas/${businessId}/staff/${staffId}`);
        return response.data;
    },

    // Upload Staff Profile Picture
    uploadStaffProfilePicture: async (businessId: string, staffId: string, file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await apiClient.post<{ profilePicture: string }>(
            `/spas/${businessId}/staff/${staffId}/profile-picture`,
            formData,
            { headers: { 'Content-Type': 'multipart/form-data' } }
        );
        return response.data;
    },

    // Upload Image
    uploadImage: async (
        businessId: string,
        file: File,
        isPrimary: boolean = false,
        caption?: string,
        category: string = 'gallery',
        serviceId?: string
    ): Promise<BusinessImage> => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('isPrimary', isPrimary.toString());
        if (caption) formData.append('caption', caption);
        // If a serviceId is provided, automatically use 'services' category
        formData.append('category', serviceId ? 'services' : category);
        if (serviceId) formData.append('serviceId', serviceId);

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
    },

    // Get Cities with Business Counts (Public)
    getCitiesWithBusinessCounts: async (): Promise<CityWithCount[]> => {
        const response = await apiClient.get<CityWithCount[]>('/spas/cities');
        return response.data;
    },

    // Get Business Reviews (Public)
    getBusinessReviews: async (businessId: string, params?: { page?: number; limit?: number }): Promise<ReviewsResponse> => {
        const response = await apiClient.get<ReviewsResponse>(`/spas/${businessId}/reviews`, { params });
        return response.data;
    }
};
