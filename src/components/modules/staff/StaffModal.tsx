"use client";

import { useState, useEffect } from "react";
import { Loader2, Scissors } from "lucide-react";
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
import { businessService, Staff, Service, CreateStaffDto } from "@/services/business.service";
import { toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";

const experienceLevels = [
    { label: "Junior", value: "Junior" },
    { label: "Intermediate", value: "Intermediate" },
    { label: "Expert", value: "Expert" },
];

interface StaffModalProps {
    businessId: string;
    staff: Staff | null; // null for "Add", non-null for "Edit"
    services: Service[];
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (staff: Staff) => void;
}

export const StaffModal = ({ businessId, staff, services, isOpen, onClose, onSuccess }: StaffModalProps) => {
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [formData, setFormData] = useState<CreateStaffDto>({
        name: "",
        role: "",
        experience: "",
        serviceIds: []
    });

    useEffect(() => {
        if (staff && isOpen) {
            setFormData({
                name: staff.name,
                role: staff.role,
                experience: staff.experience,
                serviceIds: staff.serviceIds || []
            });
        } else if (!staff && isOpen) {
            setFormData({
                name: "",
                role: "",
                experience: "",
                serviceIds: []
            });
        }
    }, [staff, isOpen]);

    const handleServiceToggle = (serviceId: string) => {
        setFormData(prev => ({
            ...prev,
            serviceIds: prev.serviceIds.includes(serviceId)
                ? prev.serviceIds.filter(id => id !== serviceId)
                : [...prev.serviceIds, serviceId]
        }));
    };

    const handleSaveStaff = async () => {
        if (!businessId) return;
        if (!formData.name || !formData.role || !formData.experience || formData.serviceIds.length === 0) {
            toaster.create({ title: "Validation Error", description: "All fields are required", type: "error" });
            return;
        }

        setIsActionLoading(true);
        try {
            let result: Staff;
            if (staff) {
                // Edit mode
                result = await businessService.updateStaff(businessId, staff.id, formData);
                toaster.create({ title: "Staff Updated", type: "success" });
            } else {
                // Add mode
                result = await businessService.createStaff(businessId, formData);
                toaster.create({ title: "Staff Added", type: "success" });
            }
            onSuccess(result);
            onClose();
        } catch (error) {
            const err = error as { response?: { data?: { message?: string } } };
            toaster.create({
                title: "Error",
                description: err.response?.data?.message || `Failed to ${staff ? 'update' : 'add'} staff`,
                type: "error"
            });
        } finally {
            setIsActionLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(val) => { if (!val) onClose(); }}>
            <DialogContent className="bg-white rounded-3xl sm:max-w-[600px] p-0 overflow-hidden border-none text-left">
                <div className="p-8 space-y-8">
                    <DialogHeader>
                        <DialogTitle className="text-3xl font-extrabold text-gray-900 tracking-tight">
                            {staff ? "Edit Staff" : "Add New Staff"}
                        </DialogTitle>
                        <p className="text-gray-500 font-medium">
                            {staff ? "Update staff details and specialized roles" : "Add new staffs and their specialized roles"}
                        </p>
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
                            onClick={onClose}
                            className="flex-1 h-16 rounded-2xl font-extrabold text-gray-400 hover:text-gray-600 hover:bg-gray-50 text-lg"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSaveStaff}
                            disabled={isActionLoading}
                            className="flex-1 h-16 bg-[#F59E0B] hover:bg-[#D97706] text-white font-extrabold rounded-2xl shadow-xl shadow-[#F59E0B]/20 flex items-center justify-center gap-3 text-lg"
                        >
                            {isActionLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : "Save Staff"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
