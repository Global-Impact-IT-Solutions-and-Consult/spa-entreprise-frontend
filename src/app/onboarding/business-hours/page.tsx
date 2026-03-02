'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiArrowRight, FiArrowLeft, FiClock } from 'react-icons/fi';
import { useOnboardingStore } from '@/store/onboarding.store';
import { businessService } from '@/services/business.service';
import type { OperatingHours } from '@/services/business.service';

import { Button } from "@/components/ui/button";
import { Select } from '@/components/ui/select';
import { Switch } from "@/components/ui/switch";
import { toaster } from "@/components/ui/toaster";

const DAYS = [
    { id: 'monday', label: 'Monday' },
    { id: 'tuesday', label: 'Tuesday' },
    { id: 'wednesday', label: 'Wednesday' },
    { id: 'thursday', label: 'Thursday' },
    { id: 'friday', label: 'Friday' },
    { id: 'saturday', label: 'Saturday' },
    { id: 'sunday', label: 'Sunday' },
];

const TIME_SLOTS = Array.from({ length: 24 * 2 }).map((_, i) => {
    const hourNum = Math.floor(i / 2);
    const minute = i % 2 === 0 ? '00' : '30';
    const ampm = hourNum >= 12 ? 'PM' : 'AM';
    const hour12 = hourNum % 12 || 12;
    const time = `${hour12.toString().padStart(2, '0')}:${minute}${ampm}`;
    const value = `${hourNum.toString().padStart(2, '0')}:${minute}`;
    return { value, label: time };
});

interface DaySchedule {
    open: string;
    close: string;
    closed: boolean;
    allDay: boolean;
}

type Schedule = Record<string, DaySchedule>;

export default function BusinessHoursPage() {
    const router = useRouter();
    const { businessId, setOperatingHours, operatingHours } = useOnboardingStore();
    const [isLoading, setIsLoading] = useState(false);

    const [schedule, setSchedule] = useState<Schedule>(() => {
        if (Object.keys(operatingHours).length > 0) {
            // Hydrate from store — detect allDay by checking if times match 00:00/23:59
            return DAYS.reduce((acc: Schedule, day) => {
                const stored = operatingHours[day.id];
                const allDay = stored?.open === '00:00' && stored?.close === '23:59';
                acc[day.id] = {
                    open: stored?.open ?? '09:00',
                    close: stored?.close ?? '21:00',
                    closed: stored?.closed ?? (day.id === 'sunday'),
                    allDay,
                };
                return acc;
            }, {});
        }
        return DAYS.reduce((acc: Schedule, day) => {
            acc[day.id] = {
                open: '09:00',
                close: '21:00',
                closed: day.id === 'sunday',
                allDay: false,
            };
            return acc;
        }, {});
    });

    const handleDayToggle = (dayId: string, isOpen: boolean) => {
        setSchedule(prev => ({
            ...prev,
            [dayId]: { ...prev[dayId], closed: !isOpen },
        }));
    };

    const handle24hrToggle = (dayId: string, enabled: boolean) => {
        setSchedule(prev => ({
            ...prev,
            [dayId]: {
                ...prev[dayId],
                allDay: enabled,
                open: enabled ? '00:00' : '09:00',
                close: enabled ? '23:59' : '21:00',
            },
        }));
    };

    const handleTimeChange = (dayId: string, field: 'open' | 'close', value: string) => {
        setSchedule(prev => ({
            ...prev,
            [dayId]: { ...prev[dayId], [field]: value },
        }));
    };

    const handleContinue = async () => {
        if (!businessId) {
            toaster.create({ title: "Error", description: "Business ID not found within session.", type: "error" });
            return;
        }

        // Strip allDay before sending — API only expects open/close/closed
        const payload: OperatingHours = DAYS.reduce((acc: OperatingHours, day) => {
            const { open, close, closed } = schedule[day.id];
            acc[day.id] = { open, close, closed };
            return acc;
        }, {});

        setIsLoading(true);
        try {
            await businessService.setAvailability(businessId, payload);
            setOperatingHours(payload);
            toaster.create({ title: "Success", description: "Operating hours set successfully", type: "success" });
            router.push('/onboarding/services');
        } catch (error) {
            const err = error as { response?: { data?: { message?: string } } };
            toaster.create({
                title: "Failed to update hours",
                description: err.response?.data?.message || "Please try again.",
                type: "error"
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-[1100px]">
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8 md:p-12">
                <div className="mb-10">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Set Up Working Hours</h1>
                    <p className="text-gray-500 font-medium">Select days you open and hours of the day you will be available</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {DAYS.map((day) => {
                        const dayData = schedule[day.id];
                        const isDisabled = dayData.closed || dayData.allDay;

                        return (
                            <div key={day.id} className="border border-gray-200 rounded-xl flex flex-col gap-4 bg-white">
                                {/* Day name + open/closed toggle */}
                                <div className="flex items-center justify-between border-b border-gray-200 p-5">
                                    <span className="text-base font-bold text-gray-900">{day.label}</span>
                                    <Switch
                                        checked={!dayData.closed}
                                        onCheckedChange={(checked) => handleDayToggle(day.id, checked)}
                                    />
                                </div>

                                {/* From */}
                                <div className="flex items-center gap-3 px-5">
                                    <span className="text-sm text-gray-400 w-10">From</span>
                                    <Select
                                        disabled={isDisabled}
                                        value={dayData.open}
                                        onChange={(e) => handleTimeChange(day.id, 'open', e.target.value)}
                                        options={TIME_SLOTS}
                                        className="h-10 rounded-lg border-gray-200 flex-1 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                    />
                                </div>

                                {/* To */}
                                <div className="flex items-center gap-3 px-5">
                                    <span className="text-sm text-gray-400 w-10">To</span>
                                    <Select
                                        disabled={isDisabled}
                                        value={dayData.close}
                                        onChange={(e) => handleTimeChange(day.id, 'close', e.target.value)}
                                        options={TIME_SLOTS}
                                        className="h-10 rounded-lg border-gray-200 flex-1 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                    />
                                </div>

                                {/* Available 24/hours */}
                                <div className="flex items-center justify-between px-5 pb-5">
                                    <div className="flex items-center gap-2 text-gray-400">
                                        <FiClock className="h-4 w-4" />
                                        <span className="text-xs font-medium">Available 24/hours</span>
                                    </div>
                                    <Switch
                                        checked={dayData.allDay}
                                        disabled={dayData.closed}
                                        onCheckedChange={(checked) => handle24hrToggle(day.id, checked)}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="flex justify-between mt-12">
                <Button
                    variant="outline"
                    className="h-[56px] px-10 border-gray-200 text-gray-500 font-bold rounded-lg flex items-center gap-2 hover:bg-gray-50"
                    onClick={() => router.back()}
                >
                    <FiArrowLeft className="h-5 w-5" />
                    Back
                </Button>
                <Button
                    className="h-[56px] rounded-lg bg-[#E59622] px-10 text-lg font-bold hover:bg-[#d48a1f] transition-colors text-white flex items-center gap-2"
                    onClick={handleContinue}
                    disabled={isLoading}
                >
                    {isLoading ? "Saving..." : "Continue"}
                    {!isLoading && <FiArrowRight className="h-5 w-5" />}
                </Button>
            </div>
        </div>
    );
}
