import { createElement, type ReactElement } from "react";
import { Bell, ClipboardCheck, Tag, Zap, Calendar, Star, CheckCircle2, CreditCard, Clock, XCircle } from "lucide-react";

export function formatTimeAgo(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + (Math.floor(interval) === 1 ? " hour ago" : " hours ago");
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m ago";
    return Math.floor(seconds) + "s ago";
}

export function getIconForType(type: string): ReactElement {
    switch (type) {
        case "service_completion":
            return createElement(CheckCircle2, { className: "w-5 h-5 text-green-500" });
        case "appointment_reminder":
            return createElement(Clock, { className: "w-5 h-5 text-amber-500" });
        case "payment_confirmation":
        case "PAYMENT":
        case "PAYMENT_SUCCESSFUL":
            return createElement(CreditCard, { className: "w-5 h-5 text-emerald-500" });
        case "booking_confirmation":
        case "BOOKING":
        case "UPCOMING_BOOKING":
            return createElement(Calendar, { className: "w-5 h-5 text-blue-500" });
        case "booking_cancelled":
            return createElement(XCircle, { className: "w-5 h-5 text-red-500" });
        case "OFFER":
        case "PROMO":
            return createElement(Tag, { className: "w-5 h-5 text-green-500" });
        case "SYSTEM":
        case "ALERT":
            return createElement(ClipboardCheck, { className: "w-5 h-5 text-blue-500" });
        case "REVIEW":
        case "NEW_REVIEW":
            return createElement(Star, { className: "w-5 h-5 text-yellow-500" });
        case "ONBOARDING":
        case "ONBOARDING_UPDATE":
            return createElement(Zap, { className: "w-5 h-5 text-purple-500" });
        default:
            return createElement(Bell, { className: "w-5 h-5 text-gray-500" });
    }
}

export function getBgForType(type: string): string {
    switch (type) {
        case "appointment_reminder":
            return "bg-amber-50";
        case "service_completion":
            return "bg-green-100";
        case "payment_confirmation":
        case "PAYMENT":
        case "PAYMENT_SUCCESSFUL":
            return "bg-emerald-50";
        case "booking_confirmation":
        case "BOOKING":
        case "UPCOMING_BOOKING":
            return "bg-blue-50";
        case "booking_cancelled":
            return "bg-red-50";
        case "OFFER":
        case "PROMO":
            return "bg-green-50";
        case "SYSTEM":
        case "ALERT":
            return "bg-blue-50";
        case "REVIEW":
        case "NEW_REVIEW":
            return "bg-yellow-50";
        case "ONBOARDING":
        case "ONBOARDING_UPDATE":
            return "bg-purple-50";
        default:
            return "bg-gray-100";
    }
}
