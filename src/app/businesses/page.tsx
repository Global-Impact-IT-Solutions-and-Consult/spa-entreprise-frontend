"use client";

import { useState } from "react";
import { CustomerHeader } from "@/components/modules/customer/customer-header";
import { CustomerFooter } from "@/components/modules/customer/customer-footer";
import { BusinessDirectoryCard } from "@/components/modules/discovery/business-directory-card";
import { Search, MapPin, Star, Building2, Scissors, Info, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";

const MOCK_BUSINESSES = [
    {
        id: "1",
        name: "Elite Barber Lounge",
        location: "Lekki Phase 1, Lagos",
        description: "Premium barbershop offering haircuts, beard grooming, and traditional shaves with modern styling techniques.",
        rating: 4.7,
        reviews: 124,
        image: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800&q=80",
        isOpen: true,
        isVerified: true,
        startingPrice: "3,000",
    },
    {
        id: "2",
        name: "Facial Star",
        location: "Ring Rd, Warri, Delta",
        description: "We Specialize in facial massages, to bring bring out the glow of your skin.",
        rating: 4.5,
        reviews: 184,
        image: "https://images.unsplash.com/photo-1512290923902-8a9f81dc2069?w=800&q=80",
        isOpen: true,
        isVerified: false,
        startingPrice: "10,000",
    },
    {
        id: "3",
        name: "Glow Beauty Salon",
        location: "Abuja Central",
        description: "Full-service beauty salon specializing in hair styling, makeup, facials, and nail services with certified...",
        rating: 4.7,
        reviews: 154,
        image: "https://images.unsplash.com/photo-1560066922-19e91495c621?w=800&q=80",
        isOpen: true,
        isVerified: true,
        startingPrice: "4,500",
    },
    {
        id: "4",
        name: "Serenity Spa & Wellness",
        location: "Victoria Island, Lagos",
        description: "Premium wellness center offering spa treatments, massage therapy, and relaxation services in a tranquil environment.",
        rating: 4.7,
        reviews: 98,
        image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&q=80",
        isOpen: true,
        isVerified: true,
        startingPrice: "6,500",
    },
];

export default function BusinessDirectoryPage() {
    const [activeTab, setActiveTab] = useState("All Businesses");

    return (
        <div className="min-h-screen bg-white">
            <CustomerHeader />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
                {/* Header Section */}
                <div className="mb-10">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">Business Directory</h1>
                    <p className="text-gray-600 max-w-2xl leading-relaxed">
                        Find trusted barbershops, nail salons, spas, and wellness centers in your area. Verified businesses with quality services.
                    </p>
                </div>

                {/* Filter Container */}
                <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm mb-12">
                    {/* Search Input */}
                    <div className="relative mb-8">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <div className="flex flex-col md:flex-row gap-4">
                            <input
                                type="text"
                                placeholder="Search Business name"
                                className="flex-1 pl-14 pr-4 h-14 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#F5B800] transition-all bg-gray-50/30"
                            />
                            <Button className="h-14 px-12 bg-[#F5B800] hover:bg-[#E5A800] font-bold text-white rounded-2xl shadow-lg shadow-yellow-500/10">
                                Search
                            </Button>
                        </div>
                    </div>

                    {/* Detailed Filters */}
                    <div className="space-y-6">
                        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            Filter by
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Business Type */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Business Type</label>
                                <select className="w-full h-12 px-4 rounded-xl border border-gray-100 bg-gray-50/50 text-sm font-medium focus:ring-2 focus:ring-[#F5B800] transition-all">
                                    <option>All Businesses</option>
                                    <option>Barbershop</option>
                                    <option>Spa & Wellness</option>
                                    <option>Nail Studio</option>
                                </select>
                            </div>

                            {/* Service Offered */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Service Offered</label>
                                <select className="w-full h-12 px-4 rounded-xl border border-gray-100 bg-gray-50/50 text-sm font-medium focus:ring-2 focus:ring-[#F5B800] transition-all">
                                    <option>All Service</option>
                                    <option>Haircut</option>
                                    <option>Massage</option>
                                    <option>Facials</option>
                                </select>
                            </div>

                            {/* Minimum Rating */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Minimum Rating</label>
                                <select className="w-full h-12 px-4 rounded-xl border border-gray-100 bg-gray-50/50 text-sm font-medium focus:ring-2 focus:ring-[#F5B800] transition-all">
                                    <option>All Rating</option>
                                    <option>4.5+</option>
                                    <option>4.0+</option>
                                    <option>3.5+</option>
                                </select>
                            </div>

                            {/* Location Radius */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Location</label>
                                <select className="w-full h-12 px-4 rounded-xl border border-gray-100 bg-gray-50/50 text-sm font-medium focus:ring-2 focus:ring-[#F5B800] transition-all">
                                    <option>Within 5 miles</option>
                                    <option>Within 10 miles</option>
                                    <option>Within 20 miles</option>
                                </select>
                            </div>
                        </div>

                        {/* Bottom Filter Controls */}
                        <div className="flex flex-col sm:flex-row items-center justify-between pt-4 gap-4">
                            <label className="flex items-center gap-3 cursor-pointer group self-start">
                                <div className="relative w-6 h-6 rounded-md border-2 border-gray-200 group-hover:border-[#F5B800] transition-colors">
                                    <input type="checkbox" className="absolute opacity-0 w-full h-full cursor-pointer peer" />
                                    <div className="absolute inset-0 bg-[#F5B800] rounded-sm scale-0 peer-checked:scale-100 transition-transform" />
                                </div>
                                <span className="text-sm font-bold text-gray-600 group-hover:text-gray-900 transition-colors">Verified businesses only</span>
                            </label>

                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                <Button variant="ghost" className="flex-1 sm:flex-none h-12 px-8 font-bold text-gray-500 hover:text-gray-700">
                                    Reset All
                                </Button>
                                <Button className="flex-1 sm:flex-none h-12 px-8 bg-[#F5B800] hover:bg-[#E5A800] font-bold text-white rounded-xl">
                                    Apply Filters
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Featured Section Title */}
                <div className="mb-10">
                    <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Featured Business</h2>
                </div>

                {/* Business Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                    {MOCK_BUSINESSES.map((business) => (
                        <BusinessDirectoryCard key={business.id} business={business} />
                    ))}
                </div>

                {/* Pagination */}
                <div className="flex justify-center pt-8 border-t border-gray-100 mb-12">
                    <Button variant="outline" className="h-12 px-10 rounded-xl border-gray-200 font-bold text-gray-700 hover:bg-gray-50 transition-colors">
                        Load More Services
                    </Button>
                </div>
            </main>

            <CustomerFooter />
        </div>
    );
}
