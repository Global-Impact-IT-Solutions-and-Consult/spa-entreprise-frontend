import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Clock, CheckCircle2 } from "lucide-react";
import { PaymentOverviewData } from "@/services/business.service";

interface PaymentOverviewProps {
    data: PaymentOverviewData;
}

export const PaymentOverview: React.FC<PaymentOverviewProps> = ({ data }) => {
    const formatCurrency = (amount: number | undefined | null) => {
        if (typeof amount !== 'number') return "0";
        return amount.toLocaleString();
    };

    if (!data || !data.pending || !data.completed) {
        return null;
    }

    return (
        <Card className="border-none shadow-sm bg-white overflow-hidden rounded-xl">
            <CardContent className="p-4 sm:p-6 lg:p-8">
                {/* Mobile: escrow total up top, plus a compact completed/payout
                    block so nothing desktop shows is lost on small screens. */}
                <div className="lg:hidden">
                    <h2 className="text-[15px] font-bold text-gray-900">Payment Overview</h2>
                    <p className="text-[11px] text-gray-400 mt-0.5">Pending and completed payments</p>

                    <div className="mt-4 rounded-2xl bg-[#FEF9EE] p-4">
                        <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2">
                                <div className="h-9 w-9 bg-[#F59E0B1A] rounded-lg flex items-center justify-center shrink-0">
                                    <Clock className="h-4 w-4 text-[#F59E0B]" />
                                </div>
                                <div>
                                    <p className="text-[11px] text-gray-400 leading-none">In escrow</p>
                                    <h3 className="text-[20px] font-bold text-gray-900 leading-tight mt-1">
                                        ₦{formatCurrency(data.pending.totalAmount)}
                                    </h3>
                                </div>
                            </div>
                            <span className="text-[#F59E0B] text-[10px] font-medium px-2.5 py-1 rounded-full bg-[#FFEDD0] shrink-0">
                                Awaiting service
                            </span>
                        </div>

                        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                            <div>
                                <p className="text-[10px] text-gray-400">Today</p>
                                <p className="text-[12px] font-semibold text-gray-900">₦{formatCurrency(data.pending.today)}</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-400">This week</p>
                                <p className="text-[12px] font-semibold text-gray-900">₦{formatCurrency(data.pending.thisWeek)}</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-400">Next week</p>
                                <p className="text-[12px] font-semibold text-gray-900">₦{formatCurrency(data.pending.nextWeek)}</p>
                            </div>
                        </div>

                        <div className="mt-3 pt-3 border-t border-[#FBECC5]/60">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Est. release</span>
                                <span className="text-[10px] font-bold text-gray-600">{data.pending.estReleaseLabel || "---"}</span>
                            </div>
                            <div className="h-2 w-full bg-[#E89D2420] rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-[#E89D24] rounded-full transition-all duration-500"
                                    style={{ width: `${data.pending.progress || 0}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mt-3 rounded-2xl bg-[#F0FDF4] p-4">
                        <div className="flex items-center gap-2">
                            <div className="h-9 w-9 bg-[#22C55E1A] rounded-lg flex items-center justify-center shrink-0">
                                <CheckCircle2 className="h-4 w-4 text-[#22C55E]" />
                            </div>
                            <div>
                                <p className="text-[11px] text-gray-400 leading-none">Completed</p>
                                <h3 className="text-[20px] font-bold text-gray-900 leading-tight mt-1">
                                    ₦{formatCurrency(data.completed.totalAmount)}
                                </h3>
                            </div>
                        </div>

                        <div className="mt-3 pt-3 border-t border-[#DCFCE7]/60 flex items-center justify-between gap-3">
                            <div>
                                <p className="text-[10px] text-gray-400">This month</p>
                                <p className="text-[13px] font-semibold text-gray-900">₦{formatCurrency(data.completed.thisMonth)}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] text-gray-400">
                                    Next payout · {data.completed.nextPayout?.date || "---"}
                                </p>
                                <p className="text-[13px] font-bold text-[#22C55E]">
                                    ₦{formatCurrency(data.completed.nextPayout?.amount)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Desktop/tablet (unchanged) */}
                <div className="hidden lg:block">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Payment Overview</h2>
                        <p className="text-sm text-gray-400 mt-1">Track your pending and completed payments</p>
                    </div>
                    {/* <button className="px-4 py-2 border border-gray-100 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-50 transition-all">
                        View all transactions
                    </button> */}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Pending Card */}
                    <div className="bg-[#FEF9EE] rounded-xl p-5 sm:p-6 lg:p-8 relative overflow-hidden">
                        <div className="flex items-center justify-between mb-4">
                            <div className='flex items-center gap-1'>
                                <div className="h-10 w-10 bg-[#F59E0B1A] rounded-md flex items-center justify-center">
                                    <Clock className="h-5 w-5 text-[#F59E0B]" />
                                </div>

                                <div className="">
                                    <p className="text-sm text-gray-400">Pending</p>
                                    <h3 className="text-lg font-semibold text-gray-900">₦{formatCurrency(data.pending.totalAmount)}</h3>
                                </div>
                            </div>
                            <span className="text-[#F59E0B] text-xs font-medium px-3 py-1 rounded-full bg-[#FFEDD0]">
                                Awaiting service
                            </span>
                        </div>

                        <div className="space-y-2 mb-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500">Today&apos;s pending</span>
                                <span className="text-sm text-gray-900">₦{formatCurrency(data.pending.today)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500">This week</span>
                                <span className="text-sm text-gray-900">₦{formatCurrency(data.pending.thisWeek)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500">Next week</span>
                                <span className="text-sm text-gray-900">₦{formatCurrency(data.pending.nextWeek)}</span>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-[#FBECC5]/60">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Est. release</span>
                                <span className="text-xs font-bold text-gray-600">{data.pending.estReleaseLabel || "---"}</span>
                            </div>
                            <div className="h-3 w-full bg-[#E89D2420] rounded-full overflow-hidden p-[2px]">
                                <div 
                                    className="h-full bg-[#E89D24] rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(232,157,36,0.5)]" 
                                    style={{ width: `${data.pending.progress || 0}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Completed Card */}
                    <div className="bg-[#F0FDF4] rounded-xl p-5 sm:p-6 lg:p-8 relative overflow-hidden">
                        <div className="flex items-center justify-between mb-4">
                            <div className='flex items-center gap-1'>
                                <div className="h-10 w-10 bg-[#22C55E1A] rounded-md flex items-center justify-center">
                                    <CheckCircle2 className="h-5 w-5 text-[#22C55E]" />
                                </div>

                                <div className="">
                                    <p className="text-sm text-gray-400">Completed</p>
                                    <h3 className="text-lg font-semibold text-gray-900">₦{formatCurrency(data.completed.totalAmount)}</h3>
                                </div>
                            </div>
                            <span className="bg-[#D8FFDC] text-[#22C55E] text-[10px] font-medium px-3 py-1 rounded-full">
                                Paid Out
                            </span>
                        </div>

                        <div className="space-y-2 mb-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500">This month</span>
                                <span className="text-sm text-gray-900">₦{formatCurrency(data.completed.thisMonth)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500">Last month</span>
                                <span className="text-sm text-gray-900">₦{formatCurrency(data.completed.lastMonth)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500">Total all time</span>
                                <span className="text-sm text-gray-900">₦{formatCurrency(data.completed.totalAllTime)}</span>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-[#DCFCE7]/60 flex justify-between items-center">
                            <div>
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Next payout</p>
                                <p className="text-[10px] text-gray-500">Scheduled for {data.completed.nextPayout?.date || "---"}</p>
                            </div>
                            <span className="text-lg font-black text-[#22C55E]">₦{formatCurrency(data.completed.nextPayout?.amount)}</span>
                        </div>
                    </div>
                </div>
                </div>
            </CardContent>
        </Card>
    );
};
