'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiArrowLeft, FiArrowRight, FiPlus, FiEdit2, FiTrash2, FiUser } from 'react-icons/fi';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toaster } from "@/components/ui/toaster";
import { useOnboardingStore } from '@/store/onboarding.store';
import { businessService, Service, Staff } from '@/services/business.service';
import { StaffModal } from '@/components/modules/staff/StaffModal';
import { cn } from '@/lib/utils';
import { Scissors } from 'lucide-react';
import { ConfirmModal } from "@/components/ui/confirm-modal";

// Refined Staff Card Component
interface StaffCardProps {
    staff: Staff & { serviceName?: string; tags?: string[] };
    onEdit: () => void;
    onDelete: () => void;
}

const StaffCard = ({ staff, onEdit, onDelete }: StaffCardProps) => {
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
                <div className="flex items-start gap-3">
                    <span className="text-xs font-medium text-gray-400 w-20">Services</span>
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-300 mt-1.5" />
                    <span className="text-xs font-bold text-gray-800 flex-1">{staff.serviceName || "No services"}</span>
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

const experienceLevels = [
    { label: "Select experience level", value: "" },
    { label: "Junior", value: "Junior" },
    { label: "Intermediate", value: "Intermediate" },
    { label: "Expert", value: "Expert" },
];

export default function StaffsPage() {
    const router = useRouter();
    const { businessId } = useOnboardingStore();
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [services, setServices] = useState<Service[]>([]);
    const [staffs, setStaffs] = useState<Staff[]>([]);
    const [staffToDelete, setStaffToDelete] = useState<string | null>(null);
    const [staffToEdit, setStaffToEdit] = useState<Staff | null>(null);

    // Form state
    const [newStaff, setNewStaff] = useState({
        name: '',
        serviceIds: [] as string[],
        role: '',
        experience: ''
    });

    // Load services and staff
    useEffect(() => {
        const loadData = async () => {
            if (!businessId) {
                toaster.create({ title: "Error", description: "Business ID not found", type: "error" });
                setIsLoadingData(false);
                return;
            }

            try {
                const [servicesData, staffsData] = await Promise.all([
                    businessService.getServices(businessId),
                    businessService.getAllStaff(businessId)
                ]);
                setServices(servicesData);
                setStaffs(staffsData);
            } catch (error) {
                const err = error as { response?: { data?: { message?: string } } };
                console.error("Failed to load data", err);
                toaster.create({
                    title: "Error",
                    description: err.response?.data?.message || "Failed to load data",
                    type: "error"
                });
            } finally {
                setIsLoadingData(false);
            }
        };

        loadData();
    }, [businessId]);



    const handleDeleteStaff = (staffId: string) => {
        if (!businessId) return;
        setStaffToDelete(staffId);
    };

    const confirmDelete = async () => {
        if (!businessId || !staffToDelete) return;

        try {
            await businessService.deleteStaff(businessId, staffToDelete);
            setStaffs(staffs.filter(s => s.id !== staffToDelete));
            toaster.create({ title: "Staff Deleted", type: "success" });
        } catch (error) {
            const err = error as { response?: { data?: { message?: string } } };
            toaster.create({
                title: "Failed to delete staff",
                description: err.response?.data?.message || "Please try again.",
                type: "error"
            });
        } finally {
            setStaffToDelete(null);
        }
    };

    const handleFinish = async () => {
        setIsLoading(true);
        try {
            // Check if business has at least one service and one staff
            if (services.length === 0) {
                toaster.create({
                    title: "Incomplete Onboarding",
                    description: "Please create at least one service before finishing.",
                    type: "error"
                });
                setIsLoading(false);
                return;
            }

            // Onboarding is complete - redirect to dashboard
            toaster.create({
                title: "Onboarding Complete!",
                description: "Your business profile is set up. Waiting for admin approval.",
                type: "success"
            });
            router.push('/dashboard');
        } catch (error) {
            const err = error as { response?: { data?: { message?: string } } };
            toaster.create({
                title: "Error",
                description: err.response?.data?.message || "An error occurred",
                type: "error"
            });
        } finally {
            setIsLoading(false);
        }
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
                        disabled={services.length === 0}
                        className="bg-[#E59622] hover:bg-[#d48a1f] text-white font-bold h-12 px-6 rounded-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <FiPlus className="h-5 w-5" />
                        Add Staff
                    </Button>
                </div>

                {isLoadingData ? (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-gray-500">Loading staff...</div>
                    </div>
                ) : staffs.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center py-20">
                        <div className="text-gray-500 mb-4">No staff found. Please add staff.</div>
                        <Button
                            onClick={() => setOpen(true)}
                            className="bg-[#E59622] hover:bg-[#d48a1f] text-white"
                        >
                            Add Staff
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 flex-1">
                        {staffs.map(staff => {
                            // Get service names for this staff member
                            const staffServiceIds = staff.serviceIds || [];
                            const staffServices = services.filter(s => staffServiceIds.includes(s.id));
                            const serviceNames = staffServices.map(s => s.name).join(', ') || 'No services assigned';

                            return (
                                <StaffCard
                                    key={staff.id}
                                    staff={{
                                        ...staff,
                                        serviceName: serviceNames
                                    }}
                                    onEdit={() => setStaffToEdit(staff)}
                                    onDelete={() => handleDeleteStaff(staff.id)}
                                />
                            );
                        })}
                    </div>
                )}
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

            {/* Staff Modal (Add/Edit) */}
            {businessId && (
                <StaffModal
                    businessId={businessId}
                    staff={staffToEdit}
                    services={services}
                    isOpen={open || !!staffToEdit}
                    onClose={() => {
                        setOpen(false);
                        setStaffToEdit(null);
                    }}
                    onSuccess={(savedStaff) => {
                        if (staffToEdit) {
                            setStaffs(prev => prev.map(s => s.id === savedStaff.id ? savedStaff : s));
                        } else {
                            setStaffs(prev => [...prev, savedStaff]);
                        }
                    }}
                />
            )}

            <ConfirmModal
                isOpen={!!staffToDelete}
                title="Delete Staff?"
                message="Are you sure you want to delete this staff member? This action cannot be undone."
                variant="danger"
                confirmLabel="Delete"
                onConfirm={confirmDelete}
                onCancel={() => setStaffToDelete(null)}
            />
        </div>
    );
}
