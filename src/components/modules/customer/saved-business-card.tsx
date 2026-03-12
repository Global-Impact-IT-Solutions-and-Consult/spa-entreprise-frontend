"use client";

import Link from "next/link";
import Image from "next/image";
import { Bookmark, MapPin, Star, BadgeCheck, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface SavedBusinessCardProps {
    business: {
        id: string;
        businessName: string;
        city: string;
        address: string;
        description: string;
        averageRating: number | string;
        totalReviews: number;
        primaryImageUrl: string | null;
        isOpen?: boolean;
        isVerified?: boolean;
        startingPrice?: string | number;
    };
    onRemove?: (id: string) => void;
}

export function SavedBusinessCard({ business, onRemove }: SavedBusinessCardProps) {
    const [isRemoving, setIsRemoving] = useState(false);

    const name = business.businessName || "Wellness Business";
    const image = business.primaryImageUrl || "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&q=80";
    const city = business.city || "Lagos";
    const rating = typeof business.averageRating === 'string' ? parseFloat(business.averageRating) : (business.averageRating || 0);

    return (
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 flex flex-col group">
            {/* Image Section */}
            <div className="relative h-48 bg-gray-100 block overflow-hidden">
                <Image
                    src={image}
                    alt={name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Badge Overlay */}
                <div className="absolute top-3 left-3 flex items-center gap-2">
                    {business.isVerified && (
                        <div className="bg-blue-600 rounded-full p-1.5 shadow-md border border-white/20">
                            <BadgeCheck className="w-3.5 h-3.5 text-white" />
                        </div>
                    )}
                </div>

                {/* Bookmark Toggle */}
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        if (onRemove) onRemove(business.id);
                    }}
                    className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm rounded-full p-2 hover:bg-white transition-all shadow-sm group/bookmark"
                >
                    <Bookmark className="w-4 h-4 fill-[#E89D24] text-[#E89D24] group-hover:scale-110 transition-transform" />
                </button>
            </div>

            {/* Content Section */}
            <div className="p-5 flex flex-col flex-1">
                {/* Title & Status */}
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                        <Building2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <h3 className="font-bold text-gray-900 text-sm truncate">{name}</h3>
                    </div>
                    <div className={cn(
                        "rounded px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap",
                        business.isOpen !== false ? "bg-green-50 text-green-500" : "bg-red-50 text-red-500"
                    )}>
                        {business.isOpen !== false ? "Open" : "Closed"}
                    </div>
                </div>

                {/* Location */}
                <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-2.5">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                    <span className="truncate">{city}</span>
                </div>

                {/* Description */}
                <p className="text-[11px] text-gray-500 mb-4 line-clamp-2 leading-relaxed">
                    {business.description || "Premium wellness services tailored to your specific needs and relaxation goals."}
                </p>

                <hr className="border-gray-50 mb-4" />

                {/* Rating Section */}
                <div className="flex items-center gap-2 mb-4">
                    <span className="font-bold text-xs text-gray-900">{rating.toFixed(1)}</span>
                    <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, i) => (
                            <Star
                                key={i}
                                className={cn(
                                    "w-3 h-3",
                                    i < Math.floor(rating)
                                        ? "fill-[#E89D24] text-[#E89D24]"
                                        : "fill-gray-100 text-gray-100"
                                )}
                            />
                        ))}
                    </div>
                    <span className="text-[10px] text-gray-400 font-medium">({business.totalReviews || 0} reviews)</span>
                </div>

                <hr className="border-gray-50 mb-5" />

                {/* Footer */}
                <div className="flex items-center justify-between gap-4 mt-auto">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">From</span>
                        <p className="font-black text-gray-900 text-sm">₦{business.startingPrice?.toLocaleString() || "---"}</p>
                    </div>
                    <Link href={`/businesses/${business.id}`} className="flex-1 max-w-[140px]">
                        <Button className="w-full bg-[#E89D24] hover:bg-[#D97706] text-white text-xs font-bold h-10 rounded-lg shadow-sm shadow-orange-100 transition-all active:scale-[0.98]">
                            View More
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}

export function SavedBusinessSkeleton() {
    return (
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 animate-pulse">
            <div className="h-48 bg-gray-100" />
            <div className="p-5 space-y-4">
                <div className="flex justify-between items-center">
                    <div className="h-4 bg-gray-100 rounded w-1/2" />
                    <div className="h-4 bg-gray-100 rounded w-12" />
                </div>
                <div className="h-3 bg-gray-100 rounded w-1/3" />
                <div className="space-y-2">
                    <div className="h-3 bg-gray-100 rounded w-full" />
                    <div className="h-3 bg-gray-100 rounded w-5/6" />
                </div>
                <div className="pt-4 flex justify-between items-center">
                    <div className="h-8 bg-gray-100 rounded w-16" />
                    <div className="h-10 bg-gray-100 rounded w-32" />
                </div>
            </div>
        </div>
    );
}
