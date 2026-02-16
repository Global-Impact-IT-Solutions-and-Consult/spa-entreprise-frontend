import apiClient from '@/lib/api-client';

export interface BusinessType {
    code: string;
    name: string;
}

export interface ServiceCategory {
    id: string;
    name: string;
}

export interface BusinessService {
    id: string;
    name: string;
    description?: string;
    category: ServiceCategory;
    price?: number;
    duration?: number;
    imageUrl?: string | null;
}

export interface OperatingHours {
    [key: string]: {
        open: string;
        close: string;
        closed: boolean;
    };
}

export interface BusinessOwner {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    userId?: string;
    createdAt?: string;
}

export interface AdminBusiness {
    id: string;
    businessName: string;
    businessTypeCode: string;
    businessType?: BusinessType;
    status: 'pending_approval' | 'approved' | 'rejected' | 'suspended';
    description?: string;
    city?: string;
    address?: string;
    phone?: string;
    email?: string;
    cacNumber?: string;
    coverImage?: string | null;
    registrationDate?: string;
    approvedAt?: string | null;
    owner?: BusinessOwner;
    services?: BusinessService[];
    operatingHours?: OperatingHours;
    amenities?: string[];
    createdAt?: string;
    updatedAt?: string;
}

export interface BusinessStats {
    pendingApprovals: number;
    approved: number;
    rejected: number;
    allBusinesses: number;
}

export interface BusinessFilters {
    status?: 'pending_approval' | 'approved' | 'rejected' | 'suspended';
    businessTypeCode?: string;
    city?: string;
    sortBy?: 'newest' | 'oldest' | 'name_asc' | 'name_desc';
    search?: string;
    page?: number;
    limit?: number;
}

export interface PaginationInfo {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface BusinessesResponse {
    data: AdminBusiness[];
    pagination: PaginationInfo;
}

export const adminService = {
    // Get business statistics
    getBusinessStats: async () => {
        try {
            const response = await apiClient.get<BusinessStats>('/admin/spas/statistics');
            
            if (!response || !response.data) {
                console.warn('Invalid response structure from admin/spas/statistics endpoint');
                return { 
                    pendingApprovals: 0, 
                    approved: 0, 
                    rejected: 0, 
                    allBusinesses: 0, 
                    endpointAvailable: false 
                };
            }
            
            return { ...response.data, endpointAvailable: true };
        } catch (error: any) {
            if (error.response?.status === 404) {
                console.warn('Admin business stats endpoint not available yet:', error.response?.status);
                return { 
                    pendingApprovals: 0, 
                    approved: 0, 
                    rejected: 0, 
                    allBusinesses: 0, 
                    endpointAvailable: false 
                };
            }
            throw error;
        }
    },

    // Get all businesses with filters
    getAllBusinesses: async (filters?: BusinessFilters) => {
        try {
            const response = await apiClient.get<BusinessesResponse>('/admin/spas', {
                params: filters
            });
            
            // Handle response structure
            if (!response || !response.data) {
                console.warn('Invalid response structure from admin/spas endpoint');
                return { 
                    data: [], 
                    pagination: { total: 0, page: 1, limit: 20, totalPages: 0 },
                    endpointAvailable: false 
                };
            }

            const responseData = response.data;
            
            // Handle both direct BusinessesResponse and wrapped responses
            if (responseData.data && responseData.pagination) {
                // Standard paginated response
                return { 
                    data: responseData.data || [], 
                    pagination: responseData.pagination || { total: 0, page: 1, limit: 20, totalPages: 0 },
                    endpointAvailable: true 
                };
            } else if (Array.isArray(responseData)) {
                // Direct array response (fallback)
                return { 
                    data: responseData, 
                    pagination: { total: responseData.length, page: 1, limit: responseData.length, totalPages: 1 },
                    endpointAvailable: true 
                };
            } else {
                // Unexpected structure
                console.warn('Unexpected response structure:', responseData);
                return { 
                    data: [], 
                    pagination: { total: 0, page: 1, limit: 20, totalPages: 0 },
                    endpointAvailable: false 
                };
            }
        } catch (error: any) {
            if (error.response?.status === 404) {
                console.warn('Admin businesses endpoint not available yet:', error.response?.status);
                return { 
                    data: [], 
                    pagination: { total: 0, page: 1, limit: 20, totalPages: 0 },
                    endpointAvailable: false 
                };
            }
            throw error;
        }
    },

    // Get business details by ID (admin view with full details)
    getBusiness: async (businessId: string) => {
        try {
            const response = await apiClient.get<AdminBusiness>(`/admin/spas/${businessId}`);
            return response.data;
        } catch (error: any) {
            if (error.response?.status === 404) {
                throw new Error('Business not found or admin endpoint not available yet.');
            }
            throw error;
        }
    },

    // Approve business
    approveBusiness: async (businessId: string, notes?: string) => {
        try {
            const response = await apiClient.post(`/admin/spas/${businessId}/approve`, { notes });
            return response.data;
        } catch (error: any) {
            if (error.response?.status === 404) {
                throw new Error('Admin approve endpoint not available yet. Please contact the backend team.');
            }
            throw error;
        }
    },

    // Reject business
    rejectBusiness: async (businessId: string, reason: string, sendEmail: boolean = true) => {
        try {
            const response = await apiClient.post(`/admin/spas/${businessId}/reject`, { reason, sendEmail });
            return response.data;
        } catch (error: any) {
            if (error.response?.status === 404) {
                throw new Error('Admin reject endpoint not available yet. Please contact the backend team.');
            }
            throw error;
        }
    },

    // Get pending businesses (convenience endpoint)
    getPendingBusinesses: async (page: number = 1, limit: number = 50) => {
        try {
            const response = await apiClient.get<BusinessesResponse>('/admin/spas/pending', {
                params: { page, limit }
            });
            return {
                data: response.data.data || [],
                pagination: response.data.pagination,
                endpointAvailable: true
            };
        } catch (error: any) {
            if (error.response?.status === 404) {
                console.warn('Admin pending businesses endpoint not available yet');
                return {
                    data: [],
                    pagination: { total: 0, page: 1, limit: 50, totalPages: 0 },
                    endpointAvailable: false
                };
            }
            throw error;
        }
    }
};
