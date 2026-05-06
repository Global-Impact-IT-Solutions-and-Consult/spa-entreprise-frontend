'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  adminService,
  type DashboardResponse,
  type DashboardPlatformGrowth,
} from '@/services/admin.service';
import { Card, CardContent } from '@/components/ui/card';
import {
  Building2,
  Users,
  DollarSign,
  Calendar,
  FolderOpen,
  FileText,
  Download,
  CheckCircle,
  UserX,
  UserPlus,
  UserCheck,
  Settings,
  AlertCircle,
  RefreshCw,
  XCircle,
} from 'lucide-react';

function formatRelativeTime(iso: string): string {
  try {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 1) return 'Just Now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1)
      return (
        'Yesterday, ' +
        d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      );
    if (diffDays < 7)
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

function initialsFromEmail(email: string): string {
  const part = email.split('@')[0] || '';
  const segments = part.replace(/[._-]/g, ' ').trim().split(/\s+/);
  if (segments.length >= 2)
    return (segments[0][0] + segments[1][0]).toUpperCase().slice(0, 2);
  return part.slice(0, 2).toUpperCase() || '?';
}

function roleLabel(role: string): string {
  if (role === 'business') return 'Business Owner';
  if (role === 'admin') return 'Admin';
  return 'Customer';
}

function formatRevenue(n: number): string {
  if (n >= 1_000_000) return '₦' + (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return '₦' + (n / 1_000).toFixed(1) + 'K';
  return '₦' + n;
}

type GrowthPeriod = '7d' | '30d' | '90d';

function PlatformGrowthChart({
  data,
}: {
  data: DashboardPlatformGrowth | null | undefined;
}) {
  if (!data || !data.labels?.length) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500 text-sm">
        No growth data available
      </div>
    );
  }
  const maxVal = Math.max(
    ...(data.users || [0]),
    ...(data.bookings || [0]),
    ...(data.businesses || [0]),
    1,
  );
  const toY = (v: number) => 85 - (v / maxVal) * 75;
  const points = (arr: number[]) =>
    arr
      .map((v, i) => 10 + (i / (arr.length - 1 || 1)) * 80 + ',' + toY(v))
      .join(' ');
  return (
    <div className="w-full h-64">
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="w-full h-full"
      >
        {data.users?.length ? (
          <polyline
            fill="none"
            stroke="#3B82F6"
            strokeWidth="0.5"
            points={points(data.users)}
          />
        ) : null}
        {data.bookings?.length ? (
          <polyline
            fill="none"
            stroke="#22c55e"
            strokeWidth="0.5"
            points={points(data.bookings)}
          />
        ) : null}
        {data.businesses?.length ? (
          <polyline
            fill="none"
            stroke="#EF4444"
            strokeWidth="0.5"
            points={points(data.businesses)}
          />
        ) : null}
      </svg>
      <div className="flex gap-4 mt-2 text-xs text-gray-500">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-blue-500" /> Users
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-green-500" /> Bookings
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-red-500" /> Businesses
        </span>
      </div>
    </div>
  );
}

