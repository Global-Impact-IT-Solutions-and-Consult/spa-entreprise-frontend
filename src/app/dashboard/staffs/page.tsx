"use client";

import { useState, useEffect } from "react";
import { Plus, User, Edit2, Trash2, Loader2, Scissors } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StaffModal } from "@/components/modules/staff/StaffModal";
import { useAuthStore } from "@/store/auth.store";
import { businessService, Staff, Service } from "@/services/business.service";
import { toaster } from "@/components/ui/toaster";
import { ConfirmModal } from "@/components/ui/confirm-modal";

// Staff Card Component for Dashboard
interface StaffDashboardCardProps {
    staff: Staff;
    serviceNames: string[];
    onEdit: () => void;
    onDelete: () => void;
}

const StaffDashboardCard = ({ staff, serviceNames, onEdit, onDelete }: StaffDashboardCardProps) => {
    const [expanded, setExpanded] = useState(false);
    return (
        <div className={`bg-white rounded-xl p-3 border border-gray-100 shadow-sm flex flex-col gap-4 ${expanded ? 'min-h-[300px]' : 'h-[300px]'}`}>
            {/* Top section: avatar + name */}
            <div className="shadow-md p-2 rounded">
                <div className="flex justify-between items-start">
                    <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                        {staff.profilePicture
                            ? <img src={staff.profilePicture} alt={staff.name} className="h-full w-full object-cover" />
                            : <User className="h-7 w-7 text-gray-400" />
                        }
                    </div>
                    <div className="flex gap-2">
                        <button onClick={onEdit} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                            <Edit2 className="h-4 w-4" />
                        </button>
                        <button onClick={onDelete} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                </div>
                <div className="mt-3">
                    <h3 className="text-base font-bold text-gray-900">{staff.name}</h3>
                    <p className="text-sm text-gray-400 mt-0.5">
                        {staff.experience ? `${staff.experience} ${staff.role}` : staff.role}
                    </p>
                </div>
            </div>

            {/* About text — 2-line clamp with See more */}
            {staff.about && (
                <div className="border-t border-gray-100 pt-3">
                    <p className={`text-sm text-gray-500 leading-relaxed ${expanded ? '' : 'line-clamp-2'}`}>
                        {staff.about}
                    </p>
                    {staff.about.length > 110 && (
                        <button
                            onClick={() => setExpanded(prev => !prev)}
                            className="text-xs text-amber-600 font-medium mt-1 hover:underline"
                        >
                            {expanded ? 'See less' : 'See more'}
                        </button>
                    )}
                </div>
            )}

            {/* Service name tags */}
            {serviceNames.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {serviceNames.map((name, i) => (
                        <span key={i} className="px-3 py-1 bg-amber-50 text-amber-700 text-xs font-medium rounded-full border border-amber-100">
                            {name}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
};

export default function StaffsPage() {
    const { user } = useAuthStore();
    const businessId = user?.businesses?.[0]?.id;

    const [staffs, setStaffs] = useState<Staff[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [businessTypeIcon, setBusinessTypeIcon] = useState<string | undefined>(undefined);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchQuery] = useState("");
    const [staffToDelete, setStaffToDelete] = useState<string | null>(null);
    const [staffToEdit, setStaffToEdit] = useState<Staff | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!businessId) return;
            try {
                const [staffData, servicesData, myBusinesses] = await Promise.all([
                    businessService.getAllStaff(businessId),
                    businessService.getServices(businessId),
                    businessService.getMyBusinesses()
                ]);
                setStaffs(staffData);
                setServices(servicesData);
                const businessData = myBusinesses.find(b => b.id === businessId);
                setBusinessTypeIcon(businessData?.businessType?.iconUrl);
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
                        const staffServiceNames = services
                            .filter(s => staff.serviceIds?.includes(s.id))
                            .map(s => s.name);

                        return (
                            <StaffDashboardCard
                                key={staff.id}
                                staff={staff}
                                serviceNames={staffServiceNames}
                                onEdit={() => setStaffToEdit(staff)}
                                onDelete={() => handleDeleteStaff(staff.id)}
                            />
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
                    businessTypeIcon={businessTypeIcon}
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
