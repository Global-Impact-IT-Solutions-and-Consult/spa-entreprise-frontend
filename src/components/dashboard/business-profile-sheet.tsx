"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet } from "@/components/ui/sheet";
import { useAuthStore } from "@/store/auth.store";
import { useLogout } from "@/hooks/use-logout";
import { businessStatusBadge, isBusinessPending } from "@/lib/dashboard-status";
import { toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";
import {
    ChevronRight,
    Clock,
    ExternalLink,
    Loader2,
    LogOut,
    Settings,
    Share2,
    Store,
} from "lucide-react";

interface BusinessProfileSheetProps {
    open: boolean;
    onClose: () => void;
}

const LINKS = [
    { label: "Edit Business Profile", href: "/dashboard/business", icon: Store },
    { label: "Working Hours", href: "/dashboard/working-hours", icon: Clock },
    { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

// Mobile-only sheet opened from the dashboard-home hero avatar. Exists so the
// Business tab, which is no longer a mobile-primary bottom-nav item, stays one
// tap away. Public-profile / Share are gated on pending verification exactly
// as the equivalent buttons on /dashboard/business are.
export function BusinessProfileSheet({ open, onClose }: BusinessProfileSheetProps) {
    const { user } = useAuthStore();
    const { handleLogout, isLoggingOut } = useLogout();
    const business = user?.businesses?.[0];
    const badge = businessStatusBadge(business?.status);
    const isPending = isBusinessPending(business?.status);
    const businessName = business?.businessName || "Your Business";

    const initials =
        businessName
            .split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map((word) => word.charAt(0).toUpperCase())
            .join("") || "B";

    const publicUrl = () =>
        typeof window === "undefined" ? "" : `${window.location.origin}/businesses/${business?.slug}`;

    const handleViewPublic = () => {
        if (isPending) return;
        window.open(publicUrl(), "_blank");
    };

    const handleShare = async () => {
        if (isPending) return;
        const url = publicUrl();
        try {
            if (navigator.share) {
                await navigator.share({ title: businessName, url });
                return;
            }
            await navigator.clipboard.writeText(url);
            toaster.create({ title: "Link copied to clipboard", type: "success" });
        } catch {
            // User dismissed the share sheet, or the clipboard was unavailable.
        }
    };

    return (
        <div className="lg:hidden">
            <Sheet open={open} onClose={onClose} title="Business Profile" className="max-w-none">
                <div className="px-4 pb-4">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-14 w-14">
                            <AvatarImage src={business?.profileImage || undefined} className="object-cover" />
                            <AvatarFallback className="bg-[#F59E0B] text-white font-bold">
                                {initials}
                            </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                            <p className="text-[16px] font-bold text-gray-900 line-clamp-1">{businessName}</p>
                            <span
                                className={cn(
                                    "mt-1 inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold",
                                    badge.className
                                )}
                            >
                                {badge.label}
                            </span>
                        </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2">
                        <button
                            onClick={handleViewPublic}
                            disabled={isPending}
                            className="h-11 rounded-xl bg-gray-100 text-[13px] font-semibold text-gray-700 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ExternalLink className="h-4 w-4" />
                            View Public
                        </button>
                        <button
                            onClick={handleShare}
                            disabled={isPending}
                            className="h-11 rounded-xl bg-amber-50 text-[13px] font-semibold text-[#E89D24] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Share2 className="h-4 w-4" />
                            Share
                        </button>
                    </div>
                    {isPending && (
                        <p className="mt-2 text-[11px] text-gray-400">
                            Available after verification is complete.
                        </p>
                    )}

                    <div className="mt-5 overflow-hidden rounded-2xl border border-gray-100 divide-y divide-gray-100">
                        {LINKS.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={onClose}
                                className="flex items-center gap-3 px-4 py-3.5 min-h-[52px] text-[14px] font-medium text-gray-700 active:bg-gray-50"
                            >
                                <link.icon className="h-4 w-4 text-gray-400" />
                                <span className="flex-1">{link.label}</span>
                                <ChevronRight className="h-4 w-4 text-gray-300" />
                            </Link>
                        ))}
                    </div>

                    <button
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="mt-4 w-full flex items-center justify-center gap-2 rounded-xl px-4 py-3 min-h-[48px] text-[14px] font-semibold text-[#F59E0B] hover:bg-amber-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoggingOut ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <LogOut className="h-4 w-4" />
                        )}
                        {isLoggingOut ? "Signing Out..." : "Sign Out"}
                    </button>
                </div>
            </Sheet>
        </div>
    );
}
