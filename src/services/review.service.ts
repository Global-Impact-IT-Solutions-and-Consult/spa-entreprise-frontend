import apiClient from '@/lib/api-client';

export interface SubmitReviewDto {
    bookingId: string;
    rating: number;
    reviewText: string;
    tipAmount?: number;
}

export interface ReviewResponse {
    id: string;
    bookingId: string;
    businessId: string;
    businessName: string;
    rating: number;
    reviewText: string;
    customerName: string;
    createdAt: string;
}

export const reviewService = {
    /**
     * Submit a review for a completed booking
     */
    submitReview: async (data: SubmitReviewDto): Promise<ReviewResponse> => {
        const response = await apiClient.post<ReviewResponse>('/reviews', data);
        return response.data;
    }
};
