"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Bell, CalendarPlus, ClipboardCheck, Tag, Zap, Loader2, Calendar, Star, CheckCircle2, CreditCard, Clock, XCircle } from "lucide-react";
import { CustomerHeader } from "@/components/modules/customer/customer-header";
import { CustomerFooter } from "@/components/modules/customer/customer-footer";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { notificationService, UserNotification } from "@/services/notification.service";


const TABS = ["All Notifications", "Bookings", "Offers", "System Updates"];

function formatTimeAgo(dateString: string) {
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

export default function NotificationsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [notifications, setNotifications] = useState<UserNotification[]>([]);
    const [activeTab, setActiveTab] = useState("All Notifications");
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [markingAll, setMarkingAll] = useState(false);
    const renderNotificationActions = (notif: UserNotification) => {
        if (notif.type === "service_completion" && notif.metadata?.bookingId) {
            return (
                <div className="flex items-center gap-3 mt-1">
                    <button 
                        onClick={() => router.push(`/reviews/${notif.metadata.bookingId}`)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#E89D24] hover:bg-[#D97706] text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
                    >
                        <Star className="w-3.5 h-3.5 fill-current" />
                        Leave a Review
                    </button>
                    {notif.metadata?.cancellationLink && (
                        <button 
                            onClick={() => router.push(`/my-bookings`)}
                            className="px-3 py-1.5 border border-gray-200 hover:bg-gray-50 text-gray-600 text-xs font-bold rounded-lg transition-colors"
                        >
                            Cancel Booking
                        </button>
                    )}
                </div>
            );
        }

        return (
            <button 
                onClick={() => !notif.read && handleMarkAsRead(notif.id)}
                className="text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors"
            >
                Dismiss
            </button>
        );
    };

    useEffect(() => {
        fetchNotifications(true);
    }, []);

    const fetchNotifications = async (reset: boolean = false) => {
        try {
            if (reset) setLoading(true);
            const currentOffset = reset ? 0 : (page - 1) * 10;
            const data = await notificationService.getNotifications({ limit: 10, offset: currentOffset });

            const items = data.notifications;

            if (reset) {
                setNotifications(items);
            } else {
                setNotifications(prev => [...prev, ...items]);
            }

            setHasMore(items.length === 10);
            if (!reset) setPage(p => p + 1);
        } catch (error) {
            console.error("Failed to fetch notifications", error);
            setNotifications([]);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (notificationId: string) => {
        try {
            // Update local state first for instant feedback
            setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, read: true } : n));
            
            await notificationService.markAsRead(notificationId);
            
            // Dispatch event to refresh header count
            window.dispatchEvent(new CustomEvent('notifications:refresh'));
        } catch (error) {
            console.error("Failed to mark notification as read", error);
        }
    };

    const handleMarkAllAsRead = async () => {
        if (markingAll) return;
        setMarkingAll(true);
        try {
            await notificationService.markAllAsRead();
            
            // Update local state
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            
            // Dispatch event to refresh header count
            window.dispatchEvent(new CustomEvent('notifications:refresh'));
        } catch (error) {
            console.error("Failed to mark all notifications as read", error);
        } finally {
            setMarkingAll(false);
        }
    };

    const handleLoadMore = () => {
        fetchNotifications(false);
    };

    const filteredNotifications = notifications.filter(notif => {
        if (activeTab === "All Notifications") return true;
        if (activeTab === "Bookings") return notif.category === "bookings";
        if (activeTab === "Offers") return notif.category === "offers";
        if (activeTab === "System Updates") return notif.category === "system_updates";
        return true;
    });

    const getIconForType = (type: string) => {
        switch (type) {
            case "service_completion":
                return <CheckCircle2 className="w-5 h-5 text-green-500" />;
            case "appointment_reminder":
                return <Clock className="w-5 h-5 text-amber-500" />;
            case "payment_confirmation":
            case "PAYMENT":
            case "PAYMENT_SUCCESSFUL":
                return <CreditCard className="w-5 h-5 text-emerald-500" />;
            case "booking_confirmation":
            case "BOOKING":
            case "UPCOMING_BOOKING":
                return <Calendar className="w-5 h-5 text-blue-500" />;
            case "booking_cancelled":
                return <XCircle className="w-5 h-5 text-red-500" />;
            case "OFFER":
            case "PROMO":
                return <Tag className="w-5 h-5 text-green-500" />;
            case "SYSTEM":
            case "ALERT":
                return <ClipboardCheck className="w-5 h-5 text-blue-500" />;
            case "REVIEW":
            case "NEW_REVIEW":
                return <Star className="w-5 h-5 text-yellow-500" />;
            case "ONBOARDING":
            case "ONBOARDING_UPDATE":
                return <Zap className="w-5 h-5 text-purple-500" />;
            default:
                return <Bell className="w-5 h-5 text-gray-500" />;
        }
    };

    const getBgForType = (type: string) => {
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
    };

    return (
        <div className="min-h-screen bg-gray-50/50 flex flex-col">
            <CustomerHeader />

            <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-5xl mx-auto space-y-6">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 font-serif mb-2">Notifications</h1>
                            <p className="text-gray-500">Manage and track your business updates and alerts.</p>
                        </div>
                        {notifications.some(n => !n.read) && (
                            <Button 
                                variant="outline" 
                                onClick={handleMarkAllAsRead}
                                disabled={markingAll}
                                className="sm:self-end h-10 px-4 rounded-xl text-xs font-bold border-gray-200 hover:border-amber-500 hover:text-amber-600 transition-all shadow-sm flex items-center gap-2"
                            >
                                {markingAll ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                                Mark all as read
                            </Button>
                        )}
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-6 border-b border-gray-200 overflow-x-auto no-scrollbar pt-4">
                        {TABS.map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`pb-4 text-sm font-bold whitespace-nowrap transition-colors relative ${activeTab === tab
                                    ? "text-[#E89D24]"
                                    : "text-gray-500 hover:text-gray-700"
                                    }`}
                            >
                                {tab}
                                {activeTab === tab && (
                                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E89D24] rounded-t-full" />
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Notifications List */}
                    {loading && notifications.length === 0 ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => (
                                <Skeleton key={i} className="h-32 w-full rounded-2xl" />
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-4 pt-2">
                            {filteredNotifications.length === 0 ? (
                                <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200">
                                    <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Bell className="w-5 h-5 text-gray-400" />
                                    </div>
                                    <h3 className="font-bold text-gray-900">No notifications found</h3>
                                    <p className="text-sm text-gray-500 mt-1">There are no {activeTab.toLowerCase() == 'all notifications' ? 'notifications' : `${activeTab.toLowerCase()} notifications`} to show right now.</p>
                                </div>
                            ) : (
                                filteredNotifications.map((notif) => (
                                    <div
                                        key={notif.id}
                                        onClick={() => !notif.read && handleMarkAsRead(notif.id)}
                                        className={`p-6 rounded-2xl border transition-all cursor-pointer hover:shadow-md ${!notif.read ? "bg-[#FFF9F0] border-amber-100" : "bg-white border-gray-100"
                                            }`}
                                    >
                                        <div className="space-y-2">
                                            <div className="flex gap-2">
                                                <div className={`w-10 h-10 rounded-md flex items-center justify-center shrink-0 ${getBgForType(notif.type)}`}>
                                                    {getIconForType(notif.type)}
                                                </div>
                                                <div className="flex items-center justify-between w-full">
                                                    <h3 className="font-bold text-gray-900">{notif.title}</h3>
                                                    <div className="flex items-center gap-3">
                                                        {!notif.read && (
                                                            <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold uppercase rounded-md">
                                                                New
                                                            </span>
                                                        )}
                                                        <span className="text-xs text-gray-400 whitespace-nowrap hidden sm:inline-block">
                                                            {formatTimeAgo(notif.createdAt)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-600 leading-relaxed max-w-2xl">
                                                {notif.body} <span className="text-xs text-gray-400 whitespace-nowrap sm:hidden">
                                                    {formatTimeAgo(notif.createdAt)}
                                                </span>
                                            </p>
                                            <div className="flex flex-wrap items-center gap-4">
                                                {renderNotificationActions(notif)}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {/* Load More Button */}
                    {!loading && hasMore && filteredNotifications.length > 0 && (
                        <div className="pt-8 pb-4 flex justify-center">
                            <Button
                                variant="outline"
                                onClick={handleLoadMore}
                                className="px-6 rounded-lg text-sm font-bold text-gray-600 border-gray-200 hover:bg-gray-50"
                            >
                                Load older notifications
                            </Button>
                        </div>
                    )}
                </div>
            </main>

            <CustomerFooter />
        </div>
    );
}
