'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { useAdminHeader } from '@/contexts/AdminHeaderContext';
import {
  adminService,
  type AdminAccount,
  type BanAdminAccountDto,
  type CreateAdminAccountDto,
  type SuspendAdminAccountDto,
  type UpdateAdminAccountDto,
} from '@/services/admin.service';
import { normalizeApiMessage } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toaster } from '@/components/ui/toaster';
import {
  Ban,
  CheckCircle,
  Clock,
  Lock,
  Pencil,
  ShieldCheck,
  Trash2,
  Unlock,
  UserPlus,
} from 'lucide-react';

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'inactive', label: 'Inactive' },
];

function formatDate(value?: string | null) {
  if (!value) return 'Never';
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function displayName(admin: AdminAccount) {
  const name = [admin.firstName, admin.lastName].filter(Boolean).join(' ');
  return name || admin.email;
}

function getApiError(error: unknown, fallback: string) {
  if (error && typeof error === 'object' && 'response' in error) {
    return normalizeApiMessage(
      (error as { response?: { data?: { message?: unknown } } }).response?.data
        ?.message,
    );
  }
  return fallback;
}

export default function AdminAccountsPage() {
  const { user } = useAuthStore();
  const { setHeaderActions } = useAdminHeader();
  const [admins, setAdmins] = useState<AdminAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [accessOpen, setAccessOpen] = useState(false);
  const [accessMode, setAccessMode] = useState<'suspend' | 'ban'>('suspend');
  const [selectedAdmin, setSelectedAdmin] = useState<AdminAccount | null>(null);

  const fetchAdmins = useCallback(async () => {
    if (!user?.isSuperAdmin) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await adminService.getAdmins();
      setAdmins(data);
    } catch (err) {
      setError(getApiError(err, 'Failed to load admins'));
      setAdmins([]);
    } finally {
      setLoading(false);
    }
  }, [user?.isSuperAdmin]);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  useEffect(() => {
    if (!user?.isSuperAdmin) {
      setHeaderActions(null);
      return;
    }

    setHeaderActions(
      <Button
        className="bg-[#9333EA] hover:bg-[#7e22ce] text-white"
        onClick={() => setCreateOpen(true)}
      >
        <UserPlus className="h-4 w-4 mr-2" />
        Create Admin
      </Button>,
    );

    return () => setHeaderActions(null);
  }, [setHeaderActions, user?.isSuperAdmin]);

  const stats = useMemo(
    () => ({
      total: admins.length,
      active: admins.filter((admin) => admin.status === 'active').length,
      superAdmins: admins.filter((admin) => admin.isSuperAdmin).length,
    }),
    [admins],
  );

  const handleCreate = async (data: CreateAdminAccountDto) => {
    try {
      await adminService.createAdmin(data);
      toaster.create({
        title: 'Admin created',
        description: 'The admin account has been added.',
        type: 'success',
      });
      setCreateOpen(false);
      fetchAdmins();
    } catch (err) {
      const message = getApiError(err, 'Failed to create admin');
      toaster.create({ title: 'Error', description: message, type: 'error' });
      throw err;
    }
  };

  const handleUpdate = async (id: string, data: UpdateAdminAccountDto) => {
    try {
      await adminService.updateAdmin(id, data);
      toaster.create({
        title: 'Admin updated',
        description: 'The admin account has been updated.',
        type: 'success',
      });
      setEditOpen(false);
      setSelectedAdmin(null);
      fetchAdmins();
    } catch (err) {
      const message = getApiError(err, 'Failed to update admin');
      toaster.create({ title: 'Error', description: message, type: 'error' });
      throw err;
    }
  };

  const handleDelete = async () => {
    if (!selectedAdmin) return;

    try {
      const result = await adminService.deleteAdmin(selectedAdmin.id);
      toaster.create({
        title: 'Admin deleted',
        description: result.message || 'The admin account has been deleted.',
        type: 'success',
      });
      setDeleteOpen(false);
      setSelectedAdmin(null);
      fetchAdmins();
    } catch (err) {
      const message = getApiError(err, 'Failed to delete admin');
      toaster.create({ title: 'Error', description: message, type: 'error' });
    }
  };

  const handleSuspendAdmin = async (
    target: AdminAccount,
    data: SuspendAdminAccountDto,
  ) => {
    try {
      await adminService.suspendAdmin(target.id, data);
      toaster.create({
        title: 'Admin suspended',
        description: `${displayName(target)} has been suspended for ${data.days} day(s).`,
        type: 'success',
      });
      setAccessOpen(false);
      setSelectedAdmin(null);
      fetchAdmins();
    } catch (err) {
      const message = getApiError(err, 'Failed to suspend admin');
      toaster.create({ title: 'Error', description: message, type: 'error' });
      throw err;
    }
  };

  const handleBanAdmin = async (
    target: AdminAccount,
    data: BanAdminAccountDto,
  ) => {
    try {
      await adminService.banAdmin(target.id, data);
      toaster.create({
        title: 'Admin banned',
        description: `${displayName(target)} has been banned until unbanned.`,
        type: 'success',
      });
      setAccessOpen(false);
      setSelectedAdmin(null);
      fetchAdmins();
    } catch (err) {
      const message = getApiError(err, 'Failed to ban admin');
      toaster.create({ title: 'Error', description: message, type: 'error' });
      throw err;
    }
  };

  const handleUnbanAdmin = async (target: AdminAccount) => {
    try {
      await adminService.unbanAdmin(target.id);
      toaster.create({
        title: 'Admin unbanned',
        description: `${displayName(target)} has been unbanned.`,
        type: 'success',
      });
      fetchAdmins();
    } catch (err) {
      const message = getApiError(err, 'Failed to unban admin');
      toaster.create({ title: 'Error', description: message, type: 'error' });
    }
  };

  const handleUnsuspendAdmin = async (target: AdminAccount) => {
    try {
      await adminService.unsuspendAdmin(target.id);
      toaster.create({
        title: 'Admin unsuspended',
        description: `${displayName(target)} can access the admin dashboard again.`,
        type: 'success',
      });
      fetchAdmins();
    } catch (err) {
      const message = getApiError(err, 'Failed to unsuspend admin');
      toaster.create({ title: 'Error', description: message, type: 'error' });
    }
  };

  if (!user?.isSuperAdmin) {
    return (
      <div className="p-6 md:p-8">
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-5">
            <p className="font-medium text-amber-900">
              Super admin access is required.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Admin Management
          </h1>
        </div>
        <div className="grid grid-cols-3 gap-4 shrink-0">
          <StatCard label="Total" value={stats.total} />
          <StatCard label="Active" value={stats.active} tone="green" />
          <StatCard label="Super" value={stats.superAdmins} tone="purple" />
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-medium">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Last Login</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                    Loading admins...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <p className="text-red-600 mb-2">{error}</p>
                    <Button variant="outline" size="sm" onClick={fetchAdmins}>
                      Retry
                    </Button>
                  </td>
                </tr>
              ) : admins.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                    No admins found.
                  </td>
                </tr>
              ) : (
                admins.map((admin) => {
                  const isCurrentUser = admin.id === user.id;
                  const canDelete = !admin.isSeededAdmin && !isCurrentUser;
                  const canChangeAccess = !admin.isSeededAdmin && !isCurrentUser;

                  return (
                    <tr key={admin.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {displayName(admin)}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{admin.email}</td>
                      <td className="px-4 py-3 text-gray-600">
                        {admin.phone || '-'}
                      </td>
                      <td className="px-4 py-3">
                        <AdminTypeBadge admin={admin} />
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge admin={admin} />
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {formatDate(admin.lastLoginAt)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedAdmin(admin);
                              setEditOpen(true);
                            }}
                            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            disabled={!canChangeAccess}
                            onClick={() => {
                              if (admin.status === 'suspended') {
                                if (admin.adminBannedAt) {
                                  void handleUnbanAdmin(admin);
                                } else {
                                  void handleUnsuspendAdmin(admin);
                                }
                                return;
                              }
                              setSelectedAdmin(admin);
                              setAccessMode('suspend');
                              setAccessOpen(true);
                            }}
                            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-amber-600 disabled:cursor-not-allowed disabled:opacity-40"
                            title={
                              admin.status === 'suspended'
                                ? admin.adminBannedAt
                                  ? 'Unban'
                                  : 'Unsuspend'
                                : 'Suspend'
                            }
                          >
                            {admin.status === 'suspended' ? (
                              <Unlock className="h-4 w-4" />
                            ) : (
                              <Clock className="h-4 w-4" />
                            )}
                          </button>
                          <button
                            type="button"
                            disabled={!canChangeAccess}
                            onClick={() => {
                              setSelectedAdmin(admin);
                              setAccessMode('ban');
                              setAccessOpen(true);
                            }}
                            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                            title="Ban"
                          >
                            <Ban className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            disabled={!canDelete}
                            onClick={() => {
                              setSelectedAdmin(admin);
                              setDeleteOpen(true);
                            }}
                            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <AdminFormDialog
        mode="create"
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSubmit={(data) => handleCreate(data as CreateAdminAccountDto)}
      />
      <AdminFormDialog
        mode="edit"
        open={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open);
          if (!open) setSelectedAdmin(null);
        }}
        admin={selectedAdmin}
        onSubmit={(data) =>
          selectedAdmin
            ? handleUpdate(selectedAdmin.id, data as UpdateAdminAccountDto)
            : undefined
        }
      />
      <DeleteAdminDialog
        open={deleteOpen}
        onOpenChange={(open) => {
          setDeleteOpen(open);
          if (!open) setSelectedAdmin(null);
        }}
        admin={selectedAdmin}
        onConfirm={handleDelete}
      />
      <AdminAccessDialog
        open={accessOpen}
        mode={accessMode}
        admin={selectedAdmin}
        onOpenChange={(open) => {
          setAccessOpen(open);
          if (!open) setSelectedAdmin(null);
        }}
        onSuspend={handleSuspendAdmin}
        onBan={handleBanAdmin}
      />
    </div>
  );
}

function StatCard({
  label,
  value,
  tone = 'gray',
}: {
  label: string;
  value: number;
  tone?: 'gray' | 'green' | 'purple';
}) {
  const toneClass =
    tone === 'green'
      ? 'text-green-600'
      : tone === 'purple'
        ? 'text-[#9333EA]'
        : 'text-gray-900';

  return (
    <Card className="bg-white border-gray-200 shadow-sm">
      <CardContent className="p-4">
        <p className="text-sm text-gray-500">{label}</p>
        <p className={`text-2xl font-bold ${toneClass}`}>{value}</p>
      </CardContent>
    </Card>
  );
}

function AdminTypeBadge({ admin }: { admin: AdminAccount }) {
  if (admin.isSeededAdmin) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#9333EA]/10 px-2.5 py-1 text-xs font-medium text-[#7e22ce]">
        <ShieldCheck className="h-3.5 w-3.5" />
        Seeded Super
      </span>
    );
  }

  if (admin.isSuperAdmin) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#9333EA]/10 px-2.5 py-1 text-xs font-medium text-[#7e22ce]">
        <ShieldCheck className="h-3.5 w-3.5" />
        Super Admin
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
      Admin
    </span>
  );
}

