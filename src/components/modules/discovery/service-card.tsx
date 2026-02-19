"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, Clock, MapPin, Star, Store, House } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { BsShop } from "react-icons/bs";

import { Skeleton } from "@/components/ui/skeleton";

interface ServiceCardProps {
    service: {
        id: string;
        name: string;
        businessName: string;
        businessId: string;
        category: {
            id: string;
            name: string;
        };
        duration: number;
        bufferTime?: number;
        price: number;
        homeServicePrice?: number;
        deliveryType: string;
        rating: number | string;
        reviews: number;
        location: string;
        distance?: string;
        image: string;
    };
}

export function ServiceCard({ service }: ServiceCardProps) {
    const [isFavorite, setIsFavorite] = useState(false);

    const businessId = service.businessId;
    const rating = typeof service.rating === 'string' ? parseFloat(service.rating) : service.rating;

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all group">
            {/* Image Container */}
            <div className="relative h-48 md:h-52 overflow-hidden">
                <Image
                    src={service.image}
                    alt={service.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3">
                    <span className="bg-white/90 backdrop-blur-sm text-gray-800 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md shadow-sm">
                        {service.category.name}
                    </span>
                </div>
                <button
                    onClick={() => setIsFavorite(!isFavorite)}
                    className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-sm hover:bg-white transition-colors"
                >
                    <Heart className={`w-4 h-4 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
                </button>
            </div>

            {/* Content */}
            <div className="p-4">
                <div className="mb-3">
                    <h3 className="text-lg font-bold text-gray-900 leading-tight mb-1 group-hover:text-[#E89D24] transition-colors line-clamp-1">
                        {service.name}
                    </h3>
                    <Link href={`/businesses/${businessId}`} className="text-sm text-gray-500 font-medium hover:text-[#E89D24] transition-colors">
                        {service.businessName}
                    </Link>
                </div>
                <hr className="my-3" />
                {/* Time & Buffer */}
                <div className="flex items-center gap-4 border-b border-gray-50">
                    <div className="flex items-center gap-1.5 text-gray-600">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span className="text-xs font-medium">{service.duration}min</span>
                    </div>
                    <div className="text-gray-400 text-xs">Buffer <span className="text-gray-800 font-semibold">{service.bufferTime || 0}min</span></div>
                </div>
                <hr className="my-3" />

                {/* Pricing Layout */}
                <div className="grid grid-cols-2 gap-4 mb-5">
                    <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-gray-500">
                            <Store className="w-3 h-3 text-gray-400" />
                            <span className="text-[10px] font-bold uppercase tracking-wide">In Store</span>
                        </div>
                        <p className="text-lg font-bold text-gray-900">₦{service.price?.toLocaleString() || "---"}</p>
                    </div>
                    <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-gray-500">
                            <House className="w-3 h-3 text-gray-400" />
                            <span className="text-[10px] font-bold uppercase tracking-wide">Home Service</span>
                        </div>
                        <p className="text-lg font-bold text-gray-900">
                            {service.homeServicePrice ? `₦${service.homeServicePrice.toLocaleString()}` : "---"}
                        </p>
                    </div>
                </div>

                {/* Footer: Location & Action */}
                <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-1 text-gray-500">
                        <MapPin className="w-3.5 h-3.5" />
                        <span className="text-xs font-medium">{service.location} • {service.distance}</span>
                    </div>
                    <Button className="bg-[#E89D24] hover:bg-[#E5A800] text-white text-xs font-bold px-4 h-9 rounded transition-transform active:scale-95 shadow-sm">
                        Book Service
                    </Button>
                </div>
            </div>
        </div>
    );
}

export function ServiceSkeleton() {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden p-0 h-[450px]">
            <Skeleton className="h-48 md:h-52 w-full" />
            <div className="p-4">
                <div className="mb-3">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                </div>
                <hr className="my-3" />
                <div className="flex items-center gap-4">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-20" />
                </div>
                <hr className="my-3" />
                <div className="grid grid-cols-2 gap-4 mb-5">
                    <div className="space-y-2">
                        <Skeleton className="h-3 w-12" />
                        <Skeleton className="h-6 w-20" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-3 w-12" />
                        <Skeleton className="h-6 w-20" />
                    </div>
                </div>
                <div className="flex items-center justify-between pt-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-9 w-28" />
                </div>
            </div>
        </div>
    );
}
