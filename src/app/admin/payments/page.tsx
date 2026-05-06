'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, type SelectOption } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  adminService,
  type PaymentStats,
  type AdminPaymentListItem,
  type AdminPaymentDetail,
  type RevenueTrend,
  type PaymentMethodsDistribution,
} from '@/services/admin.service';
import { Eye, RotateCcw, TrendingUp, Clock, AlertCircle } from 'lucide-react';
import { toaster } from '@/components/ui/toaster';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const PAGE_SIZE = 15;
const STATUS_OPTIONS: SelectOption[] = [
  { value: '', label: 'All Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'successful', label: 'Success' },
  { value: 'failed', label: 'Failed' },
  { value: 'refunded', label: 'Refunded' },
];

function formatAmount(n: number) {
  return '₦' + n.toLocaleString();
}

function paymentStatusColor(s: string) {
  switch (s) {
    case 'successful':
      return 'text-green-600';
    case 'pending':
      return 'text-amber-600';
    case 'failed':
      return 'text-red-600';
    case 'refunded':
      return 'text-red-600';
    default:
      return 'text-gray-600';
  }
}

function escrowColor(s: string) {
  switch (s?.toLowerCase()) {
    case 'released':
    case 'success':
      return 'text-green-600';
    case 'held':
      return 'text-[#9333EA]';
    case 'refunded':
      return 'text-red-600';
    default:
      return 'text-gray-600';
  }
}

function formatDateTime(value: string) {
  try {
    return new Date(value).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return value;
  }
}

export default function AdminPaymentsPage() {
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [trend, setTrend] = useState<RevenueTrend | null>(null);
  const [methods, setMethods] = useState<PaymentMethodsDistribution | null>(
    null,
  );
  const [list, setList] = useState<AdminPaymentListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [trendPeriod, setTrendPeriod] = useState<'7d' | '30d' | '90d'>('7d');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedPayment, setSelectedPayment] = useState<AdminPaymentDetail | null>(
    null,
  );
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [s, t, m] = await Promise.all([
          adminService.getPaymentStats(),
          adminService.getPaymentTrend(trendPeriod),
          adminService.getPaymentMethods(),
        ]);
        setStats(s);
        setTrend(t);
        setMethods(m);
      } catch {
        setStats(null);
        setTrend(null);
        setMethods(null);
      }
    })();
  }, [trendPeriod]);

  useEffect(() => {
    setLoading(true);
    adminService
      .getPayments({
        page,
        limit: PAGE_SIZE,
        status: statusFilter || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        sortBy: 'newest',
      })
      .then((res) => {
        setList(res.data || []);
        setTotal(res.pagination?.total ?? 0);
      })
      .catch(() => {
        setList([]);
        setTotal(0);
        toaster.create({
          title: 'Error',
          description: 'Failed to load transactions.',
          type: 'error',
        });
      })
      .finally(() => setLoading(false));
  }, [page, statusFilter, dateFrom, dateTo]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const resetFilters = () => {
    setStatusFilter('');
    setDateFrom('');
    setDateTo('');
    setPage(1);
  };

  const maxRevenue = trend?.revenue?.length ? Math.max(...trend.revenue) : 1;

  const openPaymentDetails = async (paymentId: string) => {
    setDetailsLoading(true);
    setDetailsOpen(true);
    try {
      const detail = await adminService.getPaymentDetail(paymentId);
      setSelectedPayment(detail);
    } catch {
      setDetailsOpen(false);
      toaster.create({
        title: 'Error',
        description: 'Failed to load payment details.',
        type: 'error',
      });
    } finally {
      setDetailsLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Payments Management
        </h1>
        <p className="text-gray-600 mt-1">
          Monitor and manage all payment transactions, escrow status, and
          commissions.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="bg-[#9333EA] text-white border-0">
          <CardContent className="p-4">
            <p className="text-sm opacity-90">Total Revenue</p>
            <p className="text-2xl font-bold">
              {stats ? formatAmount(stats.totalRevenue) : '—'}
            </p>
            {stats?.revenuePercentChangeFromLastMonth != null && (
              <p className="text-sm mt-1 flex items-center gap-1">
                <TrendingUp className="h-4 w-4" />
                {stats.revenuePercentChangeFromLastMonth}% from last month
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Total Commission</p>
            <p className="text-2xl font-bold text-gray-900">
              {stats ? formatAmount(stats.totalCommission) : '—'}
            </p>
            <p className="text-sm text-gray-500">
              {stats?.commissionPercent ?? 10}% of total revenue
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Escrow Balance</p>
            <p className="text-2xl font-bold text-gray-900">
              {stats ? formatAmount(stats.escrowBalance) : '—'}
            </p>
            <p className="text-sm text-amber-600 flex items-center gap-1">
              <Clock className="h-4 w-4" /> Pending release
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Disputed Amount</p>
            <p className="text-2xl font-bold text-gray-900">
              {stats ? formatAmount(stats.disputedAmount) : '—'}
            </p>
            <p className="text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" /> {stats?.disputedCount ?? 0}{' '}
              disputes
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Revenue Trend</h3>
            <div className="flex gap-2 mb-4">
              {(['7d', '30d', '90d'] as const).map((p) => (
                <Button
                  key={p}
                  variant={trendPeriod === p ? 'default' : 'outline'}
                  size="sm"
                  className={
                    trendPeriod === p ? 'bg-[#9333EA] hover:bg-[#7e22ce]' : ''
                  }
                  onClick={() => setTrendPeriod(p)}
                >
                  {p === '7d' ? '7 Days' : p === '30d' ? '30 Days' : '90 Days'}
                </Button>
              ))}
            </div>
            <div className="flex items-end gap-1 h-32">
              {trend?.revenue?.map((val, i) => (
                <div
                  key={i}
                  className="flex-1 flex flex-col items-center gap-1"
                >
                  <div
                    className="w-full bg-[#9333EA]/20 rounded-t min-h-[4px]"
                    style={{ height: `${(val / maxRevenue) * 80}%` }}
                  />
                </div>
              ))}
            </div>
            {trend?.labels?.length ? (
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>{trend.labels[0]}</span>
                <span>{trend.labels[trend.labels.length - 1]}</span>
              </div>
            ) : null}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold text-gray-900 mb-3">
              Payment Methods
            </h3>
            <div className="flex items-center gap-6">
              <div
                className="h-24 w-24 rounded-full border-8 border-gray-200 flex items-center justify-center"
                style={{
                  borderColor: `conic-gradient(#14b8a6 0% ${methods?.card ?? 0}%, #f97316 ${methods?.card ?? 0}% ${(methods?.card ?? 0) + (methods?.bank_transfer ?? 0)}%, #3b82f6 ${(methods?.card ?? 0) + (methods?.bank_transfer ?? 0)}% 100%)`,
                }}
              />
              <div className="space-y-2 text-sm">
                {methods?.card != null && (
                  <p className="text-gray-600">Card: {methods.card}%</p>
                )}
                {methods?.bank_transfer != null && (
                  <p className="text-gray-600">
                    Bank Transfer: {methods.bank_transfer}%
                  </p>
                )}
                {methods?.mobile_money != null && (
                  <p className="text-gray-600">
                    Wallet: {methods.mobile_money}%
                  </p>
                )}
                {methods?.other != null && (
                  <p className="text-gray-600">Other: {methods.other}%</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap items-center gap-4 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Status</span>
          <Select
            options={STATUS_OPTIONS}
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="w-[140px]"
          />
        </div>
        <Label className="text-sm font-medium text-gray-700">Date From</Label>
        <Input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className="w-[140px]"
        />
        <Label className="text-sm font-medium text-gray-700">Date To</Label>
        <Input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className="w-[140px]"
        />
        <Button variant="outline" size="sm" onClick={resetFilters}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset Filters
        </Button>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-medium">
              <tr>
                <th className="px-4 py-3">Transaction ID</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Business/SPA</th>
                <th className="px-4 py-3">Method</th>
                <th className="px-4 py-3">Payment Status</th>
                <th className="px-4 py-3">Escrow</th>
                <th className="px-4 py-3">Date & Time</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    Loading...
                  </td>
                </tr>
              ) : list.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    No transactions found.
                  </td>
                </tr>
              ) : (
                list.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      #{row.transactionId?.slice(0, 12) || row.id.slice(0, 8)}
                    </td>
                    <td className="px-4 py-3 text-gray-900">
                      {row.customerName}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {row.businessName}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{row.method}</td>
                    <td
                      className={`px-4 py-3 font-medium ${paymentStatusColor(row.paymentStatus)}`}
                    >
                      {row.paymentStatus}
                    </td>
                    <td
                      className={`px-4 py-3 font-medium ${escrowColor(row.escrowStatus)}`}
                    >
                      {row.escrowStatus || '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{row.dateTime}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => openPaymentDetails(row.id)}
                        className="p-2 rounded-lg text-gray-500 hover:bg-gray-100"
                        title="View"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
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
            {Math.min(page * PAGE_SIZE, total)} of {total} transactions
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

      <Dialog
        open={detailsOpen}
        onOpenChange={(open) => {
          setDetailsOpen(open);
          if (!open) setSelectedPayment(null);
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Payment Details</DialogTitle>
            <DialogClose className="absolute right-4 top-4" />
          </DialogHeader>

          {detailsLoading ? (
            <div className="py-8 text-center text-gray-500">Loading payment…</div>
          ) : selectedPayment ? (
            <div className="space-y-4">
              <div className="rounded-lg border border-gray-200 p-4 space-y-2">
                <h4 className="text-sm font-semibold text-gray-900">
                  Transaction
                </h4>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Transaction ID:</span>{' '}
                  {selectedPayment.transactionId || selectedPayment.id}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Status:</span>{' '}
                  {selectedPayment.status}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Method:</span>{' '}
                  {selectedPayment.paymentMethod || '—'}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Amount:</span>{' '}
                  {formatAmount(selectedPayment.amount)} {selectedPayment.currency}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Created:</span>{' '}
                  {formatDateTime(selectedPayment.createdAt)}
                </p>
              </div>

              <div className="rounded-lg border border-gray-200 p-4 space-y-2">
                <h4 className="text-sm font-semibold text-gray-900">Customer</h4>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Name:</span>{' '}
                  {selectedPayment.customerName}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Email:</span>{' '}
                  {selectedPayment.customerEmail || '—'}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Phone:</span>{' '}
                  {selectedPayment.customerPhone || '—'}
                </p>
              </div>

              <div className="rounded-lg border border-gray-200 p-4 space-y-2">
                <h4 className="text-sm font-semibold text-gray-900">
                  Related Booking
                </h4>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Business:</span>{' '}
                  {selectedPayment.businessName}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Booking ID:</span>{' '}
                  {selectedPayment.bookingId || '—'}
                </p>
                {selectedPayment.errorMessage && (
                  <p className="text-sm text-red-600">
                    <span className="font-medium">Error:</span>{' '}
                    {selectedPayment.errorMessage}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-gray-500">
              No payment details available.
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
