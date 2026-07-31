"use client";

import { useState } from "react";
import { bookingService } from "@/services/booking.service";
import { toaster } from "@/components/ui/toaster";

interface UseBookingOwnerActionsOptions {
    businessId?: string;
    onDone: () => void;
}

// Owns the Confirm / Cancel / Approve-cancellation / Reject-cancellation
// flows for a business owner's bookings, plus the three ConfirmModal gating
// states. Extracted verbatim in behavior from src/app/dashboard/bookings/page.tsx
// so the bookings page and any other surface (e.g. a mobile booking row)
// can't drift from each other. Deliberately does NOT include a "Complete"
// action — completeBooking has no call sites anywhere in the app yet and
// wiring it is out of scope for this pass (see project plan).
export function useBookingOwnerActions({ businessId, onDone }: UseBookingOwnerActionsOptions) {
    const [bookingToCancel, setBookingToCancel] = useState<string | null>(null);
    const [bookingToApprove, setBookingToApprove] = useState<string | null>(null);
    const [bookingToReject, setBookingToReject] = useState<string | null>(null);

    const handleConfirm = async (id: string) => {
        try {
            await bookingService.confirmBooking(id, businessId!, { notes: "Handled from dashboard" });
            onDone();
        } catch (error) {
            console.error("Error confirming booking:", error);
        }
    };

    const handleCancel = (id: string) => setBookingToCancel(id);
    const handleApproveCancellation = (id: string) => setBookingToApprove(id);
    const handleRejectCancellation = (id: string) => setBookingToReject(id);

    const confirmCancel = async () => {
        if (!bookingToCancel) return;
        try {
            await bookingService.cancelBooking(bookingToCancel, { reason: "Cancelled by business owner" });
            onDone();
            toaster.create({ title: "Booking Cancelled", type: "success" });
        } catch (error) {
            console.error("Error cancelling booking:", error);
            toaster.create({ title: "Cancellation Failed", description: "Could not cancel booking", type: "error" });
        } finally {
            setBookingToCancel(null);
        }
    };

    const confirmApproveCancellation = async () => {
        if (!bookingToApprove || !businessId) return;
        try {
            await bookingService.cancellationDecision(bookingToApprove, businessId, { approve: true, reason: "Cancellation request approved by business." });
            onDone();
            toaster.create({ title: "Cancellation Approved", description: "The customer has been notified.", type: "success" });
        } catch (error) {
            console.error("Error approving cancellation:", error);
            toaster.create({ title: "Action Failed", description: "Could not approve cancellation request.", type: "error" });
        } finally {
            setBookingToApprove(null);
        }
    };

    const confirmRejectCancellation = async () => {
        if (!bookingToReject || !businessId) return;
        try {
            await bookingService.cancellationDecision(bookingToReject, businessId, { approve: false, reason: "Outside cancellation window." });
            onDone();
            toaster.create({ title: "Request Rejected", description: "The booking remains active.", type: "success" });
        } catch (error) {
            console.error("Error rejecting cancellation:", error);
            toaster.create({ title: "Action Failed", description: "Could not reject cancellation request.", type: "error" });
        } finally {
            setBookingToReject(null);
        }
    };

    return {
        bookingToCancel,
        bookingToApprove,
        bookingToReject,
        handleConfirm,
        handleCancel,
        handleApproveCancellation,
        handleRejectCancellation,
        confirmCancel,
        confirmApproveCancellation,
        confirmRejectCancellation,
        clearCancel: () => setBookingToCancel(null),
        clearApprove: () => setBookingToApprove(null),
        clearReject: () => setBookingToReject(null),
    };
}
