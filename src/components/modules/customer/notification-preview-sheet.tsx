"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import { Sheet } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { notificationService, UserNotification } from "@/services/notification.service";
import { formatTimeAgo, getIconForType, getBgForType } from "@/lib/notification-utils";

interface NotificationPreviewSheetProps {
    open: boolean;
    onClose: () => void;
}

export function NotificationPreviewSheet({ open, onClose }: NotificationPreviewSheetProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [notifications, setNotifications] = useState<UserNotification[]>([]);

    const fetchPreview = async () => {
        setLoading(true);
        try {
            const data = await notificationService.getNotifications({ limit: 5 });
            setNotifications(data.notifications);
        } catch (error) {
            console.error("Failed to fetch notifications", error);
            setNotifications([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (open) fetchPreview();
    }, [open]);

    const handleMarkAsRead = async (notificationId: string) => {
        setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, read: true } : n));
        try {
            await notificationService.markAsRead(notificationId);
            window.dispatchEvent(new CustomEvent('notifications:refresh'));
        } catch (error) {
            console.error("Failed to mark notification as read", error);
        }
    };

    const handleViewAll = () => {
        onClose();
        router.push("/notifications");
    };

    return (
        <Sheet
            open={open}
            onClose={onClose}
            title="Notifications"
            footer={
                <Button
                    onClick={handleViewAll}
                    className="w-full h-11 rounded-xl bg-[#E89D24] hover:bg-[#D97706] text-white font-bold text-sm"
                >
                    View all notifications
                </Button>
            }
        >
            <div className="px-4 pb-4 space-y-3">
                {loading ? (
                    [1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full rounded-xl" />)
                ) : notifications.length === 0 ? (
                    <div className="text-center py-10">
                        <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Bell className="w-4 h-4 text-gray-400" />
                        </div>
                        <p className="text-sm font-bold text-gray-900">No notifications yet</p>
                        <p className="text-xs text-gray-500 mt-1">We&apos;ll let you know when something comes up.</p>
                    </div>
                ) : (
                    notifications.map((notif) => (
                        <button
                            key={notif.id}
                            onClick={() => !notif.read && handleMarkAsRead(notif.id)}
                            className={`w-full flex gap-3 p-3 rounded-xl border text-left transition-colors ${!notif.read ? "bg-[#FFF9F0] border-amber-100" : "bg-white border-gray-100"
                                }`}
                        >
                            <div className={`w-9 h-9 rounded-md flex items-center justify-center shrink-0 ${getBgForType(notif.type)}`}>
                                {getIconForType(notif.type)}
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-2">
                                    <h4 className="text-sm font-bold text-gray-900 truncate">{notif.title}</h4>
                                    {!notif.read && (
                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                                    )}
                                </div>
                                <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{notif.body}</p>
                                <p className="text-[11px] text-gray-400 mt-1">{formatTimeAgo(notif.createdAt)}</p>
                            </div>
                        </button>
                    ))
                )}
            </div>
        </Sheet>
    );
}
