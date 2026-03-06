export type UserStatus = 'active' | 'suspended' | 'inactive';

export interface AdminUser {
  id: string;
  userId: string; // e.g. USR001
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: UserStatus;
  role: string;
  createdAt: string;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  lastLogin?: string;
  bookingsCount?: number;
  reviewsCount?: number;
  associatedBusiness?: {
    id: string;
    name: string;
    status: string;
    city?: string;
    createdAt?: string;
  };
}

export const STATUS_LABELS: Record<UserStatus, string> = {
  active: 'Active',
  suspended: 'Suspend',
  inactive: 'Inactive',
};

export const ROLE_OPTIONS = [
  { value: 'customer', label: 'Customer' },
  { value: 'business_owner', label: 'Business Owner' },
  { value: 'admin', label: 'Admin' },
];
