"use client";

import { useState, useEffect } from "react";
import {
    Clock,
    ChevronDown,
    Loader2,
    Save
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select as CustomSelect } from "@/components/ui/select";
import { useAuthStore } from "@/store/auth.store";
import { businessService } from "@/services/business.service";
import { toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";

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

export default function WorkingHoursPage() {
    const { user } = useAuthStore();
    const businessId = user?.businesses?.[0]?.id;
    const business = user?.businesses?.[0];

    const [schedule, setSchedule] = useState<any>({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Mass update states
    const [weekdaysTime, setWeekdaysTime] = useState({ open: "09:00", close: "21:00" });
    const [weekendsTime, setWeekendsTime] = useState({ open: "10:00", close: "18:00" });

    useEffect(() => {
        const fetchBusinessData = async () => {
            if (!businessId) return;

            setIsLoading(true);
            try {
                const businessData = await businessService.getBusinessProfile(businessId);
                const hours = (businessData as any).operatingHours || {};

                const initialSchedule = DAYS.reduce((acc: any, day) => {
                    acc[day.id] = hours[day.id] || {
                        open: '09:00',
                        close: '21:00',
                        closed: day.id === 'sunday'
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

    const handleDayChange = (dayId: string, field: string, value: any) => {
        setSchedule((prev: any) => ({
            ...prev,
            [dayId]: {
                ...prev[dayId],
                [field]: value
            }
        }));
    };

    const handleSaveHours = async () => {
        if (!businessId) return;

        setIsSaving(true);
        try {
            await businessService.setAvailability(businessId, schedule);
            toaster.create({ title: "Hours Updated", type: "success" });
        } catch (error) {
            toaster.create({ title: "Error", description: "Failed to update working hours", type: "error" });
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
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Manage Working Hours</h1>
                <p className="text-gray-500 mt-1">Set days of the week you will be open for business and time for bookings</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {DAYS.map((day) => (
                    <div key={day.id} className="bg-white rounded p-8 border border-gray-100 shadow-sm space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-gray-500 tracking-widest text-sm font-medium">
                                <Clock className="h-4 w-4" />
                                Day and Time
                            </div>
                            <Switch
                                checked={!schedule[day.id]?.closed}
                                onCheckedChange={(checked) => handleDayChange(day.id, 'closed', !checked)}
                                className="data-[state=checked]:bg-emerald-500"
                            />
                        </div>
                        <hr className="border-gray-100" />
                        <div className="space-y-4">
                            <div className="grid grid-cols-6 items-center justify-between gap-4">
                                <Label className="text-xs font-medium text-gray-400 uppercase tracking-wider col-span-1">Day</Label>
                                <div className="rounded border border-gray-100 flex items-center px-4 text-gray-500 w-full col-span-5 h-11">
                                    {day.label}
                                </div>
                            </div>

                            <div className="grid grid-cols-6 items-center justify-between gap-4">
                                <Label className="text-xs font-medium text-gray-400 uppercase tracking-wider col-span-1">From</Label>
                                <div className="col-span-5">
                                    <CustomSelect
                                        disabled={schedule[day.id]?.closed}
                                        value={schedule[day.id]?.open}
                                        onChange={(e) => handleDayChange(day.id, 'open', e.target.value)}
                                        options={TIME_SLOTS}
                                        className="rounded border border-gray-100 text-gray-500 w-full h-11"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-6 items-center justify-between gap-4">
                                <Label className="text-xs font-medium text-gray-400 uppercase tracking-wider col-span-1">To</Label>
                                <div className="col-span-5">
                                    <CustomSelect
                                        disabled={schedule[day.id]?.closed}
                                        value={schedule[day.id]?.close}
                                        onChange={(e) => handleDayChange(day.id, 'close', e.target.value)}
                                        options={TIME_SLOTS}
                                        className="rounded border border-gray-100 text-gray-500 w-full h-11"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
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
