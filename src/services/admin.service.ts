import apiClient from '@/lib/api-client';

function getErrorStatus(error: unknown) {
  if (
    error &&
    typeof error === 'object' &&
    'response' in error &&
    error.response &&
    typeof error.response === 'object' &&
    'status' in error.response &&
    typeof error.response.status === 'number'
  ) {
    return error.response.status;
  }

  return undefined;
}

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

// --- Admin Users (from ADMIN_API.md §5) ---
export interface AdminUserListItem {
  id: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
  createdAt: string;
}

export interface AdminUserStats {
  total: number;
  active: number;
  suspended: number;
}

export interface AdminUserDetailBusiness {
  id: string;
  businessName: string;
  status: string;
  city?: string;
  createdAt?: string;
}

export interface AdminUserDetail {
  id: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  createdAt: string;
  updatedAt?: string;
  lastLoginAt?: string;
  business?: AdminUserDetailBusiness | null;
  counts?: { bookings: number; reviews: number };
}

export interface AdminUsersResponse {
  data: AdminUserListItem[];
  pagination: PaginationInfo;
}

export interface CreateAdminUserDto {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role: 'customer' | 'business' | 'admin';
}

export interface UpdateAdminUserDto {
  firstName?: string;
  lastName?: string;
  phone?: string;
  password?: string;
}

// --- Dashboard (ADMIN_API.md §4) ---
export interface DashboardMetrics {
  totalUsers: number;
  totalBusinesses: number;
  pendingApprovals: number;
  totalBookings: number | null;
}

export interface DashboardRecentRegistration {
  id: string;
  email: string;
  role: string;
  createdAt: string;
  firstName?: string;
  lastName?: string;
}

export interface DashboardRecentActivity {
  registrations: DashboardRecentRegistration[];
  bookings?: Array<{ id: string; [key: string]: unknown }> | null;
}

export interface DashboardQuickAction {
  label: string;
  url: string;
  count: number;
}

export interface DashboardPlatformGrowth {
  period: string;
  labels: string[];
  users: number[];
  bookings: number[];
  businesses: number[];
}

export interface DashboardActivityFeedItem {
  type: string;
  id: string;
  date: string;
  summary: string;
  metadata?: Record<string, unknown>;
}

export interface DashboardResponse {
  metrics: DashboardMetrics;
  recentActivity: DashboardRecentActivity;
  quickActions: DashboardQuickAction[];
  platformGrowth?: DashboardPlatformGrowth | null;
  activityFeed?: DashboardActivityFeedItem[] | null;
}

// --- Bookings ---
export interface BookingStats {
  total: number;
  pending: number;
  completed: number;
  confirmed?: number;
  cancelled?: number;
  expired?: number;
}

export interface AdminBookingListItem {
  id: string;
  customerName: string;
  customerId: string;
  businessName: string;
  businessId: string;
  serviceName: string;
  dateTime: string;
  amount: number;
  status: string;
  paymentStatus: string;
  createdAt?: string;
}

export interface AdminBookingDetail {
  id: string;
  status: string;
  customer: { id: string; name: string; email: string; phone: string };
  businessAndService: {
    businessId: string;
    businessName: string;
    serviceId: string;
    serviceName: string;
    duration: number;
    staffName: string | null;
  };
  schedule: { date: string; time: string; bookedOn: string };
  payment: {
    amount: number;
    currency: string;
    paymentStatus: string;
    paymentMethod: string;
    transactionId?: string;
  };
}

export interface BookingsResponse {
  data: AdminBookingListItem[];
  pagination: PaginationInfo;
}

// --- Service categories (admin) ---
export interface AdminServiceCategory {
  id: string;
  name: string;
  description: string | null;
  usageCount: number;
  isActive: boolean;
  createdAt: string;
}

export interface ServiceCategoriesResponse {
  data: AdminServiceCategory[];
  pagination: PaginationInfo;
  stats?: { total: number; active: number };
}

// --- Payments ---
export interface PaymentStats {
  totalRevenue: number;
  totalCommission: number;
  commissionPercent?: number;
  escrowBalance: number;
  disputedAmount: number;
  disputedCount?: number;
  revenuePercentChangeFromLastMonth?: number | null;
}

export interface RevenueTrend {
  period: string;
  labels: string[];
  revenue: number[];
}

export interface PaymentMethodsDistribution {
  card?: number;
  bank_transfer?: number;
  mobile_money?: number;
  other?: number;
}

