"use client";

import { useState } from "react";
import {
    Search,
    Filter,
    Plus,
    ChevronLeft,
    ChevronRight,
    Calendar,
    Clock,
    User,
    Phone,
    Edit2,
    X,
    CheckCircle2,
    AlertCircle,
    CalendarCheck,
    Banknote,
    MoreVertical,
    Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { CreateBookingModal } from "@/components/modules/bookings/CreateBookingModal";

const stats = [
    {
        label: "Pending Confirmation",
        value: "3",
        icon: Clock,
        iconBg: "bg-amber-100",
        iconColor: "text-amber-500",
    },
    {
        label: "Today's Confirmed",
        value: "8",
        icon: CalendarCheck,
        iconBg: "bg-emerald-100",
        iconColor: "text-emerald-500",
    },
    {
        label: "Require Action",
        value: "2",
        icon: AlertCircle,
        iconBg: "bg-orange-100",
        iconColor: "text-orange-500",
    },
    {
        label: "Revenue Today",
        value: "₦35,500",
        icon: Banknote,
        iconBg: "bg-blue-100",
        iconColor: "text-blue-500",
    },
];

const bookings = [
    {
        id: "BK001",
        service: "Therapeutic Massage",
        customer: "Adeola Johnson",
        phone: "+234 801 234 5678",
        staff: "Amara Okeke",
        date: "Today, October 15, 2023",
        time: "2:00 PM - 3:15 PM (75 mins with buffer)",
        status: "Confirmed",
        price: "₦15,000",
    },
    {
        id: "BK002",
        service: "Therapeutic Massage",
        customer: "Adeola Johnson",
        phone: "+234 801 234 5678",
        staff: "Amara Okeke",
        date: "Today, October 15, 2023",
        time: "2:00 PM - 3:15 PM (75 mins with buffer)",
        status: "Confirmed",
        price: "₦15,000",
    },
    {
        id: "BK003",
        service: "Therapeutic Massage",
        customer: "Adeola Johnson",
        phone: "+234 801 234 5678",
        staff: "Amara Okeke",
        date: "Today, October 15, 2023",
        time: "2:00 PM - 3:15 PM (75 mins with buffer)",
        status: "Confirmed",
        price: "₦15,000",
    },
    {
        id: "BK004",
        service: "Therapeutic Massage",
        customer: "Adeola Johnson",
        phone: "+234 801 234 5678",
        staff: "Amara Okeke",
        date: "Today, October 15, 2023",
        time: "2:00 PM - 3:15 PM (75 mins with buffer)",
        status: "Confirmed",
        price: "₦15,000",
    },
];

export default function BookingsPage() {
    const [activeTab, setActiveTab] = useState("Upcoming");
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    return (
        <div className="space-y-8 p-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Bookings Management</h1>
                    <p className="text-gray-500 mt-1">Manage appointments, track bookings, and handle scheduling for your business</p>
                </div>
                <Button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-[#F59E0B] hover:bg-[#D97706] text-white gap-2 h-11 px-6 font-bold"
                >
                    <Plus className="h-5 w-5" />
                    New Booking
                </Button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <Card key={index} className="border-none shadow-sm ring-1 ring-gray-100">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className={cn("p-3 rounded-lg", stat.iconBg)}>
                                    <stat.icon className={cn("h-6 w-6", stat.iconColor)} />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Tabs & Filters */}
            <div className="space-y-6">
                <div className="flex items-center gap-8 border-b border-gray-200">
                    {["Upcoming", "Completed", "Canceled"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={cn(
                                "pb-4 text-sm font-semibold transition-colors relative",
                                activeTab === tab
                                    ? "text-[#F59E0B]"
                                    : "text-gray-400 hover:text-gray-600"
                            )}
                        >
                            {tab} {tab === "Upcoming" ? "(5)" : tab === "Completed" ? "(42)" : "(42)"}
                            {activeTab === tab && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#F59E0B]" />
                            )}
                        </button>
                    ))}
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-6">
                    <h2 className="text-lg font-bold text-gray-900">
                        Filter Bookings <span className="text-sm font-normal text-gray-500 ml-2">Filter by service, staff, delivery type, or date</span>
                    </h2>

                    <div className="flex flex-wrap items-center gap-4">
                        <div className="relative">
                            <select className="appearance-none bg-gray-50 border border-transparent rounded-lg px-4 py-2.5 pr-10 text-sm font-medium text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/20 w-44">
                                <option>All Services</option>
                            </select>
                            <ChevronLeft className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 rotate-[270deg]" />
                        </div>
                        <div className="relative">
                            <select className="appearance-none bg-gray-50 border border-transparent rounded-lg px-4 py-2.5 pr-10 text-sm font-medium text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/20 w-44">
                                <option>All Staffs</option>
                            </select>
                            <ChevronLeft className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 rotate-[270deg]" />
                        </div>
                        <div className="relative">
                            <select className="appearance-none bg-gray-50 border border-transparent rounded-lg px-4 py-2.5 pr-10 text-sm font-medium text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/20 w-44">
                                <option>All Delivery Type</option>
                            </select>
                            <ChevronLeft className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 rotate-[270deg]" />
                        </div>
                        <div className="relative flex items-center bg-gray-50 border border-transparent rounded-lg px-4 py-2 text-sm font-medium text-gray-600">
                            <span>10/15/2023</span>
                            <Calendar className="ml-3 h-4 w-4 text-gray-400" />
                        </div>
                        <Button className="bg-gray-100 hover:bg-gray-200 text-gray-600 gap-2 font-semibold">
                            <Filter className="h-4 w-4" />
                            Apply
                        </Button>
                        <button className="text-sm font-semibold text-gray-400 hover:text-gray-600 px-2 transition-colors">Clear</button>
                    </div>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                        placeholder="Search bookings by customer name, service, or booking ID...."
                        className="pl-12 h-14 bg-white border-gray-100 shadow-sm rounded-xl focus-visible:ring-[#F59E0B]"
                    />
                </div>

                {/* Booking Cards Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {bookings.map((booking, index) => (
                        <Card key={index} className="border-none shadow-sm ring-1 ring-gray-100 overflow-hidden group">
                            <CardContent className="p-0 flex h-full">
                                <div className="w-1/3 bg-gray-50 h-full min-h-[220px]">
                                    {/* Placeholder for image */}
                                </div>
                                <div className="flex-1 p-6 space-y-4">
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-1">
                                            <h3 className="text-lg font-bold text-gray-900">{booking.service}</h3>
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                                    <User className="h-3.5 w-3.5" />
                                                    <span>{booking.customer}</span>
                                                    <span className="w-1 h-1 rounded-full bg-gray-300" />
                                                    <div className="flex items-center gap-1">
                                                        <Phone className="h-3.5 w-3.5" />
                                                        <span>{booking.phone}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                                    <Users className="h-3.5 w-3.5" />
                                                    <span>{booking.staff}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-1 py-2 border-y border-gray-50">
                                        <div className="flex items-center gap-2 text-[13px] text-gray-600 font-medium">
                                            <Calendar className="h-3.5 w-3.5 text-gray-400" />
                                            <span>{booking.date}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-[13px] text-gray-600">
                                            <Clock className="h-3.5 w-3.5 text-gray-400" />
                                            <span>{booking.time}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="space-y-2">
                                            <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100">
                                                {booking.status}
                                            </div>
                                            <p className="text-lg font-bold text-gray-900">{booking.price}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button variant="outline" className="h-9 gap-1.5 text-amber-600 border-amber-200 hover:bg-amber-50 font-semibold px-4">
                                                <Edit2 className="h-3.5 w-3.5" />
                                                Edit
                                            </Button>
                                            <Button variant="outline" className="h-9 gap-1.5 text-red-600 border-red-200 hover:bg-red-50 font-semibold px-4">
                                                <X className="h-3.5 w-3.5" />
                                                Cancel
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-center gap-2 py-8">
                    <button className="p-2 rounded-lg border border-gray-100 text-gray-400 hover:bg-gray-50">
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                    {[1, 2, 3, 4].map((page) => (
                        <button
                            key={page}
                            className={cn(
                                "h-10 w-10 rounded-lg border text-sm font-semibold transition-colors",
                                page === 1
                                    ? "bg-amber-50 border-amber-200 text-amber-600"
                                    : "border-gray-100 text-gray-400 hover:bg-gray-50"
                            )}
                        >
                            {page}
                        </button>
                    ))}
                    <button className="p-2 rounded-lg border border-gray-100 text-gray-400 hover:bg-gray-50">
                        <ChevronRight className="h-5 w-5" />
                    </button>
                </div>
            </div>

            <CreateBookingModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
            />
        </div>
    );
}
