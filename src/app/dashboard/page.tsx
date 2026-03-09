"use client";

import { useAuthStore } from "@/store/auth.store";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
    Banknote,
    Star,
    Users,
    Clock,
    Plus,
    UserPlus,
    CalendarClock,
    Eye,
    Calendar,
    Loader2,
    TrendingUp,
    Home,
    MapPin,
    PlusIcon,
    ChevronDown
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { businessService, DashboardData } from "@/services/business.service";

export default function DashboardPage() {
    const { user } = useAuthStore();
    const business = user?.businesses?.[0];
    const businessId = business?.id;
    const status = business?.status?.toLowerCase();
    const isPending = status === 'pending_approval' || status === 'pending';

    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (businessId && !isPending) {
            const fetchDashboardData = async () => {
                setIsLoading(true);
                try {
                    const data = await businessService.getDashboard(businessId);
                    setDashboardData(data);
                } catch (error) {
                    console.error("Error fetching dashboard data:", error);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchDashboardData();
        } else if (isPending) {
            setIsLoading(false);
        }
    }, [businessId, isPending]);

    // Compute dynamic bar heights from weeklyRevenue data
    const maxRevenue = dashboardData?.weeklyRevenue?.length
        ? Math.max(...dashboardData.weeklyRevenue.map(d => d.revenue), 1)
        : 1;

    const dayAbbreviations: Record<string, string> = {
        Monday: "Mon", Tuesday: "Tue", Wednesday: "Wed",
        Thursday: "Thu", Friday: "Fri", Saturday: "Sat", Sunday: "Sun"
    };

    const statsData = dashboardData ? [
        {
            label: "Today\u2019s Revenue",
            value: `\u20A6${dashboardData.todaysRevenue.amount.toLocaleString()}`,
            change: dashboardData.todaysRevenue.changeFromYesterday >= 0
                ? `+${dashboardData.todaysRevenue.changeFromYesterday}% from yesterday`
                : `${dashboardData.todaysRevenue.changeFromYesterday}% from yesterday`,
            icon: PlusIcon,
            iconBg: "bg-[#23545B40]",
            iconColor: "text-[#23545B]",
            changeColor: dashboardData.todaysRevenue.changeFromYesterday >= 0 ? "text-teal-600" : "text-red-500",
            changeIcon: TrendingUp
        },
        {
            label: "Today\u2019s Bookings",
            value: dashboardData.todaysBookings.total.toString(),
            change: `${dashboardData.todaysBookings.completed} Bookings Completed`,
            icon: CalendarClock,
            iconBg: "bg-[#0088FF40]",
            iconColor: "text-[#0088FF]",
            changeColor: "text-gray-400",
            changeIcon: null
        },
        {
            label: "Average Rating",
            value: Number(dashboardData.averageRating.rating).toFixed(1),
            change: dashboardData.averageRating.label,
            icon: Star,
            iconBg: "bg-[#E89D2440]",
            iconColor: "text-[#E89D24]",
            changeColor: "text-amber-600",
            changeIcon: null
        },
        {
            label: "Staff Online",
            value: `${dashboardData.staffOnline.online}/${dashboardData.staffOnline.total}`,
            change: `${dashboardData.staffOnline.onHomeService} staff on home service`,
            icon: Users,
            iconBg: "bg-[#8916B240]",
            iconColor: "text-[#8916B2]",
            changeColor: "text-gray-400",
            changeIcon: Home
        }
    ] : [];

    if (isLoading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-[#F59E0B]" />
            </div>
        );
    }

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
                                staffs and so on. Bookings will remain locked untill admin&apos;s verification.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Quick Action's */}
                <Card className="border-none shadow-sm bg-white overflow-hidden rounded-[2rem]">
                    <CardContent className="p-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-8">Quick Action&apos;s</h2>
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { title: "Add Service", icon: Plus, bgColor: "bg-[#FFF7ED]", iconColor: "text-[#F59E0B]", href: "/dashboard/services" },
                                { title: "Add Staff", icon: Users, bgColor: "bg-[#EEF2FF]", iconColor: "text-[#4F46E5]", href: "/dashboard/staffs" },
                                { title: "Set Hours", icon: CalendarClock, bgColor: "bg-[#F0FDF4]", iconColor: "text-[#22C55E]", href: "/dashboard/working-hours" },
                                { title: "View Profile", icon: Eye, bgColor: "bg-[#F9FAFB]", iconColor: "text-[#6B7280]", href: `/dashboard/business` },
                            ].map((action, i) => (
                                <Link href={action.href} key={i}>
                                    <div className="flex flex-col items-center justify-center p-8 rounded-2xl hover:bg-gray-50 transition-all group border border-transparent hover:border-gray-100">
                                        <div className={cn("mb-4 flex h-14 w-14 items-center justify-center rounded-xl", action.bgColor)}>
                                            <action.icon className={cn("h-6 w-6", action.iconColor)} strokeWidth={2.5} />
                                        </div>
                                        <h3 className="text-sm font-bold text-gray-900">{action.title}</h3>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {statsData.map((stat, i) => (
                    <Card key={i} className="border-none shadow-sm bg-white hover:shadow-md transition-all">
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-xs font-medium text-gray-400">{stat.label}</p>
                                    <h3 className="mt-2 text-3xl font-bold text-gray-900 tracking-tight">{stat.value}</h3>
                                </div>
                                <div className={cn("rounded-lg p-2.5", stat.iconBg)}>
                                    <stat.icon className={cn("h-4 w-4", stat.iconColor)} strokeWidth={2.5} />
                                </div>
                            </div>
                            <p className={cn("mt-4 text-[10px] font-medium flex items-center gap-1", stat.changeColor)}>
                                {stat.changeIcon && <stat.changeIcon className="h-3 w-3" />}
                                {stat.change}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Middle Section: Chart & Bookings */}
            <div className="grid gap-8 lg:grid-cols-4">
                {/* Weekly Revenue Chart */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="border-none shadow-sm overflow-hidden bg-white hover:shadow-md transition-all">
                        <CardContent className="p-8">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-xl font-bold text-gray-900">Weekly Revenue</h2>
                                <div className="relative w-fit">
                                    <select className="text-xs font-medium bg-[#0000001A] border-none rounded-lg px-2 py-1.5 text-gray-500 outline-none appearance-none pr-6">
                                        <option>This Week</option>
                                    </select>
                                    <ChevronDown className="h-3 w-3 text-gray-500 absolute right-2 top-1/2 -translate-y-1/2 -z-1" />
                                </div>
                            </div>

                            <div className="relative h-64 flex items-end justify-between gap-4 mt-8">
                                {dashboardData?.weeklyRevenue && dashboardData.weeklyRevenue.length > 0 ? (
                                    dashboardData.weeklyRevenue.map((item, i) => {
                                        const heightPercent = Math.max((item.revenue / maxRevenue) * 100, 4);
                                        const isHighest = item.revenue === maxRevenue;
                                        return (
                                            <div key={i} className="flex-1 flex flex-col items-center gap-4 group relative">
                                                {/* Tooltip on hover */}
                                                <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-10">
                                                    ₦{item.revenue.toLocaleString()}
                                                </div>
                                                <div
                                                    className={cn(
                                                        "w-full rounded-md transition-all duration-300",
                                                        isHighest ? "bg-[#1A1F2C]" : "bg-gray-100 group-hover:bg-gray-200"
                                                    )}
                                                    style={{ height: `${heightPercent}%` }}
                                                />
                                                <span className="text-xs text-gray-400 font-medium">
                                                    {dayAbbreviations[item.day] || item.day.slice(0, 3)}
                                                </span>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="flex-1 flex items-center justify-center text-sm text-gray-400">
                                        No revenue data yet
                                    </div>
                                )}

                                {/* Y-axis Labels */}
                                {dashboardData?.weeklyRevenue && dashboardData.weeklyRevenue.length > 0 && (
                                    <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-[10px] text-gray-300 -ml-12 pointer-events-none">
                                        <span>{(maxRevenue / 1000).toFixed(0)}k</span>
                                        <span>{(maxRevenue * 0.75 / 1000).toFixed(0)}k</span>
                                        <span>{(maxRevenue * 0.5 / 1000).toFixed(0)}k</span>
                                        <span>{(maxRevenue * 0.25 / 1000).toFixed(0)}k</span>
                                        <span>0</span>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Bottom Quick Action's */}
                    <div className="border-none shadow-sm bg-white overflow-hidden rounded-xl">
                        <div className="p-8">
                            <h2 className="text-xl font-bold text-gray-900 mb-8">Quick Action&apos;s</h2>
                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { title: "Add Service", icon: Plus, bgColor: "bg-[#FFF7ED]", iconColor: "text-[#F59E0B]", href: "/dashboard/services" },
                                    { title: "Add Staff", icon: Users, bgColor: "bg-[#EEF2FF]", iconColor: "text-[#4F46E5]", href: "/dashboard/staffs" },
                                    { title: "Set Hours", icon: CalendarClock, bgColor: "bg-[#F0FDF4]", iconColor: "text-[#22C55E]", href: "/dashboard/working-hours" },
                                    { title: "View Profile", icon: Eye, bgColor: "bg-[#F9FAFB]", iconColor: "text-[#6B7280]", href: `/dashboard/business` },
                                ].map((action, i) => (
                                    <Link href={action.href} key={i}>
                                        <div className="flex flex-col items-center justify-center p-8 rounded-2xl hover:bg-gray-50 transition-all group border border-transparent hover:border-gray-100 shadow-md">
                                            <div className={cn("mb-4 flex h-14 w-14 items-center justify-center rounded-xl", action.bgColor)}>
                                                <action.icon className={cn("h-6 w-6", action.iconColor)} strokeWidth={2} />
                                            </div>
                                            <h3 className="text-sm font-bold text-gray-900">{action.title}</h3>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Upcoming Bookings */}
                <div className="space-y-4 lg:col-span-2">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-gray-900">Upcoming Bookings</h2>
                        <Link href="/dashboard/bookings" className="text-xs font-medium text-[#F59E0B] hover:underline">View All</Link>
                    </div>

                    <div className="space-y-4">
                        {!dashboardData?.upcomingBookings || dashboardData.upcomingBookings.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-8 bg-white rounded-xl border border-gray-50 text-center">
                                <Calendar className="h-8 w-8 text-gray-200 mb-2" />
                                <p className="text-sm text-gray-400">No upcoming bookings</p>
                            </div>
                        ) : (
                            dashboardData.upcomingBookings.slice(0, 5).map((booking) => (
                                <div key={booking.id} className="flex items-center gap-4 bg-white p-4 rounded-xl border border-gray-50 shadow-sm">
                                    <div className="flex-1">
                                        <h3 className="text-sm font-bold text-gray-900 leading-none">{booking.customerName}</h3>
                                        <div className="flex items-center gap-1">
                                            <p className="text-[10px] text-gray-400">{booking.serviceName}</p>
                                            <div className="h-1 w-1 bg-gray-400 rounded-full"></div>
                                            <p className="text-[10px] text-gray-400">{booking.duration} mins</p>
                                        </div>
                                        <div className="flex items-center gap-3 text-[10px] text-gray-400 mt-1.5">
                                            {booking.status === "confirmed" && <div className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                <span>{booking.startTime} - {booking.endTime}</span>
                                            </div>}
                                            {booking.status === "pending_payment" && booking.location && (
                                                <div className="flex items-center gap-1">
                                                    <div className="flex items-center gap-1">
                                                        <MapPin className="h-3 w-3" />
                                                        <span>{booking.location}</span>
                                                    </div>
                                                    <div className="h-1 w-1 bg-gray-400 rounded-full"></div>
                                                    <div className="flex items-center gap-1">
                                                        <span>
                                                            {(() => {
                                                                if (!booking.startTime) return "";
                                                                const [h, m] = booking.startTime.split(":");
                                                                const d = new Date();
                                                                d.setHours(parseInt(h, 10));
                                                                d.setMinutes(parseInt(m, 10));
                                                                return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
                                                            })()}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className={cn(
                                        "min-w-24 rounded-lg p-2 text-center transition-all",
                                        booking.status === "confirmed" ? "bg-[#1A1F2C] text-white" : "bg-orange-50 text-[#F59E0B]"
                                    )}>
                                        <p className="text-[10px] font-bold capitalize">{booking.status.replace('_', ' ')}</p>
                                        <p className="text-xs font-bold mt-0.5">₦{booking.price.toLocaleString()}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div >
    );
}
