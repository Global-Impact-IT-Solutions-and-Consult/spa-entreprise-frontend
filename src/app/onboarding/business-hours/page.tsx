'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiArrowRight } from 'react-icons/fi';
import { useOnboardingStore } from '@/store/onboarding.store';
import { businessService } from '@/services/business.service';

import { Button } from "@/components/ui/button";
import { Select } from '@/components/ui/select';
import { Switch } from "@/components/ui/switch";
import { toaster } from "@/components/ui/toaster";
import { cn } from '@/lib/utils';
import { Label } from "@/components/ui/label";

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
    const hour = Math.floor(i / 2);
    const minute = i % 2 === 0 ? '00' : '30';
    const time = `${hour.toString().padStart(2, '0')}:${minute}`;
    return { value: time, label: time };
});

export default function BusinessHoursPage() {
    const router = useRouter();
    const { businessId, setOperatingHours } = useOnboardingStore();
    const [isLoading, setIsLoading] = useState(false);

    // Initial State: Monday-Friday 9-5, Sat 10-4, Sun Closed
    const [schedule, setSchedule] = useState<any>(
        DAYS.reduce((acc: any, day) => {
            const isWeekend = day.id === 'saturday' || day.id === 'sunday';
            acc[day.id] = {
                open: isWeekend && day.id === 'saturday' ? '10:00' : '09:00',
                close: isWeekend && day.id === 'saturday' ? '16:00' : '17:00',
                closed: day.id === 'sunday'
            };
            return acc;
        }, {})
    );

    const handleDayChange = (dayId: string, field: string, value: any) => {
        setSchedule((prev: any) => ({
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
            const payload = {
                operatingHours: schedule
            };

            await businessService.updateProfile(businessId, payload);
            setOperatingHours(schedule);

            // router.push('/onboarding/services');
            router.push('/dashboard')
        } catch (error: any) {
            toaster.create({
                title: "Failed to update hours",
                description: error.response?.data?.message || "Please try again.",
                type: "error"
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="mx-auto max-w-4xl px-4 py-10">
            <div className="mb-8 text-center">
                <h1 className="mb-2 text-2xl font-bold text-teal-800">Business Hours</h1>
                <p className="text-gray-600">Set your operating hours so clients know when they can book.</p>
            </div>

            <div className="mb-10 rounded-xl border border-gray-100 bg-white p-6 shadow-sm md:p-8">
                <div className="flex flex-col gap-6">
                    {DAYS.map((day) => (
                        <div
                            key={day.id}
                            className="grid grid-cols-1 gap-4 items-center sm:grid-cols-[120px_1fr_1fr_auto]"
                        >
                            <Label className={cn("text-base font-medium text-gray-700", schedule[day.id].closed && "text-gray-400")}>
                                {day.label}
                            </Label>

                            <Select
                                disabled={schedule[day.id].closed}
                                value={schedule[day.id].open}
                                onChange={(e) => handleDayChange(day.id, 'open', e.target.value)}
                                options={TIME_SLOTS}
                                className={cn(schedule[day.id].closed && "opacity-50")}
                            />

                            <Select
                                disabled={schedule[day.id].closed}
                                value={schedule[day.id].close}
                                onChange={(e) => handleDayChange(day.id, 'close', e.target.value)}
                                options={TIME_SLOTS}
                                className={cn(schedule[day.id].closed && "opacity-50")}
                            />

                            <div className="flex items-center justify-end gap-2 sm:w-[100px]">
                                <Switch
                                    checked={!schedule[day.id].closed}
                                    onCheckedChange={(checked) => handleDayChange(day.id, 'closed', !checked)}
                                />
                                <span className={cn("text-sm font-medium w-[40px]", !schedule[day.id].closed ? "text-teal-600" : "text-gray-400")}>
                                    {!schedule[day.id].closed ? "Open" : "Closed"}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex justify-end">
                <Button
                    className="rounded-full bg-[#2D5B5E] px-10 hover:bg-[#254E50]"
                    size="lg"
                    onClick={handleContinue}
                    disabled={isLoading}
                >
                    {isLoading ? "Saving..." : (
                        <>
                            Continue to Services <FiArrowRight className="ml-2" />
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}
