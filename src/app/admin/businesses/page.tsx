'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { toaster } from '@/components/ui/toaster';
import {
  adminService,
  AdminBusiness,
  BusinessStats,
  PaginationInfo,
} from '@/services/admin.service';
import { businessService } from '@/services/business.service';
import { cn } from '@/lib/utils';
import {
  MapPin,
  Eye,
  Check,
  X,
  X as XIcon,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  FileText,
  AlertCircle,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';

type StatusFilter =
  | 'pending_approval'
  | 'approved'
  | 'rejected'
  | 'suspended'
  | 'ALL';

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

  if (error instanceof Error && error.message) return error.message;

  return fallback;
}

export default function AdminBusinessesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const businessIdFromUrlHandled = useRef(false);

  const [businesses, setBusinesses] = useState<AdminBusiness[]>([]);
  const [stats, setStats] = useState<BusinessStats>({
    pendingApprovals: 0,
    approved: 0,
    rejected: 0,
    allBusinesses: 0,
  });
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    limit: 15,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [activeStatus, setActiveStatus] = useState<StatusFilter>('ALL');
  const [selectedType, setSelectedType] = useState('All Types');
  const [selectedCity, setSelectedCity] = useState('All Cities');
  const [sortBy, setSortBy] = useState('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Business details panel
  const [selectedBusiness, setSelectedBusiness] =
    useState<AdminBusiness | null>(null);
  const [loadingBusinessDetails, setLoadingBusinessDetails] = useState(false);

  // Modals
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [approveNotes, setApproveNotes] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [sendRejectionEmail, setSendRejectionEmail] = useState(true);

  // Dropdown options: fetched once (unfiltered) so type/city can be changed to any value
  const [businessTypeOptions, setBusinessTypeOptions] = useState<
    Array<{ code: string; name: string }>
  >([]);
  const [cityOptions, setCityOptions] = useState<string[]>([]);

  // Extract from current list as fallback before options load
  const businessTypesFromList = Array.from(
    new Set(businesses.map((b) => b.businessTypeCode).filter(Boolean)),
  ).map((code) => {
    const business = businesses.find((b) => b.businessTypeCode === code);
    return {
      code: code!,
      name: business?.businessType?.name || code!,
    };
  });
  const citiesFromList = Array.from(
    new Set(businesses.map((b) => b.city).filter(Boolean)),
  ) as string[];
  const businessTypes =
    businessTypeOptions.length > 0
      ? businessTypeOptions
      : businessTypesFromList;
  const cities = cityOptions.length > 0 ? cityOptions : citiesFromList;
  // Ensure current selection is in the list (e.g. if it appears only in filtered data)
  const typeList =
    selectedType !== 'All Types' &&
    !businessTypes.some((t) => t.code === selectedType)
      ? [
          ...businessTypes,
          ...businessTypesFromList.filter((t) => t.code === selectedType),
        ]
      : businessTypes;
  const cityList =
    selectedCity !== 'All Cities' && !cities.includes(selectedCity)
      ? [...cities, ...citiesFromList.filter((c) => c === selectedCity)]
      : cities;
  const selectedBusinessId = selectedBusiness?.id;

  const fetchBusinessDetails = useCallback(async (businessId: string) => {
    setLoadingBusinessDetails(true);
    try {
      const business = await adminService.getBusiness(businessId);
      setSelectedBusiness(business);
    } catch (error) {
      console.error('Failed to fetch business details:', error);
      toaster.create({
        title: 'Error',
        description: 'Failed to load business details',
        type: 'error',
      });
    } finally {
      setLoadingBusinessDetails(false);
    }
  }, []);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const baseFilters = {
        status: activeStatus === 'ALL' ? undefined : activeStatus,
        businessTypeCode:
          selectedType !== 'All Types' ? selectedType : undefined,
        city: selectedCity !== 'All Cities' ? selectedCity : undefined,
        sortBy: sortBy as 'newest' | 'oldest' | 'name_asc' | 'name_desc',
        search: searchQuery.trim() || undefined,
      };

      const [businessesData, statsData] = await Promise.all([
        adminService.getAllBusinesses({
          ...baseFilters,
          page: pagination.page,
          limit: 15,
        }),
        adminService.getBusinessStats(),
      ]);

      const rawData = businessesData.data || [];
      setStats(statsData);
      setBusinesses(rawData);
      setPagination(
        businessesData.pagination || {
          total: 0,
          page: 1,
          limit: 15,
          totalPages: 0,
        },
      );
    } catch (error: unknown) {
      console.error('Failed to fetch data:', error);
      toaster.create({
        title: 'Error',
        description: getApiMessage(error, 'Failed to load businesses'),
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  }, [
    activeStatus,
    pagination.page,
    selectedType,
    selectedCity,
    sortBy,
    searchQuery,
  ]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  // Fetch type and city options once (unfiltered) so dropdowns always show all options
  useEffect(() => {
    let cancelled = false;
    adminService
      .getAllBusinesses({
        limit: 500,
        page: 1,
        sortBy: 'newest',
      })
      .then((res) => {
        if (cancelled || !res?.data?.length) return;
        const list = res.data;
        const types = Array.from(
          new Set(list.map((b) => b.businessTypeCode).filter(Boolean)),
        ).map((code) => {
          const business = list.find((b) => b.businessTypeCode === code);
          return {
            code: code!,
            name: business?.businessType?.name || code!,
          };
        });
        if (!cancelled) setBusinessTypeOptions(types);
      })
      .catch(() => {});
    businessService
      .getCitiesWithBusinessCounts()
      .then((cities) => {
        if (!cancelled) {
          setCityOptions(cities.map((city) => city.city));
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    // Only fetch details if we're viewing (not approving/rejecting)
    if (selectedBusinessId && !showApproveModal && !showRejectModal) {
      void fetchBusinessDetails(selectedBusinessId);
    }
  }, [
    selectedBusinessId,
    showApproveModal,
    showRejectModal,
    fetchBusinessDetails,
  ]);

  // Open business detail when navigating from User Details "View Business" link
  useEffect(() => {
    const businessId = searchParams.get('businessId');
    if (!businessId || businessIdFromUrlHandled.current) return;
    businessIdFromUrlHandled.current = true;
    const found = businesses.find((b) => b.id === businessId);
    if (found) {
      setSelectedBusiness(found);
    } else {
      adminService
        .getBusiness(businessId)
        .then((business) => setSelectedBusiness(business))
        .catch(() => {
          toaster.create({
            title: 'Business not found',
            description: 'The requested business could not be loaded.',
            type: 'error',
          });
        })
        .finally(() => {
          const next = new URLSearchParams(searchParams);
          next.delete('businessId');
          const qs = next.toString();
          router.replace(qs ? `/admin/businesses?${qs}` : '/admin/businesses', {
            scroll: false,
          });
        });
      return;
    }
    const next = new URLSearchParams(searchParams);
    next.delete('businessId');
    const qs = next.toString();
    router.replace(qs ? `/admin/businesses?${qs}` : '/admin/businesses', {
      scroll: false,
    });
  }, [searchParams, businesses, router]);

  const handleViewBusiness = (business: AdminBusiness) => {
    setSelectedBusiness(business);
  };

  const handleApproveClick = (business: AdminBusiness) => {
    // Don't set selectedBusiness to avoid triggering details fetch
    // We'll use the business directly in the modal
    setSelectedBusiness(business);
    setShowApproveModal(true);
    setApproveNotes('');
  };

  const handleRejectClick = (business: AdminBusiness) => {
    // Don't set selectedBusiness to avoid triggering details fetch
    // We'll use the business directly in the modal
    setSelectedBusiness(business);
    setShowRejectModal(true);
    setRejectReason('');
    setSendRejectionEmail(true);
  };

  const handleApprove = async () => {
    if (!selectedBusiness) return;

    setProcessingId(selectedBusiness.id);
    try {
      await adminService.approveBusiness(
        selectedBusiness.id,
        approveNotes || undefined,
      );
      toaster.create({
        title: 'Success',
        description: 'Business approved successfully',
        type: 'success',
      });
      setShowApproveModal(false);
      setSelectedBusiness(null);
      setApproveNotes('');
      fetchData();
    } catch (error: unknown) {
      toaster.create({
        title: 'Error',
        description: getApiMessage(error, 'Failed to approve business'),
        type: 'error',
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async () => {
    if (
      !selectedBusiness ||
      !rejectReason.trim() ||
      rejectReason.trim().length < 20
    ) {
      toaster.create({
        title: 'Validation Error',
        description:
          'Please provide a reason for rejection (minimum 20 characters)',
        type: 'error',
      });
      return;
    }

    setProcessingId(selectedBusiness.id);
    try {
      await adminService.rejectBusiness(
        selectedBusiness.id,
        rejectReason,
        sendRejectionEmail,
      );
      toaster.create({
        title: 'Success',
        description: 'Business rejected successfully',
        type: 'success',
      });
      setShowRejectModal(false);
      setSelectedBusiness(null);
      setRejectReason('');
      setSendRejectionEmail(true);
      fetchData();
    } catch (error: unknown) {
      toaster.create({
        title: 'Error',
        description: getApiMessage(error, 'Failed to reject business'),
        type: 'error',
      });
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower === 'pending_approval' || statusLower === 'pending') {
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
          Pending
        </span>
      );
    }
    if (statusLower === 'approved') {
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
          Approved
        </span>
      );
    }
    if (statusLower === 'rejected') {
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
          Rejected
        </span>
      );
    }
    if (statusLower === 'suspended') {
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
          Suspended
        </span>
      );
    }
    return null;
  };

  const getBusinessTypeName = (business: AdminBusiness) => {
    return business.businessType?.name || business.businessTypeCode || 'N/A';
  };

  const formatOperatingHours = (business: AdminBusiness) => {
    if (!business.operatingHours) return 'Not specified';

    const days = Object.entries(business.operatingHours)
      .filter(([, hours]) => !hours.closed)
      .map(([day, hours]) => `${day}: ${hours.open} - ${hours.close}`);

    return days.length > 0 ? days.join(', ') : 'Closed';
  };

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handleFilterChange = () => {
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const resetFilters = () => {
    setActiveStatus('ALL');
    setSelectedType('All Types');
    setSelectedCity('All Cities');
    setSortBy('newest');
    setSearchQuery('');
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-8">
          {/* Header: title left, Total Business card right */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Business/SPA Management
              </h1>
              <p className="text-gray-600">
                Review, approve, and manage businesses on the platform.
              </p>
            </div>
            <div className="shrink-0 rounded-lg border border-gray-200 bg-white px-5 py-4 shadow-sm">
              <p className="text-sm text-gray-500">Total Business</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.allBusinesses ?? pagination.total}
              </p>
            </div>
          </div>

          {/* Filters: white background, light grey borders per design */}
          <div className="bg-white border border-gray-300 rounded-md p-4 mb-6">
            <div className="flex flex-wrap items-end gap-4">
              <div className="min-w-[140px]">
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Status
                </label>
                <Select
                  value={activeStatus}
                  onChange={(e) => {
                    setActiveStatus(e.target.value as StatusFilter);
                    handleFilterChange();
                  }}
                  className="w-full bg-white border border-gray-300 rounded"
                >
                  <option value="ALL">All</option>
                  <option value="pending_approval">Pending Approval</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </Select>
              </div>
              <div className="min-w-[160px]">
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Filter by Type
                </label>
                <Select
                  value={selectedType}
                  onChange={(e) => {
                    setSelectedType(e.target.value);
                    handleFilterChange();
                  }}
                  className="w-full bg-white border border-gray-300 rounded"
                >
                  <option value="All Types">All Types</option>
                  {typeList.map((type) => (
                    <option key={type.code} value={type.code}>
                      {type.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="min-w-[160px]">
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Filter by City
                </label>
                <Select
                  value={selectedCity}
                  onChange={(e) => {
                    setSelectedCity(e.target.value);
                    handleFilterChange();
                  }}
                  className="w-full bg-white border border-gray-300 rounded"
                >
                  <option value="All Cities">All Cities</option>
                  {cityList.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="min-w-[160px]">
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Sort By
                </label>
                <Select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    handleFilterChange();
                  }}
                  className="w-full bg-white border border-gray-300 rounded"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="name_asc">Name (A-Z)</option>
                  <option value="name_desc">Name (Z-A)</option>
                </Select>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={resetFilters}
                className="shrink-0 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
              >
                <RotateCcw className="h-4 w-4 mr-2 text-gray-600" />
                Reset Filters
              </Button>
            </div>
          </div>

          {/* Data Table */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
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
                  {isLoading ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-4 py-12 text-center text-gray-500"
                      >
                        Loading businesses…
                      </td>
                    </tr>
                  ) : businesses.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-4 py-12 text-center text-gray-500"
                      >
                        No businesses match the current filters.
                      </td>
                    </tr>
                  ) : (
                    businesses.map((business) => (
                      <tr key={business.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">
                          {business.id.slice(0, 8).toUpperCase()}
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-900">
                          {business.businessName}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {business.owner?.email ?? business.email ?? '—'}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {business.owner?.phone ?? business.phone ?? '—'}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={cn(
                              'inline-flex items-center gap-1.5 text-sm font-medium capitalize',
                              business.status === 'approved' &&
                                'text-green-600',
                              business.status === 'pending_approval' &&
                                'text-amber-600',
                              business.status === 'rejected' && 'text-red-600',
                              business.status === 'suspended' &&
                                'text-gray-600',
                            )}
                          >
                            <span
                              className={cn(
                                'h-2 w-2 rounded-full shrink-0',
                                business.status === 'approved' &&
                                  'bg-green-500',
                                business.status === 'pending_approval' &&
                                  'bg-amber-500',
                                business.status === 'rejected' && 'bg-red-500',
                                business.status === 'suspended' &&
                                  'bg-gray-500',
                              )}
                            />
                            {business.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {business.createdAt || business.registrationDate
                            ? new Date(
                                business.createdAt ||
                                  business.registrationDate!,
                              ).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })
                            : '—'}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => handleViewBusiness(business)}
                              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-[#9333EA]"
                              title="View"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            {business.status === 'pending_approval' && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleApproveClick(business)}
                                  disabled={processingId === business.id}
                                  className="p-2 rounded-lg text-green-600 hover:bg-green-50 disabled:opacity-50"
                                  title="Approve"
                                >
                                  <Check className="h-4 w-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRejectClick(business)}
                                  disabled={processingId === business.id}
                                  className="p-2 rounded-lg text-red-600 hover:bg-red-50 disabled:opacity-50"
                                  title="Reject"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50/50">
              <p className="text-sm text-gray-600">
                Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)}{' '}
                of {pagination.total} businesses
              </p>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  disabled={pagination.page <= 1}
                  onClick={() => handlePageChange(pagination.page - 1)}
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
                          'h-8 w-8',
                          pagination.page === pageNum &&
                            'bg-[#9333EA] hover:bg-[#7e22ce]',
                        )}
                        onClick={() => handlePageChange(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    );
                  },
                )}
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => handlePageChange(pagination.page + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Business Details Modal - centered like User Details */}
      <Dialog
        open={!!selectedBusiness && !showApproveModal && !showRejectModal}
        onOpenChange={(open) => !open && setSelectedBusiness(null)}
      >
        <DialogContent className="max-w-2xl w-[90vw] sm:max-w-3xl max-h-[90vh] overflow-y-auto p-8">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900 pr-8">
              Business Details
            </DialogTitle>
            <DialogClose
              onClick={() => setSelectedBusiness(null)}
              className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
            >
              <XIcon className="h-4 w-4" />
            </DialogClose>
          </DialogHeader>
          {loadingBusinessDetails ? (
            <div className="py-12 text-center text-gray-500">
              Loading details…
            </div>
          ) : selectedBusiness ? (
            <div className="space-y-8 pr-2">
              {/* Business Overview */}
              <div className="border border-gray-200 rounded-lg p-6">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-3">
                      {selectedBusiness.businessName}
                    </h2>
                    <div className="flex flex-wrap items-center gap-4">
                      {getStatusBadge(selectedBusiness.status)}
                      <span className="text-sm text-gray-600 flex items-center gap-1">
                        <MapPin className="h-4 w-4 shrink-0" />
                        {selectedBusiness.city
                          ? `${selectedBusiness.city}${selectedBusiness.address ? `, ${selectedBusiness.address}` : ''}`
                          : selectedBusiness.address || 'N/A'}
                      </span>
                    </div>
                  </div>
                  {selectedBusiness.status === 'pending_approval' && (
                    <div className="flex gap-2 shrink-0">
                      <Button
                        onClick={() => handleApproveClick(selectedBusiness)}
                        disabled={processingId === selectedBusiness.id}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        onClick={() => handleRejectClick(selectedBusiness)}
                        disabled={processingId === selectedBusiness.id}
                        variant="destructive"
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Business Type: </span>
                    <span className="font-medium text-gray-900">
                      {getBusinessTypeName(selectedBusiness)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Registration Date: </span>
                    <span className="text-gray-900">
                      {selectedBusiness.registrationDate ||
                      selectedBusiness.createdAt
                        ? new Date(
                            selectedBusiness.registrationDate ||
                              selectedBusiness.createdAt!,
                          ).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : 'N/A'}
                    </span>
                  </div>
                  {selectedBusiness.cacNumber && (
                    <div className="sm:col-span-2">
                      <span className="text-gray-500">
                        CAC Registration Number:{' '}
                      </span>
                      <span className="font-semibold text-gray-900">
                        {selectedBusiness.cacNumber}
                      </span>
                    </div>
                  )}
                  <div className="sm:col-span-2">
                    <span className="text-gray-500">Business Hours: </span>
                    <span className="font-semibold text-gray-900">
                      {formatOperatingHours(selectedBusiness)}
                    </span>
                  </div>
                </div>
                {selectedBusiness.description && (
                  <p className="text-sm text-gray-700 mt-4 leading-relaxed">
                    {selectedBusiness.description}
                  </p>
                )}
              </div>

              {/* Owner Information */}
              {selectedBusiness.owner && (
                <div>
                  <h3 className="text-sm font-bold text-gray-900 mb-4">
                    Owner Information
                  </h3>
                  <div className="border border-gray-200 rounded-lg p-5 flex items-start gap-5">
                    <div className="h-14 w-14 rounded-full bg-[#9333EA] flex items-center justify-center text-white font-bold shrink-0 text-base">
                      {(selectedBusiness.owner.firstName?.charAt(0) || '') +
                        (selectedBusiness.owner.lastName?.charAt(0) || '') ||
                        '?'}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm min-w-0">
                      <div>
                        <span className="text-gray-500">Full Name: </span>
                        <span className="text-gray-900">
                          {selectedBusiness.owner.firstName}{' '}
                          {selectedBusiness.owner.lastName}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Phone Number: </span>
                        <span className="text-gray-900">
                          {selectedBusiness.owner.phone || '—'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Email Address: </span>
                        <span className="text-gray-900">
                          {selectedBusiness.owner.email || '—'}
                        </span>
                      </div>
                      {selectedBusiness.owner.userId && (
                        <div>
                          <span className="text-gray-500">User ID: </span>
                          <span className="text-gray-900">
                            {selectedBusiness.owner.userId}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Services Offered */}
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-4">
                  Services Offered
                </h3>
                {selectedBusiness.services &&
                selectedBusiness.services.length > 0 ? (
                  <div className="flex flex-wrap gap-3">
                    {selectedBusiness.services.map((service) => (
                      <span
                        key={service.id}
                        className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-xs font-medium"
                      >
                        {service.name}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No services added yet</p>
                )}
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Approve Modal */}
      <Dialog open={showApproveModal} onOpenChange={setShowApproveModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Approve Business Registration</DialogTitle>
            <DialogClose
              onClick={() => setShowApproveModal(false)}
              className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
            >
              <XIcon className="h-4 w-4" />
            </DialogClose>
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
              <p className="text-xs text-gray-500 mt-1">
                {approveNotes.length}/500 characters
              </p>
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

      {/* Reject Modal */}
      <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reject Business Registration</DialogTitle>
            <DialogClose
              onClick={() => setShowRejectModal(false)}
              className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
            >
              <XIcon className="h-4 w-4" />
            </DialogClose>
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
                onCheckedChange={(checked) =>
                  setSendRejectionEmail(checked as boolean)
                }
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
