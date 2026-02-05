'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiArrowLeft, FiArrowRight, FiPlus, FiEdit2, FiTrash2, FiUser } from 'react-icons/fi';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toaster } from "@/components/ui/toaster";
import { useOnboardingStore } from '@/store/onboarding.store';
import { cn } from '@/lib/utils';
import { Scissors } from 'lucide-react';

// Refined Staff Card Component
const StaffCard = ({ staff, onEdit, onDelete }: any) => {
    return (
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm flex flex-col gap-6 relative">
            <div className="flex justify-between items-start">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                    <FiUser className="h-8 w-8 text-gray-400" />
                </div>
                <div className="flex gap-2">
                    <button onClick={onEdit} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                        <FiEdit2 size={14} />
                    </button>
                    <button onClick={onDelete} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <FiTrash2 size={14} />
                    </button>
                </div>
            </div>

            <div className="flex flex-col gap-2">
                <h3 className="text-lg font-bold text-gray-900">{staff.name}</h3>
                <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-green-50 text-[10px] font-bold text-green-700 rounded-full uppercase tracking-wider">
                        {staff.role}
                    </span>
                    {staff.tags && staff.tags.map((tag: string, i: number) => (
                        <span key={i} className="px-3 py-1 bg-gray-50 text-[10px] font-bold text-gray-500 rounded-full uppercase tracking-wider">
                            {tag}
                        </span>
                    ))}
                </div>
            </div>

            <div className="space-y-3 pt-6 border-t border-gray-50 mt-auto">
                <div className="flex items-center gap-3">
                    <span className="text-xs font-medium text-gray-400 w-20">Service</span>
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                    <span className="text-xs font-bold text-gray-800">{staff.serviceName || "Global Spa"}</span>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-xs font-medium text-gray-400 w-20">Experience</span>
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                    <span className="text-xs font-bold text-gray-600">{staff.experience || "Expert"}</span>
                </div>
            </div>
        </div>
    );
};

const serviceTypes = [
    { label: "Barbershop", value: "barbershop" },
    { label: "Spa & Massage", value: "spa_massage" },
    { label: "Hair Styling", value: "hair_styling" },
];

const experienceLevels = [
    { label: "Junior", value: "junior" },
    { label: "Intermediate", value: "intermediate" },
    { label: "Expert", value: "expert" },
];

export default function StaffsPage() {
    const router = useRouter();
    const { services, businessId } = useOnboardingStore();
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Mock data for demo/onboarding
    const [staffs, setStaffs] = useState<any[]>([
        { id: 1, name: "John Doe", role: "Hair Stylist", serviceName: "Barbershop", experience: "Expert", tags: ["+3"] },
        { id: 2, name: "John Doe 2", role: "Senior Massage Therapist", serviceName: "Full on Body M...", experience: "Expert" },
    ]);

    // Form state (simplified for UI demonstration)
    const [newStaff, setNewStaff] = useState({
        name: '',
        service: '',
        role: '',
        experience: 'expert'
    });

    const handleAddStaff = () => {
        if (!newStaff.name || !newStaff.role) {
            toaster.create({ title: "Validation Error", description: "Name and Role are required", type: "error" });
            return;
        }
        const staff = {
            id: Date.now(),
            ...newStaff,
            serviceName: serviceTypes.find(s => s.value === newStaff.service)?.label || "Global Spa",
            experience: experienceLevels.find(e => e.value === newStaff.experience)?.label || "Expert"
        };
        setStaffs([...staffs, staff]);
        setOpen(false);
        setNewStaff({ name: '', service: '', role: '', experience: 'expert' });
        toaster.create({ title: "Staff Added", type: "success" });
    };

    const handleFinish = async () => {
        setIsLoading(true);
        // Simulate completion and redirect to dashboard
        setTimeout(() => {
            toaster.create({ title: "Onboarding Complete!", description: "Welcome to WellnessPro!", type: "success" });
            router.push('/dashboard');
            setIsLoading(false);
        }, 1500);
    };

    return (
        <div className="w-full max-w-[1100px]">
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8 md:p-12 min-h-[600px] flex flex-col">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Add a staff</h1>
                        <p className="text-gray-500 font-medium">Add staffs to services</p>
                    </div>
                    <Button
                        onClick={() => setOpen(true)}
                        className="bg-[#E59622] hover:bg-[#d48a1f] text-white font-bold h-12 px-6 rounded-lg flex items-center gap-2"
                    >
                        <FiPlus className="h-5 w-5" />
                        Add Staff
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 flex-1">
                    {staffs.map(staff => (
                        <StaffCard
                            key={staff.id}
                            staff={staff}
                            onEdit={() => toaster.create({ title: "Coming soon", description: "Edit functionality will be available in the dashboard." })}
                            onDelete={() => setStaffs(staffs.filter(s => s.id !== staff.id))}
                        />
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
                    onClick={handleFinish}
                    disabled={isLoading}
                >
                    {isLoading ? "Saving..." : "Finish & Submit"}
                    {!isLoading && <FiArrowRight className="h-5 w-5" />}
                </Button>
            </div>

            {/* Add Staff Dialog */}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="bg-white rounded-2xl sm:max-w-2xl p-0 overflow-hidden border-none text-left h-[calc(100vh-4rem)]">
                    <div className="p-8">
                        <DialogHeader className="mb-8">
                            <DialogTitle className="text-3xl font-bold text-gray-900">Add New Staff</DialogTitle>
                            <p className="text-sm font-normal text-gray-500">Add new staffs and their specialized roles</p>
                        </DialogHeader>

                        <div className="space-y-6 h-[calc(100vh-20rem)] overflow-y-auto">
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-400">Staff Name</Label>
                                <Input
                                    placeholder="John Doe"
                                    value={newStaff.name}
                                    onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                                    className="h-[56px] rounded-lg border-gray-200 bg-white"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-400">Role</Label>
                                <Input
                                    placeholder="Hair Stylist"
                                    value={newStaff.role}
                                    onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
                                    className="h-[56px] rounded-lg border-gray-200 bg-white"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-400">Staff Experience</Label>
                                <Select
                                    placeholder="Select experience level"
                                    options={experienceLevels}
                                    value={newStaff.experience}
                                    onChange={(e) => setNewStaff({ ...newStaff, experience: e.target.value })}
                                    className="h-[56px] rounded-lg border-gray-200"
                                />
                            </div>

                            <div className="space-y-4">
                                <Label className="text-sm font-medium text-gray-400">Services Associated To</Label>
                                <div className="grid grid-cols-2 gap-4">
                                    {staffs.map((staff, i) => (
                                        <div key={i} className="border border-gray-100 rounded-xl p-4 flex flex-col gap-3 relative bg-white shadow-sm">
                                            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                                                <Scissors className="h-5 w-5 text-gray-500" />
                                            </div>
                                            <span className="text-sm font-bold text-gray-900 leading-tight">{staff.serviceName}</span>
                                            <input type="checkbox" className="absolute top-4 right-4 h-5 w-5 rounded border-gray-300 text-[#E59622] focus:ring-[#E59622]" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-center gap-4 mt-10">
                            <Button
                                variant="outline"
                                onClick={() => setOpen(false)}
                                className="h-[56px] flex-1 rounded-lg border-gray-200 text-gray-500 font-bold text-lg"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleAddStaff}
                                className="h-[56px] flex-1 rounded-lg bg-[#E59622] hover:bg-[#d48a1f] text-white font-bold text-lg"
                            >
                                Save Staff
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
