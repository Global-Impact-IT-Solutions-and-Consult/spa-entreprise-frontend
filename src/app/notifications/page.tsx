"use client";

import { useState, useEffect } from "react";
import { Bell, Calendar, CreditCard, Info, Loader2 } from "lucide-react";
import { CustomerHeader } from "@/components/modules/customer/customer-header";
import { CustomerFooter } from "@/components/modules/customer/customer-footer";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { notificationService, NotificationPreferences } from "@/services/notification.service";
import { toaster } from "@/components/ui/toaster";

export default function NotificationsPage() {
    const [loading, setLoading] = useState(true);
    const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
    const [updating, setUpdating] = useState<string | null>(null);

    useEffect(() => {
        fetchPreferences();
    }, []);

    const fetchPreferences = async () => {
        try {
            setLoading(true);
            const data = await notificationService.getPreferences();
            setPreferences(data);
        } catch (error) {
            toaster.create({
                title: "Error",
                description: "Failed to load notification preferences",
                type: "error",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = async (key: keyof NotificationPreferences, value: boolean) => {
        if (!preferences) return;

        try {
            setUpdating(key);
            const updated = await notificationService.updatePreferences({ [key]: value });
            setPreferences(updated);
            toaster.create({
                title: "Success",
                description: "Notification preferences updated successfully",
                type: "success",
            });
        } catch (error) {
            toaster.create({
                title: "Error",
                description: "Failed to update notification preferences",
                type: "error",
            });
        } finally {
            setUpdating(null);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50/50 flex flex-col">
                <CustomerHeader />
                <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-4xl mx-auto space-y-8">
                        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-8 space-y-8">
                                <div className="flex items-center gap-4">
                                    <Skeleton className="w-14 h-14 rounded-2xl" />
                                    <div className="space-y-2">
                                        <Skeleton className="h-8 w-48" />
                                        <Skeleton className="h-4 w-64" />
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between py-4 border-b border-gray-100">
                                        <div className="space-y-2">
                                            <Skeleton className="h-5 w-40" />
                                            <Skeleton className="h-4 w-60" />
                                        </div>
                                        <Skeleton className="h-6 w-11 rounded-full" />
                                    </div>
                                    <div className="grid gap-4">
                                        {[1, 2, 3].map((i) => (
                                            <div key={i} className="flex items-center justify-between p-6 bg-gray-50/50 rounded-2xl border border-gray-100">
                                                <div className="flex items-center gap-4">
                                                    <Skeleton className="w-12 h-12 rounded-xl" />
                                                    <div className="space-y-2">
                                                        <Skeleton className="h-5 w-36" />
                                                        <Skeleton className="h-4 w-48" />
                                                    </div>
                                                </div>
                                                <Skeleton className="h-6 w-11 rounded-full" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
                <CustomerFooter />
            </div>
        );
    }

    if (!preferences) {
        return (
            <div className="min-h-screen bg-gray-50/50 flex flex-col">
                <CustomerHeader />
                <main className="flex-1 flex items-center justify-center">
                    <p className="text-gray-500">Failed to load preferences. Please try again later.</p>
                </main>
                <CustomerFooter />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/50 flex flex-col">
            <CustomerHeader />

            <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto space-y-8">
                    {/* Header Card */}
                    <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-8 space-y-8">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-amber-50 rounded-2xl">
                                    <Bell className="w-8 h-8 text-amber-500" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900 font-serif">Notifications</h1>
                                    <p className="text-gray-500">Configure how and when you receive notifications</p>
                                </div>
                            </div>

                            {/* Email Notifications Section */}
                            <div className="space-y-6">
                                <div className="flex items-center justify-between py-4 border-b border-gray-100">
                                    <div>
                                        <p className="font-bold text-gray-900">Email Notifications</p>
                                        <p className="text-sm text-gray-400">Receive updates and alerts via email</p>
                                    </div>
                                    <Switch
                                        checked={preferences.emailNotifications}
                                        onCheckedChange={(val) => handleToggle("emailNotifications", val)}
                                        disabled={updating === "emailNotifications"}
                                        className="data-[state=checked]:bg-emerald-500"
                                    />
                                </div>

                                {/* Granular Settings */}
                                <div className="space-y-4">
                                    {/* Up Coming Booking */}
                                    <div className="flex items-center justify-between p-6 bg-gray-50/50 rounded-2xl border border-gray-100">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center border border-gray-100 shadow-sm">
                                                <Calendar className="w-5 h-5 text-gray-400" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900">Up Coming Booking</p>
                                                <p className="text-sm text-gray-400">Let you know your next boking</p>
                                            </div>
                                        </div>
                                        <Switch
                                            checked={preferences.upcomingBooking}
                                            onCheckedChange={(val) => handleToggle("upcomingBooking", val)}
                                            disabled={updating === "upcomingBooking"}
                                            className="data-[state=checked]:bg-emerald-500"
                                        />
                                    </div>

                                    {/* Payment Notifications */}
                                    <div className="flex items-center justify-between p-6 bg-gray-50/50 rounded-2xl border border-gray-100">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center border border-gray-100 shadow-sm">
                                                <CreditCard className="w-5 h-5 text-gray-400" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900">Payment Notifications</p>
                                                <p className="text-sm text-gray-400">When payments are received or released</p>
                                            </div>
                                        </div>
                                        <Switch
                                            checked={preferences.paymentNotifications}
                                            onCheckedChange={(val) => handleToggle("paymentNotifications", val)}
                                            disabled={updating === "paymentNotifications"}
                                            className="data-[state=checked]:bg-emerald-500"
                                        />
                                    </div>

                                    {/* System Alerts */}
                                    <div className="flex items-center justify-between p-6 bg-gray-50/50 rounded-2xl border border-gray-100">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center border border-gray-100 shadow-sm">
                                                <Info className="w-5 h-5 text-gray-400" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900">System Alerts</p>
                                                <p className="text-sm text-gray-400">Important platform updates and maintenance</p>
                                            </div>
                                        </div>
                                        <Switch
                                            checked={preferences.systemAlerts}
                                            onCheckedChange={(val) => handleToggle("systemAlerts", val)}
                                            disabled={updating === "systemAlerts"}
                                            className="data-[state=checked]:bg-emerald-500"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <CustomerFooter />
        </div>
    );
}
