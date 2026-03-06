'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { AdminUser } from '../types';
import { Pencil, Ban } from 'lucide-react';
import Link from 'next/link';

interface UserDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: AdminUser | null;
  onEdit: (user: AdminUser) => void;
  onSuspend: (user: AdminUser) => void;
  loading?: boolean;
}

export function UserDetailsModal({
  open,
  onOpenChange,
  user,
  onEdit,
  onSuspend,
  loading = false,
}: UserDetailsModalProps) {
  if (!user && !loading) return null;

  const first = user?.firstName ?? '';
  const last = user?.lastName ?? '';
  const initials =
    [first, last]
      .map((s) => (s && String(s).charAt(0)) || '')
      .join('')
      .toUpperCase() || '?';
  const fullName = [first, last].filter(Boolean).join(' ') || 'Unknown';
  const roleLabel =
    user?.role === 'business_owner'
      ? 'Business Owner'
      : user?.role === 'admin'
        ? 'Admin'
        : 'Customer';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg sm:max-w-xl">
        {loading ? (
          <div className="py-12 text-center text-gray-500">
            Loading user details…
          </div>
        ) : user ? (
          <>
            <DialogHeader>
              <DialogClose
                onClick={() => onOpenChange(false)}
                className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </DialogClose>
              <DialogTitle className="text-xl font-bold text-gray-900 pr-8">
                User Details
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <Avatar className="h-14 w-14 rounded-full bg-[#9333EA] text-white text-lg font-semibold">
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {fullName}
                  </h3>
                  <div className="flex flex-wrap gap-2 mt-1">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                      {roleLabel}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-medium ${
                        user.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : user.status === 'suspended'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {user.status === 'active' && (
                        <span className="h-1.5 w-1.5 rounded-full bg-green-600" />
                      )}
                      {user.status === 'suspended' && (
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-600" />
                      )}
                      {user.status === 'active'
                        ? 'Active'
                        : user.status === 'suspended'
                          ? 'Suspended'
                          : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                <div>
                  <p className="text-gray-500">User ID</p>
                  <p className="font-semibold text-gray-900">{user.userId}</p>
                </div>
                <div>
                  <p className="text-gray-500">Email</p>
                  <p className="font-semibold">
                    <Link
                      href={`mailto:${user.email}`}
                      className="text-blue-600 hover:underline"
                    >
                      {user.email}
                    </Link>
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Phone</p>
                  <p className="font-semibold">
                    <Link
                      href={`tel:${user.phone}`}
                      className="text-blue-600 hover:underline"
                    >
                      {user.phone}
                    </Link>
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Email Verified</p>
                  <p className="font-semibold text-gray-900">
                    {user.emailVerified ? 'Yes' : 'No'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Phone Verified</p>
                  <p className="font-semibold text-gray-900">
                    {user.phoneVerified ? 'Yes' : 'No'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Created At</p>
                  <p className="font-semibold text-gray-900">
                    {user.createdAt}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Last Login</p>
                  <p className="font-semibold text-gray-900">
                    {user.lastLogin ?? '—'}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-gray-900 mb-3">
                  Activity Summary
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <p className="text-2xl font-bold text-gray-900">
                      {user.bookingsCount ?? 0}
                    </p>
                    <p className="text-sm text-gray-600">Bookings</p>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <p className="text-2xl font-bold text-gray-900">
                      {user.reviewsCount ?? 0}
                    </p>
                    <p className="text-sm text-gray-600">Reviews</p>
                  </div>
                </div>
              </div>

              {user.associatedBusiness && (
                <div>
                  <h4 className="text-sm font-bold text-gray-900 mb-3">
                    Associated Business
                  </h4>
                  <div className="border border-gray-200 rounded-lg p-4 space-y-2 text-sm">
                    <p className="font-semibold text-gray-900">
                      {user.associatedBusiness.name}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-green-500" />
                      <span className="text-gray-600">
                        {user.associatedBusiness.status}
                      </span>
                    </div>
                    <Link
                      href={`/admin/businesses?businessId=${encodeURIComponent(user.associatedBusiness.id)}`}
                      className="text-blue-600 hover:underline block"
                      onClick={() => onOpenChange(false)}
                    >
                      View Business
                    </Link>
                    <div className="grid grid-cols-2 gap-2 pt-2 text-gray-500">
                      <span>Business ID: {user.associatedBusiness.id}</span>
                      {user.associatedBusiness.city && (
                        <span>City: {user.associatedBusiness.city}</span>
                      )}
                      {user.associatedBusiness.createdAt && (
                        <span className="col-span-2">
                          Created On: {user.associatedBusiness.createdAt}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className="flex justify-end gap-2 pt-4 border-t">
              <Button
                type="button"
                variant="secondary"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              {user.status === 'active' && (
                <Button
                  type="button"
                  className="bg-amber-500 hover:bg-amber-600 text-white"
                  onClick={() => {
                    onOpenChange(false);
                    onSuspend(user);
                  }}
                >
                  <Ban className="h-4 w-4 mr-2" />
                  Suspend
                </Button>
              )}
              <Button
                type="button"
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => {
                  onOpenChange(false);
                  onEdit(user);
                }}
              >
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </DialogFooter>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
