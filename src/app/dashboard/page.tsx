"use client";

import { useAuthStore } from "@/store/auth.store";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
    Banknote,
    CalendarCheck,
    Star,
    Users,
    Clock,
    Plus,
    UserPlus,
    CalendarClock,
    Eye,
    ChevronRight,
    Search,
    MapPin,
    Calendar
} from "lucide-react";
import Link from "next/link";

// Mock Data for Approved State
const stats = [
    {
        label: "Today's Revenue",
        value: "₦84,500",
        change: "12% from yesterday",
        icon: Banknote,
        iconBg: "bg-teal-50",
        iconColor: "text-teal-600",
        changeColor: "text-teal-600"
    },
    {
        label: "Today's Booking",
        value: "12",
        change: "6 Booking Completed",
        icon: Calendar,
        iconBg: "bg-blue-50",
        iconColor: "text-blue-500",
        changeColor: "text-gray-400"
    },
    {
        label: "Average Rating",
        value: "4.3",
        change: "Good Rating",
        icon: Star,
        iconBg: "bg-orange-50",
        iconColor: "text-orange-400",
        changeColor: "text-green-500"
    },
    {
        label: "Staff Online",
        value: "1/3",
        change: "2 staff on Home Service",
        icon: Users,
        iconBg: "bg-purple-50",
        iconColor: "text-purple-400",
        changeColor: "text-gray-400"
    }
];

const bookings = [
    {
        id: 1,
        client: "Adeola Johnson",
        service: "Therapeutic Massage",
        duration: "60 mins",
        time: "2:00 PM - 3:00 PM",
        price: "₦15,000",
        status: "Confirmed"
    },
    {
        id: 2,
        client: "Chinedu Okoro",
        service: "Home Service • Haircut",
        time: "4:30 PM",
        price: "₦8,500",
        status: "Pending"
    },
    {
        id: 3,
        client: "Funke Adebayo",
        service: "Facial Treatment • 45 mins",
        time: "5:00 PM - 5:45 PM",
        price: "₦12,000",
        status: "Confirmed"
    }
];

