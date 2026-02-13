"use client";

import { useState } from "react";
import { CustomerHeader } from "@/components/modules/customer/customer-header";
import { CustomerFooter } from "@/components/modules/customer/customer-footer";
import { BusinessHeader } from "@/components/modules/discovery/business-header";
import { BusinessInfoSidebar } from "@/components/modules/discovery/business-info-sidebar";
import { ServiceCard } from "@/components/modules/discovery/service-card";
import { Button } from "@/components/ui/button";

const MOCK_BUSINESS = {
    id: "precision-cut",
    name: "Precision Cut Barbershop",
    rating: 4.6,
    reviews: 184,
    category: "Barbershop",
    distance: "1.2 mi away",
    startingPrice: "4,500",
    bannerImage: "https://images.unsplash.com/photo-1512690196246-86e580db7940?w=1600&q=80",
    profileImage: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800&q=80",
    address: "123 Barber Street, Mainland Ikeja, Lagos",
    phone: "(415) 555-0123",
    email: "info@precisioncutbarbers.com",
    status: "Open now • Closes at 7:00 PM",
    hours: [
        { day: "Monday", time: "9:00 AM - 7:00 PM" },
        { day: "Tuesday", time: "9:00 AM - 7:00 PM" },
        { day: "Wednesday", time: "9:00 AM - 7:00 PM", isToday: true },
        { day: "Thursday", time: "9:00 AM - 7:00 PM" },
        { day: "Friday", time: "9:00 AM - 7:00 PM" },
        { day: "Saturday", time: "9:00 AM - 7:00 PM" },
        { day: "Sunday", time: "9:00 AM - 7:00 PM" },
    ]
};

const MOCK_SERVICES = [
    {
        id: "s1",
        title: "Gel Manicure with Design",
        businessName: "Precision Cut Barbershop",
        category: "Nail Service",
        duration: "60min",
        bufferTime: "20min",
        inStorePrice: "7,000",
        homeServicePrice: "15,000",
        image: "https://images.unsplash.com/photo-1604654894610-df4906ecefe7?w=800&q=80",
        location: "Ikeja GRA",
        distance: "1.2 mi",
    },
    {
        id: "s2",
        title: "Skin Fade with Line Up",
        businessName: "Precision Cut Barbershop",
        category: "Barbing",
        duration: "60min",
        bufferTime: "20min",
        inStorePrice: "7,000",
        homeServicePrice: "15,000",
        image: "https://images.unsplash.com/photo-1599351431247-f57933842922?w=800&q=80",
        location: "Downtown",
        distance: "0.8 mi",
    },
];

export default function BusinessDetailsPage() {
    const [activeTab, setActiveTab] = useState("Services");

    const tabs = ["Services", "About", "Reviews", "Gallery", "Staff's"];

    return (
        <div className="min-h-screen bg-gray-50/30">
            <CustomerHeader />

            <BusinessHeader business={MOCK_BUSINESS} />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 pb-20">
                <div className="flex flex-col lg:flex-row gap-12">

                    {/* Main Content Area */}
                    <div className="flex-1">
                        {/* Tabs */}
                        <div className="bg-gray-100/50 p-1.5 rounded-2xl flex flex-wrap gap-1 mb-10 w-fit">
                            {tabs.map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-8 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === tab
                                            ? "bg-[#F5B800] text-white shadow-lg shadow-yellow-500/20"
                                            : "text-gray-500 hover:text-gray-700 hover:bg-white/50"
                                        }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        {/* Tab Search/Title Area (Mock for now) */}
                        <div className="mb-8 flex items-center justify-between">
                            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
                                Our {activeTab}
                            </h2>
                        </div>

                        {/* Render Active Tab Content */}
                        {activeTab === "Services" && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {MOCK_SERVICES.map((service) => (
                                    <ServiceCard key={service.id} service={service} />
                                ))}
                            </div>
                        )}

                        {activeTab !== "Services" && (
                            <div className="bg-white rounded-3xl border border-dashed border-gray-200 p-20 flex flex-col items-center justify-center text-center">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                    <span className="text-2xl">⏳</span>
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-1">{activeTab} coming soon</h3>
                                <p className="text-gray-500 text-sm">We are working on this section. Check back later!</p>
                            </div>
                        )}
                    </div>

                    {/* Sidebar Area */}
                    <aside className="w-full lg:w-96 order-last lg:order-none">
                        <BusinessInfoSidebar business={MOCK_BUSINESS} />
                    </aside>

                </div>
            </main>

            <CustomerFooter />
        </div>
    );
}
