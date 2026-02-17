"use client";

import { useState } from "react";
import { CustomerHeader } from "@/components/modules/customer/customer-header";
import { CustomerFooter } from "@/components/modules/customer/customer-footer";
import { BookingCard } from "@/components/modules/bookings/booking-card";

const MOCK_BOOKINGS = [
    {
        id: "1",
        serviceName: "Massage Therapy",
        businessName: "Serenity Wellness Spa",
        location: "Lekki Phase 1",
        staffName: "Jane D.",
        date: "Mon, 15 Nov 2024",
        time: "2:00 PM",
        duration: "60 min",
        price: "25,000",
        status: "Confirmed" as const,
        image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&q=80",
    },
    {
        id: "2",
        serviceName: "Premium Haircut & Styling",
        businessName: "Elite Barber Lounge",
        location: "Victoria Island",
        staffName: "David Okon",
        date: "Wed, 17 Nov 2024",
        time: "2:00 PM",
        duration: "60 min",
        price: "10,000",
        status: "Confirmed" as const,
        image: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&q=80",
    },
];

export default function MyBookingsPage() {
    const [activeTab, setActiveTab] = useState<"Upcoming" | "History" | "Canceled">("Upcoming");

    const tabs = ["Upcoming", "History", "Canceled"];

    return (
        <div className="min-h-screen bg-white">
            <CustomerHeader />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">My Bookings</h1>
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

                {/* Bookings Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {activeTab === "Upcoming" ? (
                        MOCK_BOOKINGS.map((booking) => (
                            <BookingCard key={booking.id} booking={booking} />
                        ))
                    ) : (
                        <div className="col-span-full py-20 text-center">
                            <div className="bg-gray-50 rounded-3xl p-12 max-w-md mx-auto">
                                <p className="text-gray-500 font-medium">No {activeTab.toLowerCase()} bookings found.</p>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            <CustomerFooter />
        </div>
    );
}
