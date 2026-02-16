"use client";

import { useAuthStore } from "@/store/auth.store";
import { Sidebar } from "@/components/modules/Sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, Clock, X, Info } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { businessService } from "@/services/business.service";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user } = useAuthStore();
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const business = user?.businesses?.[0];
    const status = business?.status?.toLowerCase();
    const isPending = status === 'pending_approval' || status === 'pending';

    useEffect(() => {
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

    const notifications = [
        {
            id: 1,
            title: "Appointment with John Smith",
            description: "New appointment reqested for tomorrow at 10:00 AM",
            time: "2 mins ago",
            type: "appointment"
        },
        {
            id: 2,
            title: "New Service Added",
            description: "Swedish Massage has been successfully added to your list",
            time: "1 hour ago",
            type: "system"
        },
        {
            id: 3,
            title: "Booking Cancelled",
            description: "An Appointment with Sarah Johnson has been cancelled",
            time: "3 hours ago",
            type: "alert"
        },
        {
            id: 4,
            title: "Staff Verified",
            description: "Jane Doe has been successfully verified as a staff member",
            time: "5 hours ago",
            type: "system"
        },
    ];

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
                        {isPending ? (
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#F59E0B]">
                                <Clock className="h-3.5 w-3.5" />
                                <span>Pending Verification</span>
                            </div>
                        ) : (
                            <p className="text-xs text-gray-500">Welcome Back {user?.firstName}!</p>
                        )}
                    </div>

                    {/* Right side header content: Notification & Profile (Only when approved?) */}
                    {/* Based on screenshot, approved state shows these. Pending also might, but screenshot 1 doesn't show them clearly. 
                        Actually, let's show them based on the approved screenshot. */}
                    {!isPending && (
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                                className={cn(
                                    "relative p-2.5 bg-gray-50 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all duration-200",
                                    isNotificationsOpen && "bg-amber-50 text-amber-600"
                                )}
                            >
                                <Bell className="h-5 w-5" />
                                <span className="absolute top-2 right-2 h-2 w-2 bg-[#F59E0B] rounded-full ring-2 ring-white" />
                            </button>
                            <Avatar className="h-9 w-9 border-2 border-white shadow-sm ring-1 ring-[#F59E0B]">
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
                            <div className="absolute top-20 right-8 w-[400px] bg-white rounded-[2rem] shadow-2xl shadow-black/10 border border-gray-100 z-50 animate-in fade-in slide-in-from-top-2 flex flex-col overflow-hidden">
                                <div className="p-6 flex items-center justify-between border-b border-gray-50">
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-xl font-bold text-gray-900">Notifications</h3>
                                        <span className="px-2 py-0.5 bg-amber-100 text-[#F59E0B] text-[10px] font-bold rounded-full">4 NEW</span>
                                    </div>
                                    <button
                                        onClick={() => setIsNotificationsOpen(false)}
                                        className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                                <div className="max-h-[480px] overflow-y-auto px-2 py-4 custom-scrollbar">
                                    <div className="space-y-1">
                                        {notifications.map((notif) => (
                                            <div
                                                key={notif.id}
                                                className="p-4 rounded-2xl hover:bg-gray-50 transition-colors flex gap-4 group cursor-pointer"
                                            >
                                                <div className={cn(
                                                    "h-10 w-10 shrink-0 rounded-full flex items-center justify-center",
                                                    notif.type === 'alert' ? "bg-red-50 text-red-500" : "bg-blue-50 text-blue-500"
                                                )}>
                                                    <Info className="h-5 w-5" />
                                                </div>
                                                <div className="space-y-1 flex-1">
                                                    <div className="flex justify-between items-start gap-3">
                                                        <h4 className="text-sm font-bold text-gray-900 leading-tight pr-4">
                                                            {notif.title}
                                                        </h4>
                                                        <span className="text-[10px] font-bold text-gray-400 whitespace-nowrap pt-0.5 uppercase tracking-wider">
                                                            {notif.time}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-gray-500 font-medium leading-relaxed">
                                                        {notif.description}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="p-4 border-t border-gray-50">
                                    <Button
                                        className="w-full bg-white hover:bg-gray-50 text-gray-500 font-bold h-12 rounded-xl text-sm transition-colors border-none shadow-none"
                                    >
                                        View All Notifications
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </header>

                <main className="flex-1 overflow-y-auto p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
