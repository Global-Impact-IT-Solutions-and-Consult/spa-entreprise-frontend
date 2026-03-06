"use client";

import { useState, useEffect } from "react";
import { FiClock } from "react-icons/fi";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select } from "@/components/ui/select";
import { useAuthStore } from "@/store/auth.store";
import { businessService } from "@/services/business.service";
import type { OperatingHours } from "@/services/business.service";
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

export default function WorkingHoursPage() {
    const { user } = useAuthStore();
    const businessId = user?.businesses?.[0]?.id;

    const [schedule, setSchedule] = useState<Schedule>({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchBusinessData = async () => {
            if (!businessId) return;
            setIsLoading(true);
            try {
                const businessData = await businessService.getBusinessProfile(businessId);
                const hours = (businessData as { operatingHours?: OperatingHours }).operatingHours || {};

                const initialSchedule = DAYS.reduce((acc: Schedule, day) => {
                    const stored = hours[day.id];
                    const allDay = stored?.open === '00:00' && stored?.close === '23:59';
                    acc[day.id] = {
                        open: stored?.open ?? '09:00',
                        close: stored?.close ?? '21:00',
                        closed: stored?.closed ?? (day.id === 'sunday'),
                        allDay,
                    };
                    return acc;
                }, {});

                setSchedule(initialSchedule);
            } catch (error) {
                console.error("Failed to fetch business hours:", error);
                toaster.create({ title: "Error", description: "Failed to load working hours", type: "error" });
            } finally {
                setIsLoading(false);
            }
        };

        fetchBusinessData();
    }, [businessId]);

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

    const handleSaveHours = async () => {
        if (!businessId) return;
        // Strip allDay before sending — API only expects open/close/closed
        const payload: OperatingHours = DAYS.reduce((acc: OperatingHours, day) => {
            const { open, close, closed } = schedule[day.id] ?? { open: '09:00', close: '21:00', closed: false };
            acc[day.id] = { open, close, closed };
            return acc;
        }, {});

        setIsSaving(true);
        try {
            await businessService.setAvailability(businessId, payload);
            toaster.create({ title: "Hours Updated", type: "success" });
        } catch (error) {
            const err = error as { response?: { data?: { message?: string } } };
            toaster.create({ title: "Error", description: err.response?.data?.message || "Failed to update working hours", type: "error" });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="h-[400px] flex items-center justify-center">
                <Loader2 className="h-10 w-10 text-[#F59E0B] animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-24">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Manage Working Hours</h1>
                <p className="text-gray-500 mt-1">Set days of the week you will be open for business and time for bookings</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {DAYS.map((day) => {
                    const dayData = schedule[day.id] ?? { open: '09:00', close: '21:00', closed: false, allDay: false };
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

            {/* Sticky Save Bar */}
            <div className="fixed bottom-8 left-[calc(256px+2rem)] right-8 z-10 flex justify-end animate-in slide-in-from-bottom-5">
                <Button
                    onClick={handleSaveHours}
                    disabled={isSaving}
                    className="h-16 px-12 bg-[#F59E0B] hover:bg-[#D97706] text-white font-extrabold text-lg rounded-2xl shadow-2xl shadow-[#F59E0B]/40 flex items-center gap-3 transition-all hover:scale-105 active:scale-95"
                >
                    {isSaving ? <Loader2 className="h-6 w-6 animate-spin" /> : <Save className="h-6 w-6" />}
                    {isSaving ? "Saving..." : "Save Changes"}
                </Button>
            </div>
        </div>
    );
}
