'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FiArrowLeft, FiArrowRight, FiPlus } from 'react-icons/fi';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useOnboardingStore } from '@/store/onboarding.store';

// Reusing part of StaffCard logic but adapting for selection as per design
const StaffItem = ({ name, role, isSelected, onToggle }: { name: string; role: string; isSelected: boolean; onToggle: () => void }) => {
    return (
        <div
            className={cn(
                "relative cursor-pointer rounded-xl border p-4 transition-all duration-200",
                isSelected ? "border-teal-500 bg-[#F0FDF9]" : "border-gray-200 bg-white"
            )}
            onClick={onToggle}
        >
            <div className="flex items-center gap-4">
                <Checkbox
                    checked={isSelected}
                    onCheckedChange={onToggle}
                    className="h-5 w-5 data-[state=checked]:bg-teal-600 data-[state=checked]:border-teal-600"
                />

                <Avatar className="h-10 w-10 bg-gray-200">
                    <AvatarFallback>{name.charAt(0)}</AvatarFallback>
                </Avatar>

                <div>
                    <p className="text-sm font-bold text-gray-900">{name}</p>
                    <p className="text-xs text-gray-500">{role}</p>
                </div>
            </div>
        </div>
    );
}

const serviceTypes = [
    { label: "Spa & Massage", value: "spa_massage" },
    { label: "Hair Styling", value: "hair_styling" },
    { label: "Manicure & Pedicure", value: "manicure_pedicure" },
];

const experienceLevels = [
    { label: "Junior", value: "junior" },
    { label: "Mid-Level", value: "mid" },
    { label: "Expert", value: "expert" },
];

export default function StaffsPage() {
    const [selectedStaffIds, setSelectedStaffIds] = useState<number[]>([]);
    const [open, setOpen] = useState(false);

    const staffList = [
        { id: 1, name: "Amara Okeke", role: "Massage Therapist" },
        { id: 2, name: "Amara Okeke", role: "Massage Therapist" }, // Duplicate name in design
    ];

    const toggleStaff = (id: number) => {
        setSelectedStaffIds(prev =>
            prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
        );
    };

    return (
        <div className="mx-auto max-w-4xl px-4 py-10">
            <div className="mb-8">
                <h1 className="mb-2 text-2xl font-bold text-gray-800">Staffs</h1>
                <p className="text-gray-500">Add number of staffs and Staff Info</p>
            </div>

            <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
                {staffList.map(staff => (
                    <StaffItem
                        key={staff.id}
                        name={staff.name}
                        role={staff.role}
                        isSelected={selectedStaffIds.includes(staff.id)}
                        onToggle={() => toggleStaff(staff.id)}
                    />
                ))}
            </div>

            {/* Add Staff Trigger */}
            <div
                onClick={() => setOpen(true)}
                className="flex mb-10 max-w-[300px] cursor-pointer items-center justify-center rounded-xl border border-dashed border-gray-300 p-4 text-center transition-colors hover:bg-gray-50 hover:border-teal-500"
            >
                <div className="flex h-full items-center gap-2 text-gray-500">
                    <div className="rounded-full bg-teal-100 p-1">
                        <FiPlus className="h-4 w-4 text-teal-700" />
                    </div>
                    <p className="text-sm font-medium">Add Staff</p>
                </div>
            </div>

            {/* Add Staff Dialog */}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-gray-800 text-center">Add Staff</DialogTitle>
                        <p className="text-center text-sm font-normal text-gray-500">Add staff and services offerd</p>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Staff Name</Label>
                            <Input placeholder="John Doe" />
                        </div>

                        <div className="space-y-2">
                            <Label>Service</Label>
                            <Select
                                placeholder="Spa & Massage"
                                options={serviceTypes}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Role</Label>
                            <Input placeholder="Relaxation, therapeutic massage" />
                        </div>

                        <div className="space-y-2">
                            <Label>Experience</Label>
                            <Select
                                placeholder="Expert"
                                options={experienceLevels}
                            />
                        </div>
                    </div>

                    <DialogFooter className="mt-8">
                        <Button
                            className="w-full rounded-full bg-[#2D5B5E] hover:bg-[#254E50]"
                            size="lg"
                        >
                            Add Staff
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>


            <div className="flex justify-between mt-8">
                <Link href="/onboarding/business-hours">
                    <Button variant="outline" className="rounded-full px-8 text-gray-600">
                        <FiArrowLeft className="mr-2" /> Back
                    </Button>
                </Link>
                <Link href="/onboarding/services">
                    <Button
                        className="rounded-full bg-[#2D5B5E] px-8 hover:bg-[#254E50]"
                        size="lg"
                    >
                        Continue <FiArrowRight className="ml-2" />
                    </Button>
                </Link>
            </div>
        </div>
    );
}
