"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Store,
    Briefcase,
    Calendar,
    Users,
    BarChart3,
    Home
} from "lucide-react";

const sidebarItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: Store, label: "Business Profile", href: "/dashboard/profile" }, // Placeholder route
    { icon: Briefcase, label: "Services", href: "/dashboard/services" }, // Placeholder route
    { icon: Calendar, label: "Bookings", href: "/dashboard/bookings" }, // Placeholder route
    { icon: Users, label: "Staff", href: "/dashboard/staff" }, // Placeholder route
    { icon: BarChart3, label: "Analytics", href: "/dashboard/analytics" }, // Placeholder route
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="flex h-screen w-64 flex-col border-r bg-white">
            {/* Logo Section */}
            <div className="p-6">
                <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded bg-[#2D5B5E] text-white font-bold">W</div>
                    <div>
                        <h1 className="text-lg font-bold text-gray-900">WellnessPro</h1>
                        <p className="text-xs text-gray-500">Business Portal</p>
                    </div>
                </div>
            </div>

            {/* Navigation Items */}
            <nav className="flex-1 space-y-1 px-4 py-4">
                {sidebarItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-[#DAE5E5] text-[#2D5B5E]" // Active State from screenshot (light teal bg)
                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                            )}
                        >
                            <item.icon className={cn("h-5 w-5", isActive ? "text-[#2D5B5E]" : "text-gray-400")} />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom Business Card */}
            <div className="border-t p-4">
                <div className="flex items-center gap-3 rounded-xl bg-gray-100 p-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#cbdad9] text-[#2D5B5E]">
                        <Store className="h-5 w-5" />
                    </div>
                    <div className="overflow-hidden">
                        <p className="truncate text-sm font-bold text-gray-900">Serenity Spa</p>
                        <p className="truncate text-xs text-gray-500">Lagos, Nigeria</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