export default function DashboardPage() {
    const { user } = useAuthStore();
    const business = user?.businesses?.[0];
    const status = business?.status?.toLowerCase();
    const isPending = status === 'pending_approval' || status === 'pending';

    if (isPending) {
        return (
            <div className="space-y-6">
                {/* Pending Alert */}
                <div className="rounded-xl bg-[#FDF8E6] p-6 border border-[#FBECC5]">
                    <div className="flex items-start gap-4">
                        <div className="mt-1">
                            <Clock className="h-6 w-6 text-[#F59E0B]" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-[#F59E0B]">Business Verification in Progress</h2>
                            <p className="mt-2 text-sm text-gray-600 max-w-2xl leading-relaxed">
                                Waiting for admin to verify business, while waiting you can go on to add more services,
                                staffs and so on. Bookings will remain locked untill admin's verification.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="space-y-6">
                    <h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { title: "Add Service", sub: "Create new service offering", icon: Plus, bgColor: "bg-orange-50", iconColor: "text-orange-400" },
                            { title: "Add Staff", sub: "New team member", icon: UserPlus, bgColor: "bg-blue-50", iconColor: "text-blue-400" },
                            { title: "Set Hours", sub: "Business schedule", icon: CalendarClock, bgColor: "bg-green-50", iconColor: "text-green-400" },
                            { title: "View Profile", sub: "Create new service offering", icon: Eye, bgColor: "bg-gray-50", iconColor: "text-gray-400" },
                        ].map((action, i) => (
                            <Card key={i} className="border-none shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                                    <div className={cn("mb-6 flex h-12 w-12 items-center justify-center rounded-lg", action.bgColor)}>
                                        <action.icon className={cn("h-6 w-6", action.iconColor)} />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900">{action.title}</h3>
                                    <p className="mt-1 text-xs text-gray-400">{action.sub}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, i) => (
                    <Card key={i} className="border-none shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-xs font-medium text-gray-400">{stat.label}</p>
                                    <h3 className="mt-2 text-3xl font-bold text-gray-900 tracking-tight">{stat.value}</h3>
                                </div>
                                <div className={cn("rounded-lg p-2.5", stat.iconBg)}>
                                    <stat.icon className={cn("h-5 w-5", stat.iconColor)} />
                                </div>
                            </div>
                            <p className={cn("mt-4 text-[10px] font-medium", stat.changeColor)}>
                                {stat.change}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Middle Section: Chart & Bookings */}
            <div className="grid gap-8 lg:grid-cols-3">
                {/* Weekly Revenue Chart */}
                <div className="lg:col-span-2">
                    <Card className="border-none shadow-sm overflow-hidden h-full">
                        <CardContent className="p-8">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-xl font-bold text-gray-900">Weekly Revenue</h2>
                                <select className="text-xs font-medium bg-gray-50 border-none rounded-lg px-2 py-1 text-gray-500 outline-none">
                                    <option>This Month</option>
                                </select>
                            </div>

                            <div className="relative h-64 flex items-end justify-between gap-4 mt-8">
                                {/* Simple Bar Chart */}
                                {[
                                    { day: "Mon", height: "h-12" },
                                    { day: "Tue", height: "h-24" },
                                    { day: "Wed", height: "h-32" },
                                    { day: "Thu", height: "h-20" },
                                    { day: "Fri", height: "h-28" },
                                    { day: "Sat", height: "h-40" },
                                    { day: "Sun", height: "h-26" },
                                ].map((item, i) => (
                                    <div key={i} className="flex-1 flex flex-col items-center gap-4 group">
                                        <div className={cn(
                                            "w-full rounded-md transition-all duration-300",
                                            item.height,
                                            item.day === "Sat" ? "bg-[#1A1F2C]" : "bg-gray-100 group-hover:bg-gray-200"
                                        )} />
                                        <span className="text-xs text-gray-400 font-medium">{item.day}</span>
                                    </div>
                                ))}

                                {/* Y-axis Labels Placeholder */}
                                <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-[10px] text-gray-300 -ml-12 pointer-events-none">
                                    <span>150k</span>
                                    <span>120k</span>
                                    <span>80k</span>
                                    <span>60k</span>
                                    <span>45k</span>
                                    <span>0</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Upcoming Bookings */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-gray-900">Upcoming Bookings</h2>
                        <Link href="/dashboard/bookings" className="text-xs font-medium text-[#F59E0B] hover:underline">View All</Link>
                    </div>

                    <div className="space-y-4">
                        {bookings.map((booking) => (
                            <div key={booking.id} className="flex items-center gap-4 bg-white p-4 rounded-xl border border-gray-50 shadow-sm">
                                <div className="flex-1">
                                    <h3 className="text-sm font-bold text-gray-900 leading-none">{booking.client}</h3>
                                    <p className="text-[10px] text-gray-400 mt-1">{booking.service}</p>
                                    <div className="flex items-center gap-1.5 text-[10px] text-gray-400 mt-1.5">
                                        <Clock className="h-3 w-3" />
                                        <span>{booking.time}</span>
                                    </div>
                                </div>
                                <div className={cn(
                                    "min-w-20 rounded-lg p-2 text-center transition-all",
                                    booking.status === "Confirmed" ? "bg-[#1A1F2C] text-white" : "bg-orange-50 text-[#F59E0B]"
                                )}>
                                    <p className="text-[10px] font-bold opacity-90">{booking.status}</p>
                                    <p className="text-xs font-bold mt-0.5">{booking.price}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom Quick Actions */}
            <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900">Quick Action's</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 opacity-80">
                    {/* We can reuse the same quick action cards from pending state here if needed */}
                    <Card className="border-none shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                        <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-orange-50">
                                <Plus className="h-6 w-6 text-orange-400" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">Add Service</h3>
                        </CardContent>
                    </Card>
                    <Card className="border-none shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                        <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50">
                                <UserPlus className="h-6 w-6 text-blue-400" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">Add Staff</h3>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
