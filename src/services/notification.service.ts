import api from '@/lib/api-client';

export interface NotificationPreferences {
    id: string;
    userId: string;
    emailNotifications: boolean;
    upcomingBooking: boolean;
    paymentNotifications: boolean;
    systemAlerts: boolean;
    smsBookingNotifications: boolean;
    smsPaymentNotifications: boolean;
    smsReminders: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface UpdateNotificationPreferencesDto {
    emailNotifications?: boolean;
    upcomingBooking?: boolean;
    paymentNotifications?: boolean;
    systemAlerts?: boolean;
    smsBookingNotifications?: boolean;
    smsPaymentNotifications?: boolean;
    smsReminders?: boolean;
}

export interface UserNotification {
    id: string;
    type: string;
    category: string;
    title: string;
    body: string;
    read: boolean;
    metadata: Record<string, any>;
    createdAt: string;
}

export interface NotificationListResponse {
    notifications: UserNotification[];
    total: number;
    unreadCount: number;
}

export const notificationService = {
    getPreferences: async (): Promise<NotificationPreferences> => {
        const response = await api.get<NotificationPreferences>('/users/me/notifications');
        return response.data;
    },

    updatePreferences: async (data: UpdateNotificationPreferencesDto): Promise<NotificationPreferences> => {
        const response = await api.put<NotificationPreferences>('/users/me/notifications', data);
        return response.data;
    },

    getNotifications: async (params?: {
        limit?: number;
        offset?: number;
        unreadOnly?: boolean;
    }): Promise<NotificationListResponse> => {
        const response = await api.get<NotificationListResponse>('/users/me/notifications/list', {
            params,
        });
        return response.data;
    },

    markAsRead: async (notificationId: string): Promise<void> => {
        await api.patch(`/users/me/notifications/${notificationId}/read`);
    },

    markAllAsRead: async (): Promise<void> => {
        await api.post('/users/me/notifications/read-all');
    },
};
