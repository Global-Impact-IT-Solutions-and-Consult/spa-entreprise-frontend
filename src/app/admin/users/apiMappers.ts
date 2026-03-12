import type {
  AdminUserListItem,
  AdminUserDetail,
} from '@/services/admin.service';
import type { AdminUser, UserStatus } from './types';

function toStatus(s: string): UserStatus {
  if (s === 'active' || s === 'suspended' || s === 'inactive') return s;
  return 'active';
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/** Map API list item to AdminUser for table and actions */
export function mapUserListItem(item: AdminUserListItem): AdminUser {
  return {
    id: item.id,
    userId: item.id.slice(0, 8),
    firstName: item.firstName,
    lastName: item.lastName,
    email: item.email,
    phone: item.phone ?? '',
    status: toStatus(item.status),
    role: item.role === 'business' ? 'business_owner' : item.role,
    createdAt: formatDate(item.createdAt),
  };
}

/** Map API user detail to AdminUser for modals */
export function mapUserDetail(detail: AdminUserDetail): AdminUser {
  return {
    id: detail.id,
    userId: detail.id.slice(0, 8),
    firstName: detail.firstName,
    lastName: detail.lastName,
    email: detail.email,
    phone: detail.phone ?? '',
    status: toStatus(detail.status),
    role: detail.role === 'business' ? 'business_owner' : detail.role,
    createdAt: formatDate(detail.createdAt),
    emailVerified: detail.emailVerified,
    phoneVerified: detail.phoneVerified,
    lastLogin: detail.lastLoginAt ? formatDate(detail.lastLoginAt) : undefined,
    bookingsCount: detail.counts?.bookings,
    reviewsCount: detail.counts?.reviews,
    associatedBusiness: detail.business
      ? {
          id: detail.business.id,
          name: detail.business.businessName,
          status: detail.business.status,
          city: detail.business.city,
          createdAt: detail.business.createdAt
            ? formatDate(detail.business.createdAt)
            : undefined,
        }
      : undefined,
  };
}
