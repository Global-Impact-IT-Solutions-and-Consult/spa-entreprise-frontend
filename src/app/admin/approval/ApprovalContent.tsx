'use client';

import { useState, useEffect } from 'react';
import { useAdminHeader } from '@/contexts/AdminHeaderContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { toaster } from '@/components/ui/toaster';
import {
  adminService,
  AdminBusiness,
  BusinessStats,
  PaginationInfo,
  PendingServiceApproval,
} from '@/services/admin.service';
import { cn } from '@/lib/utils';
import {
  Building2,
  Wrench,
  Clock,
  CheckCircle2,
  XCircle,
  MapPin,
  Calendar,
  User,
  Eye,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  FileText,
  AlertCircle,
  Search,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';

type StatusFilter = 'ALL' | 'pending_approval' | 'approved' | 'rejected';
type ApprovalType = 'business' | 'service';

const PAGE_SIZE = 6;

function getApiMessage(error: unknown, fallback: string) {
  if (
    error &&
    typeof error === 'object' &&
    'response' in error &&
    error.response &&
    typeof error.response === 'object' &&
    'data' in error.response &&
    error.response.data &&
    typeof error.response.data === 'object' &&
    'message' in error.response.data
  ) {
    const message = error.response.data.message;
    if (Array.isArray(message)) return String(message[0] || fallback);
    if (typeof message === 'string') return message;
  }

  return fallback;
}

export function ApprovalContent() {
  const { setHeaderActions } = useAdminHeader();
  const [approvalType, setApprovalType] = useState<ApprovalType>('business');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [businesses, setBusinesses] = useState<AdminBusiness[]>([]);
  const [pendingServices, setPendingServices] = useState<PendingServiceApproval[]>(
    [],
  );
  const [stats, setStats] = useState<BusinessStats>({
    pendingApprovals: 0,
    approved: 0,
    rejected: 0,
    allBusinesses: 0,
  });
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    limit: PAGE_SIZE,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [serviceLoading, setServiceLoading] = useState(false);
  const [selectedBusiness, setSelectedBusiness] =
    useState<AdminBusiness | null>(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [approveNotes, setApproveNotes] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [sendRejectionEmail, setSendRejectionEmail] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [serviceTotal, setServiceTotal] = useState(0);

  useEffect(() => {
    setHeaderActions(
      <Button
        className="bg-green-600 hover:bg-green-700 text-white"
        onClick={() => {
          if (approvalType === 'service') {
            toaster.create({
              title: 'Review services individually',
              description:
                'Open the related business review to moderate each submission.',
              type: 'info',
            });
            return;
          }
          if (stats.pendingApprovals === 0) {
            toaster.create({ title: 'No pending approvals', type: 'info' });
          } else {
            toaster.create({
              title: 'Approve All',
              description:
                'Filter by Pending Approval to approve individually.',
              type: 'info',
            });
          }
        }}
      >
        <Check className="h-4 w-4 mr-2" />
        Approve All
      </Button>,
    );
    return () => setHeaderActions(null);
  }, [approvalType, stats.pendingApprovals, setHeaderActions]);

  // Fetch business stats for tab counters (All, Pending, Approved, Rejected)
  useEffect(() => {
    adminService
      .getBusinessStats()
      .then(setStats)
      .catch(() => {});
  }, [showApproveModal, showRejectModal]);

  // Also fetch stats on mount so counters show as soon as the page loads
  useEffect(() => {
    adminService
      .getBusinessStats()
      .then(setStats)
      .catch(() => {});
  }, []);

  useEffect(() => {
    adminService
      .getPendingServiceApprovals({ page: 1, limit: 1 })
      .then((res) => setServiceTotal(res.pagination?.total ?? 0))
      .catch(() => setServiceTotal(0));
  }, []);

  useEffect(() => {
    if (approvalType !== 'business') return;
    setLoading(true);
    adminService
      .getAllBusinesses({
        status: statusFilter === 'ALL' ? undefined : statusFilter,
        search: searchQuery.trim() || undefined,
        page: pagination.page,
        limit: PAGE_SIZE,
        sortBy: 'newest',
      })
      .then((res) => {
        setBusinesses(res.data || []);
        const pag = res.pagination || {
          total: 0,
          page: 1,
          limit: PAGE_SIZE,
          totalPages: 0,
        };
        setPagination(pag);
        // If stats are still zeros, use list total as fallback for "All" when no filter
        if (statusFilter === 'ALL' && pag.total > 0) {
          setStats((prev) =>
            prev.allBusinesses === 0 && prev.pendingApprovals === 0
              ? { ...prev, allBusinesses: pag.total }
              : prev,
          );
        }
      })
      .catch(() => setBusinesses([]))
      .finally(() => setLoading(false));
  }, [approvalType, statusFilter, searchQuery, pagination.page]);

  useEffect(() => {
    if (approvalType !== 'service') return;
    setServiceLoading(true);
    adminService
      .getPendingServiceApprovals({
        page: pagination.page,
        limit: PAGE_SIZE,
        search: searchQuery.trim() || undefined,
      })
      .then((res) => {
        setPendingServices(res.data || []);
        setServiceTotal(res.pagination?.total ?? 0);
        setPagination(
          res.pagination || {
            total: 0,
            page: 1,
            limit: PAGE_SIZE,
            totalPages: 0,
          },
        );
      })
      .catch(() => {
        setPendingServices([]);
        setServiceTotal(0);
      })
      .finally(() => setServiceLoading(false));
  }, [approvalType, pagination.page, searchQuery]);

  const handleApproveClick = (b: AdminBusiness) => {
    setSelectedBusiness(b);
    setApproveNotes('');
    setShowApproveModal(true);
  };
  const handleRejectClick = (b: AdminBusiness) => {
    setSelectedBusiness(b);
    setRejectReason('');
    setSendRejectionEmail(true);
    setShowRejectModal(true);
  };

  const handleApprove = async () => {
    if (!selectedBusiness) return;
    setProcessingId(selectedBusiness.id);
    try {
      await adminService.approveBusiness(selectedBusiness.id, approveNotes);
      toaster.create({ title: 'Approved', type: 'success' });
      setShowApproveModal(false);
      setSelectedBusiness(null);
      setPagination((p) => ({ ...p, page: 1 }));
      const res = await adminService.getAllBusinesses({
        status: statusFilter === 'ALL' ? undefined : statusFilter,
        search: searchQuery.trim() || undefined,
        page: 1,
        limit: PAGE_SIZE,
        sortBy: 'newest',
      });
      setBusinesses(res.data || []);
      setPagination(
        res.pagination || {
          total: 0,
          page: 1,
          limit: PAGE_SIZE,
          totalPages: 0,
        },
      );
      adminService
        .getPendingServiceApprovals({
          page: 1,
          limit: 1,
        })
        .then((serviceRes) => setServiceTotal(serviceRes.pagination?.total ?? 0))
        .catch(() => {});
    } catch (error: unknown) {
      toaster.create({
        title: 'Error',
        description: getApiMessage(error, 'Failed to approve'),
        type: 'error',
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async () => {
    if (!selectedBusiness || rejectReason.trim().length < 20) return;
    setProcessingId(selectedBusiness.id);
    try {
      await adminService.rejectBusiness(
        selectedBusiness.id,
        rejectReason.trim(),
        sendRejectionEmail,
      );
      toaster.create({ title: 'Rejected', type: 'success' });
      setShowRejectModal(false);
      setSelectedBusiness(null);
      setPagination((p) => ({ ...p, page: 1 }));
      const res = await adminService.getAllBusinesses({
        status: statusFilter === 'ALL' ? undefined : statusFilter,
        search: searchQuery.trim() || undefined,
        page: 1,
        limit: PAGE_SIZE,
        sortBy: 'newest',
      });
      setBusinesses(res.data || []);
      setPagination(
        res.pagination || {
          total: 0,
          page: 1,
          limit: PAGE_SIZE,
          totalPages: 0,
        },
      );
      adminService
        .getPendingServiceApprovals({
          page: 1,
          limit: 1,
        })
        .then((serviceRes) => setServiceTotal(serviceRes.pagination?.total ?? 0))
        .catch(() => {});
    } catch (error: unknown) {
      toaster.create({
        title: 'Error',
        description: getApiMessage(error, 'Failed to reject'),
        type: 'error',
      });
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const s = (status || '').toLowerCase();
    if (s === 'pending_approval')
      return (
        <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
          Pending
        </span>
      );
    if (s === 'approved')
      return (
        <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
          Approved
        </span>
      );
    if (s === 'rejected')
      return (
        <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
          Rejected
        </span>
      );
    return null;
  };

  const getBusinessTypeName = (b: AdminBusiness) =>
    b.businessType?.name || b.businessTypeCode || 'N/A';

  const formatDate = (s?: string) => {
    if (!s) return '—';
    try {
      return new Date(s).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return s;
    }
  };

  return (
    <div className="p-6 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Approvals
          </h1>
          <p className="text-gray-600 mt-1">
            Review and approve on the platform
          </p>
        </div>
        <div className="shrink-0 rounded-lg border border-gray-200 bg-gray-50 px-5 py-4">
          <p className="text-sm text-gray-500">All Approvals</p>
          <p className="text-2xl font-bold text-gray-900">
            {stats.allBusinesses}
          </p>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        <button
          type="button"
          onClick={() => setApprovalType('business')}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm',
            approvalType === 'business'
              ? 'bg-[#9333EA] text-white'
              : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200',
          )}
        >
          <Building2 className="h-4 w-4" />
          Business Approval
          {stats.pendingApprovals > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-white/20 text-xs">
              {stats.pendingApprovals}
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={() => setApprovalType('service')}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm',
            approvalType === 'service'
              ? 'bg-[#9333EA] text-white'
              : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200',
          )}
        >
          <Wrench className="h-4 w-4" />
          Service Approval
          <span className="px-2 py-0.5 rounded-full bg-gray-200 text-gray-600 text-xs">
            {serviceTotal}
          </span>
        </button>
      </div>

      {approvalType === 'business' && (
        <>
          {/* Status tabs + search in white background (match design) */}
          <div className="bg-white border border-gray-300 rounded-md p-4 mb-4 shadow-sm">
            <div className="flex flex-wrap items-center gap-2">
              {(
                [
                  ['ALL', 'All', stats.allBusinesses],
                  [
                    'pending_approval',
                    'Pending Approval',
                    stats.pendingApprovals,
                  ],
                  ['approved', 'Approved', stats.approved],
                  ['rejected', 'Rejected', stats.rejected],
                ] as const
              ).map(([value, label, count]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setStatusFilter(value)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium',
                    statusFilter === value && value === 'ALL'
                      ? 'bg-blue-600 text-white'
                      : statusFilter === value
                        ? 'bg-[#9333EA] text-white'
                        : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200',
                  )}
                >
                  {value === 'pending_approval' && (
                    <Clock className="h-4 w-4" />
                  )}
                  {value === 'approved' && <CheckCircle2 className="h-4 w-4" />}
                  {value === 'rejected' && <XCircle className="h-4 w-4" />}
                  {label}
                  <span className="text-xs opacity-90">{count}</span>
                </button>
              ))}
              <div className="ml-auto flex-1 min-w-[200px] max-w-xs">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="search"
                    placeholder="Search business, owner"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === 'Enter' &&
                      setPagination((p) => ({ ...p, page: 1 }))
                    }
                    className="pl-9 bg-white border border-gray-300"
                  />
                </div>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 py-12">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="border border-gray-200 rounded-lg p-5 h-64 bg-gray-50 animate-pulse"
                />
              ))}
            </div>
          ) : businesses.length === 0 ? (
            <div className="border border-gray-200 rounded-lg p-12 text-center text-gray-500">
              No businesses found.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {businesses.map((b) => (
                <div
                  key={b.id}
                  className="border border-gray-200 rounded-lg p-5 bg-white shadow-sm flex flex-col"
                >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <h3 className="font-bold text-gray-900 truncate flex-1">
                      {b.businessName}
                    </h3>
                    {getStatusBadge(b.status)}
                  </div>
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <p className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 shrink-0 text-gray-400" />
                      {b.city || b.address || '—'}
                    </p>
                    <p className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 shrink-0 text-gray-400" />
                      {getBusinessTypeName(b)}
                    </p>
                    <p className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 shrink-0 text-gray-400" />
                      Registered:{' '}
                      {formatDate(b.registrationDate || b.createdAt)}
                    </p>
                    {b.cacNumber && (
                      <p className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 shrink-0 text-gray-400" />
                        CAC: {b.cacNumber}
                      </p>
                    )}
                  </div>
                  {b.owner && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <p className="flex items-center gap-2 text-xs font-medium text-gray-500 mb-1">
                        <User className="h-3.5 w-3.5" />
                        Business Owner
                      </p>
                      <p className="font-medium text-gray-900 text-sm">
                        {b.owner.firstName} {b.owner.lastName}
                      </p>
                      <p className="text-xs text-gray-600">{b.owner.email}</p>
                      {b.owner.phone && (
                        <p className="text-xs text-gray-600">{b.owner.phone}</p>
                      )}
                    </div>
                  )}
                  <div className="flex items-center gap-2 mt-auto pt-2">
                    {b.status === 'pending_approval' && (
                      <>
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white flex-1"
                          onClick={() => handleApproveClick(b)}
                          disabled={processingId === b.id}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="bg-red-600 hover:bg-red-700 text-white flex-1"
                          onClick={() => handleRejectClick(b)}
                          disabled={processingId === b.id}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Rejected
                        </Button>
                      </>
                    )}
                    {b.status === 'approved' && (
                      <Button
                        size="sm"
                        className="bg-amber-500 hover:bg-amber-600 text-white flex-1"
                      >
                        Suspend
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="icon"
                      className="shrink-0"
                      onClick={() => {
                        setSelectedBusiness(b);
                        setDetailsOpen(true);
                      }}
                      title="View details"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button
                variant="outline"
                size="icon"
                disabled={pagination.page <= 1}
                onClick={() =>
                  setPagination((p) => ({ ...p, page: p.page - 1 }))
                }
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {Array.from(
                { length: Math.min(4, pagination.totalPages) },
                (_, i) => {
                  const pageNum =
                    pagination.totalPages <= 4
                      ? i + 1
                      : Math.min(
                          Math.max(pagination.page - 2, 1) + i,
                          pagination.totalPages,
                        );
                  return (
                    <Button
                      key={pageNum}
                      variant={
                        pagination.page === pageNum ? 'default' : 'outline'
                      }
                      size="icon"
                      className={cn(
                        pagination.page === pageNum &&
                          'bg-[#9333EA] hover:bg-[#7e22ce]',
                      )}
                      onClick={() =>
                        setPagination((p) => ({ ...p, page: pageNum }))
                      }
                    >
                      {pageNum}
                    </Button>
                  );
                },
              )}
              <Button
                variant="outline"
                size="icon"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() =>
                  setPagination((p) => ({ ...p, page: p.page + 1 }))
                }
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}

      {approvalType === 'service' && (
        <>
          <div className="bg-white border border-gray-300 rounded-md p-4 mb-4 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Pending service submissions
                </p>
                <p className="text-sm text-gray-500">
                  Services attached to businesses still awaiting admin approval.
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase tracking-wide text-gray-500">
                  Total
                </p>
                <p className="text-2xl font-bold text-gray-900">{serviceTotal}</p>
              </div>
            </div>
          </div>

          {serviceLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 py-12">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="border border-gray-200 rounded-lg p-5 h-56 bg-gray-50 animate-pulse"
                />
              ))}
            </div>
          ) : pendingServices.length === 0 ? (
            <div className="border border-gray-200 rounded-lg p-12 text-center text-gray-500">
              No pending service submissions found.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendingServices.map((service) => (
                <div
                  key={service.id}
                  className="border border-gray-200 rounded-lg p-5 bg-white shadow-sm flex flex-col"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <h3 className="font-bold text-gray-900">{service.name}</h3>
                      <p className="text-sm text-gray-500">
                        {service.category?.name || 'Uncategorized'}
                      </p>
                    </div>
                    <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                      Pending
                    </span>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <p className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 shrink-0 text-gray-400" />
                      {service.business.businessName}
                    </p>
                    <p className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 shrink-0 text-gray-400" />
                      {service.business.city || 'Location unavailable'}
                    </p>
                    <p className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 shrink-0 text-gray-400" />
                      Submitted {formatDate(service.createdAt)}
                    </p>
                    <p className="text-gray-700">
                      Price: ₦{Number(service.price).toLocaleString()} • Duration:{' '}
                      {service.duration} mins
                    </p>
                    {service.owner && (
                      <p className="text-gray-700">
                        Owner: {service.owner.firstName || ''}{' '}
                        {service.owner.lastName || ''} ({service.owner.email})
                      </p>
                    )}
                    {service.description && (
                      <p className="line-clamp-3">{service.description}</p>
                    )}
                  </div>
                  <div className="mt-auto pt-2">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        window.location.href = `/admin/businesses?businessId=${service.business.id}`;
                      }}
                    >
                      Open Business Review
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Business Details</DialogTitle>
            <DialogClose className="absolute right-4 top-4" />
          </DialogHeader>
          {selectedBusiness && (
            <div className="space-y-4">
              <p className="font-semibold text-gray-900">
                {selectedBusiness.businessName}
              </p>
              <p className="text-sm text-gray-600">
                {getBusinessTypeName(selectedBusiness)} •{' '}
                {selectedBusiness.city || selectedBusiness.address || '—'}
              </p>
              {selectedBusiness.owner && (
                <p className="text-sm">
                  Owner: {selectedBusiness.owner.firstName}{' '}
                  {selectedBusiness.owner.lastName} (
                  {selectedBusiness.owner.email})
                </p>
              )}
              <Button
                variant="outline"
                onClick={() => {
                  setDetailsOpen(false);
                  window.location.href = `/admin/businesses?businessId=${selectedBusiness.id}`;
                }}
              >
                Open in Business Management
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showApproveModal} onOpenChange={setShowApproveModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Approve Business Registration</DialogTitle>
            <DialogClose className="absolute right-4 top-4" />
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-3 bg-green-50 border border-green-200 rounded-lg p-4">
              <Check className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
              <p className="text-sm text-green-800">
                This business will be approved and the owner will be notified
                via email.
              </p>
            </div>
            {selectedBusiness && (
              <div className="space-y-1 text-sm text-gray-700">
                <p>
                  <span className="font-medium text-gray-900">Business:</span>{' '}
                  {selectedBusiness.businessName}
                </p>
                <p>
                  <span className="font-medium text-gray-900">Owner:</span>{' '}
                  {selectedBusiness.owner?.firstName}{' '}
                  {selectedBusiness.owner?.lastName}
                </p>
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <FileText className="h-4 w-4 text-gray-500" />
                Additional Notes (Optional)
              </label>
              <Textarea
                value={approveNotes}
                onChange={(e) => setApproveNotes(e.target.value)}
                placeholder="Add any note for internal reference"
                className="min-h-[100px]"
                maxLength={500}
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowApproveModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleApprove}
                disabled={processingId === selectedBusiness?.id}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Confirm Approval
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reject Business Registration</DialogTitle>
            <DialogClose className="absolute right-4 top-4" />
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-3 bg-red-50 border border-red-200 rounded-lg p-4">
              <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">
                This action will reject the business registration and notify the
                owner via email.
              </p>
            </div>
            {selectedBusiness && (
              <div className="space-y-1 text-sm text-gray-700">
                <p>
                  <span className="font-medium text-gray-900">Business:</span>{' '}
                  {selectedBusiness.businessName}
                </p>
                <p>
                  <span className="font-medium text-gray-900">Owner:</span>{' '}
                  {selectedBusiness.owner?.firstName}{' '}
                  {selectedBusiness.owner?.lastName}
                </p>
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <FileText className="h-4 w-4 text-gray-500" />
                Reason for Rejection <span className="text-red-500">*</span>
              </label>
              <Textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Please provide a clear reason for rejection. This will be sent to the business owner"
                className="min-h-[120px]"
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-1">
                Minimum 20 characters required.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={sendRejectionEmail}
                onCheckedChange={(c) => setSendRejectionEmail(!!c)}
              />
              <label className="text-sm text-gray-700">
                Send rejection email to business owner
              </label>
            </div>
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowRejectModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleReject}
                disabled={
                  processingId === selectedBusiness?.id ||
                  rejectReason.trim().length < 20
                }
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Confirm Rejection
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
