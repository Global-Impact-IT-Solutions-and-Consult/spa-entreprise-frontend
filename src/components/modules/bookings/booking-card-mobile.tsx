"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, CalendarClock, CalendarPlus, Star, Heart, XCircle } from "lucide-react";
import { SwipeableRow, type SwipeAction } from "@/components/ui/swipeable-row";
import { AddToCalendarModal } from "./add-to-calendar-modal";
import { Booking } from "@/services/booking.service";
import { isPastOrCancelled, BOOKING_STATUS_TONE } from "@/lib/booking-utils";

interface BookingCardMobileProps {
    booking: Booking;
}

// Mobile-only compact variant of BookingCard — no cover image (avoids the
// per-card getServices fetch the desktop card makes), combined date+price
// row, and swipe-to-reveal reschedule/cancel actions instead of an
// always-visible button row.
export function BookingCardMobile({ booking }: BookingCardMobileProps) {
    const router = useRouter();
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);

    const isDone = isPastOrCancelled(booking.status);
    const isHistory = booking.status === "completed";
    const canReschedule = booking.status === "pending_payment" || booking.status === "confirmed";

    const actions: SwipeAction[] = [];
    if (!isDone) {
        if (canReschedule) {
            actions.push({
                key: "reschedule",
                label: "Reschedule",
                icon: CalendarClock,
                onClick: () => router.push(`/reschedule/${booking.id}`),
                className: "bg-gray-100 text-gray-700",
            });
        }
        actions.push({
            key: "cancel",
            label: "Cancel",
            icon: XCircle,
            onClick: () => router.push(`/bookings/${booking.id}/cancel`),
            className: "bg-[#E74C3C] text-white",
        });
    }

    const dateLabel = new Date(booking.bookingDate).toLocaleDateString('en-US', {
        weekday: 'short', day: 'numeric', month: 'short',
    });

    return (
        <>
        <SwipeableRow actions={actions} disabled={isDone} className="shadow-sm">
            <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                        <p className="text-[15px] font-bold text-gray-900 line-clamp-1">{booking.serviceName}</p>
                        <p className="text-[12px] text-gray-400 line-clamp-1 mt-0.5">
                            {booking.businessName} · {booking.staffName || "Any staff"}
                        </p>
                    </div>
                    <div className="shrink-0 flex items-center gap-1.5">
                        {!isDone && (
                            <button
                                onClick={() => setIsCalendarOpen(true)}
                                className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400"
                                aria-label="Add to calendar"
                            >
                                <CalendarPlus className="w-3.5 h-3.5" />
                            </button>
                        )}
                        <span className={`text-[10px] font-semibold px-2 py-1 rounded-full capitalize ${BOOKING_STATUS_TONE[booking.status]}`}>
                            {booking.status.replaceAll('_', ' ')}
                        </span>
                    </div>
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                    <div className="flex items-center gap-1.5 text-[12px] text-gray-500">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        <span>{dateLabel} · {booking.startTime}</span>
                    </div>
                    <span className="text-[14px] font-bold text-gray-900">₦{booking.totalPrice.toLocaleString()}</span>
                </div>

                {isHistory && (
                    <div className="grid grid-cols-2 gap-2 mt-3">
                        <button
                            onClick={() => router.push(`/reviews/${booking.id}`)}
                            className="h-9 rounded-xl bg-gray-100 text-gray-700 text-[12px] font-semibold flex items-center justify-center gap-1.5"
                        >
                            <Star className="w-3.5 h-3.5" />
                            Leave Review
                        </button>
                        <button
                            onClick={() => router.push(`/reviews/${booking.id}?focus=tip`)}
                            className="h-9 rounded-xl bg-amber-50 text-[#E89D24] text-[12px] font-semibold flex items-center justify-center gap-1.5"
                        >
                            <Heart className="w-3.5 h-3.5" />
                            Add Tip
                        </button>
                    </div>
                )}
            </div>
        </SwipeableRow>

        <AddToCalendarModal
            isOpen={isCalendarOpen}
            onClose={() => setIsCalendarOpen(false)}
            booking={{
                id: booking.id,
                serviceName: booking.serviceName,
                businessName: booking.businessName,
                date: booking.bookingDate,
                time: booking.startTime,
                location: 'In-store',
            }}
        />
        </>
    );
}
