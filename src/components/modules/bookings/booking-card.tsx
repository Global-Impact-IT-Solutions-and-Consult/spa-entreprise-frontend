"use client";

import Image from "next/image";
import { Phone, MessageSquare, Send, Calendar, CheckCircle2, Clock, MapPin, User, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BookingCardProps {
    booking: {
        id: string;
        serviceName: string;
        businessName: string;
        location: string;
        staffName: string;
        date: string;
        time: string;
        duration: string;
        price: string;
        status: "Confirmed" | "History" | "Canceled";
        image: string;
    };
}

export function BookingCard({ booking }: BookingCardProps) {
    const isCanceled = booking.status === "Canceled";

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            {/* Business Image & Status */}
            <div className="relative h-48 md:h-56">
                <Image
                    src={booking.image}
                    alt={booking.serviceName}
                    fill
                    className="object-cover"
                />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1.5 shadow-sm">
                    <CheckCircle2 className={`w-4 h-4 ${isCanceled ? 'text-red-500' : 'text-green-600'}`} />
                    <span className={`text-xs font-semibold ${isCanceled ? 'text-red-600' : 'text-green-700'}`}>
                        {booking.status === "History" ? "Completed" : booking.status}
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="p-5">
                <div className="mb-4">
                    <p className="text-sm text-gray-500 mb-1">{booking.serviceName}</p>
                    <div className="flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-gray-700" />
                        <h3 className="text-xl font-bold text-gray-900">{booking.businessName}</h3>
                    </div>
                </div>

                <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm">In-store · {booking.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                        <User className="w-4 h-4" />
                        <span className="text-sm">Therapist: {booking.staffName}</span>
                    </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-100 my-4" />

                {/* Date & Time */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2 text-gray-700">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium">{booking.date}</span>
                    </div>
                    <div className="h-4 w-[1px] bg-gray-200" />
                    <div className="flex items-center gap-2 text-gray-700">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium">{booking.time} ({booking.duration})</span>
                    </div>
                </div>

                {/* Footer: Price & Actions */}
                <div className="mt-6 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <span className="text-xl font-bold text-gray-900">₦{booking.price}</span>
                        <button className="flex items-center gap-1.5 text-gray-600 hover:text-[#F5B800] transition text-sm font-medium">
                            <Calendar className="w-4 h-4" />
                            Add to calender
                        </button>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                        <Button variant="outline" className="flex items-center gap-2 h-11 border-gray-200 hover:border-[#F5B800] hover:text-[#F5B800]">
                            <Phone className="w-4 h-4" />
                            <span className="hidden sm:inline">Contact</span>
                        </Button>
                        <Button variant="outline" className="flex items-center gap-2 h-11 border-gray-200 hover:border-[#F5B800] hover:text-[#F5B800]">
                            <Send className="w-4 h-4" />
                            <span className="hidden sm:inline">Contact</span>
                        </Button>
                        <Button className="bg-[#E74C3C] hover:bg-[#C0392B] text-white flex items-center gap-2 h-11">
                            <XCircle className="w-4 h-4" />
                            <span className="hidden sm:inline">Contact</span>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function XCircle({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <circle cx="12" cy="12" r="10" />
            <path d="m15 9-6 6" />
            <path d="m9 9 6 6" />
        </svg>
    );
}
