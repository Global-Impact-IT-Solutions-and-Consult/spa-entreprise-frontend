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

    const handleAddStaff = async () => {
        if (!businessId) {
            toaster.create({ title: "Error", description: "Business ID not found", type: "error" });
            return;
        }

        if (!newStaff.name || !newStaff.role || newStaff.serviceIds.length === 0 || !newStaff.experience) {
            toaster.create({ title: "Validation Error", description: "Please fill all required fields and select at least one service", type: "error" });
            return;
        }

        setIsLoading(true);
        try {
            const newStaffMember = await businessService.createStaff(businessId, {
                name: newStaff.name,
                serviceIds: newStaff.serviceIds,
                role: newStaff.role,
                experience: newStaff.experience
            });

            setStaffs([...staffs, newStaffMember]);
            setOpen(false);
            setNewStaff({ name: '', serviceIds: [], role: '', experience: '' });
            toaster.create({ title: "Staff Added", type: "success" });
        } catch (error) {
            const err = error as { response?: { data?: { message?: string } } };
            toaster.create({
                title: "Failed to add staff",
                description: err.response?.data?.message || "Please try again.",
                type: "error"
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleServiceToggle = (serviceId: string) => {
        setNewStaff(prev => {
            if (prev.serviceIds.includes(serviceId)) {
                return { ...prev, serviceIds: prev.serviceIds.filter(id => id !== serviceId) };
            } else {
                return { ...prev, serviceIds: [...prev.serviceIds, serviceId] };
            }
        });
    };

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
                ) : services.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center py-20">
                        <div className="text-gray-500 mb-4">Please create services first before adding staff.</div>
                        <Button
                            onClick={() => router.push('/onboarding/services')}
                            className="bg-[#E59622] hover:bg-[#d48a1f] text-white"
                        >
                            Go to Services
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
                                    onEdit={() => toaster.create({ title: "Coming soon", description: "Edit functionality will be available in the dashboard." })}
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
                                <Label className="text-sm font-medium text-gray-400">Services * (Select one or more)</Label>
                                <div className="grid grid-cols-2 gap-4 max-h-60 overflow-y-auto">
                                    {services.map((service) => (
                                        <div
                                            key={service.id}
                                            className={cn(
                                                "border rounded-xl p-4 flex flex-col gap-3 relative bg-white shadow-sm cursor-pointer transition-all",
                                                newStaff.serviceIds.includes(service.id)
                                                    ? "border-[#E59622] bg-[#FEF5E7]"
                                                    : "border-gray-100 hover:border-gray-200"
                                            )}
                                            onClick={() => handleServiceToggle(service.id)}
                                        >
                                            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                                                <Scissors className="h-5 w-5 text-gray-500" />
                                            </div>
                                            <span className="text-sm font-bold text-gray-900 leading-tight">{service.name}</span>
                                            <input
                                                type="checkbox"
                                                checked={newStaff.serviceIds.includes(service.id)}
                                                onChange={() => handleServiceToggle(service.id)}
                                                className="absolute top-4 right-4 h-5 w-5 rounded border-gray-300 text-[#E59622] focus:ring-[#E59622] cursor-pointer"
                                            />
                                        </div>
                                    ))}
                                </div>
                                {newStaff.serviceIds.length === 0 && (
                                    <p className="text-xs text-red-500">Please select at least one service</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-400">Staff Experience *</Label>
                                <Select
                                    placeholder="Select experience level"
                                    options={experienceLevels}
                                    value={newStaff.experience}
                                    onChange={(e) => setNewStaff({ ...newStaff, experience: e.target.value })}
                                    className="h-[56px] rounded-lg border-gray-200"
                                />
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
                                disabled={isLoading}
                                className="h-[56px] flex-1 rounded-lg bg-[#E59622] hover:bg-[#d48a1f] text-white font-bold text-lg disabled:opacity-50"
                            >
                                {isLoading ? "Adding..." : "Save Staff"}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

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
