'use client';

import { useEffect, useState } from 'react';
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
import { Eye, RotateCcw } from 'lucide-react';
import { toaster } from '@/components/ui/toaster';

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

function formatDate(s: string) {
  if (!s) return '—';
  try {
    const d = new Date(s);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return s;
  }
}

function statusColor(status: string) {
  switch ((status || '').toLowerCase()) {
    case 'confirmed':
      return 'text-green-600';
    case 'completed':
      return 'text-purple-600';
    case 'cancelled':
      return 'text-red-600';
    case 'expired':
    case 'no_show':
      return 'text-gray-600';
    default:
      return 'text-gray-600';
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

function paymentColor(status: string) {
  switch ((status || '').toLowerCase()) {
    case 'successful':
    case 'paid':
      return 'text-green-600';
    case 'refunded':
      return 'text-red-600';
    default:
      return 'text-amber-600';
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

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] =
    useState<AdminBookingDetail | null>(null);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(
    null,
  );

  const loadStats = async () => {
    try {
      const s = await adminService.getBookingStats();
      setStats({
        total: s.total ?? 0,
        pending: s.pending ?? 0,
        completed: s.completed ?? 0,
        confirmed: (s as any).confirmed,
        cancelled: (s as any).cancelled,
        expired: (s as any).expired,
      });
    } catch {
      setStats({ total: 0, pending: 0, completed: 0 });
      toaster.create({
        title: 'Error',
        description: 'Failed to load booking statistics.',
        type: 'error',
      });
    }
  };

  const loadBookings = async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: PAGE_SIZE, sortBy: 'newest' };
      if (statusFilter) params.status = statusFilter;
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;
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
  };

  useEffect(() => {
    loadStats();
  }, []);
  useEffect(() => {
    loadBookings();
  }, [page, statusFilter, dateFrom, dateTo]);

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
    } catch (e: any) {
      const raw = e.response?.data?.message;
      const msg = Array.isArray(raw)
        ? raw[0] || 'Failed to cancel booking.'
        : raw || e.message || 'Failed to cancel booking.';
      toaster.create({ title: 'Error', description: msg, type: 'error' });
      throw e;
    }
  };

  const resetFilters = () => {
    setStatusFilter('');
    setDateFrom('');
    setDateTo('');
    setPage(1);
  };

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Bookings Management
        </h1>
        <p className="text-gray-600 mt-1">
          View and manage all bookings across the platform.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card className="bg-white border-gray-200">
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Total Bookings</p>
            <p className="text-2xl font-bold text-gray-900">
              {stats.total.toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-white border-gray-200">
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Pending</p>
            <p className="text-2xl font-bold text-blue-600">
              {stats.pending?.toLocaleString() ?? '0'}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-white border-gray-200">
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Completed</p>
            <p className="text-2xl font-bold text-green-600">
              {stats.completed?.toLocaleString() ?? '0'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="bg-gray-100 border border-gray-200 rounded-lg p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Status</span>
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
          <div className="flex items-center gap-2">
            <Label className="text-sm font-medium text-gray-700 whitespace-nowrap">
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
          <div className="flex items-center gap-2">
            <Label className="text-sm font-medium text-gray-700 whitespace-nowrap">
              Date To
            </Label>
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-[140px]"
              title="DD / MM / YYYY"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Business</span>
            <Select
              options={[{ value: '', label: 'All Business...' }]}
              value=""
              onChange={() => {}}
              className="w-[140px]"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Customers</span>
            <Select
              options={[{ value: '', label: 'All Custom...' }]}
              value=""
              onChange={() => {}}
              className="w-[140px]"
            />
          </div>
          <Button variant="outline" size="sm" onClick={resetFilters}>
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
                list.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50">
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
                      {row.dateTime || formatDate(row.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-gray-900">
                      {formatAmount(row.amount)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 text-sm font-medium capitalize ${statusColor(row.status)}`}
                      >
                        <span
                          className={`h-2 w-2 rounded-full shrink-0 ${statusDot(row.status)}`}
                        />
                        {row.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-sm font-medium ${paymentColor(row.paymentStatus)}`}
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
                      <button
                        type="button"
                        onClick={() => openDetails(row)}
                        className="p-2 rounded-lg text-gray-500 hover:bg-gray-100"
                        title="View"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {row.status !== 'cancelled' &&
                        row.status !== 'completed' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-amber-600 hover:text-amber-700"
                            onClick={() => openCancel(row)}
                          >
                            Cancel
                          </Button>
                        )}
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
