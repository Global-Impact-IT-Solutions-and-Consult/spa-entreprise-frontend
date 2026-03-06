"use client";

import { useState, useEffect, useCallback } from "react";
import { CustomerHeader } from "@/components/modules/customer/customer-header";
import { CustomerFooter } from "@/components/modules/customer/customer-footer";
import { BookingCard } from "@/components/modules/bookings/booking-card";
import { Booking, bookingService } from "@/services/booking.service";
import { Loader2, CalendarX, Lock } from "lucide-react";
import { toaster } from "@/components/ui/toaster";
import { useAuthStore } from "@/store/auth.store";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function MyBookingsPage() {
    const { isAuthenticated } = useAuthStore();
    const [activeTab, setActiveTab] = useState<"Upcoming" | "History" | "Canceled">("Upcoming");
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const tabs = ["Upcoming", "History", "Canceled"];

    const fetchBookings = useCallback(async () => {
        setIsLoading(true);
        try {
            // Map our UI tabs to API status
            let apiStatus = '';
            if (activeTab === 'Upcoming') apiStatus = 'confirmed';
            else if (activeTab === 'History') apiStatus = 'completed';
            else if (activeTab === 'Canceled') apiStatus = 'cancelled';

            const data = await bookingService.getUserBookings({ status: apiStatus });
            setBookings(data);
        } catch (error) {
            console.error("Error fetching bookings:", error);
            toaster.create({
                title: "Error",
                description: "Failed to load your bookings. Please try again.",
                type: "error"
            });
        } finally {
            setIsLoading(false);
        }
    }, [activeTab]);

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
                            className={`flex-1 md:flex-none px-6 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === tab
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
                                <BookingCard key={booking.id} booking={booking} />
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
            </main>

            <CustomerFooter />
        </div>
    );
}