export interface AdminPaymentListItem {
  id: string;
  transactionId: string;
  customerName: string;
  businessName: string;
  method: string;
  paymentStatus: string;
  escrowStatus: string;
  dateTime: string;
  amount: number;
  createdAt?: string;
}

export interface PaymentsResponse {
  data: AdminPaymentListItem[];
  pagination: PaginationInfo;
}

export interface AdminPaymentDetail {
  id: string;
  transactionId: string | null;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  businessId: string;
  businessName: string;
  bookingId: string;
  amount: number;
  currency: string;
  status: string;
  paymentMethod: string | null;
  flwTransactionId: string | null;
  createdAt: string;
  errorMessage: string | null;
}

export interface PendingServiceApproval {
  id: string;
  name: string;
  description: string | null;
  price: number;
  duration: number;
  isActive: boolean;
  createdAt: string;
  category: { id: string; name: string } | null;
  business: {
    id: string;
    businessName: string;
    status: string;
    city: string;
  };
  owner: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
  } | null;
}

export interface PendingServiceApprovalsResponse {
  data: PendingServiceApproval[];
  pagination: PaginationInfo;
}

// --- Activity logs ---
export interface ActivityLogItem {
  timestamp: string;
  admin: string;
  action: string;
  details: string;
  ipAddress: string | null;
  status: string;
}

export interface ActivityLogsResponse {
  data: ActivityLogItem[];
  pagination: PaginationInfo;
}

// --- Settings ---
export interface NotificationPreferences {
  newUserRegistration: boolean;
  businessApprovalRequests: boolean;
  newBookings: boolean;
  paymentDisputes: boolean;
  systemUpdates: boolean;
}

export interface AdminSession {
  id: string;
  device: string;
  location: string;
  lastActive: string;
  current: boolean;
  canRevoke: boolean;
}

export interface HealthCheckResponse {
  status: string;
  info?: Record<string, unknown>;
  error?: Record<string, unknown>;
  details?: Record<string, unknown>;
}