function ActivityIcon({ type }: { type: string }) {
  const t = type?.toLowerCase();
  switch (t) {
    case 'approval':
    case 'approved':
      return <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />;
    case 'suspended':
    case 'suspend':
      return <UserX className="h-4 w-4 text-red-500 shrink-0" />;
    case 'unsuspended':
      return <UserCheck className="h-4 w-4 text-green-500 shrink-0" />;
    case 'rejection':
    case 'rejected':
      return <XCircle className="h-4 w-4 text-red-500 shrink-0" />;
    case 'booking':
      return <Calendar className="h-4 w-4 text-blue-500 shrink-0" />;
    case 'registration':
    case 'register':
      return <UserPlus className="h-4 w-4 text-blue-500 shrink-0" />;
    case 'category':
    case 'system':
      return <Settings className="h-4 w-4 text-purple-500 shrink-0" />;
    case 'payment':
    case 'dispute':
      return <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />;
    default:
      return <RefreshCw className="h-4 w-4 text-gray-500 shrink-0" />;
  }
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [revenue, setRevenue] = useState<number | null>(null);
  const [systemHealthy, setSystemHealthy] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [growthPeriod, setGrowthPeriod] = useState<GrowthPeriod>('7d');
  const [growthChartLoading, setGrowthChartLoading] = useState(false);
  const hasLoadedDashboard = useRef(false);

  // Initial load: dashboard (with default 7d period) + payment stats
  useEffect(() => {
    let cancelled = false;
    const loadDashboard = async () => {
      setLoading(true);
      setError(null);
      try {
        const [dashboard, paymentStats, health] = await Promise.all([
          adminService.getDashboard({ period: '7d' }),
          adminService.getPaymentStats().catch(() => null),
          adminService.getSystemHealth().catch(() => null),
        ]);

        if (cancelled) return;
        setData(dashboard);
        hasLoadedDashboard.current = true;
        setRevenue(
          paymentStats && typeof paymentStats.totalRevenue === 'number'
            ? paymentStats.totalRevenue
            : null,
        );
        setSystemHealthy(health?.status === 'ok');
      } catch (e: unknown) {
        if (cancelled) return;
        const msg =
          e && typeof e === 'object' && e !== null && 'response' in e
            ? (e as { response?: { data?: { message?: string } } }).response
                ?.data?.message
            : e instanceof Error
              ? e.message
              : undefined;
        setError(msg || 'Failed to load dashboard');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void loadDashboard();
    return () => {
      cancelled = true;
    };
  }, []);

  // When user changes period tab, refetch dashboard with ?period=7d|30d|90d
  useEffect(() => {
    if (!hasLoadedDashboard.current) return;
    let cancelled = false;
    setGrowthChartLoading(true);
    adminService
      .getDashboard({ period: growthPeriod })
      .then((dashboard) => {
        if (!cancelled) setData(dashboard);
      })
      .catch(() => {
        if (!cancelled) {
          // Keep previous data; period switch failed
        }
      })
      .finally(() => {
        if (!cancelled) setGrowthChartLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [growthPeriod]);

  if (loading && !data) {
    return (
      <div className="p-6 md:p-8 flex items-center justify-center min-h-[400px]">
        <p className="text-gray-500">Loading dashboard…</p>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="p-6 md:p-8">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  const metrics = data?.metrics;
  const recentActivity = data?.recentActivity;
  const quickActions = data?.quickActions ?? [];
  const platformGrowth = data?.platformGrowth ?? null;
  const activityFeed = data?.activityFeed ?? [];
  const registrations = recentActivity?.registrations ?? [];
  const totalBusinesses = metrics?.totalBusinesses ?? 0;
  const totalUsers = metrics?.totalUsers ?? 0;
  const totalBookings = metrics?.totalBookings ?? 0;

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Dashboard Overview
        </h1>
        <p className="text-gray-600 mt-1">
          Welcome back! Here&apos;s what&apos;s happening with your platform
          today.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="border-0 shadow-sm bg-[#F5F3FF]">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Business</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {totalBusinesses.toLocaleString()}
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-[#9333EA] flex items-center justify-center">
                <Building2 className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-sky-50">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {totalUsers.toLocaleString()}
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-blue-500 flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-[#ECFDF5]">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Monthly Revenue</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {revenue != null && typeof revenue === 'number'
                    ? formatRevenue(revenue)
                    : '—'}
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-emerald-600 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-[#FDF2F8]">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Bookings</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {(totalBookings ?? 0).toLocaleString()}
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-pink-500 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Platform Growth</h3>
              <div className="flex gap-1">
                {(['7d', '30d', '90d'] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setGrowthPeriod(p)}
                    disabled={growthChartLoading}
                    className={
                      'px-3 py-1.5 text-sm rounded-lg ' +
                      (growthPeriod === p
                        ? 'bg-[#9333EA] text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200')
                    }
                  >
                    {p === '7d'
                      ? '7 Days'
                      : p === '30d'
                        ? '30 Days'
                        : '90 Days'}
                  </button>
                ))}
              </div>
            </div>
            <div className="relative min-h-[200px]">
              {growthChartLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10 rounded">
                  <p className="text-sm text-gray-500">Loading…</p>
                </div>
              )}
              <PlatformGrowthChart data={platformGrowth} />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              {quickActions.length > 0 ? (
                quickActions.map((action, i) => {
                  const isApprove = action.label
                    .toLowerCase()
                    .includes('approve');
                  const Icon = isApprove
                    ? FolderOpen
                    : action.label.toLowerCase().includes('categor')
                      ? FileText
                      : Download;
                  const href = isApprove ? '/admin/businesses' : action.url;
                  const subtext =
                    typeof action.count === 'number'
                      ? isApprove
                        ? action.count + ' Pending'
                        : action.count + ' items'
                      : 'Open';
                  return (
                    <Link
                      key={action.url + String(i)}
                      href={href}
                      className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                        <Icon className="h-5 w-5 text-gray-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900">
                          {action.label}
                        </p>
                        <p className="text-sm text-gray-500">{subtext}</p>
                      </div>
                    </Link>
                  );
                })
              ) : (
                <>
                  <Link
                    href="/admin/businesses"
                    className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50"
                  >
                    <FolderOpen className="h-5 w-5 text-gray-600" />
                    <div>
                      <p className="font-medium text-gray-900">
                        Approve Businesses
                      </p>
                      <p className="text-sm text-gray-500">
                        {(metrics?.pendingApprovals ?? 0) +
                          ' Pending Approvals'}
                      </p>
                    </div>
                  </Link>
                  <Link
                    href="/admin/payments"
                    className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50"
                  >
                    <DollarSign className="h-5 w-5 text-gray-600" />
                    <div>
                      <p className="font-medium text-gray-900">View Payments</p>
                      <p className="text-sm text-gray-500">
                        Monitor transactions and revenue
                      </p>
                    </div>
                  </Link>
                  <Link
                    href="/admin/categories"
                    className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50"
                  >
                    <FileText className="h-5 w-5 text-gray-600" />
                    <div>
                      <p className="font-medium text-gray-900">
                        Manage Categories
                      </p>
                      <p className="text-sm text-gray-500">
                        Edit service categories
                      </p>
                    </div>
                  </Link>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">
                Recent User Registration
              </h3>
              <Link
                href="/admin/users"
                className="text-sm text-[#9333EA] hover:underline"
              >
                view all
              </Link>
            </div>
            <div className="space-y-3">
              {registrations.length > 0 ? (
                registrations.slice(0, 5).map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50"
                  >
                    <div className="h-10 w-10 rounded-full bg-[#9333EA] text-white flex items-center justify-center text-sm font-medium shrink-0">
                      {initialsFromEmail(r.email)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {r.firstName && r.lastName
                          ? r.firstName + ' ' + r.lastName
                          : r.email}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {r.email}
                        {roleLabel(r.role) ? ' • ' + roleLabel(r.role) : ''}
                      </p>
                    </div>
                    <div className="shrink-0 text-right flex flex-col items-end gap-1">
                      <p className="text-xs text-gray-500">
                        {formatRelativeTime(r.createdAt)}
                      </p>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                        Active
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 py-4">
                  No recent registrations.
                  {registrations.length === 0 && activityFeed.length === 0 ? (
                    <span className="block mt-1 text-xs text-gray-400">
                      Backend can populate{' '}
                      <code className="bg-gray-100 px-1 rounded">
                        recentActivity.registrations
                      </code>{' '}
                      in GET /admin/dashboard.
                    </span>
                  ) : null}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">
                Recent Activity Feed
              </h3>
              <Link
                href="/admin/logs"
                className="text-sm text-[#9333EA] hover:underline"
              >
                see all activity
              </Link>
            </div>
            <div className="space-y-3">
              {activityFeed.length > 0 ? (
                activityFeed.slice(0, 5).map((item, i) => (
                  <div
                    key={item.id + String(i)}
                    className="flex gap-3 p-2 rounded-lg hover:bg-gray-50"
                  >
                    <ActivityIcon type={item.type} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{item.summary}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {formatRelativeTime(item.date)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 py-4">
                  No recent activity.
                  {activityFeed.length === 0 && registrations.length === 0 ? (
                    <span className="block mt-1 text-xs text-gray-400">
                      Backend can populate{' '}
                      <code className="bg-gray-100 px-1 rounded">
                        activityFeed
                      </code>{' '}
                      in GET /admin/dashboard.
                    </span>
                  ) : null}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="border-t border-gray-200 pt-4 flex flex-wrap items-center justify-between gap-2 text-sm text-gray-500">
        <p>
          Wellness Beauty Admin Portal • Last updated:{' '}
          {new Date().toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
        <p
          className={`flex items-center gap-1.5 ${
            systemHealthy === false ? 'text-red-600' : 'text-green-600'
          }`}
        >
          <span
            className={`h-2 w-2 rounded-full ${
              systemHealthy === false ? 'bg-red-500' : 'bg-green-500'
            }`}
          />
          System Status:{' '}
          {systemHealthy === false ? 'Service Degraded' : 'Operational'}
        </p>
      </div>
    </div>
  );
}
