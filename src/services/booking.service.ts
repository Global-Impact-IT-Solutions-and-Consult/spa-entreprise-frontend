import apiClient from '@/lib/api-client';

export interface Booking {
    id: string;
    businessId: string;
    businessName: string;
    serviceId: string;
    serviceName: string;
    bookingDate: string;
    startTime: string;
    endTime: string;
    status: 'pending_payment' | 'confirmed' | 'completed' | 'cancelled' | 'expired';
    totalPrice: number;
    customerName?: string;
    customerPhone?: string;
    staffName?: string;
    staffId?: string;
    createdAt: string;
}

export interface BookingStats {
    totalBookings: number;
    pendingCount: number;
    confirmedCount: number;
    completedCount: number;
    cancelledCount: number;
    totalRevenue: number;
}

export interface BookingsMetricsResponseDto {
    pendingConfirmation: number;
    todaysConfirmed: number;
    requireAction: number;
    revenueToday: number;
}

export interface RescheduleBookingDto {
    bookingDate: string;
    startTime: string;
}

export const bookingService = {
    // Reschedule a booking
    rescheduleBooking: async (bookingId: string, data: RescheduleBookingDto) => {
        const response = await apiClient.post<Booking>(`/bookings/${bookingId}/reschedule`, data);
        return response.data;
    },

    // Get bookings metrics for a business dashboard
    getBookingsMetrics: async (businessId: string): Promise<BookingsMetricsResponseDto> => {
        const response = await apiClient.get<BookingsMetricsResponseDto>(`/bookings/business/${businessId}/metrics`);
        return response.data;
    },

    // Get bookings for a spa
    getSpaBookings: async (spaId: string, params?: { status?: string; date?: string; page?: number; limit?: number }) => {
        const response = await apiClient.get<Booking[] | { data: Booking[] }>(`/spas/${spaId}/bookings`, { params });
        // Handle cases where response might be wrapped in { data: [...] } or direct array
        if (Array.isArray(response.data)) {
            return response.data as Booking[];
        } else if (response.data && Array.isArray(response.data.data)) {
            return response.data.data as Booking[];
        }
        return [] as Booking[];
    },

    // Confirm a booking
    confirmBooking: async (bookingId: string, businessId: string, data: { notes?: string }) => {
        const response = await apiClient.post<Booking>(`/bookings/${bookingId}/confirm?businessId=${businessId}`, data);
        return response.data;
    },

    // Cancel a booking
    cancelBooking: async (bookingId: string, data: { reason?: string }) => {
        const response = await apiClient.post<Booking>(`/bookings/${bookingId}/cancel`, data);
        return response.data;
    },

    // Complete a booking
    completeBooking: async (bookingId: string) => {
        const response = await apiClient.post<Booking>(`/bookings/${bookingId}/complete`);
        return response.data;
    },

    // Create a new booking
    createBooking: async (data: {
        businessId?: string;
        serviceId: string;
        staffId?: string;
        bookingDate: string;
        startTime: string;
        endTime?: string;
        userId?: string;
        customerName?: string;
        customerPhone?: string;
        totalPrice?: number;
    }) => {
        const response = await apiClient.post<Booking>('/bookings', data);
        return response.data;
    },

    // Get bookings for the current user
    getUserBookings: async (params?: { status?: string; page?: number; limit?: number }): Promise<{ data: Booking[]; meta: { total: number } }> => {
        const response = await apiClient.get<Booking[] | { data: Booking[]; meta?: { total: number } }>('/bookings/my-bookings', { params });

        const { data } = response;

        // Handle cases where response might be wrapped in { data: [...], meta: {...} } or direct array
        if (Array.isArray(data)) {
            return { data: data, meta: { total: data.length } };
        } else if (data && Array.isArray(data.data)) {
            return { 
                data: data.data, 
                meta: data.meta || { total: data.data.length } 
            };
        }
        return { data: [], meta: { total: 0 } };
    }
};
