"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MapPin, Star, Heart, BadgeCheck } from "lucide-react";
import Image from "next/image";

const businesses = [
    {
        id: 1,
        name: "Elite Barber Lounge",
        location: "Lekki Phase 1, Lagos",
        description: "Premium barbershop offering haircuts, beard grooming, and traditional shaves with modern styling techniques.",
        rating: 4.7,
        reviews: 124,
        price: "3,000",
        image: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&q=80",
        isOpen: true,
        verified: true,
    },
    {
        id: 2,
        name: "Facial Star",
        location: "Ring Rd, Warri, Delta",
        description: "We specialize in facial massages, to bring bring out the glow of your skin",
        rating: 4.5,
        reviews: 184,
        price: "10,000",
        image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&q=80",
        isOpen: true,
        verified: false,
    },
    {
        id: 3,
        name: "Glow Beauty Salon",
        location: "Abuja Central",
        description: "Full-service beauty salon specializing in hair styling, makeup, facials, and nail services. Certified...",
        rating: 4.7,
        reviews: 154,
        price: "4,500",
        image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&q=80",
        isOpen: true,
        verified: true,
    },
    {
        id: 4,
        name: "Serenity Spa & Wellness",
        location: "Victoria Island, Lagos",
        description: "Premium wellness center offering spa treatments, massage therapy, and relaxation services in a tranquil...",
        rating: 4.7,
        reviews: 98,
        price: "6,500",
        image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&q=80",
        isOpen: true,
        verified: true,
    },
];

export function FeaturedBusinesses() {
    return (
        <section className="py-12 md:py-16 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between mb-8 md:mb-10">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Featured Businesses</h2>
                    <Link href="/businesses" className="text-[#F5B800] hover:text-[#E5A800] font-semibold text-sm md:text-base">
                        View All
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {businesses.map((business) => (
                        <div
                            key={business.id}
                            className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                        >
                            {/* Image */}
                            <div className="relative h-48 bg-gray-200">
                                <Image
                                    src={business.image}
                                    alt={business.name}
                                    fill
                                    className="object-cover"
                                />
                                {/* Badges */}
                                <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                                    {business.verified && (
                                        <div className="bg-blue-500 rounded-full p-1.5">
                                            <BadgeCheck className="w-4 h-4 text-white" />
                                        </div>
                                    )}
                                    <button className="ml-auto bg-white rounded-full p-1.5 hover:bg-gray-100">
                                        <Heart className="w-4 h-4 text-gray-600" />
                                    </button>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-4">
                                {/* Business Name */}
                                <div className="flex items-center gap-2 mb-2">
                                    <Building2 className="w-4 h-4 text-gray-600 flex-shrink-0" />
                                    <h3 className="font-bold text-gray-900 text-sm md:text-base">{business.name}</h3>
                                </div>

                                {/* Location */}
                                <div className="flex items-center gap-1 text-xs md:text-sm text-gray-600 mb-2">
                                    <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                                    <span className="line-clamp-1">{business.location}</span>
                                </div>

                                {/* Description */}
                                <p className="text-xs md:text-sm text-gray-600 mb-4 line-clamp-2">
                                    {business.description}
                                </p>

                                {/* Rating */}
                                <div className="flex items-center gap-2 mb-4 flex-wrap">
                                    <div className="flex items-center gap-1">
                                        <Star className="w-4 h-4 fill-[#F5B800] text-[#F5B800]" />
                                        <span className="font-semibold text-sm">{business.rating}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                className={`w-3 h-3 ${i < Math.floor(business.rating)
                                                        ? "fill-[#F5B800] text-[#F5B800]"
                                                        : "fill-gray-200 text-gray-200"
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-xs md:text-sm text-gray-600">({business.reviews} reviews)</span>
                                </div>

                                {/* Price and Button */}
                                <div className="flex items-center justify-between gap-2">
                                    <div>
                                        <p className="text-xs text-gray-500">From</p>
                                        <p className="font-bold text-gray-900 text-sm md:text-base">₦{business.price}</p>
                                    </div>
                                    <Link href={`/businesses/${business.id}`}>
                                        <Button className="bg-[#F5B800] hover:bg-[#E5A800] text-white text-sm px-4 md:px-6">
                                            View More
                                        </Button>
                                    </Link>
                                </div>

                                {/* Status */}
                                <div className="mt-3 pt-3 border-t border-gray-100">
                                    <span className={`text-xs font-semibold ${business.isOpen ? 'text-green-600' : 'text-red-600'}`}>
                                        {business.isOpen ? 'Open' : 'Closed'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

function Building2({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className={className}
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z"
            />
        </svg>
    );
}
