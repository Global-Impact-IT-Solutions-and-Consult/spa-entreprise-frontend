import type { Booking } from "@/services/booking.service";

// Shared between the desktop and mobile booking cards so their notion of
// "this booking is done/settled" can't drift.
export function isPastOrCancelled(status: Booking["status"]): boolean {
    return status === "completed" || status === "cancelled" || status === "cancellation_pending_approval";
}

export const BOOKING_STATUS_TONE: Record<Booking["status"], string> = {
    confirmed: "bg-emerald-50 text-emerald-600",
    pending_payment: "bg-amber-50 text-amber-600",
    completed: "bg-gray-100 text-gray-500",
    cancelled: "bg-red-50 text-red-600",
    expired: "bg-red-50 text-red-600",
    cancellation_pending_approval: "bg-orange-50 text-orange-600",
};

/**
 * Generates an array of time strings (e.g., ["9:00AM", "10:00AM"]) based on open/close times and an interval.
 * 
 * @param openTime - Opening time in "HH:mm" format (e.g., "09:00")
 * @param closeTime - Closing time in "HH:mm" format (e.g., "17:00")
 * @param intervalMinutes - Minutes between each slot (default: 60)
 * @returns Array of formatted time strings
 */
export function generateTimeSlots(openTime: string, closeTime: string, intervalMinutes: number = 60): string[] {
    if (!openTime || !closeTime) return [];

    const parseTime = (time: string) => {
        const [hours, minutes] = time.split(':').map(Number);
        return hours * 60 + minutes;
    };

    const formatTime = (totalMinutes: number) => {
        let hours = Math.floor(totalMinutes / 60);
        const mins = totalMinutes % 60;
        const ampm = hours >= 12 ? 'PM' : 'AM';

        hours = hours % 12;
        if (hours === 0) hours = 12;

        const minsStr = mins === 0 ? '00' : mins.toString().padStart(2, '0');
        return `${hours}:${minsStr}${ampm}`;
    };

    const startMinutes = parseTime(openTime);
    const endMinutes = parseTime(closeTime);
    const slots: string[] = [];

    // Loop until we reach closeTime. We stop if the next slot would end after closeTime.
    for (let current = startMinutes; current <= endMinutes - intervalMinutes; current += intervalMinutes) {
        slots.push(formatTime(current));
    }

    return slots;
}