function StatusBadge({ admin }: { admin: AdminAccount }) {
  const status = admin.status;
  const icon =
    status === 'active' ? (
      <CheckCircle className="h-3.5 w-3.5" />
    ) : (
      <Ban className="h-3.5 w-3.5" />
    );
  const className =
    status === 'active'
      ? 'text-green-600'
      : status === 'suspended'
        ? 'text-amber-600'
        : 'text-gray-600';

  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      {icon}
      {admin.adminBannedAt
        ? 'Banned'
        : status.charAt(0).toUpperCase() + status.slice(1)}
      {admin.adminSuspendedUntil && (
        <span className="text-gray-500">
          until {formatDate(admin.adminSuspendedUntil)}
        </span>
      )}
    </span>
  );
}

function AdminFormDialog({
  mode,
  open,
  onOpenChange,
  admin,
  onSubmit,
}: {
  mode: 'create' | 'edit';
  open: boolean;
  onOpenChange: (open: boolean) => void;
  admin?: AdminAccount | null;
  onSubmit: (
    data: CreateAdminAccountDto | UpdateAdminAccountDto,
  ) => Promise<void> | void;
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState<AdminAccount['status']>('active');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;

    setEmail(admin?.email || '');
    setPassword('');
    setFirstName(admin?.firstName || '');
    setLastName(admin?.lastName || '');
    setPhone(admin?.phone || '');
    setStatus(admin?.status || 'active');
  }, [admin, open]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      const payload =
        mode === 'create'
          ? {
              email: email.trim(),
              password,
              firstName: firstName.trim() || undefined,
              lastName: lastName.trim() || undefined,
              phone: phone.trim() || undefined,
            }
          : {
              email: admin?.isSeededAdmin ? undefined : email.trim(),
              password: password.trim() || undefined,
              firstName: firstName.trim() || undefined,
              lastName: lastName.trim() || undefined,
              phone: phone.trim() || null,
              status: admin?.isSeededAdmin ? undefined : status,
            };

      await onSubmit(payload);
      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900">
            {mode === 'create' ? 'Create Admin' : 'Edit Admin'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor={`${mode}-admin-email`}>Email *</Label>
            <Input
              id={`${mode}-admin-email`}
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-1"
              disabled={mode === 'edit' && admin?.isSeededAdmin}
              required
            />
          </div>

          <div>
            <Label htmlFor={`${mode}-admin-password`}>
              {mode === 'create' ? 'Password *' : 'New Password'}
            </Label>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id={`${mode}-admin-password`}
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="pl-9"
                minLength={8}
                required={mode === 'create'}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor={`${mode}-admin-first-name`}>First Name</Label>
              <Input
                id={`${mode}-admin-first-name`}
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor={`${mode}-admin-last-name`}>Last Name</Label>
              <Input
                id={`${mode}-admin-last-name`}
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor={`${mode}-admin-phone`}>Phone</Label>
            <Input
              id={`${mode}-admin-phone`}
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              className="mt-1"
            />
          </div>

          {mode === 'edit' && (
            <div>
              <Label htmlFor="edit-admin-status">Status</Label>
              <Select
                id="edit-admin-status"
                options={STATUS_OPTIONS}
                value={status}
                onChange={(event) =>
                  setStatus(event.target.value as AdminAccount['status'])
                }
                className="mt-1"
                disabled={admin?.isSeededAdmin}
              />
            </div>
          )}

          <DialogFooter className="flex justify-end gap-2 pt-4 border-t">
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-[#9333EA] hover:bg-[#7e22ce] text-white"
              disabled={submitting}
            >
              {submitting
                ? mode === 'create'
                  ? 'Creating...'
                  : 'Saving...'
                : mode === 'create'
                  ? 'Create Admin'
                  : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DeleteAdminDialog({
  open,
  onOpenChange,
  admin,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  admin: AdminAccount | null;
  onConfirm: () => Promise<void> | void;
}) {
  const [submitting, setSubmitting] = useState(false);

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      await onConfirm();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900">
            Delete Admin
          </DialogTitle>
        </DialogHeader>

        <p className="text-sm text-gray-600">
          Delete {admin ? displayName(admin) : 'this admin'}?
        </p>

        <DialogFooter className="flex justify-end gap-2 pt-4 border-t">
          <Button
            type="button"
            variant="secondary"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="bg-red-600 hover:bg-red-700 text-white"
            disabled={submitting}
            onClick={handleConfirm}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {submitting ? 'Deleting...' : 'Delete Admin'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AdminAccessDialog({
  open,
  mode,
  admin,
  onOpenChange,
  onSuspend,
  onBan,
}: {
  open: boolean;
  mode: 'suspend' | 'ban';
  admin: AdminAccount | null;
  onOpenChange: (open: boolean) => void;
  onSuspend: (
    admin: AdminAccount,
    data: SuspendAdminAccountDto,
  ) => Promise<void> | void;
  onBan: (
    admin: AdminAccount,
    data: BanAdminAccountDto,
  ) => Promise<void> | void;
}) {
  const [days, setDays] = useState(7);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setDays(7);
    setReason('');
  }, [open, mode]);

  const handleConfirm = async () => {
    if (!admin) return;
    if (mode === 'suspend' && (!days || days < 1)) {
      toaster.create({
        title: 'Invalid duration',
        description: 'Enter at least 1 day.',
        type: 'error',
      });
      return;
    }

    setSubmitting(true);
    try {
      if (mode === 'suspend') {
        await onSuspend(admin, { days, reason: reason.trim() || undefined });
      } else {
        await onBan(admin, { reason: reason.trim() || undefined });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900">
            {mode === 'suspend' ? 'Suspend Admin' : 'Ban Admin'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            {mode === 'suspend'
              ? `Temporarily suspend ${admin ? displayName(admin) : 'this admin'} from accessing the admin dashboard.`
              : `Ban ${admin ? displayName(admin) : 'this admin'} until a super admin unbans them.`}
          </p>

          {mode === 'suspend' && (
            <div>
              <Label htmlFor="admin-suspend-days">Days *</Label>
              <Input
                id="admin-suspend-days"
                type="number"
                min={1}
                max={365}
                value={days}
                onChange={(event) => setDays(Number(event.target.value))}
                className="mt-1"
              />
            </div>
          )}

          <div>
            <Label htmlFor="admin-access-reason">Reason</Label>
            <Textarea
              id="admin-access-reason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Optional internal reason"
              rows={4}
              className="mt-1"
            />
          </div>
        </div>

        <DialogFooter className="flex justify-end gap-2 pt-4 border-t">
          <Button
            type="button"
            variant="secondary"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className={
              mode === 'suspend'
                ? 'bg-amber-600 hover:bg-amber-700 text-white'
                : 'bg-red-600 hover:bg-red-700 text-white'
            }
            disabled={submitting}
            onClick={handleConfirm}
          >
            {mode === 'suspend' ? (
              <Clock className="h-4 w-4 mr-2" />
            ) : (
              <Ban className="h-4 w-4 mr-2" />
            )}
            {submitting
              ? mode === 'suspend'
                ? 'Suspending...'
                : 'Banning...'
              : mode === 'suspend'
                ? 'Suspend Admin'
                : 'Ban Admin'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
