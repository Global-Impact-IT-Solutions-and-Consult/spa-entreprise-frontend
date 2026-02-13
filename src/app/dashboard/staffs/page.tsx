"use client";

import { useState, useEffect } from "react";
import {
    Plus,
    User,
    Edit2,
    Trash2,
    Loader2,
    Scissors
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import { Select as CustomSelect } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { StaffModal } from "@/components/modules/staff/StaffModal";
import { useAuthStore } from "@/store/auth.store";
import { businessService, Staff, Service } from "@/services/business.service";
import { toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";
import { ConfirmModal } from "@/components/ui/confirm-modal";

const experienceLevels = [
    { label: "Junior", value: "Junior" },
    { label: "Intermediate", value: "Intermediate" },
    { label: "Expert", value: "Expert" },
];

export default function StaffsPage() {
    const { user } = useAuthStore();
    const businessId = user?.businesses?.[0]?.id;

    const [staffs, setStaffs] = useState<Staff[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchQuery] = useState("");
    const [staffToDelete, setStaffToDelete] = useState<string | null>(null);
    const [staffToEdit, setStaffToEdit] = useState<Staff | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!businessId) return;
            try {
                const [staffData, servicesData] = await Promise.all([
                    businessService.getAllStaff(businessId),
                    businessService.getServices(businessId)
                ]);
                setStaffs(staffData);
                setServices(servicesData);
            } catch (error) {
                const err = error as { response?: { data?: { message?: string } } };
                console.error("Failed to fetch staff data", err);
                toaster.create({ title: "Error", description: err.response?.data?.message || "Failed to load staff data", type: "error" });
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [businessId]);


    const handleDeleteStaff = (staffId: string) => {
        if (!businessId) return;
        setStaffToDelete(staffId);
    };

    const confirmDelete = async () => {
        if (!businessId || !staffToDelete) return;

        try {
            await businessService.deleteStaff(businessId, staffToDelete);
            setStaffs(prev => prev.filter(s => s.id !== staffToDelete));
            toaster.create({ title: "Staff Deleted", type: "success" });
        } catch (error) {
            const err = error as { response?: { data?: { message?: string } } };
            toaster.create({ title: "Error", description: err.response?.data?.message || "Failed to delete staff", type: "error" });
        } finally {
            setStaffToDelete(null);
        }
    };


    const filteredStaff = staffs?.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.role.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Manage Business Staffs</h1>
                    <p className="text-gray-500 mt-1">Create new staff, edit existing staff or delete staff</p>
                </div>
                <Button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-[#F59E0B] hover:bg-[#D97706] text-white font-bold h-12 px-6 rounded-xl shadow-lg shadow-[#F59E0B]/20 flex items-center gap-2"
                >
                    <Plus className="h-5 w-5" />
                    Add Staff
                </Button>
            </div>

            {isLoading ? (
                <div className="h-[400px] flex items-center justify-center">
                    <Loader2 className="h-10 w-10 text-[#F59E0B] animate-spin" />
                </div>
            ) : filteredStaff.length === 0 ? (
                <div className="mt-6 h-[400px] flex flex-col items-center justify-center bg-white rounded-3xl border-2 border-dashed border-gray-100 p-12 text-center">
                    <User className="h-16 w-16 text-gray-200 mb-4" />
                    <h3 className="text-xl font-bold text-gray-900">No staffs found</h3>
                    <p className="text-gray-500 mt-2 max-w-sm">
                        You haven&apos;t added any staff members yet or no results match your search.
                    </p>
                    <Button
                        variant="link"
                        onClick={() => setIsModalOpen(true)}
                        className="text-[#F59E0B] font-bold mt-4"
                    >
                        Add your first staff member
                    </Button>
                </div>
            ) : (
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredStaff.map((staff) => {
                        const staffServices = services.filter(s => staff.serviceIds?.includes(s.id));
                        const mainService = staffServices[0]?.name || "No services";
                        const extraCount = staffServices.length > 1 ? staffServices.length - 1 : 0;

                        return (
                            <div key={staff.id} className="bg-white rounded-md p-8 border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative group">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm ring-1 ring-gray-100">
                                        <User className="h-8 w-8 text-gray-400" />
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setStaffToEdit(staff)}
                                            className="p-2 bg-blue-50 text-blue-500 rounded-xl hover:bg-blue-100 transition-colors"
                                        >
                                            <Edit2 className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteStaff(staff.id)}
                                            className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="space-y-1">
                                        <h3 className="text-xl font-bold text-gray-900">{staff.name}</h3>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="py-1 text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
                                                {staff.role}
                                            </span>
                                            {extraCount > 0 && (
                                                <span className="px-3 py-1 bg-gray-50 text-[10px] font-bold text-gray-400 rounded-full uppercase tracking-wider">
                                                    +{extraCount}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <hr className="border-gray-100" />

                                    <div className="pt-1 space-y-3">
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs font-semibold text-gray-400 w-16">Service</span>
                                            <div className="h-1.5 w-1.5 rounded-full bg-gray-300" />
                                            <span className="text-xs font-bold text-gray-700 truncate flex-1">{mainService}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs font-semibold text-gray-400 w-16">Experience</span>
                                            <div className="h-1.5 w-1.5 rounded-full bg-gray-300" />
                                            <span className="text-xs font-bold text-gray-700">{staff.experience}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Staff Modal (Add/Edit) */}
            {businessId && (
                <StaffModal
                    businessId={businessId}
                    staff={staffToEdit}
                    services={services}
                    isOpen={isModalOpen || !!staffToEdit}
                    onClose={() => {
                        setIsModalOpen(false);
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
        </div >
    );
}
