"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { MoreHorizontal, LogOut, LogIn, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth.store";
import { authService } from "@/services/auth.service";
import { toaster } from "@/components/ui/toaster";
import { customerNavItems } from "@/lib/customer-nav";
import { Sheet } from "@/components/ui/sheet";

export function CustomerBottomNav() {
    const pathname = usePathname();
    const router = useRouter();
    const { isAuthenticated, logout: logoutStore } = useAuthStore();
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [isMoreOpen, setIsMoreOpen] = useState(false);

    const primaryItems = customerNavItems.filter((item) => item.mobilePrimary);
    const moreItems = customerNavItems.filter(
        (item) => !item.mobilePrimary && (!item.authRequired || isAuthenticated)
    );

    const isActive = (href: string) =>
        href === "/" ? pathname === "/" : pathname.startsWith(href);

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            await authService.logout();
            logoutStore();
            toaster.create({ title: "Logged out successfully", type: "success" });
            router.push("/");
        } catch {
            logoutStore();
            router.push("/");
        } finally {
            setIsLoggingOut(false);
            setIsMoreOpen(false);
        }
    };

    return (
        <>
            <nav className="fixed bottom-0 inset-x-0 z-30 grid grid-cols-5 md:hidden border-t bg-white pb-[var(--safe-area-bottom)]">
                {primaryItems.map((item) => {
                    const active = isActive(item.href);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center justify-center gap-0.5 min-h-[56px] text-[10px] font-medium transition-colors",
                                active ? "text-[#E89D24]" : "text-gray-400"
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

            <Sheet
                open={isMoreOpen}
                onClose={() => setIsMoreOpen(false)}
                title="More"
                className="md:hidden"
            >
                <div className="px-3 pb-2 space-y-1">
                    {moreItems.map((item) => {
                        const active = isActive(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsMoreOpen(false)}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-4 py-3 min-h-[44px] text-sm font-medium transition-all duration-200",
                                    active ? "bg-[#E89D24] text-white" : "text-gray-600 hover:bg-gray-50"
                                )}
                            >
                                <item.icon className="h-5 w-5" />
                                {item.label}
                            </Link>
                        );
                    })}
                </div>

                <div className="border-t px-3 py-3">
                    {isAuthenticated ? (
                        <button
                            onClick={handleLogout}
                            disabled={isLoggingOut}
                            className="w-full flex items-center gap-3 rounded-lg px-4 py-3 min-h-[44px] text-sm font-medium text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoggingOut ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <LogOut className="h-5 w-5" />
                            )}
                            {isLoggingOut ? "Signing Out..." : "Sign Out"}
                        </button>
                    ) : (
                        <Link
                            href="/auth/login"
                            onClick={() => setIsMoreOpen(false)}
                            className="w-full flex items-center gap-3 rounded-lg px-4 py-3 min-h-[44px] text-sm font-medium text-[#E89D24] hover:bg-amber-50 transition-colors"
                        >
                            <LogIn className="h-5 w-5" />
                            Sign In
                        </Link>
                    )}
                </div>
            </Sheet>
        </>
    );
}
