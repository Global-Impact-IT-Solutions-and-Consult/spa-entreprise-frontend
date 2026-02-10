"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Store,
    Briefcase,
    Calendar,
    Users,
    Home,
    Clock
} from "lucide-react";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth.store";
import { toaster } from "@/components/ui/toaster";
import { Button } from "@/components/ui/button";

const sidebarItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: Calendar, label: "Bookings", href: "/dashboard/bookings" },
    { icon: Store, label: "Business", href: "/dashboard/business" },
    { icon: Briefcase, label: "Services", href: "/dashboard/services" },
    { icon: Users, label: "Staffs", href: "/dashboard/staffs" },
    { icon: Clock, label: "Working Hours", href: "/dashboard/working-hours" },
];

export function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { logout: logoutStore, user } = useAuthStore();
    const business = user?.businesses?.[0];

    const handleLogout = async () => {
        try {
            await authService.logout();
            logoutStore();
            toaster.create({
                title: "Logged out",
                description: "You have been successfully logged out.",
                type: "success"
            });
            router.push('/auth/login');
        } catch (error) {
            console.error("Logout error:", error);
            logoutStore();
            router.push('/auth/login');
        }
    };

    const status = business?.status?.toLowerCase();
    const isPending = status === "pending_approval" || status === "pending";

    return (
        <div className="flex h-screen w-64 flex-col bg-[#1A1F2C] text-gray-400">
            {/* Logo Section */}
            <div className="p-6">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#F59E0B] text-white font-bold text-xl">WP</div>
                    <div>
                        <h1 className="text-sm font-bold text-white">WellnessPro</h1>
                        <p className="text-[10px] text-gray-400">Connecting Businesses</p>
                    </div>
                </div>
            </div>

            {/* Navigation Items */}
            <nav className="flex-1 space-y-1 px-3 py-4">
                {sidebarItems.map((item) => {
                    const isActive = pathname === item.href;
                    const isDisabled = isPending && item.label === "Bookings";

                    if (isDisabled) {
                        return (
                            <div
                                key={item.href}
                                className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-gray-600 cursor-not-allowed opacity-50"
                                title="Pending business verification"
                            >
                                <item.icon className="h-5 w-5 text-gray-600" />
                                {item.label}
                            </div>
                        );
                    }

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200",
                                isActive
                                    ? "bg-[#F59E0B] text-white"
                                    : "text-gray-400 hover:bg-[#2D3343] hover:text-white"
                            )}
                        >
                            <item.icon className={cn("h-5 w-5", isActive ? "text-white" : "text-gray-400")} />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom Section: Business Card & Logout */}
            <div className="p-4 space-y-4">
                <div className="flex items-center gap-3 p-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2D3343] text-white">
                        <Home className="h-5 w-5" />
                    </div>
                    <div className="overflow-hidden flex-1">
                        <p className="truncate text-sm font-semibold text-white">{business?.businessName || "SerenitySpa"}</p>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="w-fit flex items-center gap-1.5 text-xs font-medium text-[#F59E0B] hover:text-[#fbbf24] transition-colors pl-2"
                >
                    Sign Out
                </button>
            </div>
        </div>
    );
}
