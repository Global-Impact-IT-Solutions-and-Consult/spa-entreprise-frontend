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

export const bookingService = {
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
    confirmBooking: async (bookingId: string, data: { notes?: string }) => {
        const response = await apiClient.post<Booking>(`/bookings/${bookingId}/confirm`, data);
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
        serviceId: string;
        staffId?: string;
        bookingDate: string;
        startTime: string;
        endTime: string;
        customerName: string;
        customerPhone: string;
        totalPrice: number;
    }) => {
        const response = await apiClient.post<Booking>('/bookings', data);
        return response.data;
    }
};
