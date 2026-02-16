"use client";

import { useState } from "react";
import { CustomerHeader } from "@/components/modules/customer/customer-header";
import { CustomerFooter } from "@/components/modules/customer/customer-footer";
import { ServiceCard } from "@/components/modules/discovery/service-card";
import { Search, MapPin, SlidersHorizontal, Heart, Store, Home, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

const MOCK_SERVICES = [
    {
        id: "1",
        title: "Classic Haircut & Beard Trim",
        businessName: "Precision Cut Barbershop",
        category: "Barbing",
        duration: "60min",
        buffer: "20min",
        inStorePrice: "7,000",
        homePrice: "15,000",
        rating: 4.8,
        reviews: 124,
        distance: "0.8 mi",
        location: "Downtown",
        image: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&q=80",
    },
    {
        id: "2",
        title: "Gel Manicure with Design",
        businessName: "Luxe Nail Studio",
        category: "Nail Service",
        duration: "60min",
        buffer: "20min",
        inStorePrice: "7,000",
        homePrice: "15,000",
        rating: 4.9,
        reviews: 86,
        distance: "0.8 mi",
        location: "Downtown",
        image: "https://images.unsplash.com/photo-1604654894610-df490c3d0b2e?w=800&q=80",
    },
    {
        id: "3",
        title: "Box Braids Installation",
        businessName: "Braids & Beauty Salon",
        category: "Hair Braiding",
        duration: "60min",
        buffer: "20min",
        inStorePrice: "7,000",
        homePrice: "15,000",
        rating: 4.7,
        reviews: 52,
        distance: "0.8 mi",
        location: "Downtown",
        image: "https://images.unsplash.com/photo-1620331311520-246422fd82f9?w=800&q=80",
    },
    {
        id: "4",
        title: "Acrylic Nails Full Set",
        businessName: "Nail Artistry Studio",
        category: "Nail Service",
        duration: "60min",
        buffer: "20min",
        inStorePrice: "7,000",
        homePrice: "15,000",
        rating: 4.6,
        reviews: 42,
        distance: "0.8 mi",
        location: "Downtown",
        image: "https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=800&q=80",
    },
    {
        id: "5",
        title: "Hot Stone Therapy",
        businessName: "Serenity Wellness Spa",
        category: "Wellness",
        duration: "60min",
        buffer: "20min",
        inStorePrice: "7,000",
        homePrice: "15,000",
        rating: 5.0,
        reviews: 31,
        distance: "0.8 mi",
        location: "Downtown",
        image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&q=80",
    },
    {
        id: "6",
        title: "Full Body Massage",
        businessName: "Mas STudio",
        category: "Massage",
        duration: "60min",
        buffer: "20min",
        inStorePrice: "7,000",
        homePrice: "15,000",
        rating: 4.5,
        reviews: 28,
        distance: "0.8 mi",
        location: "Downtown",
        image: "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=800&q=80",
    },
];

export default function DiscoverPage() {
    const [activeFilter, setActiveFilter] = useState("All Services");
    const [showAdvanced, setShowAdvanced] = useState(false);

    const filters = [
        { id: "All Services", label: "All Services", icon: null },
        { id: "Favorite", label: "Favorite", icon: Heart },
        { id: "In-Store", label: "In-Store", icon: Store },
        { id: "Home Service", label: "Home Service", icon: Home },
    ];

    return (
        <div className="min-h-screen bg-[#F9FAFB]">
            <CustomerHeader />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
                {/* Header Section */}
                <div className="mb-10">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">Discover services</h1>
                    <p className="text-gray-600 max-w-2xl leading-relaxed">
                        Browse wellness services from trusted businesses. Book in-store or home services at your convenience.
                    </p>
                </div>

                {/* Search & Filter Container */}
                <div className="bg-white p-6 rounded-md border border-gray-100 shadow-sm mb-12">
                    {/* Search Bar */}
                    <div className="flex flex-col md:flex-row gap-4 mb-8 border border-gray-200 rounded-md p-2">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search services"
                                className="w-full pl-12 pr-4 h-12 focus:outline-none transition-all cursor-pointer"
                            />
                        </div>
                        <div className="relative md:w-64">
                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <select className="w-full pl-12 pr-4 h-12 rounded-md border border-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-200 appearance-none focus:border-transparent transition-all cursor-pointer">
                                <option>Lagos</option>
                                <option>Abuja</option>
                                <option>Port Harcourt</option>
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        </div>
                        <Button className="h-12 px-8 bg-[#E89D24] hover:bg-[#E5A800] text-white font-bold rounded-md shadow-lg shadow-yellow-500/20">
                            Search
                        </Button>
                    </div>

                    {/* Filter Bar */}
                    <div className={`flex flex-col gap-6`}>
                        <div className={`flex items-center ${showAdvanced ? "justify-between" : "justify-end"}`}>
                            <h3 className={`text-xl font-bold text-gray-900 ${showAdvanced ? "" : "hidden"}`}>Filter by</h3>
                            <button onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-2 text-sm font-bold text-[#E89D24] hover:text-[#E5A800] transition-colors">
                                <SlidersHorizontal className="w-4 h-4" />
                                Advance Filter Option
                            </button>
                        </div>
                        <div className={`flex flex-wrap gap-3 ${showAdvanced ? "" : "hidden"}`}>
                            {filters.map((filter) => (
                                <button
                                    key={filter.id}
                                    onClick={() => setActiveFilter(filter.id)}
                                    className={`flex items-center gap-2.5 px-6 py-3.5 rounded-full text-sm font-bold transition-all border ${activeFilter === filter.id
                                        ? "bg-[#E89D24] border-[#E89D24] text-white shadow-md"
                                        : "bg-white border-gray-100 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                                        }`}
                                >
                                    {filter.icon && <filter.icon className={`w-4 h-4 ${activeFilter === filter.id ? 'text-white' : 'text-gray-400'}`} />}
                                    {filter.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Results Info */}
                <div className="mb-8">
                    <p className="text-sm font-medium text-gray-500">Showing <span className="text-gray-900 font-bold">124 services</span></p>
                </div>

                {/* Services Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                    {MOCK_SERVICES.map((service) => (
                        <ServiceCard key={service.id} service={service} />
                    ))}
                </div>

                {/* Load More */}
                <div className="flex justify-center pt-8 border-t border-gray-100">
                    <Button variant="outline" className="h-12 px-8 rounded-xl border-gray-200 font-bold text-gray-700 hover:bg-gray-50">
                        Load More Services
                    </Button>
                </div>
            </main>

            <CustomerFooter />
        </div>
    );
}
