"use client";

import { useAuthStore } from "@/store/auth.store";
import { Sidebar } from "@/components/modules/Sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, Clock, X, Info } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { authService } from "@/services/auth.service";
import { businessService } from "@/services/business.service";
import Link from "next/link";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, updateUser } = useAuthStore();
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const business = user?.businesses?.[0];
    const status = business?.status?.toLowerCase();
    const isPending = status === 'pending_approval' || status === 'pending';

    useEffect(() => {
        const refreshUserData = async () => {
            try {
                const refreshedUser = await authService.getCurrentUser();
                updateUser(refreshedUser);
            } catch (error) {
                console.error("Failed to refresh user data", error);
            }
        };

        const fetchPrimaryImage = async () => {
            const businessId = business?.id;
            if (!businessId) return;
            try {
                const images = await businessService.getImages(businessId);
                const primary = images.find(img => img.isPrimary) || images[0];
                if (primary) setAvatarUrl(primary.url);
            } catch {
                // Silently fail — fallback will show initials
            }
        };

        refreshUserData();
        fetchPrimaryImage();
    }, [business?.id]);

    // Listen for primary image changes from the business page
    useEffect(() => {
        const handlePrimaryChange = (e: Event) => {
            const detail = (e as CustomEvent).detail;
            if (detail?.url !== undefined) {
                setAvatarUrl(detail.url);
            }
        };
        window.addEventListener("primary-image-changed", handlePrimaryChange);
        return () => window.removeEventListener("primary-image-changed", handlePrimaryChange);
    }, []);

    const [activeTab, setActiveTab] = useState("All");

    const notifications = [
        {
            id: 1,
            title: "Spa Appointment Booked,",
            description: "Home Service Session for 12:30PM Today",
            dayTime: "Thursday 4:20pm",
            timeAgo: "20 min ago",
            type: "Bookings",
            isUnread: true
        },
        {
            id: 2,
            title: "HairCut Appointment Booked,",
            description: "In-Store Service Session for 12:30PM Today",
            dayTime: "Thursday 4:20pm",
            timeAgo: "1hours ago",
            type: "Bookings",
            isUnread: true
        },
        {
            id: 3,
            title: "HairCut Appointment Booked,",
            description: "Home Service Session for 12:30PM Tuesday",
            dayTime: "Thursday 4:20pm",
            timeAgo: "1 hours ago",
            type: "Bookings",
            isUnread: false
        },
        {
            id: 4,
            title: "Spa Service Appointment Booked,",
            description: "Home Service Session for 12:30PM Today",
            dayTime: "Thursday 4:20pm",
            timeAgo: "2 hours ago",
            type: "Bookings",
            isUnread: false
        },
        {
            id: 5,
            title: "Spa Service Appointment Booked,",
            description: "Home Service Session for 12:30PM Today",
            dayTime: "Thursday 4:20pm",
            timeAgo: "4 hours ago",
            type: "Bookings",
            isUnread: false
        },
        {
            id: 6,
            title: "System Update,",
            description: "New platform features are now available",
            dayTime: "Wednesday 10:00am",
            timeAgo: "1 day ago",
            type: "System",
            isUnread: false
        }
    ];

    const filteredNotifications = notifications.filter(n => {
        if (activeTab === "All") return true;
        return n.type === activeTab;
    });

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <div className="flex flex-1 flex-col h-full overflow-hidden">
                {/* Header */}
                <header className="flex h-20 min-h-[5rem] items-center justify-between border-b bg-white px-8 shrink-0">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 leading-tight">Dashboard</h1>
                        <p className="text-xs text-gray-500">Welcome Back {user?.firstName}!</p>
                    </div>

                    {/* Right side header content: Notification & Profile */}
                    {!isPending && (
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                                className={cn(
                                    "relative p-2.5 text-[#192131] hover:text-gray-900 rounded-xl transition-all duration-200 cursor-pointer",
                                    isNotificationsOpen && "text-amber-600"
                                )}
                            >
                                <Bell className="h-5 w-5" />
                                <span className="absolute top-2 right-2 h-2 w-2 bg-[#F59E0B] rounded-full ring-2 ring-white" />
                            </button>
                            <Avatar className="h-9 w-9 border-2 border-white shadow-sm ring-1 ring-[#192131]">
                                <AvatarImage src={avatarUrl || undefined} />
                                <AvatarFallback className="bg-[#F59E0B] text-white font-bold">
                                    {user?.firstName?.charAt(0) || "D"}
                                </AvatarFallback>
                            </Avatar>
                        </div>
                    )}

                    {/* Notification Popover */}
                    {isNotificationsOpen && (
                        <>
                            <div
                                className="fixed inset-0 z-40 bg-transparent"
                                onClick={() => setIsNotificationsOpen(false)}
                            />
                            <div className="absolute top-20 right-8 w-[440px] bg-white rounded-md shadow-2xl shadow-black/10 border border-gray-100 z-50 animate-in fade-in slide-in-from-top-2 flex flex-col overflow-hidden">
                                <div className="p-8 py-4">
                                    <div className="flex items-center justify-between mb-5">
                                        <h3 className="text-2xl font-semibold text-gray-900">Notifications</h3>
                                        <button
                                            onClick={() => setIsNotificationsOpen(false)}
                                            className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
                                        >
                                            <X className="h-4 w-4" strokeWidth={2.5} />
                                        </button>
                                    </div>

                                    {/* Tabs */}
                                    <div className="flex items-center gap-2">
                                        {["All", "Bookings", "System"].map((tab) => (
                                            <button
                                                key={tab}
                                                onClick={() => setActiveTab(tab)}
                                                className={cn(
                                                    "px-4 py-1 text-sm font-medium transition-all rounded-2xl",
                                                    activeTab === tab
                                                        ? "bg-[#FFF7ED] text-[#F59E0B]"
                                                        : "text-gray-500 hover:bg-gray-50"
                                                )}
                                            >
                                                {tab}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="h-[1px] w-full bg-gray-50 mb-4" />

                                <div className="max-h-[520px] overflow-y-auto px-6 py-2 custom-scrollbar">
                                    <div className="space-y-4 pb-6">
                                        {filteredNotifications.length > 0 ? (
                                            filteredNotifications.map((notif) => (
                                                <div
                                                    key={notif.id}
                                                    className="bg-white p-5 rounded-md shadow-[0px_4px_5px_0px_#E89D24/10] hover:shadow-[#E89D24]/20 shadow-[#E89D24]/10 transition-all group flex flex-col relative"
                                                >
                                                    {/* Unread Indicator */}
                                                    <div className={cn(
                                                        "absolute top-6 right-6 h-2 w-2 rounded-full",
                                                        notif.isUnread ? "bg-[#F59E0B]" : "bg-gray-200"
                                                    )} />

                                                    <div className="pr-6">
                                                        <h4 className="text-sm font-bold text-gray-900 leading-tight">
                                                            {notif.title} <span className="text-gray-400 font-medium">{notif.description}</span>
                                                        </h4>
                                                    </div>

                                                    <div className="flex items-center justify-between mt-6">
                                                        <span className="text-[11px] font-medium text-gray-400">
                                                            {notif.dayTime}
                                                        </span>
                                                        <span className="text-[11px] font-medium text-gray-400">
                                                            {notif.timeAgo}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                                <Bell className="h-12 w-12 text-gray-100 mb-4" />
                                                <p className="text-sm text-gray-400 font-medium">No notifications yet</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </header>

                {isPending && (
                    <div className="bg-amber-50 border-b border-amber-100 flex items-center justify-between px-8 py-2 animate-in slide-in-from-top duration-300">
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-[#F59E0B]" />
                            <span className="text-sm font-bold text-amber-700">Account Pending Verification</span>
                            <span className="text-xs text-amber-600/80 font-medium ml-2">Some features will be available once your business is verified.</span>
                        </div>
                        <Link
                            href="/dashboard/contact-support"
                            className="h-8 rounded-lg border border-amber-200 bg-white text-amber-700 hover:bg-amber-50 hover:text-amber-800 font-bold text-xs px-3 flex items-center"
                        >
                            Contact Support
                        </Link>
                    </div>
                )}

                <main className="flex-1 overflow-y-auto p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
