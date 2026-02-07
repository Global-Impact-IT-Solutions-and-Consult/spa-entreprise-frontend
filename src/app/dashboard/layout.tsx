"use client";

import { useAuthStore } from "@/store/auth.store";
import { Sidebar } from "@/components/modules/Sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, Clock } from "lucide-react";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user } = useAuthStore();
    const business = user?.businesses?.[0];
    const status = business?.status?.toLowerCase();
    const isPending = status === 'pending_approval' || status === 'pending';

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <div className="flex flex-1 flex-col">
                {/* Header */}
                <header className="flex h-20 items-center justify-between border-b bg-white px-8">
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
                            <button className="relative text-gray-400 hover:text-gray-600 transition-colors">
                                <Bell className="h-5 w-5" />
                            </button>
                            <Avatar className="h-9 w-9 border-2 border-white shadow-sm ring-1 ring-[#F59E0B]">
                                <AvatarImage src="/assets/avatars/user.jpg" />
                                <AvatarFallback className="bg-[#F59E0B] text-white font-bold">
                                    {user?.firstName?.charAt(0) || "D"}
                                </AvatarFallback>
                            </Avatar>
                        </div>
                    )}
                </header>

                <main className="flex-1 overflow-y-auto p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
