"use client";

import { Calendar, Check, CheckCircle2, Phone, X, XCircle } from "lucide-react";
import { SwipeableRow, type SwipeAction } from "@/components/ui/swipeable-row";
import type { Booking } from "@/services/booking.service";
import type { Service, Staff } from "@/services/business.service";
import { cn } from "@/lib/utils";

interface BookingRowMobileProps {
    booking: Booking & { fullService?: Service; fullStaff?: Staff };
    dateLabel: string;
    timeLabel: string;
    onConfirm: (id: string) => void;
    onCancel: (id: string) => void;
    onApproveCancellation: (id: string) => void;
    onRejectCancellation: (id: string) => void;
}

const STATUS_TONE: Record<string, string> = {
    confirmed: "bg-emerald-50 text-emerald-600",
    completed: "bg-emerald-50 text-emerald-600",
    pending_payment: "bg-amber-50 text-amber-600",
    cancellation_pending_approval: "bg-rose-50 text-rose-600",
    cancelled: "bg-gray-100 text-gray-500",
    expired: "bg-gray-100 text-gray-500",
};

// Mobile-only compact booking row for the owner's bookings page. No cover
// image (the desktop card's 140px hero would dominate a 360px row) and the
// desktop card's always-visible button row becomes swipe-to-reveal actions.
//
// Swipe actions are deliberately limited to the two flows already wired and
// tested on desktop: Confirm/Cancel for pending_payment and Approve/Decline
// for cancellation_pending_approval. Every other status swipes to nothing.
export function BookingRowMobile({
    booking,
    dateLabel,
    timeLabel,
    onConfirm,
    onCancel,
    onApproveCancellation,
    onRejectCancellation,
}: BookingRowMobileProps) {
    const actions: SwipeAction[] = [];

    if (booking.status === "pending_payment") {
        actions.push({
            key: "confirm",
            label: "Confirm",
            icon: CheckCircle2,
            onClick: () => onConfirm(booking.id),
            className: "bg-[#1A1F2C] text-white",
        });
        actions.push({
            key: "cancel",
            label: "Cancel",
            icon: XCircle,
            onClick: () => onCancel(booking.id),
            className: "bg-[#E74C3C] text-white",
        });
    } else if (booking.status === "cancellation_pending_approval") {
        actions.push({
            key: "decline",
            label: "Decline",
            icon: X,
            onClick: () => onRejectCancellation(booking.id),
            className: "bg-gray-100 text-gray-700",
        });
        actions.push({
            key: "approve",
            label: "Approve",
            icon: Check,
            onClick: () => onApproveCancellation(booking.id),
            className: "bg-[#E74C3C] text-white",
        });
    }

    const staffName = booking.fullStaff?.name || booking.staffName;

    return (
        <SwipeableRow actions={actions} disabled={actions.length === 0} className="shadow-sm">
            <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                        <p className="text-[15px] font-bold text-gray-900 line-clamp-1">
                            {booking.serviceName}
                        </p>
                        <p className="mt-0.5 text-[12px] text-gray-400 line-clamp-1">
                            {booking.customerName || "Guest"}
                            {staffName ? ` · ${staffName}` : ""}
                        </p>
                    </div>
                    <span
                        className={cn(
                            "shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold capitalize",
                            STATUS_TONE[booking.status] || "bg-gray-100 text-gray-500"
                        )}
                    >
                        {booking.status.replaceAll("_", " ")}
                    </span>
                </div>

                {booking.customerPhone && (
                    <a
                        href={`tel:${booking.customerPhone}`}
                        className="mt-2 inline-flex items-center gap-1.5 text-[12px] font-medium text-gray-500"
                    >
                        <Phone className="h-3.5 w-3.5 text-gray-400" />
                        {booking.customerPhone}
                    </a>
                )}

                <div className="mt-3 flex items-center justify-between gap-2 border-t border-gray-50 pt-3">
                    <div className="flex min-w-0 items-center gap-1.5 text-[12px] text-gray-500">
                        <Calendar className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                        <span className="line-clamp-1">
                            {dateLabel} · {timeLabel}
                        </span>
                    </div>
                    <span className="shrink-0 text-[14px] font-bold text-gray-900">
                        ₦{booking.totalPrice.toLocaleString()}
                    </span>
                </div>
            </div>
        </SwipeableRow>
    );
}
