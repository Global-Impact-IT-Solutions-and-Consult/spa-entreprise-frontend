"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import {
    Search,
    Filter,
    Plus,
    ChevronLeft,
    ChevronRight,
    Calendar,
    Clock,
    User,
    Phone,
    X,
    AlertCircle,
    CalendarCheck,
    Banknote,
    Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { CreateBookingModal } from "@/components/modules/bookings/CreateBookingModal";
import { useAuthStore } from "@/store/auth.store";
import { bookingService, Booking } from "@/services/booking.service";
import { businessService, Service, Staff } from "@/services/business.service";
import { FiBell } from "react-icons/fi";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { useBookingOwnerActions } from "@/hooks/use-booking-owner-actions";
import { Sheet } from "@/components/ui/sheet";
import { BookingRowMobile } from "@/components/dashboard/booking-row-mobile";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { CachedDataBadge } from "@/components/cached-data-badge";
import { OfflineFallback } from "@/components/offline-fallback";

export default function BookingsPage() {
    const { user } = useAuthStore();
    const businessId = user?.businesses?.[0]?.id;

    const [activeTab, setActiveTab] = useState("Upcoming");
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    // Mobile-only: the desktop filter card becomes a bottom sheet.
    const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
    const [allBookings, setAllBookings] = useState<Booking[]>([]);
    const [businessServices, setBusinessServices] = useState<Service[]>([]);
    const [businessStaff, setBusinessStaff] = useState<Staff[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const isOnline = useOnlineStatus();
    const [stats, setStats] = useState({
        pending: 0,
        confirmedToday: 0,
        requireAction: 0,
        revenueToday: 0
    });
    const [tabCount, setTabCount] = useState({
        upcoming: 0,
        completed: 0,
        "pending cancellations": 0,
        canceled: 0
    });

    // Filter state
    const [filterService, setFilterService] = useState("all");
    const [filterStaff, setFilterStaff] = useState("all");
    const [filterDeliveryType, setFilterDeliveryType] = useState("all");
    const [filterDate, setFilterDate] = useState("");

    const [searchQuery, setSearchQuery] = useState("");

    // Applied filters (only update when "Apply" is clicked)
    const [appliedFilters, setAppliedFilters] = useState({
        service: "all",
        staff: "all",
        deliveryType: "all",
        date: "",
        search: ""
    });

    const statusMap: Record<string, string[]> = {
        "Upcoming": ["pending_payment", "confirmed"],
        "Completed": ["completed"],
        "Pending Cancellations": ["cancellation_pending_approval"],
        "Canceled": ["cancelled", "expired"]
    };

    const fetchBookings = useCallback(async () => {
        if (!businessId) return;
        setIsLoading(true);
        try {
            const [fetchedBookings, services, staff, metrics] = await Promise.all([
                bookingService.getSpaBookings(businessId, { limit: 100 }),
                businessService.getServices(businessId),
                businessService.getAllStaff(businessId),
                bookingService.getBookingsMetrics(businessId).catch(() => null)
            ]);
            const bookingsArray = Array.isArray(fetchedBookings) ? fetchedBookings : [];
            setBusinessServices(Array.isArray(services) ? services : []);
            setBusinessStaff(Array.isArray(staff) ? staff : []);
            setAllBookings(bookingsArray);

            setTabCount({
                upcoming: bookingsArray.filter(b => b.status === 'pending_payment' || b.status === 'confirmed').length,
                completed: bookingsArray.filter(b => b.status === 'completed').length,
                "pending cancellations": bookingsArray.filter(b => b.status === 'cancellation_pending_approval').length,
                canceled: bookingsArray.filter(b => b.status === 'cancelled' || b.status === 'expired').length
            });

            if (metrics) {
                setStats({
                    pending: metrics.pendingConfirmation || 0,
                    confirmedToday: metrics.todaysConfirmed || 0,
                    requireAction: metrics.requireAction || 0,
                    revenueToday: metrics.revenueToday || 0
                });
            } else {
                // Fallback client-side calculation if metrics API fails
                const now = new Date();
                const todayStr = now.toISOString().split('T')[0];
                const pending = bookingsArray.filter(b => b.status === 'pending_payment').length;
                const confirmedTodayData = bookingsArray.filter(b => b.status === 'confirmed' && b.bookingDate === todayStr);
                
                setStats({
                    pending,
                    confirmedToday: confirmedTodayData.length,
                    requireAction: pending,
                    revenueToday: confirmedTodayData.reduce((sum, b) => sum + b.totalPrice, 0) +
                        bookingsArray.filter(b => b.status === 'completed' && b.bookingDate === todayStr)
                            .reduce((sum, b) => sum + b.totalPrice, 0)
                });
            }
        } catch (error) {
            console.error("Error fetching bookings:", error);
        } finally {
            setIsLoading(false);
        }
    }, [businessId]);

    useEffect(() => {
        fetchBookings();
    }, [fetchBookings]);

    const {
        bookingToCancel,
        bookingToApprove,
        bookingToReject,
        handleConfirm,
        handleCancel,
        handleApproveCancellation,
        handleRejectCancellation,
        confirmCancel,
        confirmApproveCancellation,
        confirmRejectCancellation,
        clearCancel,
        clearApprove,
        clearReject,
    } = useBookingOwnerActions({ businessId, onDone: fetchBookings });

    // Filtered bookings based on active tab + applied filters
    const filteredBookings = useMemo(() => {
        const statuses = statusMap[activeTab];
        let filtered = allBookings.filter(b => statuses.includes(b.status));

        // Apply service filter
        if (appliedFilters.service !== "all") {
            filtered = filtered.filter(b => b.serviceName === appliedFilters.service);
        }

        // Apply staff filter
        if (appliedFilters.staff !== "all") {
            filtered = filtered.filter(b => b.staffName === appliedFilters.staff);
        }

        // Apply date filter
        if (appliedFilters.date) {
            filtered = filtered.filter(b => b.bookingDate === appliedFilters.date);
        }

        // Apply search
        if (appliedFilters.search.trim()) {
            const q = appliedFilters.search.toLowerCase();
            filtered = filtered.filter(b =>
                (b.customerName?.toLowerCase().includes(q)) ||
                (b.serviceName?.toLowerCase().includes(q)) ||
                (b.staffName?.toLowerCase().includes(q)) ||
                (b.id?.toLowerCase().includes(q))
            );
        }

        // Enrich with full service and staff data
        return filtered.map(booking => {
            const fullService = businessServices.find(s => s.id === booking.serviceId);
            const fullStaff = booking.staffId ? businessStaff.find(s => s.id === booking.staffId) : undefined;
            return {
                ...booking,
                fullService,
                fullStaff
            };
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [allBookings, activeTab, appliedFilters, businessServices, businessStaff]);

    const handleApplyFilters = () => {
        setAppliedFilters({
            service: filterService,
            staff: filterStaff,
            deliveryType: filterDeliveryType,
            date: filterDate,
            search: searchQuery
        });
    };

    const handleClearFilters = () => {
        setFilterService("all");
        setFilterStaff("all");
        setFilterDeliveryType("all");
        setFilterDate("");
        setSearchQuery("");
        setAppliedFilters({
            service: "all",
            staff: "all",
            deliveryType: "all",
            date: "",
            search: ""
        });
    };

    // Check if any filters are active
    const hasActiveFilters = appliedFilters.service !== "all" ||
        appliedFilters.staff !== "all" ||
        appliedFilters.date !== "" ||
        appliedFilters.search !== "";

    const activeFilterCount = [
        appliedFilters.service !== "all",
        appliedFilters.staff !== "all",
        appliedFilters.date !== "",
        appliedFilters.search !== "",
    ].filter(Boolean).length;

    const statsConfig = [
        {
            label: "Pending Confirmation",
            value: stats.pending.toString(),
            icon: Clock,
            iconBg: "bg-amber-100",
            iconColor: "text-amber-500",
        },
        {
            label: "Today\u2019s Confirmed",
            value: stats.confirmedToday.toString(),
            icon: CalendarCheck,
            iconBg: "bg-emerald-100",
            iconColor: "text-emerald-500",
        },
        {
            label: "Require Action",
            value: stats.requireAction.toString(),
            icon: AlertCircle,
            iconBg: "bg-orange-100",
            iconColor: "text-orange-500",
        },
        {
            label: "Revenue Today",
            value: `\u20A6${stats.revenueToday.toLocaleString()}`,
            icon: Banknote,
            iconBg: "bg-blue-100",
            iconColor: "text-blue-500",
        },
    ];

    // Also apply search immediately on typing (debounced via Enter or Apply)
    const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            setAppliedFilters(prev => ({ ...prev, search: searchQuery }));
        }
    };

    // Date formatter for Today/Tomorrow, Month DD, YYYY
    const formatBookingDate = (dateString: string) => {
        if (!dateString) return "";
        try {
            // Need to handle potential timezone issues by parsing correctly
            // dateString is typically YYYY-MM-DD
            const [year, month, day] = dateString.split('-').map(Number);
            const date = new Date(year, month - 1, day);

            const today = new Date();
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);

            const isToday = date.getDate() === today.getDate() &&
                date.getMonth() === today.getMonth() &&
                date.getFullYear() === today.getFullYear();

            const isTomorrow = date.getDate() === tomorrow.getDate() &&
                date.getMonth() === tomorrow.getMonth() &&
                date.getFullYear() === tomorrow.getFullYear();

            const formattedDate = date.toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
            });

            if (isToday) return `Today, ${formattedDate}`;
            if (isTomorrow) return `Tomorrow, ${formattedDate}`;
            return formattedDate;
        } catch (e) {
            return dateString;
        }
    };

    // Time formatter for 12-hour AM/PM format
    const formatTime12h = (time24: string) => {
        if (!time24) return "";
        try {
            const [hoursStr, minutes] = time24.split(':');
            const hours = parseInt(hoursStr, 10);
            const period = hours >= 12 ? 'PM' : 'AM';
            const displayHours = hours % 12 || 12; // Convert 0 to 12
            return `${displayHours}:${minutes} ${period}`;
        } catch (e) {
            return time24;
        }
    };

    return (
        <div className="">
            <div className="flex items-end justify-between mb-8">
                <div className="my-5 md:my-0">
                    <div className="flex flex-wrap items-center gap-2">
                        <h1 className="text-xl sm:text-3xl font-bold text-gray-900">Bookings Management</h1>
                        {!isOnline && allBookings.length > 0 && <CachedDataBadge />}
                    </div>
                    <p className="text-gray-500 mt-1 text-sm  sm:text-base">Manage appointments, track bookings, and handle scheduling for your business</p>
                </div>
                {/* <Button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-[#F59E0B] hover:bg-[#D97706] text-white gap-2 h-11 px-6 font-bold mb-1"
                >
                    <Plus className="h-5 w-5" />
                    New Booking
                </Button> */}
            </div>

            {/* Stats — mobile: compact 2-up grid */}
            <div className="lg:hidden grid grid-cols-2 gap-3 mb-6">
                {statsConfig.map((stat, index) => (
                    <div key={index} className="rounded-2xl bg-white p-3.5 shadow-sm ring-1 ring-gray-100">
                        <div className="flex items-start justify-between gap-2">
                            <p className="text-[11px] font-medium leading-tight text-gray-500">{stat.label}</p>
                            <div className={cn("shrink-0 rounded-lg p-1.5", stat.iconBg)}>
                                <stat.icon className={cn("h-3.5 w-3.5", stat.iconColor)} />
                            </div>
                        </div>
                        <p className="mt-2 text-[20px] font-bold leading-none text-gray-900">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Stats Grid */}
            <div className="hidden lg:block">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {statsConfig.map((stat, index) => (
                    <Card key={index} className="border-none shadow-sm hover:shadow-md ring-1 ring-gray-100 bg-white">
                        <CardContent className="p-6 px-4">
                            <div className="flex items-center gap-4">
                                <div className={cn("p-3 rounded-lg", stat.iconBg)}>
                                    <stat.icon className={cn("h-6 w-6", stat.iconColor)} />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
            </div>

            {/* Tabs & Filters */}
            <div className="space-y-6 mb-8">
                <div className="hidden lg:block">
                <div className="flex items-center gap-6 sm:gap-8 border-b border-gray-200 overflow-x-auto no-scrollbar">
                    {["Upcoming", "Completed", "Pending Cancellations", "Canceled"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={cn(
                                "pb-4 text-sm font-semibold whitespace-nowrap transition-colors relative flex items-center gap-1 shrink-0",
                                activeTab === tab
                                    ? "text-[#F59E0B]"
                                    : "text-gray-400 hover:text-gray-600"
                            )}
                        >
                            <FiBell className="mr-2 h-4 w-4" />
                            {tab}
                            <span className="text-xs px-2 py-1 rounded-full">({tabCount[tab.toLowerCase() as keyof typeof tabCount]})</span>
                            {activeTab === tab && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#F59E0B]" />
                            )}
                        </button>
                    ))}
                </div>
                </div>

                {/* Tabs — mobile: same underline treatment, scrolled, no bell icon */}
                <div className="lg:hidden scroll-row gap-5 border-b border-gray-200 -mx-4 px-4">
                    {["Upcoming", "Completed", "Pending Cancellations", "Canceled"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={cn(
                                "relative shrink-0 whitespace-nowrap pb-3 text-[13px] font-semibold transition-colors",
                                activeTab === tab ? "text-[#F59E0B]" : "text-gray-400"
                            )}
                        >
                            {tab}
                            <span className="ml-1 text-[11px]">
                                ({tabCount[tab.toLowerCase() as keyof typeof tabCount]})
                            </span>
                            {activeTab === tab && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#F59E0B]" />
                            )}
                        </button>
                    ))}
                </div>

                <div className="hidden lg:block">
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-6">
                    <h2 className="text-lg font-bold text-gray-900">
                        Filter Bookings <span className="text-sm font-normal text-gray-500 ml-2">Filter by service, staff, delivery type, or date</span>
                    </h2>

                    <div className="flex flex-wrap items-center gap-4">
                        {/* Service Filter */}
                        <div className="relative">
                            <select
                                value={filterService}
                                onChange={(e) => setFilterService(e.target.value)}
                                className="appearance-none bg-gray-50 border border-transparent rounded-lg px-4 py-2.5 pr-10 text-sm font-medium text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/20 w-44"
                            >
                                <option value="all">All Services</option>
                                {businessServices.map(s => (
                                    <option key={s.id} value={s.name}>{s.name}</option>
                                ))}
                            </select>
                            <ChevronLeft className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 rotate-[270deg] pointer-events-none" />
                        </div>

                        {/* Staff Filter */}
                        <div className="relative">
                            <select
                                value={filterStaff}
                                onChange={(e) => setFilterStaff(e.target.value)}
                                className="appearance-none bg-gray-50 border border-transparent rounded-lg px-4 py-2.5 pr-10 text-sm font-medium text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/20 w-44"
                            >
                                <option value="all">All Staffs</option>
                                {businessStaff.map(s => (
                                    <option key={s.id} value={s.name}>{s.name}</option>
                                ))}
                            </select>
                            <ChevronLeft className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 rotate-[270deg] pointer-events-none" />
                        </div>

                        {/* Delivery Type Filter */}
                        <div className="relative">
                            <select
                                value={filterDeliveryType}
                                onChange={(e) => setFilterDeliveryType(e.target.value)}
                                className="appearance-none bg-gray-50 border border-transparent rounded-lg px-4 py-2.5 pr-10 text-sm font-medium text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/20 w-44"
                            >
                                <option value="all">All Delivery Type</option>
                                <option value="in_location">In Location</option>
                                <option value="home_service">Home Service</option>
                            </select>
                            <ChevronLeft className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 rotate-[270deg] pointer-events-none" />
                        </div>

                        {/* Date Picker */}
                        <div className="relative">
                            <input
                                type="date"
                                value={filterDate}
                                onChange={(e) => setFilterDate(e.target.value)}
                                className="appearance-none bg-gray-50 border border-transparent rounded-lg px-4 py-2.5 pr-10 text-sm font-medium text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/20 w-44"
                            />
                            <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                        </div>

                        {/* Apply & Clear */}
                        <Button
                            onClick={handleApplyFilters}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-600 gap-2 font-semibold"
                        >
                            <Filter className="h-4 w-4" />
                            Apply
                        </Button>
                        <button
                            onClick={handleClearFilters}
                            className={cn(
                                "text-sm font-semibold px-2 transition-colors",
                                hasActiveFilters ? "text-red-500 hover:text-red-600" : "text-gray-400 hover:text-gray-600"
                            )}
                        >
                            Clear
                        </button>

                        {/* Active filter badges */}
                        {hasActiveFilters && (
                            <div className="flex items-center gap-2 ml-auto">
                                {appliedFilters.service !== "all" && (
                                    <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 text-xs font-medium px-2.5 py-1 rounded-full border border-amber-200">
                                        {appliedFilters.service}
                                        <X className="h-3 w-3 cursor-pointer" onClick={() => {
                                            setFilterService("all");
                                            setAppliedFilters(prev => ({ ...prev, service: "all" }));
                                        }} />
                                    </span>
                                )}
                                {appliedFilters.staff !== "all" && (
                                    <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full border border-blue-200">
                                        {appliedFilters.staff}
                                        <X className="h-3 w-3 cursor-pointer" onClick={() => {
                                            setFilterStaff("all");
                                            setAppliedFilters(prev => ({ ...prev, staff: "all" }));
                                        }} />
                                    </span>
                                )}
                                {appliedFilters.date && (
                                    <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 text-xs font-medium px-2.5 py-1 rounded-full border border-purple-200">
                                        {new Date(appliedFilters.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        <X className="h-3 w-3 cursor-pointer" onClick={() => {
                                            setFilterDate("");
                                            setAppliedFilters(prev => ({ ...prev, date: "" }));
                                        }} />
                                    </span>
                                )}
                                {appliedFilters.search && (
                                    <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 text-xs font-medium px-2.5 py-1 rounded-full border border-gray-200">
                                        &quot;{appliedFilters.search}&quot;
                                        <X className="h-3 w-3 cursor-pointer" onClick={() => {
                                            setSearchQuery("");
                                            setAppliedFilters(prev => ({ ...prev, search: "" }));
                                        }} />
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                </div>
                </div>

                {/* Filters — mobile: icon button opening a Sheet with the same
                    controls, plus the active-filter chips as a scroll row */}
                <div className="lg:hidden flex items-center gap-2">
                    <button
                        onClick={() => setIsFilterSheetOpen(true)}
                        className="h-10 shrink-0 flex items-center gap-1.5 rounded-xl bg-white px-3 text-[12px] font-semibold text-gray-600 shadow-sm ring-1 ring-gray-100"
                    >
                        <Filter className="h-4 w-4" />
                        Filters
                        {activeFilterCount > 0 && (
                            <span className="ml-0.5 rounded-full bg-[#F59E0B] px-1.5 py-0.5 text-[10px] font-bold text-white">
                                {activeFilterCount}
                            </span>
                        )}
                    </button>

                    {hasActiveFilters ? (
                        <div className="scroll-row min-w-0 gap-2">
                            {appliedFilters.service !== "all" && (
                                <span className="shrink-0 inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-medium text-amber-700">
                                    {appliedFilters.service}
                                    <X className="h-3 w-3" onClick={() => {
                                        setFilterService("all");
                                        setAppliedFilters(prev => ({ ...prev, service: "all" }));
                                    }} />
                                </span>
                            )}
                            {appliedFilters.staff !== "all" && (
                                <span className="shrink-0 inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[11px] font-medium text-blue-700">
                                    {appliedFilters.staff}
                                    <X className="h-3 w-3" onClick={() => {
                                        setFilterStaff("all");
                                        setAppliedFilters(prev => ({ ...prev, staff: "all" }));
                                    }} />
                                </span>
                            )}
                            {appliedFilters.date && (
                                <span className="shrink-0 inline-flex items-center gap-1 rounded-full border border-purple-200 bg-purple-50 px-2.5 py-1 text-[11px] font-medium text-purple-700">
                                    {new Date(appliedFilters.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    <X className="h-3 w-3" onClick={() => {
                                        setFilterDate("");
                                        setAppliedFilters(prev => ({ ...prev, date: "" }));
                                    }} />
                                </span>
                            )}
                            {appliedFilters.search && (
                                <span className="shrink-0 inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-100 px-2.5 py-1 text-[11px] font-medium text-gray-700">
                                    &quot;{appliedFilters.search}&quot;
                                    <X className="h-3 w-3" onClick={() => {
                                        setSearchQuery("");
                                        setAppliedFilters(prev => ({ ...prev, search: "" }));
                                    }} />
                                </span>
                            )}
                        </div>
                    ) : (
                        <p className="truncate text-[11px] text-gray-400"></p>
                    )}
                </div>

                {/* Search */}
                <div className="hidden lg:block">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={handleSearchKeyDown}
                        placeholder="Search bookings by customer name, service, or booking ID... (press Enter)"
                        className="pl-12 h-14 bg-white border-gray-100 shadow-sm rounded-xl focus-visible:ring-[#F59E0B]"
                    />
                </div>
                </div>

                {/* Booking Cards Grid */}
                {isLoading ? (
                    <>
                        <div className="hidden lg:grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <Card key={i} className="border-none shadow-sm ring-1 ring-gray-100 overflow-hidden">
                                    <CardContent className="p-0">
                                        <Skeleton className="h-[140px] w-full rounded-none" />
                                        <div className="p-6 space-y-4">
                                            <Skeleton className="h-4 w-2/3" />
                                            <Skeleton className="h-3 w-1/2" />
                                            <Skeleton className="h-3 w-1/3" />
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                        <div className="lg:hidden space-y-3">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="rounded-2xl bg-white border border-gray-100 p-4 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <Skeleton className="h-3.5 w-1/2" />
                                        <Skeleton className="h-5 w-16 rounded-full" />
                                    </div>
                                    <Skeleton className="h-3 w-2/3" />
                                </div>
                            ))}
                        </div>
                    </>
                ) : !isOnline && allBookings.length === 0 ? (
                    <OfflineFallback message="Your bookings will appear here once you're back online." />
                ) : filteredBookings.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-gray-100 gap-4">
                        <CalendarCheck className="h-12 w-12 text-gray-200" />
                        <div className="text-center">
                            <p className="text-lg font-bold text-gray-900">
                                {hasActiveFilters ? "No bookings match your filters" : `No ${activeTab.toLowerCase()} bookings`}
                            </p>
                            <p className="text-sm text-gray-400">
                                {hasActiveFilters ? "Try adjusting your filters or clearing them" : "When you have bookings, they will appear here"}
                            </p>
                        </div>
                        {hasActiveFilters && (
                            <Button
                                onClick={handleClearFilters}
                                variant="outline"
                                className="mt-2 text-sm font-semibold"
                            >
                                Clear All Filters
                            </Button>
                        )}
                    </div>
                ) : (
                    <>
                    <div className="hidden lg:block">
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredBookings.map((booking) => (
                            <Card key={booking.id} className="border-none shadow-sm ring-1 ring-gray-100 overflow-hidden group">
                                <CardContent className="p-0 h-full">
                                    <div className="h-[140px] relative w-full bg-gray-100">
                                        <Image
                                            src={booking.fullService?.imageUrl || "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&q=80"}
                                            alt={booking.serviceName || "Service"}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <div className="flex-1 p-6 space-y-4">
                                        <div className="flex items-start justify-between">
                                            <div className="space-y-1">
                                                <h3 className="text-lg font-bold text-gray-900">{booking.serviceName}</h3>
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                                        <User className="h-3.5 w-3.5 text-[#192131]" strokeWidth={2} />
                                                        <span>{booking.customerName || "Guest"}</span>
                                                        {booking.customerPhone && (
                                                            <>
                                                                <span className="w-1 h-1 rounded-full bg-gray-500" />
                                                                <div className="flex items-center gap-1">
                                                                    <Phone className="h-3.5 w-3.5 text-[#192131]" strokeWidth={2} />
                                                                    <span>{booking.customerPhone}</span>
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                    {(booking.fullStaff || booking.staffName || booking.staffId) && (
                                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                                            <Users className="h-3.5 w-3.5" />
                                                            <span>{booking.fullStaff?.name || booking.staffName || booking.staffId}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <hr className="border-gray-100" />

                                        <div className="flex justify-between">
                                            <div className="flex flex-col gap-1 py-2 border-y border-gray-50">
                                                <div className="flex items-center gap-2 text-[13px] text-gray-600 font-medium">
                                                    <Calendar className="h-3.5 w-3.5 text-gray-400" strokeWidth={3} />
                                                    <span>{formatBookingDate(booking.bookingDate)}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-[13px] text-gray-600 font-medium">
                                                    <Clock className="h-3.5 w-3.5 text-gray-400" strokeWidth={3} />
                                                    <span>
                                                        {formatTime12h(booking.startTime)} - {formatTime12h(booking.endTime)}
                                                        {booking.fullService && (
                                                            <span className="ml-1 text-gray-400">
                                                                ({(booking.fullService.duration || 0) + (booking.fullService.bufferTime || 0)} mins {booking.fullService.bufferTime ? 'with buffer' : ''})
                                                            </span>
                                                        )}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <div className="space-y-2">
                                                    <div className={cn(
                                                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border capitalize",
                                                        booking.status === 'confirmed' || booking.status === 'completed'
                                                            ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                                                            : booking.status === 'cancellation_pending_approval'
                                                            ? "bg-none text-rose-600 border-none font-semibold px-0"
                                                            : "bg-amber-50 text-amber-600 border-amber-100"
                                                    )}>
                                                        {booking.status.replaceAll('_', ' ')}
                                                    </div>
                                                    <p className="text-lg font-bold text-gray-900">₦{booking.totalPrice.toLocaleString()}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <hr className="border-gray-100" />

                                        <div className="flex items-center justify-end gap-2">
                                            {booking.status === 'pending_payment' && (
                                                <Button
                                                    onClick={() => handleConfirm(booking.id)}
                                                    className="bg-[#1A1F2C] hover:bg-black text-white h-9 px-4 font-bold"
                                                >
                                                    Confirm
                                                </Button>
                                            )}
                                            {booking.status === 'cancellation_pending_approval' ? (
                                                <>
                                                    <Button
                                                        onClick={() => handleRejectCancellation(booking.id)}
                                                        variant="outline"
                                                        className="h-9 gap-1.5 border-gray-200 hover:border-[#1A1F2C] hover:bg-gray-50 font-semibold px-4"
                                                    >
                                                        Reject Request
                                                    </Button>
                                                    <Button
                                                        onClick={() => handleApproveCancellation(booking.id)}
                                                        className="bg-[#E74C3C] hover:bg-[#C0392B] text-white h-9 gap-1.5 font-bold px-4"
                                                    >
                                                        <X className="h-3.5 w-3.5" />
                                                        Approve Cancellation
                                                    </Button>
                                                </>
                                            ) : (
                                                booking.status !== 'cancelled' && booking.status !== 'completed' && (
                                                    <Button
                                                        onClick={() => handleCancel(booking.id)}
                                                        variant="outline"
                                                        className="h-9 gap-1.5 bg-[#CA3A311A] text-red-600 border-[#CA3A31] hover:bg-red-50 font-semibold px-4"
                                                    >
                                                        <X className="h-3.5 w-3.5" />
                                                        Cancel
                                                    </Button>
                                                )
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                    </div>

                    {/* Booking rows — mobile: swipe-to-reveal actions */}
                    <div className="lg:hidden space-y-3">
                        {filteredBookings.map((booking) => (
                            <BookingRowMobile
                                key={booking.id}
                                booking={booking}
                                dateLabel={formatBookingDate(booking.bookingDate)}
                                timeLabel={`${formatTime12h(booking.startTime)} - ${formatTime12h(booking.endTime)}`}
                                onConfirm={handleConfirm}
                                onCancel={handleCancel}
                                onApproveCancellation={handleApproveCancellation}
                                onRejectCancellation={handleRejectCancellation}
                            />
                        ))}
                    </div>
                    </>
                )}

                {/* Pagination Placeholder — hidden on mobile, it isn't wired up */}
                <div className="hidden lg:flex items-center justify-center gap-2 py-8">
                    <button className="p-2 rounded-lg border border-gray-100 text-gray-400 hover:bg-gray-50 disabled:opacity-50" disabled>
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button className="h-10 w-10 rounded-lg border text-sm font-semibold bg-amber-50 border-amber-200 text-amber-600">
                        1
                    </button>
                    <button className="p-2 rounded-lg border border-gray-100 text-gray-400 hover:bg-gray-50 disabled:opacity-50" disabled>
                        <ChevronRight className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {/* Mobile filter sheet — same state and handlers as the desktop card */}
            <div className="lg:hidden">
                <Sheet
                    open={isFilterSheetOpen}
                    onClose={() => setIsFilterSheetOpen(false)}
                    title="Filter Bookings"
                    className="max-w-none"
                    footer={
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => {
                                    handleClearFilters();
                                    setIsFilterSheetOpen(false);
                                }}
                                className="h-12 flex-1 rounded-xl bg-gray-100 text-[14px] font-semibold text-gray-600"
                            >
                                Clear
                            </button>
                            <button
                                onClick={() => {
                                    handleApplyFilters();
                                    setIsFilterSheetOpen(false);
                                }}
                                className="h-12 flex-1 rounded-xl bg-[#F59E0B] text-[14px] font-bold text-white"
                            >
                                Apply Filters
                            </button>
                        </div>
                    }
                >
                    <div className="space-y-4 px-4 pb-4">
                        <div className="relative">
                            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <Input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Customer, service or booking ID"
                                className="h-12 rounded-xl border-gray-100 bg-gray-50 pl-10 text-[14px] focus-visible:ring-[#F59E0B]"
                            />
                        </div>

                        <div>
                            <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Service</label>
                            <select
                                value={filterService}
                                onChange={(e) => setFilterService(e.target.value)}
                                className="mt-1.5 h-12 w-full appearance-none rounded-xl border border-transparent bg-gray-50 px-4 text-[14px] font-medium text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/20"
                            >
                                <option value="all">All Services</option>
                                {businessServices.map(s => (
                                    <option key={s.id} value={s.name}>{s.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Staff</label>
                            <select
                                value={filterStaff}
                                onChange={(e) => setFilterStaff(e.target.value)}
                                className="mt-1.5 h-12 w-full appearance-none rounded-xl border border-transparent bg-gray-50 px-4 text-[14px] font-medium text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/20"
                            >
                                <option value="all">All Staffs</option>
                                {businessStaff.map(s => (
                                    <option key={s.id} value={s.name}>{s.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Delivery Type</label>
                            <select
                                value={filterDeliveryType}
                                onChange={(e) => setFilterDeliveryType(e.target.value)}
                                className="mt-1.5 h-12 w-full appearance-none rounded-xl border border-transparent bg-gray-50 px-4 text-[14px] font-medium text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/20"
                            >
                                <option value="all">All Delivery Type</option>
                                <option value="in_location">In Location</option>
                                <option value="home_service">Home Service</option>
                            </select>
                        </div>

                        <div>
                            <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Date</label>
                            <input
                                type="date"
                                value={filterDate}
                                onChange={(e) => setFilterDate(e.target.value)}
                                className="mt-1.5 h-12 w-full appearance-none rounded-xl border border-transparent bg-gray-50 px-4 text-[14px] font-medium text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/20"
                            />
                        </div>
                    </div>
                </Sheet>
            </div>

            <CreateBookingModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={fetchBookings}

            />

            <ConfirmModal
                isOpen={!!bookingToCancel}
                title="Cancel Booking?"
                message="Are you sure you want to cancel this booking? This action cannot be undone."
                variant="danger"
                confirmLabel="Cancel Booking"
                onConfirm={confirmCancel}
                onCancel={clearCancel}
            />

            <ConfirmModal
                isOpen={!!bookingToApprove}
                title="Approve Cancellation Request?"
                message="Are you sure you want to approve this cancellation? The booking will be cancelled and the customer will be notified."
                variant="danger"
                confirmLabel="Approve & Cancel"
                onConfirm={confirmApproveCancellation}
                onCancel={clearApprove}
            />

            <ConfirmModal
                isOpen={!!bookingToReject}
                title="Reject Cancellation Request?"
                message="Are you sure you want to reject this request? The booking will remain active and the customer will be notified."
                variant="warning"
                confirmLabel="Reject Request"
                onConfirm={confirmRejectCancellation}
                onCancel={clearReject}
            />
        </div>
    );
}
