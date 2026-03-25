"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, MapPin, Star, BadgeCheck, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { favoritesService } from "@/services/favorites.service";
import { useAuthStore } from "@/store/auth.store";
import { useFavoritesStore } from "@/store/favorites.store";
import { useRouter } from "next/navigation";
import { toaster } from "@/components/ui/toaster";
import { getFallbackImage } from "@/lib/image.utils";

interface BusinessDirectoryCardProps {
    business: {
        id: string | number;
        name?: string;
        businessName?: string;
        location?: string;
        city?: string | { name: string };
        addressDetails?: {
            city?: { name: string };
            state?: { name: string };
        };
        description: string;
        rating: number | string;
        reviews: number;
        totalReviews?: number;
        image?: string;
        primaryImageUrl?: string | null;
        profileImage?: string | null;
        isOpen?: boolean;
        isVerified?: boolean;
        verified?: boolean;
        startingPrice?: string;
        price?: string;
    };
}

export function BusinessDirectoryCard({ business }: BusinessDirectoryCardProps) {
    const [isLoading, setIsLoading] = useState(false);
    const { isAuthenticated } = useAuthStore();
    const { businessIds, addBusiness, removeBusiness } = useFavoritesStore();
    const router = useRouter();
    console.log(business);

    const verified = business.verified ?? business.isVerified;
    const price = business.price ?? business.startingPrice;
    const name = business.businessName ?? business.name ?? "Wellness Business";
    const image = business.profileImage || getFallbackImage(name);
    const city = business.addressDetails?.city?.name || (typeof business.city === 'string' ? business.city : business.city?.name) || business.location;

    // Robust rating resolution
    let ratingValue = 0;
    let reviewsCount = business.totalReviews ?? business.reviews ?? 0;

    if (typeof business.rating === 'string') {
        ratingValue = parseFloat(business.rating);
    } else if (typeof business.rating === 'number') {
        ratingValue = business.rating;
    } else if (business.rating && typeof business.rating === 'object') {
        // Handle object format: { average: number, totalReviews: number }
        const rObj = business.rating as { average?: number; rating?: number; totalReviews?: number };
        ratingValue = rObj.average || rObj.rating || 0;
        if (rObj.totalReviews) reviewsCount = rObj.totalReviews;
    }

    const rating = ratingValue || 0;
    const reviews = reviewsCount;

    // For the demo, we use precision-cut as the ID if it matches our mock business
    const businessIdString = typeof business.id === 'string' && name.toLowerCase().includes("precision") ? "precision-cut" : business.id.toString();

    const isSaved = businessIds.includes(businessIdString);

    const handleSaveToggle = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isAuthenticated) {
            router.push('/auth/login');
            return;
        }

        if (!businessIdString) return;

        setIsLoading(true);
        try {
            if (isSaved) {
                await favoritesService.removeBusinessFavorite(businessIdString);
                removeBusiness(businessIdString);
                toaster.create({ title: "Removed from saved", type: "success" });
            } else {
                await favoritesService.addFavorite({ businessId: businessIdString });
                addBusiness(businessIdString);
                toaster.create({ title: "Saved successfully", type: "success" });
            }
        } catch (error) {
            console.error('Failed to toggle favorite status:', error);
            toaster.create({ title: "Failed to update saved status", type: "error" });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div
            className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-full flex flex-col"
        >
            {/* Image */}
            <Link href={`/businesses/${businessIdString}`} className="relative h-48 bg-gray-200 block overflow-hidden group rounded-t-2xl">
                <Image
                    src={image}
                    alt={name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300 rounded-t-2xl"
                />
                {/* Badges */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    {verified && (
                        <div className="bg-blue-500 rounded-full p-1.5 shadow-sm">
                            <BadgeCheck className="w-4 h-4 text-white" />
                        </div>
                    )}
                    <button
                        onClick={handleSaveToggle}
                        disabled={isLoading}
                        className="ml-auto bg-white/90 backdrop-blur-sm rounded-full p-1.5 hover:bg-gray-100 transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        <Heart className={`w-4 h-4 ${isSaved ? 'fill-red-500 text-red-500' : 'text-gray-600'} ${isLoading ? 'animate-pulse' : ''}`} />
                    </button>
                </div>
            </Link>

            {/* Content */}
            <div className="p-4 flex flex-col flex-1">
                {/* Business Name */}
                <div className="flex items-center justify-between mb-2">
                    <Link href={`/businesses/${businessIdString}`} className="flex items-center gap-2 group/title">
                        <Building2 className="w-4 h-4 text-gray-600 flex-shrink-0 group-hover/title:text-[#E89D24] transition-colors" />
                        <h3 className="font-bold text-gray-900 text-xs md:text-sm line-clamp-1 group-hover/title:text-[#E89D24] transition-colors">{name}</h3>
                    </Link>
                    <div className={`rounded px-2 py-1 text-[10px] md:text-xs font-bold uppercase tracking-wider ${business.isOpen ? "bg-[#63C68B1A] text-[#63C68B]" : "bg-red-50 text-red-500"}`}>
                        {business.isOpen ? "Open" : "Closed"}
                    </div>
                </div>

                {/* Location */}
                <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                    <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-gray-400" />
                    <span className="line-clamp-1">{city}</span>
                </div>

                {/* Description */}
                <p className="text-xs text-gray-500 mb-4 line-clamp-2 ml-4 flex-1">
                    {business.description}
                </p>

                <hr className="mb-4" />

                {/* Rating */}
                <div className="flex items-center gap-4 mb-4 flex-wrap">
                    <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-[#E89D24] text-[#E89D24]" />
                        <span className="font-semibold text-xs text-gray-900">{rating}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                                <Star
                                    key={i}
                                    className={`w-2 h-2 ${i < Math.floor(rating)
                                        ? "fill-[#E89D24] text-[#E89D24]"
                                        : "fill-gray-200 text-gray-200"
                                        }`}
                                />
                            ))}
                        </div>
                        <span className="text-[10px] md:text-xs text-gray-400">({reviews} reviews)</span>
                    </div>
                </div>

                <hr className="mb-4" />

                {/* Price and Button */}
                <div className="flex items-center justify-between gap-2 mt-auto">
                    <div className="flex items-center gap-2">
                        <p className="text-[10px] font-bold text-gray-400 tracking-wider">From</p>
                        <p className="font-bold text-gray-900 text-sm md:text-base">₦{price}</p>
                    </div>
                    <Link href={`/businesses/${businessIdString}`}>
                        <Button className="bg-[#E89D24] hover:bg-[#E5A800] text-white text-xs md:text-sm font-bold h-10 px-4 md:px-6 rounded-lg transition-all active:scale-95 shadow-lg shadow-yellow-500/10">
                            View More
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
