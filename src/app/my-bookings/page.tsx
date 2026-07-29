"use client";

import { useState, useEffect, useCallback } from "react";
import { CustomerHeader } from "@/components/modules/customer/customer-header";
import { CustomerFooter } from "@/components/modules/customer/customer-footer";
import { MobileFooterStrip } from "@/components/modules/customer/mobile-footer-strip";
import { CustomerBottomNav } from "@/components/modules/customer/customer-bottom-nav";
import { PaymentSuccessSheet } from "@/components/modules/customer/payment-success-sheet";
import { BookingCard } from "@/components/modules/bookings/booking-card";
import { BookingCardMobile } from "@/components/modules/bookings/booking-card-mobile";
import { Booking, bookingService } from "@/services/booking.service";
import { Loader2, CalendarX, Lock } from "lucide-react";
import { toaster } from "@/components/ui/toaster";
import { useAuthStore } from "@/store/auth.store";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import { useIsMobile } from "@/hooks/use-is-mobile";

const MOBILE_TAB_LABEL: Record<string, string> = {
    "Pending Cancellations": "Pending",
};

function MyBookingsContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { isAuthenticated } = useAuthStore();
    const [activeTab, setActiveTab] = useState<"Upcoming" | "History" | "Pending Cancellations" | "Canceled">("Upcoming");
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [totalBookings, setTotalBookings] = useState(0);
    const [limit, setLimit] = useState(12); // Use 12 items as default limit for 3-col grid
    const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
    const isMobile = useIsMobile();

    useEffect(() => {
        if (searchParams.get("payment_success") === "true") {
            setShowPaymentSuccess(true);
        }
    }, [searchParams]);

    const handleCloseSuccessModal = () => {
        setShowPaymentSuccess(false);
        router.replace("/my-bookings");
    };

    const tabs: Array<"Upcoming" | "History" | "Pending Cancellations" | "Canceled"> = ["Upcoming", "History", "Pending Cancellations", "Canceled"];

    const fetchBookings = useCallback(async (isLoadMore = false, currentLimit = limit) => {
        if (isLoadMore) {
            setIsLoadingMore(true);
        } else {
            setIsLoading(true);
        }
        try {
            // Map our UI tabs to API status
            let apiStatus = '';
            if (activeTab === 'Upcoming') apiStatus = 'confirmed';
            else if (activeTab === 'History') apiStatus = 'completed';
            else if (activeTab === 'Pending Cancellations') apiStatus = 'cancellation_pending_approval';
            else if (activeTab === 'Canceled') apiStatus = 'cancelled';

            const response = await bookingService.getUserBookings({ status: apiStatus, limit: currentLimit });
            setBookings(response.data);
            setTotalBookings(response.meta?.total || 0);
        } catch (error) {
            console.error("Error fetching bookings:", error);
            toaster.create({
                title: "Error",
                description: "Failed to load your bookings. Please try again.",
                type: "error"
            });
        } finally {
            setIsLoading(false);
            setIsLoadingMore(false);
        }
    }, [activeTab, limit]);

    // Reset limit when tab changes
    useEffect(() => {
        setLimit(12);
    }, [activeTab]);

    const handleLoadMore = () => {
        const newLimit = limit + 12;
        setLimit(newLimit);
        fetchBookings(true, newLimit);
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchBookings();
        } else {
            setIsLoading(false);
        }
    }, [fetchBookings, isAuthenticated]);

    const hasSwipeableUpcoming = isMobile && activeTab === "Upcoming" && bookings.length > 0;

    return (
        <div className="min-h-screen flex flex-col bg-white pb-20 md:pb-0">
            <CustomerHeader />

            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-12 w-full">
                <div className="mb-4 md:mb-8">
                    <h1 className="text-[24px] md:text-3xl font-bold text-gray-900 mb-1 md:mb-2 font-playfair">My Bookings</h1>
                    <p className="text-gray-600 hidden md:block">Manage your upcoming appointments and view booking history</p>
                </div>

                {/* Tabs — mobile: underline style, matching Notifications */}
                <div className="md:hidden scroll-row gap-6 -mx-4 px-4 mb-4 border-b border-gray-200">
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`shrink-0 whitespace-nowrap pb-3 text-sm font-bold transition-colors relative ${activeTab === tab
                                ? "text-[#E89D24]"
                                : "text-gray-500 hover:text-gray-700"
                                }`}
                        >
                            {MOBILE_TAB_LABEL[tab] || tab}
                            {activeTab === tab && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E89D24] rounded-t-full" />
                            )}
                        </button>
                    ))}
                </div>

                {/* Tabs — desktop, unchanged */}
                <div className="hidden md:flex bg-gray-50 p-1.5 rounded-2xl w-full md:w-auto mb-8 overflow-x-auto no-scrollbar">
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`shrink-0 whitespace-nowrap px-6 py-3 rounded-lg text-sm font-semibold transition-all ${activeTab === tab
                                ? "bg-[#E89D24] text-white shadow-sm"
                                : "text-gray-500 hover:text-gray-700"
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Content */}
                {!isAuthenticated ? (
                    <div className="flex flex-col items-center justify-center py-10 md:py-20 text-center px-4">
                        <h2 className="text-xl md:text-4xl font-bold text-gray-900 mb-4 md:mb-6 font-playfair">Sign In to view Bookings</h2>
                    </div>
                ) : isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="w-10 h-10 text-[#E89D24] animate-spin mb-4" />
                        <p className="text-gray-500 font-medium">Loading your bookings...</p>
                    </div>
                ) : bookings.length === 0 ? (
                    <div className="py-10 md:py-20 text-center">
                        <div className="bg-gray-50 md:rounded-3xl p-6 md:p-12 max-w-md mx-auto flex flex-col items-center">
                            <CalendarX className="w-10 h-10 md:w-12 md:h-12 text-gray-300 mb-3 md:mb-4" />
                            <p className="text-[13px] md:text-base text-gray-500 font-medium">
                                Nothing here yet
                            </p>
                            <p className="text-[12px] text-gray-400 mt-1 md:hidden">
                                Your {activeTab.toLowerCase()} bookings will show up here.
                            </p>
                        </div>
                    </div>
                ) : isMobile === false ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {bookings.map((booking) => (
                            <BookingCard key={booking.id} booking={booking} onCancelSuccess={() => fetchBookings()} />
                        ))}
                    </div>
                ) : isMobile === true ? (
                    <div className="space-y-3">
                        {bookings.map((booking) => (
                            <BookingCardMobile key={booking.id} booking={booking} />
                        ))}
                    </div>
                ) : null}

                {hasSwipeableUpcoming && (
                    <p className="text-[11px] text-gray-300 text-center mt-4 font-medium">
                        Swipe a booking left to reschedule or cancel
                    </p>
                )}

                {/* Pagination / Load More */}
                {bookings.length > 0 && bookings.length < totalBookings && (
                    <div className="flex justify-center pt-8 border-t border-gray-100 mt-12 mb-12">
                        <Button
                            variant="outline"
                            disabled={isLoadingMore}
                            onClick={handleLoadMore}
                            className="h-11 w-full md:h-12 md:w-auto md:px-10 rounded-xl border-gray-200 font-bold text-gray-700 hover:bg-gray-50 transition-colors md:min-w-[200px]"
                        >
                            {isLoadingMore ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                    Loading...
                                </>
                            ) : (
                                "Load More Bookings"
                            )}
                        </Button>
                    </div>
                )}
            </main>

            <div className="hidden md:block">
                <CustomerFooter />
            </div>
            <MobileFooterStrip />
            <CustomerBottomNav />

            <PaymentSuccessSheet open={showPaymentSuccess} onClose={handleCloseSuccessModal} />
        </div>
    );
}

export default function MyBookingsPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-10 h-10 animate-spin text-[#E89D24]" />
            </div>
        }>
            <MyBookingsContent />
        </Suspense>
    );
}
