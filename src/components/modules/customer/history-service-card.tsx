"use client";

import Link from "next/link";
import Image from "next/image";
import { CheckCircle2, MapPin, User, Calendar, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { getFallbackImage } from "@/lib/image.utils";

interface HistoryServiceCardProps {
    booking: {
        id: string;
        serviceName: string;
        businessName: string;
        location: string;
        staffName?: string;
        price: number;
        date: string;
        time: string;
        duration: number;
        imageUrl?: string;
        relativeTime: string;
        status: string;
    };
}

export function HistoryServiceCard({ booking }: HistoryServiceCardProps) {
    return (
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex flex-col group hover:shadow-md transition-all duration-300">
            {/* Image Section */}
            <div className="relative h-44 bg-gray-100 block overflow-hidden">
                <Image
                    src={booking.imageUrl || getFallbackImage(booking.serviceName)}
                    alt={booking.serviceName}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
            </div>

            {/* Content Section */}
            <div className="p-5 flex flex-col flex-1">
                {/* Status & Title */}
                <div className="flex items-center justify-between mb-3">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest truncate max-w-[140px]">
                        {booking.serviceName}
                    </p>
                    <div className="flex items-center gap-1.5 text-green-600">
                        <CheckCircle2 className="w-3.5 h-3.5 fill-green-600 text-white" />
                        <span className="text-[10px] font-black uppercase tracking-wider">Completed</span>
                    </div>
                </div>

                <div className="flex items-center gap-2 mb-4">
                    <div className="bg-gray-50 p-1.5 rounded-lg">
                        <Clock className="w-3.5 h-3.5 text-gray-500" />
                    </div>
                    <h3 className="font-black text-gray-900 text-base leading-tight">
                        {booking.businessName}
                    </h3>
                </div>

                {/* Details Grid */}
                <div className="space-y-2.5 mb-5">
                    <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-gray-300" />
                        <span className="truncate">{booking.location}</span>
                    </div>
                    {booking.staffName && (
                        <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                            <User className="w-3.5 h-3.5 text-gray-300" />
                            <span className="truncate">Therapist: {booking.staffName}</span>
                        </div>
                    )}
                </div>

                {/* Date/Time Section */}
                <div className="grid grid-cols-2 gap-px bg-gray-50 border border-gray-50 rounded-xl mb-5 overflow-hidden">
                    <div className="bg-white p-3 flex flex-col items-center justify-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-[10px] font-bold text-gray-900">{booking.date}</span>
                    </div>
                    <div className="bg-white p-3 flex flex-col items-center justify-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-[10px] font-bold text-gray-900">{booking.time} ({booking.duration} min)</span>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-1 mt-auto gap-4">
                    <div className="flex flex-col">
                        <p className="font-black text-gray-900 text-lg leading-none mb-1">
                            ₦{booking.price?.toLocaleString()}
                        </p>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">
                            {booking.relativeTime}
                        </span>
                    </div>

                    <Link
                        href={`/reviews/${booking.id}`}
                        className="bg-[#E89D24] hover:bg-[#D97706] text-white text-[10px] font-black uppercase tracking-widest h-9 px-6 flex items-center justify-center rounded-xl shadow-lg shadow-orange-100 transition-all active:scale-[0.98]"
                    >
                        Review
                    </Link>
                </div>
            </div>
        </div>
    );
}

export function HistoryServiceSkeleton() {
    return (
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 animate-pulse">
            <div className="h-44 bg-gray-100" />
            <div className="p-5 space-y-4">
                <div className="flex justify-between items-center">
                    <div className="h-3 bg-gray-100 rounded w-1/3" />
                    <div className="h-3 bg-gray-100 rounded w-1/4" />
                </div>
                <div className="h-5 bg-gray-100 rounded w-1/2" />
                <div className="space-y-2">
                    <div className="h-3 bg-gray-100 rounded w-full" />
                    <div className="h-3 bg-gray-100 rounded w-5/6" />
                </div>
                <div className="h-14 bg-gray-50 rounded-xl" />
                <div className="flex justify-between items-center">
                    <div className="h-6 bg-gray-100 rounded w-20" />
                    <div className="h-3 bg-gray-100 rounded w-16" />
                </div>
            </div>
        </div>
    );
}
