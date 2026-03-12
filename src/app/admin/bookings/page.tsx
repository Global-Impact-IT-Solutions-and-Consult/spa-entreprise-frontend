'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, type SelectOption } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  adminService,
  type AdminBookingListItem,
  type AdminBookingDetail,
  type BookingStats,
} from '@/services/admin.service';
import { BookingDetailsModal } from './modals/BookingDetailsModal';
import { CancelBookingModal } from './modals/CancelBookingModal';
import { Ban, Eye, RotateCcw } from 'lucide-react';
import { toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';

const PAGE_SIZE = 15;
const STATUS_OPTIONS: SelectOption[] = [
  { value: '', label: 'All Status' },
  { value: 'pending_payment', label: 'Pending Payment' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'expired', label: 'Expired' },
];

function formatAmount(n: number) {
  return '₦' + n.toLocaleString();
}

/** Format for Date & Time column: "Oct 18, 2023 • 14:30". Handles ISO, "YYYY-MM-DD", and "YYYY-MM-DD • HH:mm" from API. */
function formatDateTime(s: string | undefined) {
  if (!s || !s.trim()) return '—';
  const raw = s.trim();
  try {
    const d = new Date(raw);
    if (!Number.isNaN(d.getTime())) {
      const date = d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
      const time = d.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
      return `${date} • ${time}`;
    }
    // Backend may send "2026-02-15 • 10:00" or "2026-02-15 10:00" – parse date and time parts
    const bullet = raw.indexOf(' • ');
    const space = raw.indexOf(' ');
    const sep = bullet >= 0 ? ' • ' : space >= 0 ? ' ' : null;
    if (sep) {
      const [datePart, timePart] = raw.split(sep);
      if (datePart) {
        const d2 = new Date(timePart ? `${datePart}T${timePart}` : datePart);
        if (!Number.isNaN(d2.getTime())) {
          const date = d2.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          });
          const time = timePart
            ? d2.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
              })
            : '—';
          return timePart ? `${date} • ${time}` : date;
        }
      }
    }
    // Try "YYYY-MM-DD" only
    const d3 = new Date(raw);
    if (!Number.isNaN(d3.getTime())) {
      return d3.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    }
    return raw;
  } catch {
    return raw;
  }
}

function statusDot(status: string) {
  switch ((status || '').toLowerCase()) {
    case 'confirmed':
      return 'bg-green-500';
    case 'completed':
      return 'bg-purple-500';
    case 'cancelled':
      return 'bg-red-500';
    case 'expired':
    case 'no_show':
      return 'bg-gray-500';
    default:
      return 'bg-gray-500';
  }
}

