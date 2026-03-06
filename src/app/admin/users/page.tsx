'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useAdminHeader } from '@/contexts/AdminHeaderContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, type SelectOption } from '@/components/ui/select';
import { AdminUser, STATUS_LABELS } from './types';
import { mapUserListItem, mapUserDetail } from './apiMappers';
import { adminService } from '@/services/admin.service';
import { normalizeApiMessage } from '@/lib/api';
import { UserDetailsModal } from './modals/UserDetailsModal';
import {
  CreateUserModal,
  type CreateUserFormData,
} from './modals/CreateUserModal';
import { EditUserModal, type EditUserFormData } from './modals/EditUserModal';
import { SuspendUserModal } from './modals/SuspendUserModal';
import { UnsuspendUserModal } from './modals/UnsuspendUserModal';
import { DeleteUserModal } from './modals/DeleteUserModal';
import { PermanentDeleteModal } from './modals/PermanentDeleteModal';
import {
  UserPlus,
  Upload,
  Eye,
  Pencil,
  CheckCircle,
  Ban,
  Trash2,
  RotateCcw,
} from 'lucide-react';
import { toaster } from '@/components/ui/toaster';

const PAGE_SIZE = 15;
const STATUS_OPTIONS: SelectOption[] = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'inactive', label: 'Inactive' },
];
const SORT_OPTIONS: SelectOption[] = [
  { value: 'name_asc', label: 'Name A-Z' },
  { value: 'name_desc', label: 'Name Z-A' },
  { value: 'date_desc', label: 'Newest first' },
  { value: 'date_asc', label: 'Oldest first' },
];

