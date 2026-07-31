"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { MoreHorizontal, Home, Headset, LogOut, Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { dashboardNavItems, contactSupportItem } from "@/lib/dashboard-nav";
import { Sheet } from "@/components/ui/sheet";
import { useLogout } from "@/hooks/use-logout";
import { isBusinessPending } from "@/lib/dashboard-status";

export function MobileBottomNav() {
    const pathname = usePathname();
    const { user } = useAuthStore();
    const { handleLogout, isLoggingOut } = useLogout();
    const [isMoreOpen, setIsMoreOpen] = useState(false);
    const business = user?.businesses?.[0];

    const isPending = isBusinessPending(business?.status);

    const primaryItems = dashboardNavItems.filter((item) => item.mobilePrimary);
    const moreItems = dashboardNavItems.filter((item) => !item.mobilePrimary);

    const closeMore = () => setIsMoreOpen(false);

    return (
        <>
            <nav className="fixed bottom-0 inset-x-0 z-30 grid grid-cols-5 lg:hidden border-t bg-white pb-[env(safe-area-inset-bottom)]">
                {primaryItems.map((item) => {
                    const isActive = pathname === item.href;
                    const isDisabled = isPending && item.label === "Bookings";

                    if (isDisabled) {
                        return (
                            <div
                                key={item.href}
                                className="flex flex-col items-center justify-center gap-0.5 min-h-[56px] text-[10px] font-medium text-gray-300 cursor-not-allowed"
                            >
                                <item.icon className="h-5 w-5" />
                                {item.label}
                            </div>
                        );
                    }

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center justify-center gap-0.5 min-h-[56px] text-[10px] font-medium transition-colors",
                                isActive ? "text-[#F59E0B]" : "text-gray-400"
                            )}
                        >
                            <item.icon className="h-5 w-5" />
                            {item.label}
                        </Link>
                    );
                })}

                <button
                    onClick={() => setIsMoreOpen(true)}
                    className="flex flex-col items-center justify-center gap-0.5 min-h-[56px] text-[10px] font-medium text-gray-400"
                >
                    <MoreHorizontal className="h-5 w-5" />
                    More
                </button>
            </nav>

            {/* The Sheet primitive renders on any viewport, so the mobile-only
                bottom nav keeps it behind an explicit lg:hidden gate. */}
            <div className="lg:hidden">
                <Sheet
                    open={isMoreOpen}
                    onClose={closeMore}
                    title="More"
                    className="max-w-none"
                    footer={
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 px-4 py-1 text-sm text-gray-500">
                                <Home className="h-5 w-5" />
                                <span className="truncate font-semibold text-gray-700">
                                    {business?.businessName || "SerenitySpa"}
                                </span>
                            </div>
                            <button
                                onClick={handleLogout}
                                disabled={isLoggingOut}
                                className="w-full flex items-center gap-3 rounded-lg px-4 py-3 min-h-[44px] text-sm font-medium text-[#F59E0B] hover:bg-amber-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoggingOut ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <LogOut className="h-5 w-5" />
                                )}
                                {isLoggingOut ? "Signing Out..." : "Sign Out"}
                            </button>
                        </div>
                    }
                >
                    <div className="px-3 pb-2 space-y-1">
                        {moreItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={closeMore}
                                    className={cn(
                                        "flex items-center gap-3 rounded-lg px-4 py-3 min-h-[44px] text-sm font-medium transition-all duration-200",
                                        isActive
                                            ? "bg-[#F59E0B] text-white"
                                            : "text-gray-600 hover:bg-gray-50"
                                    )}
                                >
                                    <item.icon className="h-5 w-5" />
                                    {item.label}
                                </Link>
                            );
                        })}

                        <Link
                            href={contactSupportItem.href}
                            onClick={closeMore}
                            className={cn(
                                "flex items-center gap-3 rounded-lg px-4 py-3 min-h-[44px] text-sm font-medium transition-all duration-200",
                                pathname === contactSupportItem.href
                                    ? "bg-[#F59E0B] text-white"
                                    : "text-gray-600 hover:bg-gray-50"
                            )}
                        >
                            <Headset className="h-5 w-5" />
                            {contactSupportItem.label}
                        </Link>
                    </div>
                </Sheet>
            </div>
        </>
    );
}
