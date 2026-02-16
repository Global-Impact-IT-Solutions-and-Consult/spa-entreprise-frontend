"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, Clock, MapPin, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface ServiceCardProps {
    service: {
        id: string;
        title: string;
        businessName: string;
        category: string;
        duration: string;
        buffer: string;
        inStorePrice: string;
        homePrice: string;
        rating: number;
        reviews: number;
        distance: string;
        location: string;
        image: string;
    };
}

export function ServiceCard({ service }: ServiceCardProps) {
    const [isFavorite, setIsFavorite] = useState(false);

    // For the demo, we use precision-cut as the ID if it matches our mock business
    const businessId = service.businessName.toLowerCase().includes("precision") ? "precision-cut" : service.id;

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all group">
            {/* Image Container */}
            <div className="relative h-48 md:h-52 overflow-hidden">
                <Image
                    src={service.image}
                    alt={service.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3">
                    <span className="bg-white/90 backdrop-blur-sm text-gray-800 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md shadow-sm">
                        {service.category}
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
                    <h3 className="text-lg font-bold text-gray-900 leading-tight mb-1 group-hover:text-[#F5B800] transition-colors line-clamp-1">
                        {service.title}
                    </h3>
                    <Link href={`/businesses/${businessId}`} className="text-sm text-gray-500 font-medium hover:text-[#F5B800] transition-colors">
                        {service.businessName}
                    </Link>
                </div>
                {/* ... existing content ... */}
                {/* Time & Buffer */}
                <div className="flex items-center gap-4 mb-4 border-b border-gray-50 pb-4">
                    <div className="flex items-center gap-1.5 text-gray-600">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium">{service.duration}</span>
                    </div>
                    <div className="text-gray-300 text-xs">Buffer <span className="text-gray-800 font-semibold">{service.buffer}</span></div>
                </div>

                {/* Pricing Layout */}
                <div className="grid grid-cols-2 gap-4 mb-5">
                    <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-gray-500">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                            <span className="text-[10px] font-bold uppercase tracking-wide">In Store</span>
                        </div>
                        <p className="text-lg font-bold text-gray-900">₦{service.inStorePrice}</p>
                    </div>
                    <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-gray-500">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                            <span className="text-[10px] font-bold uppercase tracking-wide">Home Service</span>
                        </div>
                        <p className="text-lg font-bold text-gray-900">₦{service.homePrice}</p>
                    </div>
                </div>

                {/* Footer: Location & Action */}
                <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-1 text-gray-500">
                        <MapPin className="w-3.5 h-3.5" />
                        <span className="text-xs font-medium">{service.location} • {service.distance}</span>
                    </div>
                    <Button className="bg-[#F5B800] hover:bg-[#E5A800] text-white text-xs font-bold px-4 h-9 rounded-lg transition-transform active:scale-95 shadow-sm">
                        Book Service
                    </Button>
                </div>
            </div>
        </div>
    );
}
