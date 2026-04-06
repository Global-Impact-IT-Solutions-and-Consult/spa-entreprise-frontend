"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Info, Clock, Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { bookingService } from "@/services/booking.service";
import { bookingPublicService, TimeSlot } from "@/services/booking-public.service";

export default function ReschedulePage() {
    const params = useParams();
    const router = useRouter();
    const bookingId = params.bookingId as string;

    const [booking, setBooking] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [selectedDate, setSelectedDate] = useState<string>("");
    const [selectedTime, setSelectedTime] = useState<string>("");
    const [reason, setReason] = useState<string>("");

    const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
    const [isSlotsLoading, setIsSlotsLoading] = useState(false);

    // Helper functions for formatting
    const formatTime12h = (time24: string) => {
        if (!time24) return "";
        try {
            const [hoursStr, minutes] = time24.split(':');
            const hours = parseInt(hoursStr, 10);
            const period = hours >= 12 ? 'PM' : 'AM';
            const displayHours = hours % 12 || 12;
            return `${displayHours}:${minutes}${period}`;
        } catch (e) {
            return time24;
        }
    };

    const formatDateDisplay = (dateString: string) => {
        if (!dateString) return "";
        try {
            const [year, month, day] = dateString.split('-').map(Number);
            const date = new Date(year, month - 1, day);
            return date.toLocaleDateString('en-US', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            });
        } catch (e) {
            return dateString;
        }
    };

    useEffect(() => {
        const fetchBooking = async () => {
            if (!bookingId) return;
            setIsLoading(true);
            try {
                // Fetch user bookings and find this one
                const res = await bookingService.getUserBookings({ limit: 100 });
                const foundBooking = res.data.find((b: any) => b.id === bookingId);
                
                if (foundBooking) {
                    setBooking(foundBooking);
                    // Initialize selection with current
                    setSelectedDate(foundBooking.bookingDate);
                    setSelectedTime(foundBooking.startTime);
                }
            } catch (error) {
                console.error("Failed to fetch booking", error);
                toaster.create({ title: "Error", description: "Failed to load booking details.", type: "error" });
            } finally {
                setIsLoading(false);
            }
        };

        fetchBooking();
    }, [bookingId]);

    // Fetch dynamic slots when date or booking changes
    useEffect(() => {
        const fetchSlots = async () => {
            if (!selectedDate || !booking) return;
            setIsSlotsLoading(true);
            try {
                let response;
                // If a specific staff member is assigned, strictly check their availability
                if (booking.staffId) {
                    response = await bookingPublicService.getStaffAvailability({
                        businessId: booking.businessId,
                        serviceId: booking.serviceId,
                        staffId: booking.staffId,
                        date: selectedDate
                    });
                } else {
                    // Fallback to general availability for the service if no specific staff is linked
                    response = await bookingPublicService.getGeneralAvailability({
                        businessId: booking.businessId,
                        serviceId: booking.serviceId,
                        date: selectedDate
                    });
                }
                setAvailableSlots(response.availableSlots || []);
            } catch (error) {
                console.error("Failed to fetch slots", error);
                setAvailableSlots([]);
            } finally {
                setIsSlotsLoading(false);
            }
        };

        fetchSlots();
    }, [selectedDate, booking]);

    const handleReschedule = async () => {
        if (!selectedDate || !selectedTime) {
            toaster.create({ title: "Missing Fields", description: "Please select a new date and time.", type: "error" });
            return;
        }

        setIsSubmitting(true);
        try {
            await bookingService.rescheduleBooking(bookingId, {
                bookingDate: selectedDate,
                startTime: selectedTime
            });

            toaster.create({ 
                title: "Booking Rescheduled", 
                description: "Your appointment has been successfully rescheduled.", 
                type: "success" 
            });
            router.push("/my-bookings");
        } catch (error: any) {
            console.error("Reschedule failed", error);
            toaster.create({ 
                title: "Action Failed", 
                description: error?.response?.data?.message || "Could not reschedule at this time. Please try again.", 
                type: "error" 
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-[#E89D24]" />
            </div>
        );
    }

    if (!booking) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-center px-4">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Not Found</h2>
                <p className="text-gray-500 mb-6">We couldn't find the booking you want to reschedule.</p>
                <Button onClick={() => router.push("/my-bookings")} className="bg-[#E89D24] text-white font-bold h-12 px-6">
                    Return to Bookings
                </Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <header className="bg-white px-4 md:px-8 py-4 flex items-center justify-between border-b border-gray-100 sticky top-0 z-[1000]">
                <Link href="/" className="flex items-center gap-2">
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-[#E89D24] rounded-lg flex items-center justify-center text-white font-bold text-lg md:text-xl">
                        WP
                    </div>
                    <span className="font-bold text-gray-900 text-sm md:text-base">WellnessPro</span>
                </Link>
                <div className="hidden md:flex items-center gap-2 text-gray-400 font-bold text-sm ml-8 mr-auto">
                    <span>Lagos</span>
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </div>
                <button
                    onClick={() => router.back()}
                    className="text-gray-400 hover:text-gray-600 font-bold text-xs md:text-sm uppercase tracking-wider"
                >
                    Cancel
                </button>
            </header>

            <main className="flex-1 flex flex-col items-center py-10 px-4 md:px-8">
                {/* Title Section */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-[#E89D24] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-100">
                        <CalendarIcon className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-black text-gray-900 font-playfair mb-2">Reschedule Booking</h1>
                    <p className="text-gray-500 font-medium tracking-wide">Choose a new date and time for your appointment</p>
                </div>

                <div className="w-full max-w-3xl space-y-6">
                    {/* Current Details Card */}
                    <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
                        <div className="flex items-center gap-2 mb-6">
                            <Info className="w-5 h-5 text-[#E89D24]" />
                            <h2 className="text-xl font-bold text-gray-900 font-playfair">Current Booking Details</h2>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                            <div>
                                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">Service</p>
                                <p className="text-gray-900 font-medium">{booking.serviceName || "Treatment"}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">Business</p>
                                <p className="text-gray-900 font-medium">{booking.businessName || "Wellness Spa"}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">Staff</p>
                                <p className="text-gray-900 font-medium">{booking.staffName || "Any Available Staff"}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">Current Date & Time</p>
                                <p className="text-gray-900 font-medium tracking-wide">
                                    {formatDateDisplay(booking.bookingDate)} • {formatTime12h(booking.startTime)}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Selection Form Card */}
                    <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 space-y-8">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Select New Date</label>
                            <Input 
                                type="date" 
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="h-14 bg-white border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-[#E89D24] focus:border-[#E89D24]"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-3 flex justify-between items-center">
                                <span>Time</span>
                                {isSlotsLoading && <Loader2 className="w-4 h-4 animate-spin text-[#E89D24]" />}
                            </label>
                            
                            {!isSlotsLoading && availableSlots.length === 0 ? (
                                <div className="text-sm text-gray-500 bg-gray-50 rounded-lg p-4 text-center border border-gray-100">
                                    No available slots found for this date.
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                    {availableSlots.map((slot) => {
                                        const isSelected = selectedTime === slot.startTime;
                                        return (
                                            <button
                                                key={slot.startTime}
                                                onClick={() => setSelectedTime(slot.startTime)}
                                                className={cn(
                                                    "h-12 rounded-lg font-bold text-sm tracking-wide transition-all",
                                                    isSelected 
                                                        ? "bg-[#E89D24] text-white shadow-md shadow-orange-100" 
                                                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                                )}
                                            >
                                                {formatTime12h(slot.startTime)}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Reason for rescheduling (optional)</label>
                            <select 
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                className="w-full h-14 px-4 bg-white border border-gray-200 rounded-lg text-gray-600 focus:outline-none focus:ring-1 focus:ring-[#E89D24] focus:border-[#E89D24]"
                            >
                                <option value="" disabled>Select a reason</option>
                                <option value="schedule_conflict">Schedule Conflict</option>
                                <option value="illness">Feeling unwell</option>
                                <option value="travel">Travel plans changed</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        {/* Banner */}
                        <div className="bg-orange-50/80 border border-orange-100 rounded-xl p-4 flex items-start gap-3">
                            <Clock className="w-5 h-5 text-[#E89D24] mt-0.5" />
                            <p className="text-orange-600 text-sm font-medium leading-relaxed">
                                Rescheduling is free up to 24 hours before your appointment. Changes within 24 hours may incur a small fee.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 border-t border-gray-50">
                            <Button
                                onClick={() => router.back()}
                                variant="outline"
                                className="w-full sm:w-1/2 h-14 bg-white border-gray-200 text-gray-700 font-bold tracking-wide hover:bg-gray-50"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleReschedule}
                                disabled={isSubmitting}
                                className="w-full sm:w-1/2 h-14 bg-[#E89D24] hover:bg-[#D97706] text-white font-bold tracking-wide shadow-lg shadow-orange-100"
                            >
                                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Confirm Reschedule"}
                            </Button>
                        </div>
                    </div>

                    <p className="text-center text-sm text-gray-400 font-medium tracking-widest uppercase">
                        Booking #{booking.id.substring(0, 8).toUpperCase()}
                    </p>
                </div>
            </main>
        </div>
    );
}
