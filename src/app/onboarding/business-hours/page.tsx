'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiArrowRight, FiArrowLeft, FiClock } from 'react-icons/fi';
import { useOnboardingStore } from '@/store/onboarding.store';
import { businessService } from '@/services/business.service';

import { Button } from "@/components/ui/button";
import { Select } from '@/components/ui/select';
import { Switch } from "@/components/ui/switch";
import { toaster } from "@/components/ui/toaster";
import { Label } from "@/components/ui/label";

const DAYS = [
    { id: 'sunday', label: 'Sunday' },
    { id: 'monday', label: 'Monday' },
    { id: 'tuesday', label: 'Tuesday' },
    { id: 'wednesday', label: 'Wednesday' },
    { id: 'thursday', label: 'Thursday' },
    { id: 'friday', label: 'Friday' },
    { id: 'saturday', label: 'Saturday' },
];

const TIME_SLOTS = Array.from({ length: 24 * 2 }).map((_, i) => {
    const hourNum = Math.floor(i / 2);
    const minute = i % 2 === 0 ? '00' : '30';
    const ampm = hourNum >= 12 ? 'PM' : 'AM';
    const hour12 = hourNum % 12 || 12;
    const time = `${hour12.toString().padStart(2, '0')}:${minute}${ampm}`;
    const value = `${hourNum.toString().padStart(2, '0')}:${minute}`;
    return { value: value, label: time };
});

export default function BusinessHoursPage() {
    const router = useRouter();
    const { businessId, setOperatingHours, operatingHours } = useOnboardingStore();
    const [isLoading, setIsLoading] = useState(false);

    // Initial State
    const [schedule, setSchedule] = useState<import('@/services/business.service').OperatingHours>(
        Object.keys(operatingHours).length > 0 ? operatingHours :
            DAYS.reduce((acc: import('@/services/business.service').OperatingHours, day) => {
                acc[day.id] = {
                    open: '09:00',
                    close: '21:00',
                    closed: day.id === 'sunday'
                };
                return acc;
            }, {})
    );

    const handleDayChange = (dayId: string, field: string, value: string | boolean) => {
        setSchedule((prev) => ({
            ...prev,
            [dayId]: {
                ...prev[dayId],
                [field]: value
            }
        }));
    };

    const handleContinue = async () => {
        if (!businessId) {
            toaster.create({ title: "Error", description: "Business ID not found within session.", type: "error" });
            return;
        }

        setIsLoading(true);
        try {
            // new endpoint is /api/v1/spas/{id}/operating-hours
            // body is the schedule object directly according to the requirement
            await businessService.setAvailability(businessId, schedule);
            setOperatingHours(schedule);

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
                    {DAYS.map((day) => (
                        <div key={day.id} className="border border-gray-200 rounded-xl p-5 flex flex-col gap-4 bg-white">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-gray-400">
                                    <FiClock className="h-4 w-4" />
                                    <span className="text-xs font-semibold uppercase tracking-wider">Day and Time</span>
                                </div>
                                <Switch
                                    checked={!schedule[day.id].closed}
                                    onCheckedChange={(checked) => handleDayChange(day.id, 'closed', !checked)}
                                />
                            </div>

                            <div className="flex flex-col gap-3">
                                <div className="flex items-center justify-between gap-4">
                                    <Label className="text-sm font-medium text-gray-400 min-w-[40px]">Day</Label>
                                    <div className="flex-1 h-11 px-4 border border-gray-100 bg-gray-50/50 rounded-lg flex items-center text-sm font-medium text-gray-700">
                                        {day.label}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between gap-4">
                                    <Label className="text-sm font-medium text-gray-400 min-w-[40px]">From</Label>
                                    <Select
                                        disabled={schedule[day.id].closed}
                                        value={schedule[day.id].open}
                                        onChange={(e) => handleDayChange(day.id, 'open', e.target.value)}
                                        options={TIME_SLOTS}
                                        className="h-11 rounded-lg border-gray-100 flex-1 hover:border-[#E59622] transition-colors"
                                    />
                                </div>

                                <div className="flex items-center justify-between gap-4">
                                    <Label className="text-sm font-medium text-gray-400 min-w-[40px]">To</Label>
                                    <Select
                                        disabled={schedule[day.id].closed}
                                        value={schedule[day.id].close}
                                        onChange={(e) => handleDayChange(day.id, 'close', e.target.value)}
                                        options={TIME_SLOTS}
                                        className="h-11 rounded-lg border-gray-100 flex-1 hover:border-[#E59622] transition-colors"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
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
