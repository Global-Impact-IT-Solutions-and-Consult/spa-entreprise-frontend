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
import { useAuthStore } from "@/store/auth.store";
import { businessService, Staff, Service } from "@/services/business.service";
import { toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";

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
    const [searchQuery, setSearchQuery] = useState("");

    const [formData, setFormData] = useState({
        name: "",
        role: "",
        experience: "",
        serviceIds: [] as string[]
    });

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
                console.error("Failed to fetch staff data", error);
                toaster.create({ title: "Error", description: "Failed to load staff data", type: "error" });
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [businessId]);

    const handleAddStaff = async () => {
        if (!businessId) return;
        if (!formData.name || !formData.role || !formData.experience || formData.serviceIds.length === 0) {
            toaster.create({ title: "Validation Error", description: "All fields are required", type: "error" });
            return;
        }

        setIsActionLoading(true);
        try {
            const newStaff = await businessService.createStaff(businessId, formData);
            setStaffs(prev => [...prev, newStaff]);
            setIsModalOpen(false);
            setFormData({ name: "", role: "", experience: "", serviceIds: [] });
            toaster.create({ title: "Staff Added", type: "success" });
        } catch (error) {
            toaster.create({ title: "Error", description: "Failed to add staff", type: "error" });
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleDeleteStaff = async (staffId: string) => {
        if (!businessId || !confirm("Are you sure you want to delete this staff member?")) return;

        try {
            await businessService.deleteStaff(businessId, staffId);
            setStaffs(prev => prev.filter(s => s.id !== staffId));
            toaster.create({ title: "Staff Deleted", type: "success" });
        } catch (error) {
            toaster.create({ title: "Error", description: "Failed to delete staff", type: "error" });
        }
    };

    const handleServiceToggle = (serviceId: string) => {
        setFormData(prev => ({
            ...prev,
            serviceIds: prev.serviceIds.includes(serviceId)
                ? prev.serviceIds.filter(id => id !== serviceId)
                : [...prev.serviceIds, serviceId]
        }));
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
                        You haven't added any staff members yet or no results match your search.
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
                            <div key={staff.id} className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative group">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm ring-1 ring-gray-100">
                                        <User className="h-8 w-8 text-gray-400" />
                                    </div>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => toaster.create({ title: "Coming soon", description: "Edit functionality will be available shortly." })}
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

                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <h3 className="text-xl font-bold text-gray-900">{staff.name}</h3>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="px-3 py-1 bg-emerald-50 text-[10px] font-bold text-emerald-600 rounded-full uppercase tracking-wider border border-emerald-100">
                                                {staff.role}
                                            </span>
                                            {extraCount > 0 && (
                                                <span className="px-3 py-1 bg-gray-50 text-[10px] font-bold text-gray-400 rounded-full uppercase tracking-wider border border-gray-100">
                                                    +{extraCount}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t border-gray-50 space-y-3">
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

            {/* Add Staff Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="bg-white rounded-3xl sm:max-w-[600px] p-0 overflow-hidden border-none text-left">
                    <div className="p-8 space-y-8">
                        <DialogHeader>
                            <DialogTitle className="text-3xl font-extrabold text-gray-900 tracking-tight">Add New Staff</DialogTitle>
                            <p className="text-gray-500 font-medium">Add new staffs and their specialized roles</p>
                        </DialogHeader>

                        <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                            <div className="space-y-2">
                                <Label className="text-sm font-bold text-gray-400 uppercase tracking-widest">Staff Name</Label>
                                <Input
                                    placeholder="Enter full name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="h-14 bg-gray-50 border-none focus:ring-2 focus:ring-[#F59E0B] rounded-2xl text-gray-900 font-bold px-6"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-bold text-gray-400 uppercase tracking-widest">Role</Label>
                                <Input
                                    placeholder="e.g. Hair Stylist, Massage Therapist"
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    className="h-14 bg-gray-50 border-none focus:ring-2 focus:ring-[#F59E0B] rounded-2xl text-gray-900 font-bold px-6"
                                />
                            </div>

                            <div className="space-y-4">
                                <Label className="text-sm font-bold text-gray-400 uppercase tracking-widest">Services * (Select one or more)</Label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {services.map((service) => (
                                        <div
                                            key={service.id}
                                            onClick={() => handleServiceToggle(service.id)}
                                            className={cn(
                                                "p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col gap-3 relative group",
                                                formData.serviceIds.includes(service.id)
                                                    ? "border-[#F59E0B] bg-amber-50/50"
                                                    : "border-gray-50 bg-white hover:border-gray-200"
                                            )}
                                        >
                                            <div className={cn(
                                                "h-10 w-10 rounded-full flex items-center justify-center transition-colors",
                                                formData.serviceIds.includes(service.id) ? "bg-[#F59E0B] text-white" : "bg-gray-50 text-gray-400 group-hover:bg-gray-100"
                                            )}>
                                                <Scissors className="h-5 w-5" />
                                            </div>
                                            <p className="font-bold text-gray-900 text-sm">{service.name}</p>
                                            <Checkbox
                                                checked={formData.serviceIds.includes(service.id)}
                                                onCheckedChange={() => handleServiceToggle(service.id)}
                                                className="absolute top-4 right-4 h-5 w-5 border-2 border-gray-200 data-[state=checked]:bg-[#F59E0B] data-[state=checked]:border-[#F59E0B] rounded-lg"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-bold text-gray-400 uppercase tracking-widest">Staff Experience *</Label>
                                <CustomSelect
                                    value={formData.experience}
                                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                                    options={experienceLevels}
                                    placeholder="Select experience level"
                                    className="h-14 bg-gray-50 border-none focus:ring-2 focus:ring-[#F59E0B] rounded-2xl text-gray-900 font-bold px-6"
                                />
                            </div>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <Button
                                variant="ghost"
                                onClick={() => setIsModalOpen(false)}
                                className="flex-1 h-16 rounded-2xl font-extrabold text-gray-400 hover:text-gray-600 hover:bg-gray-50 text-lg"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleAddStaff}
                                disabled={isActionLoading}
                                className="flex-1 h-16 bg-[#F59E0B] hover:bg-[#D97706] text-white font-extrabold rounded-2xl shadow-xl shadow-[#F59E0B]/20 flex items-center justify-center gap-3 text-lg"
                            >
                                {isActionLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : "Save Staff"}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
