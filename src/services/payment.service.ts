import apiClient from '@/lib/api-client';

export interface InitializePaymentDto {
    bookingId: string;
    paymentMethod?: 'card' | 'bank_transfer' | 'mobile_money' | 'other';
}

export interface PaymentResponseDto {
    id: string;
    bookingId: string;
    amount: number;
    currency: string;
    status: 'pending' | 'successful' | 'failed' | 'cancelled' | 'refunded';
    paymentMethod: string | null;
    flwReference: string | null;
    paymentLink: string | null;
    expiresAt: string | null;
    createdAt: string;
}

export interface InitializeTipPaymentDto {
    bookingId: string;
    amount: number;
}

export const paymentService = {
    // Initialize payment for a booking
    initializePayment: async (data: InitializePaymentDto): Promise<PaymentResponseDto> => {
        const response = await apiClient.post<PaymentResponseDto>('/payments/initialize', data);
        return response.data;
    },

    // Initialize tip payment for a completed booking
    initializeTipPayment: async (data: InitializeTipPaymentDto): Promise<PaymentResponseDto> => {
        const response = await apiClient.post<PaymentResponseDto>('/payments/tips/initialize', data);
        return response.data;
    },

    // Verify a payment after redirect
    verifyPayment: async (transactionId: string, txRef: string): Promise<unknown> => {
        const response = await apiClient.get(`/payments/verify`, {
            params: {
                transaction_id: transactionId,
                tx_ref: txRef
            }
        });
        return response.data;
    }
};