/** Pill background + text for Status (design: rounded pill with dot) */
function statusPillClass(status: string) {
  switch ((status || '').toLowerCase()) {
    case 'confirmed':
      return 'bg-green-100 text-green-700';
    case 'completed':
      return 'bg-purple-100 text-purple-700';
    case 'cancelled':
      return 'bg-red-100 text-red-700';
    case 'expired':
    case 'no_show':
      return 'bg-gray-100 text-gray-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
}

/** Pill background + text for Payment (design: light green/orange/red pills) */
function paymentPillClass(status: string) {
  switch ((status || '').toLowerCase()) {
    case 'successful':
    case 'paid':
      return 'bg-green-100 text-green-700';
    case 'refunded':
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-amber-100 text-amber-700';
  }
}

export default function AdminBookingsPage() {
  const [stats, setStats] = useState<BookingStats>({
    total: 0,
    pending: 0,
    completed: 0,
  });
  const [list, setList] = useState<AdminBookingListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [businessId, setBusinessId] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [businessOptions, setBusinessOptions] = useState<SelectOption[]>([
    { value: '', label: 'All Businesses' },
  ]);
  const [customerOptions, setCustomerOptions] = useState<SelectOption[]>([
    { value: '', label: 'All Customers' },
  ]);

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] =
    useState<AdminBookingDetail | null>(null);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(
    null,
  );

  const loadStats = useCallback(async () => {
    try {
      const s = await adminService.getBookingStats();
      setStats({
        total: s.total ?? 0,
        pending: s.pending ?? 0,
        completed: s.completed ?? 0,
        confirmed: s.confirmed,
        cancelled: s.cancelled,
        expired: s.expired,
      });
    } catch {
      setStats({ total: 0, pending: 0, completed: 0 });
      toaster.create({
        title: 'Error',
        description: 'Failed to load booking statistics.',
        type: 'error',
      });
    }
  }, []);

  const loadBookings = useCallback(async () => {
    setLoading(true);
    try {
      const params: {
        page: number;
        limit: number;
        sortBy: 'newest';
        status?: string;
        dateFrom?: string;
        dateTo?: string;
        businessId?: string;
        customerId?: string;
      } = { page, limit: PAGE_SIZE, sortBy: 'newest' };
      if (statusFilter) params.status = statusFilter;
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;
      if (businessId) params.businessId = businessId;
      if (customerId) params.customerId = customerId;
      const res = await adminService.getBookings(params);
      setList(res.data || []);
      setTotal(res.pagination?.total ?? 0);
    } catch {
      setList([]);
      setTotal(0);
      toaster.create({
        title: 'Error',
        description: 'Failed to load bookings.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, dateFrom, dateTo, businessId, customerId]);

  useEffect(() => {
    loadStats();
    Promise.all([
      adminService.getAllBusinesses({
        page: 1,
        limit: 100,
        sortBy: 'name_asc',
      }),
      adminService.getUsers({
        page: 1,
        limit: 100,
        role: 'customer',
      }),
    ])
      .then(([businesses, users]) => {
        setBusinessOptions([
          { value: '', label: 'All Businesses' },
          ...(businesses.data || []).map((business) => ({
            value: business.id,
            label: business.businessName,
          })),
        ]);
        setCustomerOptions([
          { value: '', label: 'All Customers' },
          ...(users.data || []).map((user) => ({
            value: user.id,
            label:
              `${user.firstName || ''} ${user.lastName || ''}`.trim() ||
              user.email,
          })),
        ]);
      })
      .catch(() => {
        setBusinessOptions([{ value: '', label: 'All Businesses' }]);
        setCustomerOptions([{ value: '', label: 'All Customers' }]);
      });
  }, [loadStats]);
  useEffect(() => {
    void loadBookings();
  }, [loadBookings]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const openDetails = async (item: AdminBookingListItem) => {
    try {
      const detail = await adminService.getBookingDetail(item.id);
      setSelectedBooking(detail);
      setDetailsOpen(true);
    } catch {
      toaster.create({
        title: 'Error',
        description: 'Could not load booking details.',
        type: 'error',
      });
    }
  };

  const openCancel = (item: AdminBookingListItem) => {
    setSelectedBookingId(item.id);
    setCancelOpen(true);
  };

  const handleCancelConfirm = async (reason: string, notify: boolean) => {
    if (!selectedBookingId) return;
    try {
      await adminService.cancelBooking(selectedBookingId, {
        reason,
        notifyCustomerAndBusiness: notify,
      });
      toaster.create({
        title: 'Booking cancelled',
        description: 'The booking has been cancelled.',
        type: 'success',
      });
      setSelectedBookingId(null);
      loadBookings();
      loadStats();
    } catch (error: unknown) {
      const responseMessage =
        error &&
        typeof error === 'object' &&
        'response' in error &&
        error.response &&
        typeof error.response === 'object' &&
        'data' in error.response &&
        error.response.data &&
        typeof error.response.data === 'object' &&
        'message' in error.response.data
          ? error.response.data.message
          : undefined;
      const msg = Array.isArray(responseMessage)
        ? String(responseMessage[0] || 'Failed to cancel booking.')
        : typeof responseMessage === 'string'
          ? responseMessage
          : error instanceof Error
            ? error.message
            : 'Failed to cancel booking.';
      toaster.create({ title: 'Error', description: msg, type: 'error' });
      throw error;
    }
  };

  const resetFilters = () => {
    setStatusFilter('');
    setDateFrom('');
    setDateTo('');
    setBusinessId('');
    setCustomerId('');
    setPage(1);
  };

  return (
    <div className="p-6 md:p-8">
      {/* Title/subtitle left, stat cards top right (match User Management & Service Categories) */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Bookings Management
          </h1>
          <p className="text-gray-600 mt-1">
            View and manage all bookings across the platform.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-4 shrink-0">
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardContent className="p-4">
              <p className="text-sm text-gray-500">Total Bookings</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.total.toLocaleString()}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardContent className="p-4">
              <p className="text-sm text-gray-500">Pending</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.pending?.toLocaleString() ?? '0'}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardContent className="p-4">
              <p className="text-sm text-gray-500">Completed</p>
              <p className="text-2xl font-bold text-green-600">
                {stats.completed?.toLocaleString() ?? '0'}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-medium text-gray-700">Status</Label>
            <Select
              options={STATUS_OPTIONS}
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-[160px]"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-medium text-gray-700">
              Date From
            </Label>
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-[140px]"
              title="DD / MM / YYYY"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-medium text-gray-700">Date To</Label>
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-[140px]"
              title="DD / MM / YYYY"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-medium text-gray-700">
              Business
            </Label>
            <Select
              options={businessOptions}
              value={businessId}
              onChange={(e) => {
                setBusinessId(e.target.value);
                setPage(1);
              }}
              className="w-[140px]"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-medium text-gray-700">
              Customers
            </Label>
            <Select
              options={customerOptions}
              value={customerId}
              onChange={(e) => {
                setCustomerId(e.target.value);
                setPage(1);
              }}
              className="w-[140px]"
            />
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="text-[#9333EA] hover:text-[#7e22ce] hover:bg-[#9333EA]/10"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset Filters
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-medium">
              <tr>
                <th className="px-4 py-3">Booking ID</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Business/SPA</th>
                <th className="px-4 py-3">Service</th>
                <th className="px-4 py-3">Date & Time</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    Loading...
                  </td>
                </tr>
              ) : list.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    No bookings found.
                  </td>
                </tr>
              ) : (
                list.map((row, index) => (
                  <tr
                    key={row.id}
                    className={cn(
                      'hover:bg-gray-50',
                      index % 2 === 1 && 'bg-gray-50/50',
                    )}
                  >
                    <td className="px-4 py-3 font-medium text-gray-900">
                      #BK-{row.id.slice(0, 8).toUpperCase()}
                    </td>
                    <td className="px-4 py-3 text-gray-900">
                      {row.customerName}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {row.businessName}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {row.serviceName}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {formatDateTime(row.dateTime || row.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-gray-900">
                      {formatAmount(row.amount)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium capitalize',
                          statusPillClass(row.status),
                        )}
                      >
                        <span
                          className={cn(
                            'h-1.5 w-1.5 rounded-full shrink-0',
                            statusDot(row.status),
                          )}
                        />
                        {row.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          'inline-flex rounded-full px-2.5 py-1 text-xs font-medium',
                          paymentPillClass(row.paymentStatus),
                        )}
                      >
                        {row.paymentStatus === 'successful' ||
                        row.paymentStatus === 'paid'
                          ? 'Paid'
                          : row.paymentStatus === 'refunded'
                            ? 'Refunded'
                            : 'Unpaid'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => openDetails(row)}
                          className="p-2 rounded-lg text-[#9333EA] hover:bg-[#9333EA]/10"
                          title="View"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {!['cancelled', 'completed', 'expired'].includes(
                          row.status.toLowerCase(),
                        ) && (
                          <button
                            type="button"
                            onClick={() => openCancel(row)}
                            className="p-2 rounded-lg text-red-600 hover:bg-red-50"
                            title="Cancel booking"
                          >
                            <Ban className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50/50">
          <p className="text-sm text-gray-600">
            Showing {(page - 1) * PAGE_SIZE + 1} to{' '}
            {Math.min(page * PAGE_SIZE, total)} of {total.toLocaleString()}{' '}
            bookings
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              ‹
            </Button>
            {Array.from(
              { length: Math.min(4, totalPages) },
              (_, i) => i + 1,
            ).map((p) => (
              <Button
                key={p}
                variant={page === p ? 'default' : 'outline'}
                size="icon"
                className={`h-8 w-8 ${page === p ? 'bg-[#9333EA] hover:bg-[#7e22ce]' : ''}`}
                onClick={() => setPage(p)}
              >
                {p}
              </Button>
            ))}
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              ›
            </Button>
          </div>
        </div>
      </Card>

      <BookingDetailsModal
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        booking={selectedBooking}
      />
      <CancelBookingModal
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        bookingId={selectedBookingId}
        onConfirm={handleCancelConfirm}
      />
    </div>
  );
}
