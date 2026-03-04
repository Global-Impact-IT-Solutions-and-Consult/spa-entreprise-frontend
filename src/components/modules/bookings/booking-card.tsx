"use client";

import { useState } from "react";
import Image from "next/image";
import { Phone, MessageSquare, Send, Calendar, CheckCircle2, Clock, MapPin, User, Building2, CalendarPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddToCalendarModal } from "./add-to-calendar-modal";
import { CancelBookingModal } from "./cancel-booking-modal";
import { toaster } from "@/components/ui/toaster";

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
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [isCancelOpen, setIsCancelOpen] = useState(false);
    const [isCanceling, setIsCanceling] = useState(false);

    const isCanceled = booking.status === "Canceled";

    const handleCancel = async () => {
        setIsCanceling(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsCanceling(false);
        setIsCancelOpen(false);
        toaster.create({
            title: "Booking Canceled",
            description: "Your booking has been successfully canceled.",
            type: "success"
        });
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            {/* Business Image & Status */}
            <div className="relative h-32 md:h-32">
                <Image
                    src={booking.image}
                    alt={booking.serviceName}
                    fill
                    className="object-cover"
                />
            </div>

            {/* Content */}
            <div className="p-5">
                <div className="flex items-center justify-between mb-1">
                    <p className="text-xs text-gray-500">{booking.serviceName}</p>

                    <div className="flex items-center gap-1">
                        <CheckCircle2 className={`w-3 h-3 ${isCanceled ? 'text-red-500' : 'text-green-600'}`} />
                        <span className={`text-xs font-medium ${isCanceled ? 'text-red-600' : 'text-green-700'}`}>
                            {booking.status === "History" ? "Completed" : booking.status}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-gray-700" />
                    <h3 className="text-lg font-bold text-gray-900">{booking.businessName}</h3>
                </div>

                <div className="space-y-1 mt-3">
                    <div className="flex items-center gap-2 text-gray-500">
                        <MapPin className="w-3 h-3" />
                        <span className="text-xs">In-store · {booking.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                        <User className="w-3 h-3" />
                        <span className="text-xs">Therapist: {booking.staffName}</span>
                    </div>
                </div>

                {/* Divider */}
                <hr className="my-3" />

                {/* Date & Time */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-500">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium">{booking.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium">{booking.time} ({booking.duration})</span>
                    </div>
                </div>

                <hr className="my-3" />

                {/* Footer: Price & Actions */}
                <div className="mt-6 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <span className="text-xl font-bold text-gray-900">₦{booking.price}</span>
                        <button
                            onClick={() => setIsCalendarOpen(true)}
                            className="flex items-center gap-1.5 text-gray-600 hover:text-[#E89D24] transition text-sm font-medium"
                        >
                            <CalendarPlus className="w-4 h-4" />
                            Add to calender
                        </button>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                        <Button variant="outline" className="flex items-center gap-2 h-11 border-gray-200 hover:border-[#E89D24] hover:text-[#E89D24]">
                            <Phone className="w-4 h-4" />
                            <span className="hidden sm:inline">Contact</span>
                        </Button>
                        <Button variant="outline" className="flex items-center gap-2 h-11 border-gray-200 hover:border-[#E89D24] hover:text-[#E89D24]">
                            <Send className="w-4 h-4" />
                            <span className="hidden sm:inline">Contact</span>
                        </Button>
                        <Button
                            onClick={() => setIsCancelOpen(true)}
                            className="bg-[#E74C3C] hover:bg-[#C0392B] text-white flex items-center gap-2 h-11"
                        >
                            <XCircle className="w-4 h-4" />
                            <span className="hidden sm:inline">Cancel</span>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <AddToCalendarModal
                isOpen={isCalendarOpen}
                onClose={() => setIsCalendarOpen(false)}
                booking={{
                    id: booking.id,
                    serviceName: booking.serviceName,
                    businessName: booking.businessName,
                    date: booking.date,
                    time: booking.time,
                    location: booking.location,
                }}
            />

            <CancelBookingModal
                isOpen={isCancelOpen}
                onClose={() => setIsCancelOpen(false)}
                onConfirm={handleCancel}
                isLoading={isCanceling}
            />
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
