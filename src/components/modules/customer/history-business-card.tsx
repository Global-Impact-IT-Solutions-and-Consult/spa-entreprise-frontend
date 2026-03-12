"use client";

import Image from "next/image";
import { MapPin, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface HistoryBusinessCardProps {
    business: {
        id: string;
        name: string;
        location: string;
        description: string;
        imageUrl?: string;
        relativeTime: string;
        isOpen?: boolean;
    };
}

export function HistoryBusinessCard({ business }: HistoryBusinessCardProps) {
    return (
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex p-3 md:p-4 gap-4 md:gap-6 group hover:shadow-md transition-all duration-300">
            {/* Image Section */}
            <div className="relative w-28 md:w-56 h-auto min-h-[120px] bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                <Image
                    src={business.imageUrl || "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&q=80"}
                    alt={business.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
            </div>

            {/* Content Section */}
            <div className="flex flex-col flex-1 py-1">
                {/* Title & Status */}
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                        <div className="p-1.5 bg-orange-50 rounded-lg">
                            <Building2 className="w-3.5 h-3.5 text-[#E89D24]" />
                        </div>
                        <h3 className="font-black text-gray-900 text-sm md:text-base truncate">
                            {business.name}
                        </h3>
                    </div>
                    <div className={cn(
                        "rounded px-2 md:px-2.5 py-0.5 md:py-1 text-[10px] md:text-xs font-bold uppercase tracking-wider whitespace-nowrap",
                        business.isOpen !== false ? "bg-green-50 text-green-500" : "bg-red-50 text-red-500"
                    )}>
                        {business.isOpen !== false ? "Open" : "Closed"}
                    </div>
                </div>

                {/* Location */}
                <div className="flex items-center gap-1.5 text-[10px] md:text-xs text-gray-400 font-bold uppercase tracking-widest mb-3">
                    <MapPin className="w-3 h-3 md:w-3.5 md:h-3.5 text-gray-300" />
                    <span className="truncate">{business.location}</span>
                </div>

                {/* Description */}
                <p className="text-[11px] md:text-xs text-gray-500 line-clamp-2 md:line-clamp-3 leading-relaxed mb-4 max-w-2xl">
                    {business.description || "Premium wellness services tailored to your specific needs and relaxation goals."}
                </p>

                {/* Footer / Relative Time */}
                <div className="mt-auto flex justify-end">
                    <div className="bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            Last: <span className="text-gray-600">{business.relativeTime}</span>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function HistoryBusinessSkeleton() {
    return (
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex p-4 gap-6 animate-pulse">
            <div className="w-56 h-32 bg-gray-100 rounded-xl" />
            <div className="flex flex-col flex-1 py-1 space-y-4">
                <div className="flex justify-between items-center">
                    <div className="h-5 bg-gray-100 rounded w-1/3" />
                    <div className="h-5 bg-gray-100 rounded w-12" />
                </div>
                <div className="h-3 bg-gray-100 rounded w-1/4" />
                <div className="space-y-2">
                    <div className="h-3 bg-gray-100 rounded w-full" />
                    <div className="h-3 bg-gray-100 rounded w-5/6" />
                </div>
                <div className="mt-auto flex justify-end">
                    <div className="h-7 bg-gray-100 rounded-full w-24" />
                </div>
            </div>
        </div>
    );
}
