'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, type SelectOption } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { adminService, type ActivityLogItem } from '@/services/admin.service';
import type { DashboardActivityFeedItem } from '@/services/admin.service';
import { toaster } from '@/components/ui/toaster';
import { RotateCcw, Search } from 'lucide-react';

function actionLabelFromType(type: string): string {
  const t = (type || '').toLowerCase();
  if (t === 'registration' || t === 'register') return 'User Registered';
  if (t === 'booking') return 'Booking';
  if (t === 'approval' || t === 'approved') return 'Business Approved';
  if (t === 'rejection' || t === 'rejected') return 'Business Rejected';
  if (t === 'suspended' || t === 'suspend') return 'User Suspended';
  if (t === 'unsuspended') return 'User Unsuspended';
  if (t === 'login') return 'Login';
  if (t === 'failed_login') return 'Failed Login';
  return type || 'Activity';
}

/** Map dashboard activityFeed item to table row when activity-logs endpoint is empty/unavailable */
function feedItemToLogItem(item: DashboardActivityFeedItem): ActivityLogItem {
  const meta = item.metadata || {};
  return {
    timestamp: item.date,
    admin: (meta.admin as string) || (meta.email as string) || 'System',
    action: actionLabelFromType(item.type) || item.summary,
    details: item.summary,
    ipAddress: (meta.ipAddress as string) || '—',
    status: 'success',
  };
}

const PAGE_SIZE = 15;
const ACTION_OPTIONS: SelectOption[] = [
  { value: '', label: 'All Action' },
  { value: 'user_created', label: 'User Created' },
  { value: 'user_suspended', label: 'User Suspended' },
  { value: 'business_approved', label: 'Business Approved' },
  { value: 'business_rejected', label: 'Business Rejected' },
  { value: 'login', label: 'Login' },
  { value: 'failed_login', label: 'Failed Login' },
];

function actionTagClass(action: string) {
  const a = (action || '').toLowerCase();
  if (a.includes('created') || a.includes('approved'))
    return 'bg-green-100 text-green-800';
  if (a.includes('suspended') || a.includes('rejected') || a.includes('failed'))
    return 'bg-red-100 text-red-800';
  if (a.includes('approval') || a.includes('business'))
    return 'bg-amber-100 text-amber-800';
  return 'bg-gray-100 text-gray-800';
}

function formatTimestamp(s: string) {
  try {
    const d = new Date(s);
    return d
      .toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'medium' })
      .replace(',', '');
  } catch {
    return s;
  }
}

export default function AdminLogsPage() {
  const [list, setList] = useState<ActivityLogItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [actionType, setActionType] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [search, setSearch] = useState('');
  const [fallbackFullList, setFallbackFullList] = useState<
    ActivityLogItem[] | null
  >(null);

  const hasFilters = !!(actionType || dateFrom || dateTo || search.trim());

  useEffect(() => {
    setLoading(true);
    // When we already have fallback data and only page changed (no filters), slice locally
    if (fallbackFullList !== null && !hasFilters) {
      const start = (page - 1) * PAGE_SIZE;
      setList(fallbackFullList.slice(start, start + PAGE_SIZE));
      setTotal(fallbackFullList.length);
      setLoading(false);
      return;
    }
    if (hasFilters) setFallbackFullList(null);

    adminService
      .getActivityLogs({
        page,
        limit: PAGE_SIZE,
        actionType: actionType || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        search: search.trim() || undefined,
      })
      .then((res) => {
        const data = res.data || [];
        const totalFromApi = res.pagination?.total ?? 0;
        if (data.length > 0 || totalFromApi > 0) {
          setList(data);
          setTotal(totalFromApi);
          setFallbackFullList(null);
          return;
        }
        // Dedicated endpoint returned empty; use dashboard activity feed as fallback (page 1, no filters)
        if (page === 1 && !hasFilters) {
          return adminService.getDashboard().then((d) => {
            const feed = d.activityFeed || [];
            const mapped = feed.map(feedItemToLogItem);
            setFallbackFullList(mapped);
            const start = (page - 1) * PAGE_SIZE;
            setList(mapped.slice(start, start + PAGE_SIZE));
            setTotal(mapped.length);
          });
        }
        setList([]);
        setTotal(0);
        setFallbackFullList(null);
      })
      .catch(() => {
        // Endpoint failed; try dashboard activity feed as fallback (page 1, no filters)
        if (page === 1 && !hasFilters) {
          adminService
            .getDashboard()
            .then((d) => {
              const feed = d.activityFeed || [];
              const mapped = feed.map(feedItemToLogItem);
              setFallbackFullList(mapped);
              const start = (page - 1) * PAGE_SIZE;
              setList(mapped.slice(start, start + PAGE_SIZE));
              setTotal(mapped.length);
              if (mapped.length === 0) {
                toaster.create({
                  title: 'Error',
                  description: 'Failed to load activity logs.',
                  type: 'error',
                });
              }
            })
            .catch(() => {
              setList([]);
              setTotal(0);
              toaster.create({
                title: 'Error',
                description: 'Failed to load activity logs.',
                type: 'error',
              });
            })
            .finally(() => setLoading(false));
          return;
        }
        setList([]);
        setTotal(0);
        toaster.create({
          title: 'Error',
          description: 'Failed to load activity logs.',
          type: 'error',
        });
      })
      .finally(() => setLoading(false));
  }, [page, actionType, dateFrom, dateTo, search]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const resetFilters = () => {
    setActionType('');
    setDateFrom('');
    setDateTo('');
    setSearch('');
    setPage(1);
  };

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Activity Logs
        </h1>
        <p className="text-gray-600 mt-1">
          Track all admin actions and system events.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-4 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Action Type</span>
          <Select
            options={ACTION_OPTIONS}
            value={actionType}
            onChange={(e) => {
              setActionType(e.target.value);
              setPage(1);
            }}
            className="w-[160px]"
          />
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-sm font-medium text-gray-700">Date From</Label>
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="w-[140px]"
          />
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-sm font-medium text-gray-700">Date To</Label>
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="w-[140px]"
          />
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 w-48"
          />
        </div>
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
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Admin</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Details</th>
                <th className="px-4 py-3">IP Address</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    Loading...
                  </td>
                </tr>
              ) : list.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    No activity logs found.
                  </td>
                </tr>
              ) : (
                list.map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                      {formatTimestamp(row.timestamp)}
                    </td>
                    <td className="px-4 py-3 text-gray-900">{row.admin}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${actionTagClass(row.action)}`}
                      >
                        {row.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 max-w-md truncate">
                      {row.details}
                    </td>
                    <td className="px-4 py-3 text-gray-600 font-mono text-xs">
                      {row.ipAddress ?? '—'}
                    </td>
                    <td
                      className={`px-4 py-3 font-medium ${row.status === 'success' ? 'text-green-600' : 'text-red-600'}`}
                    >
                      {row.status}
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
            {Math.min(page * PAGE_SIZE, total)} of {total} logs
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
    </div>
  );
}