export const adminService = {
  // Dashboard (GET /admin/dashboard). Optional period for platformGrowth: 7d | 30d | 90d.
  getDashboard: async (params?: { period?: '7d' | '30d' | '90d' }) => {
    const res = await apiClient.get<DashboardResponse>('/admin/dashboard', {
      params: params?.period ? { period: params.period } : undefined,
    });
    return res.data;
  },

  // Get business statistics
  getBusinessStats: async () => {
    try {
      const response = await apiClient.get<BusinessStats>(
        '/admin/spas/statistics',
      );

      if (!response || !response.data) {
        console.warn(
          'Invalid response structure from admin/spas/statistics endpoint',
        );
        return {
          pendingApprovals: 0,
          approved: 0,
          rejected: 0,
          allBusinesses: 0,
          endpointAvailable: false,
        };
      }

      return { ...response.data, endpointAvailable: true };
    } catch (error: unknown) {
      if (getErrorStatus(error) === 404) {
        console.warn(
          'Admin business stats endpoint not available yet:',
          getErrorStatus(error),
        );
        return {
          pendingApprovals: 0,
          approved: 0,
          rejected: 0,
          allBusinesses: 0,
          endpointAvailable: false,
        };
      }
      throw error;
    }
  },

  // Get all businesses with filters
  getAllBusinesses: async (filters?: BusinessFilters) => {
    try {
      const response = await apiClient.get<BusinessesResponse>('/admin/spas', {
        params: filters,
      });

      // Handle response structure
      if (!response || !response.data) {
        console.warn('Invalid response structure from admin/spas endpoint');
        return {
          data: [],
          pagination: { total: 0, page: 1, limit: 20, totalPages: 0 },
          endpointAvailable: false,
        };
      }

      const responseData = response.data;

      // Handle both direct BusinessesResponse and wrapped responses
      if (responseData.data && responseData.pagination) {
        // Standard paginated response
        return {
          data: responseData.data || [],
          pagination: responseData.pagination || {
            total: 0,
            page: 1,
            limit: 20,
            totalPages: 0,
          },
          endpointAvailable: true,
        };
      } else if (Array.isArray(responseData)) {
        // Direct array response (fallback)
        return {
          data: responseData,
          pagination: {
            total: responseData.length,
            page: 1,
            limit: responseData.length,
            totalPages: 1,
          },
          endpointAvailable: true,
        };
      } else {
        // Unexpected structure
        console.warn('Unexpected response structure:', responseData);
        return {
          data: [],
          pagination: { total: 0, page: 1, limit: 20, totalPages: 0 },
          endpointAvailable: false,
        };
      }
    } catch (error: unknown) {
      if (getErrorStatus(error) === 404) {
        console.warn(
          'Admin businesses endpoint not available yet:',
          getErrorStatus(error),
        );
        return {
          data: [],
          pagination: { total: 0, page: 1, limit: 20, totalPages: 0 },
          endpointAvailable: false,
        };
      }
      throw error;
    }
  },

  // Get business details by ID (admin view with full details)
  getBusiness: async (businessId: string) => {
    try {
      const response = await apiClient.get<AdminBusiness>(
        `/admin/spas/${businessId}`,
      );
      return response.data;
    } catch (error: unknown) {
      if (getErrorStatus(error) === 404) {
        throw new Error(
          'Business not found or admin endpoint not available yet.',
        );
      }
      throw error;
    }
  },

  // Approve business
  approveBusiness: async (businessId: string, notes?: string) => {
    try {
      const response = await apiClient.post(
        `/admin/spas/${businessId}/approve`,
        { notes },
      );
      return response.data;
    } catch (error: unknown) {
      if (getErrorStatus(error) === 404) {
        throw new Error(
          'Admin approve endpoint not available yet. Please contact the backend team.',
        );
      }
      throw error;
    }
  },

  // Reject business
  rejectBusiness: async (
    businessId: string,
    reason: string,
    sendEmail: boolean = true,
  ) => {
    try {
      const response = await apiClient.post(
        `/admin/spas/${businessId}/reject`,
        { reason, sendEmail },
      );
      return response.data;
    } catch (error: unknown) {
      if (getErrorStatus(error) === 404) {
        throw new Error(
          'Admin reject endpoint not available yet. Please contact the backend team.',
        );
      }
      throw error;
    }
  },

  // Get pending businesses (convenience endpoint)
  getPendingBusinesses: async (page: number = 1, limit: number = 50) => {
    try {
      const response = await apiClient.get<BusinessesResponse>(
        '/admin/spas/pending',
        {
          params: { page, limit },
        },
      );
      return {
        data: response.data.data || [],
        pagination: response.data.pagination,
        endpointAvailable: true,
      };
    } catch (error: unknown) {
      if (getErrorStatus(error) === 404) {
        console.warn('Admin pending businesses endpoint not available yet');
        return {
          data: [],
          pagination: { total: 0, page: 1, limit: 50, totalPages: 0 },
          endpointAvailable: false,
        };
      }
      throw error;
    }
  },

  // --- Admin Users ---
  getUsers: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    status?: string;
  }) => {
    const res = await apiClient.get<AdminUsersResponse>('/admin/users', {
      params,
    });
    return res.data;
  },
  getUsersStatistics: async () => {
    const res = await apiClient.get<AdminUserStats>('/admin/users/statistics');
    return res.data;
  },
  getUserDetail: async (id: string) => {
    const res = await apiClient.get<AdminUserDetail>(`/admin/users/${id}`);
    return res.data;
  },
  createUser: async (body: CreateAdminUserDto) => {
    const res = await apiClient.post<AdminUserDetail>('/users', body);
    return res.data;
  },
  updateUser: async (id: string, body: UpdateAdminUserDto) => {
    const res = await apiClient.patch<AdminUserDetail>(`/users/${id}`, body);
    return res.data;
  },
  deleteUser: async (id: string) => {
    const res = await apiClient.delete<{ message: string }>(`/users/${id}`);
    return res.data;
  },
  hardDeleteUser: async (id: string) => {
    const res = await apiClient.delete<{ message: string }>(`/users/${id}/hard`);
    return res.data;
  },
  exportUsers: async (params?: {
    search?: string;
    role?: string;
    status?: string;
  }) => {
    const res = await apiClient.get<Blob>('/admin/users/export', {
      params,
      responseType: 'blob',
    });
    return res.data;
  },
  suspendUser: async (id: string, reason: string) => {
    const res = await apiClient.post(`/admin/users/${id}/suspend`, { reason });
    return res.data;
  },
  unsuspendUser: async (id: string) => {
    const res = await apiClient.post(`/admin/users/${id}/unsuspend`);
    return res.data;
  },

  // --- Bookings ---
  getBookingStats: async (): Promise<
    BookingStats & { endpointAvailable?: boolean }
  > => {
    try {
      const res = await apiClient.get<BookingStats>(
        '/admin/bookings/statistics',
      );
      return { ...res.data, endpointAvailable: true };
    } catch (error: unknown) {
      if (getErrorStatus(error) === 404)
        return { total: 0, pending: 0, completed: 0, endpointAvailable: false };
      throw error;
    }
  },
  getBookings: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
    businessId?: string;
    customerId?: string;
    sortBy?: string;
  }) => {
    const res = await apiClient.get<BookingsResponse>('/admin/bookings', {
      params,
    });
    return res.data;
  },
  getBookingDetail: async (id: string) => {
    const res = await apiClient.get<AdminBookingDetail>(
      `/admin/bookings/${id}`,
    );
    return res.data;
  },
  cancelBooking: async (
    id: string,
    body: { reason: string; notifyCustomerAndBusiness?: boolean },
  ) => {
    const res = await apiClient.post(`/admin/bookings/${id}/cancel`, body);
    return res.data;
  },

  // --- Service categories ---
  getServiceCategories: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    sortBy?: string;
    search?: string;
  }) => {
    const res = await apiClient.get<ServiceCategoriesResponse>(
      '/admin/service-categories',
      { params },
    );
    return res.data;
  },
  createServiceCategory: async (body: {
    name: string;
    description?: string;
  }) => {
    const res = await apiClient.post<AdminServiceCategory>(
      '/admin/service-categories',
      body,
    );
    return res.data;
  },
  updateServiceCategory: async (
    id: string,
    body: { name?: string; description?: string; isActive?: boolean },
  ) => {
    const res = await apiClient.patch<AdminServiceCategory>(
      `/admin/service-categories/${id}`,
      body,
    );
    return res.data;
  },
  deleteServiceCategory: async (id: string) => {
    const res = await apiClient.delete(`/admin/service-categories/${id}`);
    return res.data;
  },

  // --- Payments ---
  getPaymentStats: async () => {
    const res = await apiClient.get<PaymentStats>('/admin/payments/statistics');
    return res.data;
  },
  getPaymentTrend: async (period: '7d' | '30d' | '90d' = '7d') => {
    const res = await apiClient.get<RevenueTrend>('/admin/payments/trend', {
      params: { period },
    });
    return res.data;
  },
  getPaymentMethods: async () => {
    const res = await apiClient.get<PaymentMethodsDistribution>(
      '/admin/payments/methods',
    );
    return res.data;
  },
  getPayments: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
    businessId?: string;
    customerId?: string;
    sortBy?: string;
  }) => {
    const res = await apiClient.get<PaymentsResponse>('/admin/payments', {
      params,
    });
    return res.data;
  },
  getPaymentDetail: async (id: string) => {
    const res = await apiClient.get<AdminPaymentDetail>(`/admin/payments/${id}`);
    return res.data;
  },

  // --- Activity logs ---
  getActivityLogs: async (params?: {
    page?: number;
    limit?: number;
    actionType?: string;
    dateFrom?: string;
    dateTo?: string;
    search?: string;
  }) => {
    const res = await apiClient.get<ActivityLogsResponse>(
      '/admin/activity-logs',
      { params },
    );
    return res.data;
  },

  // --- Settings ---
  getNotificationPreferences: async () => {
    const res = await apiClient.get<NotificationPreferences>(
      '/admin/settings/notifications',
    );
    return res.data;
  },
  updateNotificationPreferences: async (
    prefs: Partial<NotificationPreferences>,
  ) => {
    const res = await apiClient.patch<NotificationPreferences>(
      '/admin/settings/notifications',
      prefs,
    );
    return res.data;
  },
  getSessions: async () => {
    const res = await apiClient.get<AdminSession[]>('/admin/settings/sessions');
    return res.data;
  },
  revokeSession: async (sessionId: string) => {
    try {
      await apiClient.post(`/admin/settings/sessions/${sessionId}/revoke`);
    } catch {
      await apiClient.delete(`/admin/settings/sessions/${sessionId}`);
    }
  },
  getPendingServiceApprovals: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
  }) => {
    const res = await apiClient.get<PendingServiceApprovalsResponse>(
      '/admin/services/pending',
      { params },
    );
    return res.data;
  },
  getSystemHealth: async () => {
    const res = await apiClient.get<HealthCheckResponse>('/health');
    return res.data;
  },
};
