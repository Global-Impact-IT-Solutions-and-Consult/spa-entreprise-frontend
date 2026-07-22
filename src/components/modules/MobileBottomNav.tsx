"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { MoreHorizontal, Home, Headset, LogOut, Loader2, X } from "lucide-react";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth.store";
import { toaster } from "@/components/ui/toaster";
import { dashboardNavItems, contactSupportItem } from "@/lib/dashboard-nav";

export function MobileBottomNav() {
    const pathname = usePathname();
    const router = useRouter();
    const { logout: logoutStore, user } = useAuthStore();
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [isMoreOpen, setIsMoreOpen] = useState(false);
    const [isSheetVisible, setIsSheetVisible] = useState(false);
    const business = user?.businesses?.[0];

    const status = business?.status?.toLowerCase();
    const isPending = status === "pending_approval" || status === "pending";

    const primaryItems = dashboardNavItems.filter((item) => item.mobilePrimary);
    const moreItems = dashboardNavItems.filter((item) => !item.mobilePrimary);

    useEffect(() => {
        if (isMoreOpen) {
            setIsSheetVisible(false);
            const id = requestAnimationFrame(() => setIsSheetVisible(true));
            return () => cancelAnimationFrame(id);
        }
    }, [isMoreOpen]);

    const closeMore = () => {
        setIsSheetVisible(false);
        setTimeout(() => setIsMoreOpen(false), 200);
    };

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            await authService.logout();
            logoutStore();
            toaster.create({
                title: "Logged out",
                description: "You have been successfully logged out.",
                type: "success",
            });
            router.push("/auth/login");
        } catch (error) {
            console.error("Logout error:", error);
            logoutStore();
            router.push("/auth/login");
        } finally {
            setIsLoggingOut(false);
        }
    };

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

            {isMoreOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40 bg-black/30 lg:hidden"
                        onClick={closeMore}
                    />
                    <div
                        className={cn(
                            "fixed inset-x-0 bottom-0 z-50 lg:hidden bg-white rounded-t-2xl shadow-2xl pb-[env(safe-area-inset-bottom)] transition-transform duration-200 ease-out",
                            isSheetVisible ? "translate-y-0" : "translate-y-full"
                        )}
                    >
                        <div className="flex items-center justify-between px-4 pt-4 pb-2">
                            <h3 className="text-lg font-bold text-gray-900">More</h3>
                            <button
                                onClick={closeMore}
                                className="h-10 w-10 flex items-center justify-center hover:bg-gray-100 rounded-lg text-gray-400 transition-colors"
                            >
                                <X className="h-5 w-5" strokeWidth={2.5} />
                            </button>
                        </div>

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

                        <div className="border-t px-3 py-3 space-y-3">
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
                    </div>
                </>
            )}
        </>
    );
}
