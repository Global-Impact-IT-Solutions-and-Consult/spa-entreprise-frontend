"use client";

import { useState, useEffect } from "react";
import { CustomerHeader } from "@/components/modules/customer/customer-header";
import { CustomerFooter } from "@/components/modules/customer/customer-footer";
import { HistoryServiceCard, HistoryServiceSkeleton } from "@/components/modules/customer/history-service-card";
import { HistoryBusinessCard, HistoryBusinessSkeleton } from "@/components/modules/customer/history-business-card";
import { bookingService, Booking } from "@/services/booking.service";
import { businessService } from "@/services/business.service";
import { useAuthStore } from "@/store/auth.store";
import { toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";
import { History, LayoutGrid, Store, Clock } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";

export default function HistoryPage() {
    const { isAuthenticated } = useAuthStore();
    const [activeTab, setActiveTab] = useState<"businesses" | "services">("businesses");
    const [historyServices, setHistoryServices] = useState<any[]>([]);
    const [historyBusinesses, setHistoryBusinesses] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchHistory = async () => {
        if (!isAuthenticated) return;

        setIsLoading(true);
        try {
            // Fetch completed bookings for services history
            const res = await bookingService.getUserBookings({ status: 'completed' });
            const bookings = res.data;

            // Map services history
            const serviceHistory = bookings.map((b: Booking) => ({
                id: b.id,
                serviceName: b.serviceName,
                businessName: b.businessName,
                location: "Victoria Island", // Placeholder if not in booking
                staffName: b.staffName,
                price: b.totalPrice,
                date: format(new Date(b.bookingDate), 'eee, dd MMM yyyy'),
                time: b.startTime,
                duration: 60, // Default or calculated
                imageUrl: "", // Will try to enrich or use placeholder
                relativeTime: formatDistanceToNow(new Date(b.bookingDate), { addSuffix: true }),
                status: b.status
            }));

            setHistoryServices(serviceHistory);

            // Derive unique businesses visited
            const uniqueBizIds = Array.from(new Set(bookings.map(b => b.businessId)));
            const bizHistory = await Promise.all(uniqueBizIds.map(async (id) => {
                const lastBooking = bookings.find(b => b.businessId === id)!;
                try {
                    const biz = await businessService.getBusiness(id);
                    return {
                        id: biz.id,
                        name: biz.businessName,
                        location: biz.addressDetails?.city?.name || (typeof biz.city === 'string' ? biz.city : (biz.city as any)?.name) || "Lagos",
                        description: biz.description,
                        imageUrl: biz.primaryImageUrl,
                        relativeTime: formatDistanceToNow(new Date(lastBooking.bookingDate), { addSuffix: true }),
                        isOpen: true
                    };
                } catch (e) {
                    return {
                        id,
                        name: lastBooking.businessName,
                        location: "Lagos",
                        description: "Premium wellness service",
                        relativeTime: formatDistanceToNow(new Date(lastBooking.bookingDate), { addSuffix: true }),
                    };
                }
            }));

            setHistoryBusinesses(bizHistory);

        } catch (error) {
            console.error("Failed to fetch history", error);
            toaster.create({ title: "Error", description: "Failed to load history.", type: "error" });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, [isAuthenticated]);

    return (
        <div className="min-h-screen bg-[#F9FAFB]">
            <CustomerHeader />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
                {/* Page Header */}
                <div className="mb-10">
                    <h1 className="text-3xl md:text-5xl font-black text-gray-900 font-playfair mb-3">Recent History</h1>
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] md:text-xs">
                        Businesses Visits and Services History
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-8 mb-10 border-b border-gray-100">
                    <button
                        onClick={() => setActiveTab("businesses")}
                        className={cn(
                            "pb-4 text-xs md:text-sm font-black uppercase tracking-widest transition-all relative",
                            activeTab === "businesses" ? "text-orange-400" : "text-gray-300 hover:text-gray-400"
                        )}
                    >
                        Saved Businesses
                        {activeTab === "businesses" && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-400" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab("services")}
                        className={cn(
                            "pb-4 text-xs md:text-sm font-black uppercase tracking-widest transition-all relative",
                            activeTab === "services" ? "text-orange-400" : "text-gray-300 hover:text-gray-400"
                        )}
                    >
                        Saved Services
                        {activeTab === "services" && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-400" />
                        )}
                    </button>
                </div>

                {/* Content */}
                {isLoading ? (
                    <div className={cn(
                        "grid gap-6",
                        activeTab === "services" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
                    )}>
                        {[1, 2, 3].map((i) => (
                            activeTab === "services" ? <HistoryServiceSkeleton key={i} /> : <HistoryBusinessSkeleton key={i} />
                        ))}
                    </div>
                ) : (activeTab === "services" ? historyServices : historyBusinesses).length === 0 ? (
                    <div className="py-24 flex flex-col items-center justify-center text-center bg-white rounded-[2rem] border border-dashed border-gray-200 shadow-sm">
                        <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mb-6">
                            <History className="w-10 h-10 text-orange-400" />
                        </div>
                        <h3 className="text-xl md:text-2xl font-black text-gray-900 mb-2">No history found</h3>
                        <p className="text-gray-400 max-w-xs mx-auto mb-10 font-bold uppercase tracking-widest text-[10px]">
                            Your completed bookings and visits will appear here
                        </p>
                        <a href="/discover" className="bg-[#E89D24] hover:bg-[#D97706] text-white px-10 h-14 flex items-center justify-center rounded-2xl font-black text-sm transition-all active:scale-[0.98] shadow-xl shadow-orange-100 uppercase tracking-widest">
                            Book Your First Service
                        </a>
                    </div>
                ) : (
                    <div className={cn(
                        "grid gap-6",
                        activeTab === "services" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1 md:grid-cols-1 lg:grid-cols-1"
                    )}>
                        {activeTab === "services" ? (
                            historyServices.map((booking) => (
                                <HistoryServiceCard key={booking.id} booking={booking} />
                            ))
                        ) : (
                            <div className="space-y-6">
                                {historyBusinesses.map((biz) => (
                                    <HistoryBusinessCard key={biz.id} business={biz} />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </main>

            <CustomerFooter />
        </div>
    );
}
