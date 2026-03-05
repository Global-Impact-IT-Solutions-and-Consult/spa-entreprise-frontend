import apiClient from '@/lib/api-client';
import { Staff, Service, Business } from './business.service';

export interface TimeSlot {
    startTime: string;
    endTime: string;
    isAvailable: boolean;
}

export interface AvailabilityCheckResponse {
    date: string;
    availableSlots: TimeSlot[];
}

export const bookingPublicService = {
    /**
     * Fetch available time slots for a specific service and staff on a given date.
     */
    getStaffAvailability: async (params: {
        businessId: string;
        serviceId: string;
        staffId?: string;
        date: string;
    }): Promise<AvailabilityCheckResponse> => {
        const { businessId, ...queryParams } = params;
        const response = await apiClient.get<AvailabilityCheckResponse>(
            `/bookings/business/${businessId}/staff-availability`,
            { params: queryParams }
        );
        return response.data;
    },

    /**
     * Get the iCal calendar event URL for a specific booking.
     */
    getCalendarIcsUrl: (bookingId: string): string => {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';
        return `${baseUrl}/bookings/${bookingId}/calendar.ics`;
    },

    /**
     * Fetch a business profile by ID.
     */
    getBusinessProfile: async (id: string): Promise<Business> => {
        const response = await apiClient.get<Business>(`/spas/${id}`);
        return response.data;
    },

    /**
     * Fetch all services for a business.
     */
    getBusinessServices: async (businessId: string): Promise<Service[]> => {
        const response = await apiClient.get<Service[]>(`/spas/${businessId}/services`);
        return response.data;
    },

    /**
     * Fetch staff members assigned to a specific service.
     */
    getServiceStaff: async (businessId: string, serviceId: string): Promise<Staff[]> => {
        const response = await apiClient.get<Staff[]>(`/spas/public/${businessId}/staff`);
        const allStaff = Array.isArray(response.data) ? response.data : [];
        return allStaff.filter(staff => staff.serviceIds?.includes(serviceId));
    }
};
