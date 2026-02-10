"use client";

import { useEffect, useState, useCallback } from "react";
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
    Users,
    Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { CreateBookingModal } from "@/components/modules/bookings/CreateBookingModal";
import { useAuthStore } from "@/store/auth.store";
import { bookingService, Booking } from "@/services/booking.service";

export default function BookingsPage() {
    const { user } = useAuthStore();
    const businessId = user?.businesses?.[0]?.id;

    const [activeTab, setActiveTab] = useState("Upcoming");
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState({
        pending: 0,
        confirmedToday: 0,
        requireAction: 0,
        revenueToday: 0
    });

    const statusMap: Record<string, string[]> = {
        "Upcoming": ["pending_payment", "confirmed"],
        "Completed": ["completed"],
        "Canceled": ["cancelled", "expired"]
    };

    const fetchBookings = useCallback(async () => {
        if (!businessId) return;
        setIsLoading(true);
        try {
            const statuses = statusMap[activeTab];
            // Since API might only take one status, we'll fetch all and filter or make multiple calls
            // For now, let's fetch all and filter locally for simpler implementation if API is limited
            const allBookings = await bookingService.getSpaBookings(businessId, { limit: 100 });
            const bookingsArray = Array.isArray(allBookings) ? allBookings : [];

            // Filter by selected tab statuses
            const filtered = bookingsArray.filter(b => statuses.includes(b.status));
            setBookings(filtered);

            // Calculate stats from all bookings
            const now = new Date();
            const todayStr = now.toISOString().split('T')[0];

            const pending = bookingsArray.filter(b => b.status === 'pending_payment').length;
            const confirmedTodayData = bookingsArray.filter(b => b.status === 'confirmed' && b.bookingDate === todayStr);
            const confirmedToday = confirmedTodayData.length;
            const revenueToday = confirmedTodayData.reduce((sum, b) => sum + b.totalPrice, 0) +
                bookingsArray.filter(b => b.status === 'completed' && b.bookingDate === todayStr)
                    .reduce((sum, b) => sum + b.totalPrice, 0);

            setStats({
                pending,
                confirmedToday,
                requireAction: pending, // For now
                revenueToday
            });
        } catch (error) {
            console.error("Error fetching bookings:", error);
        } finally {
            setIsLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [businessId, activeTab]);

    useEffect(() => {
        fetchBookings();
    }, [fetchBookings]);

    const handleConfirm = async (id: string) => {
        try {
            await bookingService.confirmBooking(id, { notes: "Handled from dashboard" });
            fetchBookings();
        } catch (error) {
            console.error("Error confirming booking:", error);
        }
    };

    const handleCancel = async (id: string) => {
        if (!confirm("Are you sure you want to cancel this booking?")) return;
        try {
            await bookingService.cancelBooking(id, { reason: "Cancelled by business owner" });
            fetchBookings();
        } catch (error) {
            console.error("Error cancelling booking:", error);
        }
    };

    const statsConfig = [
        {
            label: "Pending Confirmation",
            value: stats.pending.toString(),
            icon: Clock,
            iconBg: "bg-amber-100",
            iconColor: "text-amber-500",
        },
        {
            label: "Today's Confirmed",
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
            value: `₦${stats.revenueToday.toLocaleString()}`,
            icon: Banknote,
            iconBg: "bg-blue-100",
            iconColor: "text-blue-500",
        },
    ];

    return (
        <div className="space-y-8 p-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Bookings Management</h1>
                    <p className="text-gray-500 mt-1">Manage appointments, track bookings, and handle scheduling for your business</p>
                </div>
                <Button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-[#F59E0B] hover:bg-[#D97706] text-white gap-2 h-11 px-6 font-bold"
                >
                    <Plus className="h-5 w-5" />
                    New Booking
                </Button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statsConfig.map((stat, index) => (
                    <Card key={index} className="border-none shadow-sm ring-1 ring-gray-100">
                        <CardContent className="p-6">
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

            {/* Tabs & Filters */}
            <div className="space-y-6">
                <div className="flex items-center gap-8 border-b border-gray-200">
                    {["Upcoming", "Completed", "Canceled"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={cn(
                                "pb-4 text-sm font-semibold transition-colors relative",
                                activeTab === tab
                                    ? "text-[#F59E0B]"
                                    : "text-gray-400 hover:text-gray-600"
                            )}
                        >
                            {tab}
                            {activeTab === tab && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#F59E0B]" />
                            )}
                        </button>
                    ))}
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-6">
                    <h2 className="text-lg font-bold text-gray-900">
                        Filter Bookings <span className="text-sm font-normal text-gray-500 ml-2">Filter by service, staff, delivery type, or date</span>
                    </h2>

                    <div className="flex flex-wrap items-center gap-4">
                        <div className="relative">
                            <select className="appearance-none bg-gray-50 border border-transparent rounded-lg px-4 py-2.5 pr-10 text-sm font-medium text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/20 w-44">
                                <option>All Services</option>
                            </select>
                            <ChevronLeft className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 rotate-[270deg]" />
                        </div>
                        <div className="relative">
                            <select className="appearance-none bg-gray-50 border border-transparent rounded-lg px-4 py-2.5 pr-10 text-sm font-medium text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/20 w-44">
                                <option>All Staffs</option>
                            </select>
                            <ChevronLeft className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 rotate-[270deg]" />
                        </div>
                        <Button className="bg-gray-100 hover:bg-gray-200 text-gray-600 gap-2 font-semibold">
                            <Filter className="h-4 w-4" />
                            Apply
                        </Button>
                        <button className="text-sm font-semibold text-gray-400 hover:text-gray-600 px-2 transition-colors">Clear</button>
                    </div>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                        placeholder="Search bookings by customer name, service, or booking ID...."
                        className="pl-12 h-14 bg-white border-gray-100 shadow-sm rounded-xl focus-visible:ring-[#F59E0B]"
                    />
                </div>

                {/* Booking Cards Grid */}
                {isLoading ? (
                    <div className="flex h-64 items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-[#F59E0B]" />
                    </div>
                ) : bookings.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-gray-100 gap-4">
                        <CalendarCheck className="h-12 w-12 text-gray-200" />
                        <div className="text-center">
                            <p className="text-lg font-bold text-gray-900">No {activeTab.toLowerCase()} bookings</p>
                            <p className="text-sm text-gray-400">When you have bookings, they will appear here</p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        {bookings.map((booking) => (
                            <Card key={booking.id} className="border-none shadow-sm ring-1 ring-gray-100 overflow-hidden group">
                                <CardContent className="p-0 flex h-full">
                                    <div className="w-1/3 bg-gray-50 h-full min-h-[220px] flex items-center justify-center">
                                        <Calendar className="h-12 w-12 text-gray-200" />
                                    </div>
                                    <div className="flex-1 p-6 space-y-4">
                                        <div className="flex items-start justify-between">
                                            <div className="space-y-1">
                                                <h3 className="text-lg font-bold text-gray-900">{booking.serviceName}</h3>
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                                        <User className="h-3.5 w-3.5" />
                                                        <span>{booking.customerName || "Guest"}</span>
                                                        {booking.customerPhone && (
                                                            <>
                                                                <span className="w-1 h-1 rounded-full bg-gray-300" />
                                                                <div className="flex items-center gap-1">
                                                                    <Phone className="h-3.5 w-3.5" />
                                                                    <span>{booking.customerPhone}</span>
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                    {booking.staffName && (
                                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                                            <Users className="h-3.5 w-3.5" />
                                                            <span>{booking.staffName}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-1 py-2 border-y border-gray-50">
                                            <div className="flex items-center gap-2 text-[13px] text-gray-600 font-medium">
                                                <Calendar className="h-3.5 w-3.5 text-gray-400" />
                                                <span>{booking.bookingDate}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-[13px] text-gray-600">
                                                <Clock className="h-3.5 w-3.5 text-gray-400" />
                                                <span>{booking.startTime} - {booking.endTime}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="space-y-2">
                                                <div className={cn(
                                                    "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border capitalize",
                                                    booking.status === 'confirmed' || booking.status === 'completed'
                                                        ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                                                        : "bg-amber-50 text-amber-600 border-amber-100"
                                                )}>
                                                    {booking.status.replace('_', ' ')}
                                                </div>
                                                <p className="text-lg font-bold text-gray-900">₦{booking.totalPrice.toLocaleString()}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {booking.status === 'pending_payment' && (
                                                    <Button
                                                        onClick={() => handleConfirm(booking.id)}
                                                        className="bg-[#1A1F2C] hover:bg-black text-white h-9 px-4 font-bold"
                                                    >
                                                        Confirm
                                                    </Button>
                                                )}
                                                {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                                                    <Button
                                                        onClick={() => handleCancel(booking.id)}
                                                        variant="outline"
                                                        className="h-9 gap-1.5 text-red-600 border-red-200 hover:bg-red-50 font-semibold px-4"
                                                    >
                                                        <X className="h-3.5 w-3.5" />
                                                        Cancel
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Pagination Placeholder */}
                <div className="flex items-center justify-center gap-2 py-8">
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

            <CreateBookingModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={fetchBookings}
            />
        </div>
    );
}
