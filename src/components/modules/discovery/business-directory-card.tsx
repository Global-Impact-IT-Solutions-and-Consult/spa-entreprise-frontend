"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, MapPin, Star, CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface BusinessDirectoryCardProps {
    business: {
        id: string;
        name: string;
        location: string;
        description: string;
        rating: number;
        reviews: number;
        image: string;
        isOpen: boolean;
        isVerified: boolean;
        startingPrice: string;
    };
}

export function BusinessDirectoryCard({ business }: BusinessDirectoryCardProps) {
    const [isFavorite, setIsFavorite] = useState(false);

    // For the demo, we use precision-cut as the ID if it matches our mock business
    const businessId = business.name.toLowerCase().includes("precision") ? "precision-cut" : business.id;

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all group flex flex-col h-full">
            {/* Image Container */}
            <Link href={`/businesses/${businessId}`} className="block relative h-48 md:h-56 overflow-hidden">
                <Image
                    src={business.image}
                    alt={business.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {/* Badges Overlay */}
                <div className="absolute top-4 left-4 flex gap-2">
                    {business.isVerified && (
                        <div className="bg-blue-600 text-white p-1.5 rounded-full shadow-lg">
                            <CheckCircle2 className="w-4 h-4" />
                        </div>
                    )}
                </div>
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsFavorite(!isFavorite);
                    }}
                    className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-sm hover:bg-white transition-colors z-10"
                >
                    <Heart className={`w-4 h-4 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
                </button>
            </Link>

            {/* Content */}
            <div className="p-5 flex flex-col flex-1">
                <div className="flex items-center justify-between mb-2">
                    <Link href={`/businesses/${businessId}`} className="flex items-center gap-2 hover:text-[#F5B800] transition-colors">
                        <span className="p-1.5 bg-gray-50 rounded-lg text-gray-700">
                            <Clock className="w-4 h-4" />
                        </span>
                        <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{business.name}</h3>
                    </Link>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md ${business.isOpen ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                        {business.isOpen ? "Open" : "Closed"}
                    </span>
                </div>
                {/* ... existing fields ... */}
                <div className="flex items-center gap-1.5 text-gray-500 text-sm mb-3 font-medium">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span>{business.location}</span>
                </div>

                <p className="text-gray-500 text-sm leading-relaxed line-clamp-2 mb-4 flex-1 font-medium">
                    {business.description}
                </p>

                {/* Rating & reviews */}
                <div className="flex items-center gap-1.5 mb-5">
                    <span className="text-sm font-bold text-gray-900">{business.rating}</span>
                    <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                                key={star}
                                className={`w-3.5 h-3.5 ${star <= Math.floor(business.rating) ? 'fill-[#F5B800] text-[#F5B800]' : 'text-gray-200'}`}
                            />
                        ))}
                    </div>
                    <span className="text-xs text-gray-400 font-medium">({business.reviews} reviews)</span>
                </div>

                {/* Pricing & Action */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">From</span>
                        <span className="text-lg font-bold text-gray-900">₦{business.startingPrice}</span>
                    </div>
                    <Link href={`/businesses/${businessId}`}>
                        <Button className="bg-[#F5B800] hover:bg-[#E5A800] text-white font-bold h-11 px-6 rounded-xl transition-all active:scale-95 shadow-lg shadow-yellow-500/10">
                            View More
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
