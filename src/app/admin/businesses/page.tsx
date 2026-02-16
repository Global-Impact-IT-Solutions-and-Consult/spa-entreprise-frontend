"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toaster } from "@/components/ui/toaster";
import { adminService, AdminBusiness, BusinessStats, PaginationInfo } from "@/services/admin.service";
import { cn } from "@/lib/utils";
import {
    Clock,
    CheckCircle2,
    XCircle,
    Building2,
    MapPin,
    ClipboardList,
    Calendar,
    CreditCard,
    Eye,
    Check,
    X,
    User,
    X as XIcon,
    ChevronLeft,
    ChevronRight,
    Search
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";

type StatusFilter = 'pending_approval' | 'approved' | 'rejected' | 'suspended' | 'ALL';

export default function AdminBusinessesPage() {
    const [businesses, setBusinesses] = useState<AdminBusiness[]>([]);
    const [stats, setStats] = useState<BusinessStats>({ pendingApprovals: 0, approved: 0, rejected: 0, allBusinesses: 0 });
    const [pagination, setPagination] = useState<PaginationInfo>({ total: 0, page: 1, limit: 20, totalPages: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [activeStatus, setActiveStatus] = useState<StatusFilter>('pending_approval');
    const [selectedType, setSelectedType] = useState('All Types');
    const [selectedCity, setSelectedCity] = useState('All Cities');
    const [sortBy, setSortBy] = useState('newest');
    const [searchQuery, setSearchQuery] = useState('');
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [endpointsAvailable, setEndpointsAvailable] = useState<boolean | null>(null);
    
    // Business details panel
    const [selectedBusiness, setSelectedBusiness] = useState<AdminBusiness | null>(null);
    const [loadingBusinessDetails, setLoadingBusinessDetails] = useState(false);
    
    // Modals
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [approveNotes, setApproveNotes] = useState("");
    const [rejectReason, setRejectReason] = useState("");
    const [sendRejectionEmail, setSendRejectionEmail] = useState(true);

    // Extract unique business types and cities from businesses
    const businessTypes = Array.from(
        new Set(businesses.map(b => b.businessTypeCode).filter(Boolean))
    ).map(code => {
        const business = businesses.find(b => b.businessTypeCode === code);
        return {
            code: code!,
            name: business?.businessType?.name || code!
        };
    });

    const cities = Array.from(
        new Set(businesses.map(b => b.city).filter(Boolean))
    ) as string[];

    useEffect(() => {
        fetchData();
    }, [activeStatus, pagination.page, selectedType, selectedCity, sortBy, searchQuery]);

    useEffect(() => {
        // Only fetch details if we're viewing (not approving/rejecting)
        if (selectedBusiness && !showApproveModal && !showRejectModal) {
            fetchBusinessDetails(selectedBusiness.id);
        }
    }, [selectedBusiness?.id, showApproveModal, showRejectModal]);

    const fetchBusinessDetails = async (businessId: string) => {
        setLoadingBusinessDetails(true);
        try {
            const business = await adminService.getBusiness(businessId);
            setSelectedBusiness(business);
        } catch (error) {
            console.error('Failed to fetch business details:', error);
            toaster.create({
                title: "Error",
                description: "Failed to load business details",
                type: "error"
            });
        } finally {
            setLoadingBusinessDetails(false);
        }
    };

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [businessesData, statsData] = await Promise.all([
                adminService.getAllBusinesses({
                    status: activeStatus === 'ALL' ? undefined : activeStatus,
                    businessTypeCode: selectedType !== 'All Types' ? selectedType : undefined,
                    city: selectedCity !== 'All Cities' ? selectedCity : undefined,
                    sortBy: sortBy as 'newest' | 'oldest' | 'name_asc' | 'name_desc',
                    search: searchQuery.trim() || undefined,
                    page: pagination.page,
                    limit: 20
                }),
                adminService.getBusinessStats()
            ]);

            setBusinesses(businessesData.data || []);
            setPagination(businessesData.pagination || { total: 0, page: 1, limit: 20, totalPages: 0 });
            setStats(statsData);
            
            const businessesAvailable = (businessesData as any).endpointAvailable !== false;
            const statsAvailable = (statsData as any).endpointAvailable !== false;
            setEndpointsAvailable(businessesAvailable && statsAvailable);
        } catch (error: any) {
            console.error('Failed to fetch data:', error);
            if (error.response?.status === 404) {
                setEndpointsAvailable(false);
            } else {
                toaster.create({
                    title: "Error",
                    description: error.response?.data?.message || error.message || "Failed to load businesses",
                    type: "error"
                });
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleViewBusiness = async (business: AdminBusiness) => {
        setSelectedBusiness(business);
    };

    const handleApproveClick = (business: AdminBusiness) => {
        // Don't set selectedBusiness to avoid triggering details fetch
        // We'll use the business directly in the modal
        setSelectedBusiness(business);
        setShowApproveModal(true);
        setApproveNotes("");
    };

    const handleRejectClick = (business: AdminBusiness) => {
        // Don't set selectedBusiness to avoid triggering details fetch
        // We'll use the business directly in the modal
        setSelectedBusiness(business);
        setShowRejectModal(true);
        setRejectReason("");
        setSendRejectionEmail(true);
    };

    const handleApprove = async () => {
        if (!selectedBusiness) return;
        
        setProcessingId(selectedBusiness.id);
        try {
            await adminService.approveBusiness(selectedBusiness.id, approveNotes || undefined);
            toaster.create({
                title: "Success",
                description: "Business approved successfully",
                type: "success"
            });
            setShowApproveModal(false);
            setSelectedBusiness(null);
            setApproveNotes("");
            fetchData();
        } catch (error: any) {
            toaster.create({
                title: "Error",
                description: error.response?.data?.message || error.message || "Failed to approve business",
                type: "error"
            });
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async () => {
        if (!selectedBusiness || !rejectReason.trim() || rejectReason.trim().length < 20) {
            toaster.create({
                title: "Validation Error",
                description: "Please provide a reason for rejection (minimum 20 characters)",
                type: "error"
            });
            return;
        }
        
        setProcessingId(selectedBusiness.id);
        try {
            await adminService.rejectBusiness(selectedBusiness.id, rejectReason, sendRejectionEmail);
            toaster.create({
                title: "Success",
                description: "Business rejected successfully",
                type: "success"
            });
            setShowRejectModal(false);
            setSelectedBusiness(null);
            setRejectReason("");
            setSendRejectionEmail(true);
            fetchData();
        } catch (error: any) {
            toaster.create({
                title: "Error",
                description: error.response?.data?.message || error.message || "Failed to reject business",
                type: "error"
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
        if (!business.operatingHours) return "Not specified";
        
        const days = Object.entries(business.operatingHours)
            .filter(([_, hours]) => !hours.closed)
            .map(([day, hours]) => `${day}: ${hours.open} - ${hours.close}`);
        
        return days.length > 0 ? days.join(', ') : "Closed";
    };

    const handlePageChange = (newPage: number) => {
        setPagination(prev => ({ ...prev, page: newPage }));
    };

    const handleFilterChange = () => {
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            {/* Main Content */}
            <div className={cn("flex-1 overflow-y-auto transition-all duration-300", selectedBusiness && !showApproveModal && !showRejectModal && "mr-[400px]")}>
                <div className="p-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Business/SPA Management</h1>
                        <p className="text-gray-600">Review, approve, and manage businesses on the platform.</p>
                    </div>

                    {/* Endpoint Availability Banner */}
                    {endpointsAvailable === false && (
                        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                            <div className="flex items-start gap-3">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-sm font-semibold text-yellow-800 mb-1">Admin API Endpoints Not Available</h3>
                                    <p className="text-sm text-yellow-700">
                                        The admin API endpoints are not yet implemented on the backend. Please contact the backend team to implement the following endpoints:
                                    </p>
                                    <ul className="mt-2 text-xs text-yellow-700 list-disc list-inside space-y-1">
                                        <li><code className="bg-yellow-100 px-1 rounded">GET /api/v1/admin/spas/statistics</code> - Get business statistics</li>
                                        <li><code className="bg-yellow-100 px-1 rounded">GET /api/v1/admin/spas</code> - Get all businesses</li>
                                        <li><code className="bg-yellow-100 px-1 rounded">GET /api/v1/admin/spas/:id</code> - Get business details</li>
                                        <li><code className="bg-yellow-100 px-1 rounded">POST /api/v1/admin/spas/:id/approve</code> - Approve business</li>
                                        <li><code className="bg-yellow-100 px-1 rounded">POST /api/v1/admin/spas/:id/reject</code> - Reject business</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Stats Cards */}
                    <div className="grid grid-cols-4 gap-4 mb-8">
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-600">Pending Approvals</span>
                            </div>
                            <p className="text-3xl font-bold text-[#9333EA]">{stats.pendingApprovals}</p>
                        </div>
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-600">Approved</span>
                            </div>
                            <p className="text-3xl font-bold text-gray-900">{stats.approved}</p>
                        </div>
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-600">Rejected</span>
                            </div>
                            <p className="text-3xl font-bold text-gray-900">{stats.rejected}</p>
                        </div>
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-600">Total Business</span>
                            </div>
                            <p className="text-3xl font-bold text-gray-900">{stats.allBusinesses}</p>
                        </div>
                    </div>

                    {/* Status Tabs */}
                    <div className="flex gap-2 mb-6 overflow-x-auto">
                        <button
                            onClick={() => { setActiveStatus('pending_approval'); handleFilterChange(); }}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-colors whitespace-nowrap",
                                activeStatus === 'pending_approval'
                                    ? "bg-[#9333EA] text-white"
                                    : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                            )}
                        >
                            <Clock className="h-4 w-4" />
                            Pending Approvals
                            {stats.pendingApprovals > 0 && (
                                <span className="px-2 py-0.5 rounded-full bg-white/20 text-xs font-bold">
                                    {stats.pendingApprovals}
                                </span>
                            )}
                        </button>
                        <button
                            onClick={() => { setActiveStatus('approved'); handleFilterChange(); }}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-colors whitespace-nowrap",
                                activeStatus === 'approved'
                                    ? "bg-[#9333EA] text-white"
                                    : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                            )}
                        >
                            <CheckCircle2 className="h-4 w-4" />
                            Approved
                            {stats.approved > 0 && (
                                <span className="px-2 py-0.5 rounded-full bg-white/20 text-xs font-bold">
                                    {stats.approved}
                                </span>
                            )}
                        </button>
                        <button
                            onClick={() => { setActiveStatus('rejected'); handleFilterChange(); }}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-colors whitespace-nowrap",
                                activeStatus === 'rejected'
                                    ? "bg-[#9333EA] text-white"
                                    : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                            )}
                        >
                            <XCircle className="h-4 w-4" />
                            Rejected
                            {stats.rejected > 0 && (
                                <span className="px-2 py-0.5 rounded-full bg-white/20 text-xs font-bold">
                                    {stats.rejected}
                                </span>
                            )}
                        </button>
                        <button
                            onClick={() => { setActiveStatus('ALL'); handleFilterChange(); }}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-colors whitespace-nowrap",
                                activeStatus === 'ALL'
                                    ? "bg-[#9333EA] text-white"
                                    : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                            )}
                        >
                            <Building2 className="h-4 w-4" />
                            All Businesses
                        </button>
                    </div>

                    {/* Filters */}
                    <div className="flex gap-4 mb-6 flex-wrap">
                        <div className="flex-1 min-w-[200px]">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    type="text"
                                    placeholder="Search businesses..."
                                    value={searchQuery}
                                    onChange={(e) => { setSearchQuery(e.target.value); handleFilterChange(); }}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <div className="flex-1 min-w-[200px]">
                            <Select
                                value={selectedType}
                                onChange={(e) => { setSelectedType(e.target.value); handleFilterChange(); }}
                                className="w-full"
                            >
                                <option value="All Types">All Types</option>
                                {businessTypes.map((type) => (
                                    <option key={type.code} value={type.code}>
                                        {type.name}
                                    </option>
                                ))}
                            </Select>
                        </div>
                        <div className="flex-1 min-w-[200px]">
                            <Select
                                value={selectedCity}
                                onChange={(e) => { setSelectedCity(e.target.value); handleFilterChange(); }}
                                className="w-full"
                            >
                                <option value="All Cities">All Cities</option>
                                {cities.map((city) => (
                                    <option key={city} value={city}>
                                        {city}
                                    </option>
                                ))}
                            </Select>
                        </div>
                        <div className="flex-1 min-w-[200px]">
                            <Select
                                value={sortBy}
                                onChange={(e) => { setSortBy(e.target.value); handleFilterChange(); }}
                                className="w-full"
                            >
                                <option value="newest">Newest First</option>
                                <option value="oldest">Oldest First</option>
                                <option value="name_asc">Name (A-Z)</option>
                                <option value="name_desc">Name (Z-A)</option>
                            </Select>
                        </div>
                    </div>

                    {/* Business Cards */}
                    {isLoading ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500">Loading businesses...</p>
                        </div>
                    ) : businesses.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-xl p-8 border border-gray-100">
                            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500 text-lg font-medium mb-2">No businesses found</p>
                            <p className="text-sm text-gray-400">
                                {stats.allBusinesses === 0 
                                    ? "The admin API endpoints are not available yet. Please contact the backend team to implement the admin endpoints."
                                    : "No businesses match the current filters."}
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                                {businesses.map((business) => {
                                    const location = business.city || business.address || 'N/A';

                                    return (
                                        <div
                                            key={business.id}
                                            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                                        >
                                            {/* Business Name & Status */}
                                            <div className="flex items-start justify-between mb-4">
                                                <h3 className="text-lg font-bold text-gray-900 flex-1">{business.businessName}</h3>
                                                {getStatusBadge(business.status)}
                                            </div>

                                            {/* Location */}
                                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                                                <MapPin className="h-4 w-4" />
                                                <span>{location}</span>
                                            </div>

                                            {/* Services */}
                                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                                                <ClipboardList className="h-4 w-4" />
                                                <span>{getBusinessTypeName(business)}</span>
                                            </div>

                                            {/* Registration Date */}
                                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                                                <Calendar className="h-4 w-4" />
                                                <span>
                                                    Registered: {business.registrationDate || business.createdAt
                                                        ? new Date(business.registrationDate || business.createdAt!).toLocaleDateString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric'
                                                        })
                                                        : 'N/A'}
                                                </span>
                                            </div>

                                            {/* CAC Number */}
                                            {business.cacNumber && (
                                                <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                                                    <CreditCard className="h-4 w-4" />
                                                    <span>CAC: {business.cacNumber}</span>
                                                </div>
                                            )}

                                            {/* Owner Info */}
                                            {business.owner && (
                                                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                                                            <User className="h-4 w-4 text-gray-600" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-semibold text-gray-900 truncate">
                                                                {business.owner.firstName} {business.owner.lastName}
                                                            </p>
                                                            <p className="text-xs text-gray-600 truncate">{business.owner.email}</p>
                                                            <p className="text-xs text-gray-600">{business.owner.phone}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Action Buttons */}
                                            <div className="flex gap-2">
                                                {business.status === 'pending_approval' && (
                                                    <>
                                                        <Button
                                                            onClick={() => handleApproveClick(business)}
                                                            disabled={processingId === business.id}
                                                            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                                                        >
                                                            <Check className="h-4 w-4 mr-1" />
                                                            Approve
                                                        </Button>
                                                        <Button
                                                            onClick={() => handleRejectClick(business)}
                                                            disabled={processingId === business.id}
                                                            className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                                                        >
                                                            <X className="h-4 w-4 mr-1" />
                                                            Reject
                                                        </Button>
                                                    </>
                                                )}
                                                <Button
                                                    onClick={() => handleViewBusiness(business)}
                                                    variant="outline"
                                                    className="flex-1"
                                                >
                                                    <Eye className="h-4 w-4 mr-1" />
                                                    View
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Pagination */}
                            {pagination.totalPages > 1 && (
                                <div className="flex items-center justify-center gap-2 mt-8">
                                    <Button
                                        variant="outline"
                                        onClick={() => handlePageChange(pagination.page - 1)}
                                        disabled={pagination.page === 1}
                                        className="flex items-center gap-2"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                        Previous
                                    </Button>
                                    <div className="flex gap-1">
                                        {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                                            let pageNum;
                                            if (pagination.totalPages <= 5) {
                                                pageNum = i + 1;
                                            } else if (pagination.page <= 3) {
                                                pageNum = i + 1;
                                            } else if (pagination.page >= pagination.totalPages - 2) {
                                                pageNum = pagination.totalPages - 4 + i;
                                            } else {
                                                pageNum = pagination.page - 2 + i;
                                            }
                                            return (
                                                <button
                                                    key={pageNum}
                                                    onClick={() => handlePageChange(pageNum)}
                                                    className={cn(
                                                        "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                                                        pagination.page === pageNum
                                                            ? "bg-[#9333EA] text-white"
                                                            : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                                                    )}
                                                >
                                                    {pageNum}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <Button
                                        variant="outline"
                                        onClick={() => handlePageChange(pagination.page + 1)}
                                        disabled={pagination.page >= pagination.totalPages}
                                        className="flex items-center gap-2"
                                    >
                                        Next
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Business Details Panel - Only show when not in modal */}
            {selectedBusiness && !showApproveModal && !showRejectModal && (
                <div className="fixed right-0 top-0 h-full w-[400px] bg-white shadow-2xl border-l border-gray-200 overflow-y-auto z-40">
                    <div className="p-6">
                        {loadingBusinessDetails ? (
                            <div className="text-center py-12">
                                <p className="text-gray-500">Loading details...</p>
                            </div>
                        ) : (
                            <>
                                {/* Header */}
                                <div className="flex items-start justify-between mb-6">
                                    <div className="flex-1">
                                        <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedBusiness.businessName}</h2>
                                        <div className="flex items-center gap-3 mb-2">
                                            {getStatusBadge(selectedBusiness.status)}
                                            <span className="text-sm text-gray-600">
                                                {selectedBusiness.city || selectedBusiness.address || 'N/A'}
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setSelectedBusiness(null)}
                                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                        <XIcon className="h-5 w-5 text-gray-500" />
                                    </button>
                                </div>

                                {/* Action Buttons */}
                                {selectedBusiness.status === 'pending_approval' && (
                                    <div className="flex gap-2 mb-6">
                                        <Button
                                            onClick={() => handleApproveClick(selectedBusiness)}
                                            disabled={processingId === selectedBusiness.id}
                                            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                                        >
                                            <Check className="h-4 w-4 mr-1" />
                                            Approve
                                        </Button>
                                        <Button
                                            onClick={() => handleRejectClick(selectedBusiness)}
                                            disabled={processingId === selectedBusiness.id}
                                            className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                                        >
                                            <X className="h-4 w-4 mr-1" />
                                            Reject
                                        </Button>
                                    </div>
                                )}

                                {/* Business Information */}
                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Information</h3>
                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-sm font-medium text-gray-500 mb-1">Business Type</p>
                                            <p className="text-sm text-gray-900">{getBusinessTypeName(selectedBusiness)}</p>
                                        </div>
                                        {selectedBusiness.cacNumber && (
                                            <div>
                                                <p className="text-sm font-medium text-gray-500 mb-1">CAC Registration Number</p>
                                                <p className="text-sm text-gray-900">{selectedBusiness.cacNumber}</p>
                                            </div>
                                        )}
                                        <div>
                                            <p className="text-sm font-medium text-gray-500 mb-1">Registration Date</p>
                                            <p className="text-sm text-gray-900">
                                                {selectedBusiness.registrationDate || selectedBusiness.createdAt
                                                    ? new Date(selectedBusiness.registrationDate || selectedBusiness.createdAt!).toLocaleDateString('en-US', {
                                                        month: 'long',
                                                        day: 'numeric',
                                                        year: 'numeric'
                                                    })
                                                    : 'N/A'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-500 mb-1">Business Hours</p>
                                            <p className="text-sm text-gray-900">{formatOperatingHours(selectedBusiness)}</p>
                                        </div>
                                        {selectedBusiness.description && (
                                            <div>
                                                <p className="text-sm font-medium text-gray-500 mb-1">Description</p>
                                                <p className="text-sm text-gray-900 leading-relaxed">{selectedBusiness.description}</p>
                                            </div>
                                        )}
                                        {selectedBusiness.address && (
                                            <div>
                                                <p className="text-sm font-medium text-gray-500 mb-1">Address</p>
                                                <p className="text-sm text-gray-900">{selectedBusiness.address}</p>
                                            </div>
                                        )}
                                        {selectedBusiness.amenities && selectedBusiness.amenities.length > 0 && (
                                            <div>
                                                <p className="text-sm font-medium text-gray-500 mb-1">Amenities</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {selectedBusiness.amenities.map((amenity, idx) => (
                                                        <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                                                            {amenity}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Owner Information */}
                                {selectedBusiness.owner && (
                                    <div className="mb-6">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Owner Information</h3>
                                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                                            <div className="h-12 w-12 rounded-full bg-[#9333EA] flex items-center justify-center text-white font-bold">
                                                {selectedBusiness.owner.firstName?.charAt(0)}{selectedBusiness.owner.lastName?.charAt(0)}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-semibold text-gray-900">
                                                    {selectedBusiness.owner.firstName} {selectedBusiness.owner.lastName}
                                                </p>
                                                <p className="text-xs text-gray-600">{selectedBusiness.owner.email}</p>
                                                <p className="text-xs text-gray-600">{selectedBusiness.owner.phone}</p>
                                                {selectedBusiness.owner.userId && (
                                                    <p className="text-xs text-gray-500 mt-1">User ID: {selectedBusiness.owner.userId}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Services Offered */}
                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Services Offered</h3>
                                    {selectedBusiness.services && selectedBusiness.services.length > 0 ? (
                                        <div className="flex flex-wrap gap-2">
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
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Approve Modal */}
            <Dialog open={showApproveModal} onOpenChange={setShowApproveModal}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Approve Business Registration</DialogTitle>
                        <DialogClose onClick={() => setShowApproveModal(false)}>
                            <XIcon className="h-4 w-4" />
                        </DialogClose>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <p className="text-sm text-green-800">
                                This business will be approved and the owner will be notified via email.
                            </p>
                        </div>
                        {selectedBusiness && (
                            <div className="space-y-2">
                                <p className="text-sm text-gray-600">
                                    <span className="font-medium">Business:</span> {selectedBusiness.businessName}
                                </p>
                                <p className="text-sm text-gray-600">
                                    <span className="font-medium">Owner:</span> {selectedBusiness.owner?.firstName} {selectedBusiness.owner?.lastName}
                                </p>
                            </div>
                        )}
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block">
                                Additional Notes (Optional)
                            </label>
                            <Textarea
                                value={approveNotes}
                                onChange={(e) => setApproveNotes(e.target.value)}
                                placeholder="Add any additional notes for the business owner..."
                                className="min-h-[100px]"
                                maxLength={500}
                            />
                            <p className="text-xs text-gray-500 mt-1">{approveNotes.length}/500 characters</p>
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
                                <Check className="h-4 w-4 mr-1" />
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
                        <DialogClose onClick={() => setShowRejectModal(false)}>
                            <XIcon className="h-4 w-4" />
                        </DialogClose>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <p className="text-sm text-red-800">
                                This action will reject the business registration and notify the owner via email.
                            </p>
                        </div>
                        {selectedBusiness && (
                            <div className="space-y-2">
                                <p className="text-sm text-gray-600">
                                    <span className="font-medium">Business:</span> {selectedBusiness.businessName}
                                </p>
                                <p className="text-sm text-gray-600">
                                    <span className="font-medium">Owner:</span> {selectedBusiness.owner?.firstName} {selectedBusiness.owner?.lastName}
                                </p>
                            </div>
                        )}
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block">
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
                                Minimum 20 characters required ({rejectReason.length}/20)
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Checkbox
                                checked={sendRejectionEmail}
                                onCheckedChange={(checked) => setSendRejectionEmail(checked as boolean)}
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
                                disabled={processingId === selectedBusiness?.id || rejectReason.trim().length < 20}
                                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                            >
                                <X className="h-4 w-4 mr-1" />
                                Confirm Rejection
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
