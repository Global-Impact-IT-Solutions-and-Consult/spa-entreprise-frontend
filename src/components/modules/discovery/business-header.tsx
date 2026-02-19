"use client";

import Image from "next/image";
import { Star, CheckCircle2, MapPin, Scissors, Share2, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface BusinessHeaderProps {
    business: {
        id?: string;
        name?: string;
        businessName?: string;
        rating: number | string;
        reviews: number;
        category?: string;
        distance?: string;
        bannerImage?: string;
        profileImage?: string;
        primaryImageUrl?: string | null;
        coverImage?: string | null;
        startingPrice: string;
    };
}

export function BusinessHeader({ business }: BusinessHeaderProps) {
    const [isSaved, setIsSaved] = useState(false);
    const name = business.businessName ?? business.name ?? "Wellness Business";
    const bannerImage = business.coverImage || business.bannerImage || business.primaryImageUrl || "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=1200&q=80";
    const profileImage = business.profileImage || business.primaryImageUrl || "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400&q=80";
    const rating = typeof business.rating === 'string' ? parseFloat(business.rating) : (business.rating || 0);

    return (
        <div className="relative mb-8">
            {/* Banner */}
            <div className="h-64 md:h-80 max-w-7xl mx-auto mt-5 relative rounded-lg overflow-hidden">
                <Image
                    src={bannerImage}
                    alt="Business Banner"
                    fill
                    className="object-cover"
                    priority
                />
                <div className="absolute inset-0 bg-black/20" />
            </div>

            {/* Profile Overlap Info */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="relative -mt-16 md:-mt-20 flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
                    <div className="flex flex-col md:flex-row gap-6 items-start md:items-end">
                        {/* Profile Image */}
                        <div className="relative w-32 h-32 md:w-44 md:h-44 rounded-2xl overflow-hidden border-2 border-white shadow-xl bg-white">
                            <Image
                                src={profileImage}
                                alt={name}
                                fill
                                className="object-cover"
                            />
                        </div>

                        {/* Title and Meta */}
                        <div className="flex flex-col space-y-3 pb-2 md:pb-4">
                            <div className="flex flex-wrap gap-2">
                                <div className="flex items-center gap-2 bg-[#337BF6] text-white px-3 py-1.5 rounded text-xs font-medium shadow-lg shadow-yellow-500/20">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    Verified Business
                                </div>
                                <div className="flex items-center gap-2 bg-[#192131] text-white px-3 py-1.5 rounded text-xs font-medium">
                                    <MapPin className="w-3.5 h-3.5" />
                                    {business.distance || "Near you"}
                                </div>
                            </div>

                            <div className="mt-10">
                                <h1 className="text-3xl md:text-5xl font-bold text-gray-900 tracking-tight">
                                    {name}
                                </h1>


                                <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center gap-1">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className={`w-4 h-4 ${i < Math.floor(rating) ? 'fill-[#E89D24] text-[#E89D24]' : 'text-gray-200'}`} />
                                            ))}
                                        </div>
                                        <span className="text-sm font-bold text-gray-900">{rating}</span>
                                        <span className="text-xs text-gray-400 font-medium">({business.reviews} reviews)</span>
                                    </div>

                                    <div className="flex items-center gap-2 text-gray-500 font-medium">
                                        <Scissors className="w-4 h-4" />
                                        <span className="text-sm">{business.category || "Wellness"}</span>
                                    </div>

                                    <div className="text-lg font-bold text-gray-900">
                                        ₦{business.startingPrice}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 md:pb-6">
                        <Button
                            onClick={() => setIsSaved(!isSaved)}
                            variant="outline"
                            className={`h-12 px-6 rounded-md border-gray-100 font-bold gap-2 transition-all ${isSaved ? 'bg-red-50 text-red-500 border-red-100' : 'text-gray-700 hover:bg-gray-50'}`}
                        >
                            <Heart className={`w-4 h-4 ${isSaved ? 'fill-red-500' : ''}`} />
                            Save
                        </Button>
                        <Button variant="outline" className="h-12 px-6 rounded-md border-gray-100 text-gray-700 font-bold gap-2 hover:bg-gray-50 transition-all">
                            <Share2 className="w-4 h-4" />
                            Share
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
