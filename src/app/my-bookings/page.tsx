"use client";

import { useState, useEffect, useCallback } from "react";
import { CustomerHeader } from "@/components/modules/customer/customer-header";
import { CustomerFooter } from "@/components/modules/customer/customer-footer";
import { BookingCard } from "@/components/modules/bookings/booking-card";
import { Booking, bookingService } from "@/services/booking.service";
import { Loader2, CalendarX, Lock, Check } from "lucide-react";
import { toaster } from "@/components/ui/toaster";
import { useAuthStore } from "@/store/auth.store";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";

function MyBookingsContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { isAuthenticated } = useAuthStore();
    const [activeTab, setActiveTab] = useState<"Upcoming" | "History" | "Canceled">("Upcoming");
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [totalBookings, setTotalBookings] = useState(0);
    const [limit, setLimit] = useState(12); // Use 12 items as default limit for 3-col grid
    const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);

    useEffect(() => {
        if (searchParams.get("payment_success") === "true") {
            setShowPaymentSuccess(true);
        }
    }, [searchParams]);

    const handleCloseSuccessModal = () => {
        setShowPaymentSuccess(false);
        router.replace("/my-bookings");
    };

    const tabs = ["Upcoming", "History", "Canceled"];

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

    return (
        <div className="min-h-screen bg-white">
            <CustomerHeader />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2 font-playfair">My Bookings</h1>
                    <p className="text-gray-600">Manage your upcoming appointments and view booking history</p>
                </div>

                {/* Tabs */}
                <div className="bg-gray-50 p-1.5 rounded-2xl inline-flex w-full md:w-auto mb-8">
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`flex-1 md:flex-none px-6 py-3 rounded-lg text-sm font-semibold transition-all ${activeTab === tab
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
                    <div className="flex flex-col items-center justify-center py-20">
                        <h2 className="text-4xl font-bold text-gray-900 mb-6 font-playfair">Sign In to view Bookings</h2>
                    </div>
                ) : isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="w-10 h-10 text-[#E89D24] animate-spin mb-4" />
                        <p className="text-gray-500 font-medium">Loading your bookings...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {bookings.length > 0 ? (
                            bookings.map((booking) => (
                                <BookingCard key={booking.id} booking={booking} onCancelSuccess={() => fetchBookings()} />
                            ))
                        ) : (
                            <div className="col-span-full py-20 text-center">
                                <div className="bg-gray-50 rounded-3xl p-12 max-w-md mx-auto flex flex-col items-center">
                                    <CalendarX className="w-12 h-12 text-gray-300 mb-4" />
                                    <p className="text-gray-500 font-medium">No {activeTab.toLowerCase()} bookings found.</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Pagination / Load More */}
                {bookings.length > 0 && bookings.length < totalBookings && (
                    <div className="flex justify-center pt-8 border-t border-gray-100 mt-12 mb-12">
                        <Button
                            variant="outline"
                            disabled={isLoadingMore}
                            onClick={handleLoadMore}
                            className="h-12 px-10 rounded-xl border-gray-200 font-bold text-gray-700 hover:bg-gray-50 transition-colors min-w-[200px]"
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

            <CustomerFooter />

            {/* Payment Success Modal */}
            {showPaymentSuccess && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-[32px] p-10 max-w-sm w-full text-center shadow-2xl animate-in fade-in zoom-in duration-300">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Check className="w-10 h-10 text-green-500" strokeWidth={3} />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3 font-playfair">Payment Confirmed</h2>
                        <p className="text-gray-500 mb-8 leading-relaxed">
                            Your booking has been successfully secured. Check your email for details.
                        </p>
                        <Button
                            onClick={handleCloseSuccessModal}
                            className="w-full bg-[#E89D24] hover:bg-[#E5A800] text-white py-4 h-14 rounded-2xl font-bold text-lg shadow-lg shadow-yellow-500/20 transition-all active:scale-[0.98]"
                        >
                            Back to Bookings
                        </Button>
                    </div>
                </div>
            )}
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