export default function AdminUsersPage() {
  const { setHeaderActions } = useAdminHeader();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [stats, setStats] = useState({ total: 0, active: 0, suspended: 0 });
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name_asc');
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchParam, setSearchParam] = useState('');
  const [totalFromApi, setTotalFromApi] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [suspendOpen, setSuspendOpen] = useState(false);
  const [unsuspendOpen, setUnsuspendOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [permanentDeleteOpen, setPermanentDeleteOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      const data = await adminService.getUsersStatistics();
      setStats({
        total: data.total,
        active: data.active,
        suspended: data.suspended,
      });
    } catch {
      // keep previous stats on error
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminService.getUsers({
        page,
        limit: PAGE_SIZE,
        search: searchParam.trim() || undefined,
        status: statusFilter === 'all' ? undefined : statusFilter,
      });
      setUsers(res.data.map(mapUserListItem));
      setTotalFromApi(res.pagination?.total ?? res.data.length);
    } catch (e: unknown) {
      const msg =
        e && typeof e === 'object' && 'response' in e
          ? normalizeApiMessage(
              (e as { response?: { data?: { message?: unknown } } }).response
                ?.data?.message,
            )
          : 'Failed to load users';
      setError(msg);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [page, searchParam, statusFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    setHeaderActions(
      <>
        <Button
          className="bg-[#9333EA] hover:bg-[#7e22ce] text-white"
          onClick={() => setCreateOpen(true)}
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Create User
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            toaster.create({
              title: 'Export',
              description: 'Export is not yet provided by the backend.',
              type: 'info',
            })
          }
        >
          <Upload className="h-4 w-4 mr-2" />
          Export
        </Button>
      </>,
    );
    return () => setHeaderActions(null);
  }, [setHeaderActions]);

  const totalPages = Math.max(1, Math.ceil(totalFromApi / PAGE_SIZE));
  const paginatedUsers = useMemo(() => {
    let list = [...users];
    if (sortBy === 'name_asc')
      list.sort((a, b) =>
        `${a.firstName} ${a.lastName}`.localeCompare(
          `${b.firstName} ${b.lastName}`,
        ),
      );
    if (sortBy === 'name_desc')
      list.sort((a, b) =>
        `${b.firstName} ${b.lastName}`.localeCompare(
          `${a.firstName} ${a.lastName}`,
        ),
      );
    if (sortBy === 'date_desc' || sortBy === 'date_asc') {
      list.sort((a, b) => {
        const d = (s: string) => new Date(s).getTime();
        return sortBy === 'date_desc'
          ? d(b.createdAt) - d(a.createdAt)
          : d(a.createdAt) - d(b.createdAt);
      });
    }
    return list;
  }, [users, sortBy]);

  useEffect(() => {
    if (!detailsOpen || !selectedUserId) return;
    setDetailsLoading(true);
    setSelectedUser(null);
    adminService
      .getUserDetail(selectedUserId)
      .then((detail) => setSelectedUser(mapUserDetail(detail)))
      .catch((e: unknown) => {
        const msg =
          e && typeof e === 'object' && 'response' in e
            ? normalizeApiMessage(
                (e as { response?: { data?: { message?: unknown } } }).response
                  ?.data?.message,
              )
            : 'Failed to load user details';
        toaster.create({ title: 'Error', description: msg, type: 'error' });
      })
      .finally(() => setDetailsLoading(false));
  }, [detailsOpen, selectedUserId]);

  const openDetails = (u: AdminUser) => {
    setSelectedUserId(u.id);
    setSelectedUser(null);
    setDetailsOpen(true);
  };
  const openEdit = (u: AdminUser) => {
    setSelectedUser(u);
    setEditOpen(true);
  };
  const openSuspend = (u: AdminUser) => {
    setSelectedUser(u);
    setSuspendOpen(true);
  };
  const openUnsuspend = (u: AdminUser) => {
    setSelectedUser(u);
    setUnsuspendOpen(true);
  };
  const openDelete = (u: AdminUser) => {
    setSelectedUser(u);
    setDeleteOpen(true);
  };
  const openPermanentDelete = (u: AdminUser) => {
    setSelectedUser(u);
    setPermanentDeleteOpen(true);
  };

  const handleCreateUser = (_data: CreateUserFormData) => {
    toaster.create({
      title: 'Not available',
      description: 'Create user is not yet provided by the backend.',
      type: 'info',
    });
  };

  const handleEditUser = (_userId: string, _data: EditUserFormData) => {
    setSelectedUser(null);
    toaster.create({
      title: 'Not available',
      description: 'Update user is not yet provided by the backend.',
      type: 'info',
    });
  };

  const handleSuspend = async (u: AdminUser, reason: string) => {
    try {
      await adminService.suspendUser(u.id, reason);
      setSelectedUser(null);
      setSuspendOpen(false);
      toaster.create({
        title: 'User suspended',
        description: reason || 'User has been suspended.',
        type: 'info',
      });
      fetchUsers();
      fetchStats();
    } catch (e: unknown) {
      const msg =
        e && typeof e === 'object' && 'response' in e
          ? normalizeApiMessage(
              (e as { response?: { data?: { message?: unknown } } }).response
                ?.data?.message,
            )
          : 'Failed to suspend user';
      toaster.create({ title: 'Error', description: msg, type: 'error' });
    }
  };

  const handleUnsuspend = async (u: AdminUser) => {
    try {
      await adminService.unsuspendUser(u.id);
      setSelectedUser(null);
      setUnsuspendOpen(false);
      toaster.create({
        title: 'User reactivated',
        description: 'User can access their account again.',
        type: 'success',
      });
      fetchUsers();
      fetchStats();
    } catch (e: unknown) {
      const msg =
        e && typeof e === 'object' && 'response' in e
          ? normalizeApiMessage(
              (e as { response?: { data?: { message?: unknown } } }).response
                ?.data?.message,
            )
          : 'Failed to unsuspend user';
      toaster.create({ title: 'Error', description: msg, type: 'error' });
    }
  };

  const handleSoftDelete = (_u: AdminUser) => {
    setSelectedUser(null);
    setDeleteOpen(false);
    toaster.create({
      title: 'Not available',
      description: 'Soft delete user is not yet provided by the backend.',
      type: 'info',
    });
  };

  const handlePermanentDelete = (_u: AdminUser) => {
    setSelectedUser(null);
    setPermanentDeleteOpen(false);
    toaster.create({
      title: 'Not available',
      description: 'Permanent delete user is not yet provided by the backend.',
      type: 'info',
    });
  };

  const resetFilters = () => {
    setStatusFilter('all');
    setSortBy('name_asc');
    setPage(1);
    setSearchQuery('');
    setSearchParam('');
  };

  const submitSearch = () => {
    setSearchParam(searchQuery);
    setPage(1);
  };

  const onDetailsOpenChange = (open: boolean) => {
    setDetailsOpen(open);
    if (!open) setSelectedUserId(null);
  };

  return (
    <div className="p-6 md:p-8">
      {/* Header left, stat cards right */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            User Management
          </h1>
          <p className="text-gray-600 mt-1">
            Manage all users across the platform.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-4 shrink-0">
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardContent className="p-4">
              <p className="text-sm text-gray-500">Total users</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </CardContent>
          </Card>
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardContent className="p-4">
              <p className="text-sm text-gray-500">Active</p>
              <p className="text-2xl font-bold text-green-600">
                {stats.active}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardContent className="p-4">
              <p className="text-sm text-gray-500">Suspended</p>
              <p className="text-2xl font-bold text-red-600">
                {stats.suspended}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Filter/sort in white panel */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm p-4 mb-6">
        <div className="flex flex-wrap items-end gap-4">
          <input
            type="search"
            placeholder="Search by name, email…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submitSearch()}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm w-56 focus:outline-none focus:ring-2 focus:ring-[#9333EA]"
          />
          <Button variant="outline" size="sm" onClick={submitSearch}>
            Search
          </Button>
          <div className="flex flex-col gap-1.5">
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
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-gray-700">Sort By</span>
            <Select
              options={SORT_OPTIONS}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-[160px]"
            />
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="text-[#9333EA] hover:text-[#7e22ce] hover:bg-[#9333EA]/10 ml-auto"
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
                <th className="px-4 py-3">User ID</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Created At</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-12 text-center text-gray-500"
                  >
                    Loading users…
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <p className="text-red-600 mb-2">{error}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fetchUsers()}
                    >
                      Retry
                    </Button>
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {u.userId}
                    </td>
                    <td className="px-4 py-3 text-gray-900">
                      {u.firstName} {u.lastName}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{u.email}</td>
                    <td className="px-4 py-3 text-gray-600">{u.phone}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 ${
                          u.status === 'active'
                            ? 'text-green-600'
                            : u.status === 'suspended'
                              ? 'text-amber-600'
                              : 'text-gray-600'
                        }`}
                      >
                        {u.status === 'active' && (
                          <span className="h-2 w-2 rounded-full bg-green-500" />
                        )}
                        {u.status === 'suspended' && (
                          <span className="h-2 w-2 rounded-full bg-amber-500" />
                        )}
                        {STATUS_LABELS[u.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{u.createdAt}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => openDetails(u)}
                          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                          title="View"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => openEdit(u)}
                          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        {u.status === 'suspended' ? (
                          <button
                            type="button"
                            onClick={() => openUnsuspend(u)}
                            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-green-600"
                            title="Unsuspend"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => openSuspend(u)}
                            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-amber-600"
                            title="Suspend"
                          >
                            <Ban className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => openDelete(u)}
                          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-red-600"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
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
            {Math.min(page * PAGE_SIZE, totalFromApi)} of {totalFromApi} users
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <span className="sr-only">Previous</span>
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
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .slice(0, 4)
              .map((p) => (
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
              <span className="sr-only">Next</span>
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
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Button>
          </div>
        </div>
      </Card>

      <UserDetailsModal
        open={detailsOpen}
        onOpenChange={onDetailsOpenChange}
        user={selectedUser}
        loading={detailsLoading}
        onEdit={openEdit}
        onSuspend={openSuspend}
      />
      <CreateUserModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSubmit={handleCreateUser}
      />
      <EditUserModal
        open={editOpen}
        onOpenChange={setEditOpen}
        user={selectedUser}
        onSave={handleEditUser}
      />
      <SuspendUserModal
        open={suspendOpen}
        onOpenChange={setSuspendOpen}
        user={selectedUser}
        onConfirm={handleSuspend}
      />
      <UnsuspendUserModal
        open={unsuspendOpen}
        onOpenChange={setUnsuspendOpen}
        user={selectedUser}
        onConfirm={handleUnsuspend}
      />
      <DeleteUserModal
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        user={selectedUser}
        onSoftDelete={handleSoftDelete}
        onHardDeleteClick={openPermanentDelete}
      />
      <PermanentDeleteModal
        open={permanentDeleteOpen}
        onOpenChange={setPermanentDeleteOpen}
        user={selectedUser}
        onConfirm={handlePermanentDelete}
      />
    </div>
  );
}
