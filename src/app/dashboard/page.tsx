"use client";

import { useAuthStore } from "@/store/auth.store";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
    Star,
    Users,
    Clock,
    CalendarClock,
    Calendar,
    TrendingUp,
    Home,
    MapPin,
    PlusIcon,
    ChevronDown
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { businessService, DashboardData, PaymentOverviewData } from "@/services/business.service";
import { PaymentOverview } from "@/components/dashboard/PaymentOverview";
import { isBusinessPending } from "@/lib/dashboard-status";
import { Skeleton } from "@/components/ui/skeleton";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { CachedDataBadge } from "@/components/cached-data-badge";
import { OfflineFallback } from "@/components/offline-fallback";

export default function DashboardPage() {
    const { user } = useAuthStore();
    const business = user?.businesses?.[0];
    const businessId = business?.id;
    const isPending = isBusinessPending(business?.status);

    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [paymentData, setPaymentData] = useState<PaymentOverviewData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const isOnline = useOnlineStatus();

    useEffect(() => {
        if (businessId && !isPending) {
            const fetchDashboardData = async () => {
                setIsLoading(true);
                try {
                    const [dashData, payData] = await Promise.all([
                        businessService.getDashboard(businessId),
                        businessService.getPaymentOverview(businessId).catch(err => {
                            console.error("Error fetching payment overview:", err);
                            return {
                                pending: { totalAmount: 124500, today: 32000, thisWeek: 78500, nextWeek: 46000, estReleaseLabel: "After service completion", progress: 45 },
                                completed: { totalAmount: 2400000, thisMonth: 342000, lastMonth: 298500, totalAllTime: 2400000, nextPayout: { amount: 45200, date: "25 Nov 2024" } }
                            };
                        })
                    ]);
                    setDashboardData(dashData);
                    setPaymentData(payData);
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

    // Mobile highlights today's bar instead of desktop's highest-bar treatment.
    const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const hasWeeklyRevenue = !!dashboardData?.weeklyRevenue?.length;

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
            // change: `${dashboardData.staffOnline.onHomeService} staff on home service`,
            change: '',
            icon: Users,
            iconBg: "bg-[#8916B240]",
            iconColor: "text-[#8916B2]",
            changeColor: "text-gray-400",
            // changeIcon: Home
            changeIcon: ''
        }
    ] : [];

    if (isLoading) {
        return (
            <div className="space-y-8">
                {/* Stat cards */}
                <div className="lg:hidden scroll-row gap-3 -mx-4 px-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="w-[150px] shrink-0 rounded-2xl bg-white p-3.5 shadow-sm space-y-2.5">
                            <Skeleton className="h-3 w-3/4" />
                            <Skeleton className="h-6 w-1/2" />
                            <Skeleton className="h-2.5 w-full" />
                        </div>
                    ))}
                </div>
                <div className="hidden lg:grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {[1, 2, 3, 4].map((i) => (
                        <Card key={i} className="border-none shadow-sm bg-white">
                            <CardContent className="p-6 space-y-3">
                                <Skeleton className="h-3 w-1/2" />
                                <Skeleton className="h-7 w-2/3" />
                                <Skeleton className="h-3 w-1/3" />
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="grid gap-8 lg:grid-cols-4">
                    {/* Weekly revenue chart */}
                    <div className="hidden lg:block lg:col-span-2">
                        <Card className="border-none shadow-sm bg-white">
                            <CardContent className="p-4 sm:p-6 lg:p-8 space-y-8">
                                <Skeleton className="h-5 w-1/3" />
                                <div className="flex h-64 items-end gap-4">
                                    {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                                        <Skeleton key={i} className="flex-1" style={{ height: `${30 + (i % 4) * 15}%` }} />
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                    <div className="lg:hidden rounded-2xl bg-white p-4 shadow-sm space-y-4">
                        <Skeleton className="h-4 w-1/3" />
                        <div className="flex h-32 items-end gap-2">
                            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                                <Skeleton key={i} className="flex-1" style={{ height: `${30 + (i % 4) * 15}%` }} />
                            ))}
                        </div>
                    </div>

                    {/* Upcoming bookings */}
                    <div className="hidden lg:block space-y-4 lg:col-span-2">
                        <Skeleton className="h-5 w-1/3" />
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center gap-4 bg-white p-4 rounded-xl border border-gray-50">
                                    <div className="flex-1 space-y-2">
                                        <Skeleton className="h-3.5 w-1/2" />
                                        <Skeleton className="h-3 w-2/3" />
                                    </div>
                                    <Skeleton className="h-10 w-20 rounded-lg shrink-0" />
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="lg:hidden space-y-2">
                        <Skeleton className="h-4 w-1/3 mb-1" />
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center gap-3 rounded-2xl bg-white p-3.5 shadow-sm">
                                <div className="min-w-0 flex-1 space-y-2">
                                    <Skeleton className="h-3.5 w-1/2" />
                                    <Skeleton className="h-3 w-2/3" />
                                </div>
                                <Skeleton className="h-9 w-16 rounded-full shrink-0" />
                            </div>
                        ))}
                    </div>

                    {/* Payment overview */}
                    <div className="col-span-full rounded-2xl bg-white p-6 shadow-sm space-y-4">
                        <Skeleton className="h-4 w-1/4" />
                        <Skeleton className="h-8 w-1/3" />
                        <Skeleton className="h-3 w-full" />
                    </div>
                </div>
            </div>
        );
    }

    if (!isOnline && !dashboardData && !isPending) {
        return <OfflineFallback message="Your dashboard will appear here once you're back online." />;
    }

    if (isPending) {
        return (
            <div className="space-y-6">
                {/* Pending Alert — desktop/tablet (unchanged) */}
                <div className="hidden lg:block rounded-xl bg-[#FDF8E6] p-6 border border-[#FBECC5]">
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

                {/* Pending Alert — mobile: compact banner + Contact Support */}
                <div className="lg:hidden rounded-2xl bg-[#FDF8E6] border border-[#FBECC5] p-4">
                    <div className="flex items-start gap-3">
                        <Clock className="h-5 w-5 text-[#F59E0B] shrink-0 mt-0.5" />
                        <div className="min-w-0">
                            <h2 className="text-[15px] font-bold text-[#F59E0B] leading-snug">
                                Business Verification in Progress
                            </h2>
                            <p className="mt-1 text-[12px] text-gray-600 leading-relaxed">
                                You can keep adding services and staff while you wait. Bookings stay
                                locked until an admin verifies your business.
                            </p>
                            <Link
                                href="/dashboard/contact-support"
                                className="mt-3 inline-flex h-9 items-center rounded-xl border border-amber-200 bg-white px-3 text-[12px] font-bold text-amber-700"
                            >
                                Contact Support
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Payment Overview (Replacement for Quick Actions) */}
                {paymentData && <PaymentOverview data={paymentData} />}
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {!isOnline && dashboardData && (
                <div className="-mb-4">
                    <CachedDataBadge />
                </div>
            )}
            {/* Stat cards — mobile: horizontal scroll row (the greeting that used
                to sit here is now the navy hero in dashboard/layout.tsx) */}
            <div className="lg:hidden scroll-row gap-3 -mx-4 px-4">
                {statsData.map((stat, i) => (
                    <div
                        key={i}
                        className="w-[150px] shrink-0 rounded-2xl bg-white p-3.5 shadow-sm"
                    >
                        <div className="flex items-start justify-between gap-2">
                            <p className="text-[11px] font-medium text-gray-400 leading-tight">{stat.label}</p>
                            <div className={cn("rounded-lg p-1.5 shrink-0", stat.iconBg)}>
                                <stat.icon className={cn("h-3.5 w-3.5", stat.iconColor)} strokeWidth={2.5} />
                            </div>
                        </div>
                        <h3 className="mt-2 text-[22px] font-bold text-gray-900 tracking-tight leading-none">
                            {stat.value}
                        </h3>
                        {stat.change && (
                            <p className={cn("mt-2 text-[10px] font-medium flex items-center gap-1", stat.changeColor)}>
                                {stat.changeIcon && <stat.changeIcon className="h-3 w-3 shrink-0" />}
                                <span className="line-clamp-1">{stat.change}</span>
                            </p>
                        )}
                    </div>
                ))}
            </div>

            {/* Stats Grid */}
            <div className="hidden lg:block">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {statsData.map((stat, i) => (
                        <Card key={i} className="border-none shadow-sm bg-white hover:shadow-md transition-all">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-xs font-medium text-gray-400">{stat.label}</p>
                                        <h3 className="mt-2 text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">{stat.value}</h3>
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
            </div>

            {/* Middle Section: Chart & Bookings */}
            <div className="grid gap-8 lg:grid-cols-4">
                {/* Weekly Revenue Chart — desktop/tablet (unchanged) */}
                <div className="hidden lg:block lg:col-span-2 space-y-6">
                    <Card className="border-none shadow-sm overflow-hidden bg-white hover:shadow-md transition-all">
                        <CardContent className="p-4 sm:p-6 lg:p-8">
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
                                    <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-[10px] text-gray-300 -ml-8 sm:-ml-10 lg:-ml-12 pointer-events-none">
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
                </div>

                {/* Weekly Revenue Chart — mobile: no hover tooltip, no clipped
                    Y-axis labels, today's bar highlighted in amber */}
                <div className="lg:hidden rounded-2xl bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-[15px] font-bold text-gray-900">Weekly Revenue</h2>
                        <span className="text-[11px] font-medium text-gray-400">This Week</span>
                    </div>

                    {hasWeeklyRevenue ? (
                        <>
                            <div className="flex items-end gap-2">
                                {dashboardData?.weeklyRevenue.map((item, i) => {
                                    const heightPercent = Math.max((item.revenue / maxRevenue) * 100, 4);
                                    const isToday = item.day.toLowerCase() === todayName;
                                    return (
                                        <div key={i} className="flex-1 flex flex-col items-center gap-2">
                                            <div className="w-full h-32 flex items-end">
                                                <div
                                                    className={cn(
                                                        "w-full rounded-md",
                                                        isToday ? "bg-[#F59E0B]" : "bg-gray-100"
                                                    )}
                                                    style={{ height: `${heightPercent}%` }}
                                                />
                                            </div>
                                            <span
                                                className={cn(
                                                    "text-[10px] font-medium",
                                                    isToday ? "text-[#F59E0B] font-bold" : "text-gray-400"
                                                )}
                                            >
                                                {dayAbbreviations[item.day] || item.day.slice(0, 3)}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                            <p className="mt-3 text-[11px] text-gray-400">
                                Peak this week <span className="font-semibold text-gray-600">₦{maxRevenue.toLocaleString()}</span>
                            </p>
                        </>
                    ) : (
                        <div className="h-32 flex items-center justify-center text-[13px] text-gray-400">
                            No revenue data yet
                        </div>
                    )}
                </div>

                {/* Upcoming Bookings — desktop/tablet (unchanged) */}
                <div className="hidden lg:block space-y-4 lg:col-span-2">
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

                {/* Upcoming Bookings — mobile: read-only preview list. No swipe
                    actions and no action buttons here by design; every booking
                    action lives on /dashboard/bookings. */}
                <div className="lg:hidden">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-[15px] font-bold text-gray-900">Upcoming Bookings</h2>
                        <Link href="/dashboard/bookings" className="text-[11px] font-semibold text-[#F59E0B]">
                            View All
                        </Link>
                    </div>

                    <div className="space-y-2">
                        {!dashboardData?.upcomingBookings || dashboardData.upcomingBookings.length === 0 ? (
                            <div className="flex flex-col items-center justify-center rounded-2xl bg-white p-6 text-center shadow-sm">
                                <Calendar className="h-7 w-7 text-gray-200 mb-2" />
                                <p className="text-[13px] text-gray-400">No upcoming bookings</p>
                            </div>
                        ) : (
                            dashboardData.upcomingBookings.slice(0, 5).map((booking) => (
                                <div
                                    key={booking.id}
                                    className="flex items-center gap-3 rounded-2xl bg-white p-3.5 shadow-sm"
                                >
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[14px] font-bold text-gray-900 line-clamp-1">
                                            {booking.customerName}
                                        </p>
                                        <p className="mt-0.5 text-[11px] text-gray-400 line-clamp-1">
                                            {booking.serviceName} · {booking.startTime}
                                            {booking.duration ? ` · ${booking.duration} mins` : ""}
                                        </p>
                                    </div>
                                    <div className="shrink-0 text-right">
                                        <span
                                            className={cn(
                                                "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize",
                                                booking.status === "confirmed"
                                                    ? "bg-[#1A1F2C] text-white"
                                                    : "bg-orange-50 text-[#F59E0B]"
                                            )}
                                        >
                                            {booking.status.replaceAll("_", " ")}
                                        </span>
                                        <p className="mt-1 text-[13px] font-bold text-gray-900">
                                            ₦{booking.price.toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Payment Overview (Replacement for Quick Actions) */}
                {paymentData && (
                    <div className="col-span-full">
                        <PaymentOverview data={paymentData} />
                    </div>
                )}
            </div>
        </div >
    );
}
