"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
    Banknote,
    CalendarCheck,
    Star,
    Users,
    ArrowRight,
    Search,
    MapPin,
    Clock
} from "lucide-react";
import Link from "next/link";

// Mock Data
const stats = [
    {
        label: "Today's Revenue",
        value: "₦84,500",
        change: "12% from yesterday",
        icon: Banknote,
        iconBg: "bg-teal-100",
        iconColor: "text-teal-700",
        changeColor: "text-teal-600"
    },
    {
        label: "Today's Booking's",
        value: "8",
        change: "2 pending, 6 confirmed",
        icon: CalendarCheck,
        iconBg: "bg-blue-100",
        iconColor: "text-blue-700",
        changeColor: "text-blue-600"
    },
    {
        label: "Average Rating",
        value: "4.7",
        change: "12% from yesterday",
        icon: Star,
        iconBg: "bg-yellow-100",
        iconColor: "text-yellow-700",
        changeColor: "text-yellow-600"
    },
    {
        label: "Staff online",
        value: "3/5",
        change: "Two staff on home service",
        icon: Users,
        iconBg: "bg-purple-100",
        iconColor: "text-purple-700",
        changeColor: "text-purple-600"
    }
];

const bookings = [
    {
        id: 1,
        client: "Adeola Johnson",
        service: "Therapeutic Massage",
        duration: "60 mins",
        time: "2:00 PM - 3:00 PM",
        location: "Ikeja", // inferred
        price: "₦15,000",
        status: "confirmed"
    },
    {
        id: 2,
        client: "Chinedu Okoro",
        service: "Haircut", // "Home Service • Haircut"
        duration: "",
        type: "Home Service",
        time: "4:30 PM",
        location: "Ikeja",
        price: "₦10,000",
        status: "pending"
    },
    {
        id: 3,
        client: "Funke Adebayo",
        service: "Facial Treatment",
        duration: "45 mins",
        time: "4:30 PM",
        location: "Ikeja",
        price: "₦12,000",
        status: "confirmed"
    }
];

export default function DashboardPage() {
    return (
        <div className="space-y-8">
            {/* Header Text - Screenshot: "Dashboard \n Welcome back, David" */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-500">Welcome back, David</p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, i) => (
                    <Card key={i} className="border-none shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                                    <h3 className="mt-2 text-3xl font-bold text-gray-900">{stat.value}</h3>
                                </div>
                                <div className={cn("rounded-lg p-2", stat.iconBg)}>
                                    <stat.icon className={cn("h-5 w-5", stat.iconColor)} />
                                </div>
                            </div>
                            <p className={cn("mt-4 text-xs font-medium", stat.changeColor)}>
                                {stat.change}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Bottom Section */}
            <div className="grid gap-8 lg:grid-cols-3">
                {/* Today's Booking - Spans 2 columns if space allows, or 1 and 1 */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-gray-900">Today's Booking</h2>
                        <Link href="#" className="text-sm font-medium text-teal-600 hover:text-teal-700">View All</Link>
                    </div>

                    <div className="space-y-4">
                        {bookings.map((booking) => (
                            <div key={booking.id} className="flex flex-col sm:flex-row items-center justify-between rounded-xl border bg-white p-4 shadow-sm transition-all hover:shadow-md">
                                <div className="flex items-start gap-4 w-full sm:w-auto">
                                    {/* Avatar Placeholder or Icon */}
                                    {/* <div className="h-10 w-10 rounded-full bg-gray-200"></div> */}

                                    <div>
                                        <h3 className="font-bold text-gray-900">{booking.client}</h3>
                                        <p className="text-sm text-gray-500">
                                            {booking.type ? `${booking.type} • ` : ""}{booking.service} {booking.duration ? `• ${booking.duration}` : ""}
                                        </p>
                                        <div className="mt-1 flex items-center gap-2 text-xs text-gray-400">
                                            <div className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" /> {booking.time}
                                            </div>
                                            {booking.location && (
                                                <div className="flex items-center gap-1">
                                                    {/* <MapPin className="h-3 w-3" /> {booking.location} */}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex w-full sm:w-auto items-center justify-between sm:justify-end gap-4 mt-4 sm:mt-0">
                                    <span className={cn(
                                        "rounded-full px-2.5 py-0.5 text-xs font-medium",
                                        booking.status === "confirmed" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                                    )}>
                                        {booking.status}
                                    </span>
                                    <span className="font-bold text-gray-900">{booking.price}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Weekly Performance - Chart Placeholder */}
                <div className="space-y-4">
                    <h2 className="text-lg font-bold text-gray-900">Weekly Performance</h2>

                    <Card className="h-full border-none shadow-sm">
                        <CardContent className="flex h-[300px] flex-col items-center justify-end gap-4 p-6">
                            {/* Simple CSS Bar Chart Visualization */}
                            <div className="flex w-full items-end justify-between gap-2 h-40">
                                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => {
                                    // Randomized heights for demo visualization
                                    const heights = ["h-12", "h-20", "h-16", "h-32", "h-24", "h-36", "h-28"];
                                    // Highlight Saturday as per screenshot seems roughly high or just generic
                                    const isHigh = i === 5;

                                    return (
                                        <div key={day} className="flex flex-col items-center gap-2 w-full">
                                            <div className={cn(
                                                "w-full rounded-t-sm transition-all hover:opacity-80",
                                                heights[i],
                                                isHigh ? "bg-[#2D5B5E]" : "bg-gray-100"
                                            )} />
                                            <span className="text-xs text-gray-400">{day}</span>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="mt-4 w-full border-t pt-4">
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <div className="flex h-5 w-5 items-center justify-center rounded-full border border-gray-300">
                                        <span className="text-xs font-bold">i</span>
                                    </div>
                                    <p>32% more bookings than last week</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
