"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Loader2, Scissors, Upload, X, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Select as CustomSelect } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { businessService, Staff, Service, CreateStaffDto } from "@/services/business.service";
import { toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";

const experienceLevels = [
    { label: "Select experience level", value: "" },
    { label: "Junior", value: "Junior" },
    { label: "Intermediate", value: "Intermediate" },
    { label: "Expert", value: "Expert" },
];

interface StaffModalProps {
    businessId: string;
    staff: Staff | null;
    services: Service[];
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (staff: Staff) => void;
}

export const StaffModal = ({ businessId, staff, services, isOpen, onClose, onSuccess }: StaffModalProps) => {
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState<CreateStaffDto>({
        name: "",
        role: "",
        experience: "",
        phone: "",
        about: "",
        serviceIds: [],
    });

    useEffect(() => {
        if (staff && isOpen) {
            setFormData({
                name: staff.name,
                role: staff.role,
                experience: staff.experience,
                phone: staff.phone ?? "",
                about: staff.about ?? "",
                serviceIds: staff.serviceIds || [],
            });
            setImagePreview(staff.profilePicture ?? null);
            setImageFile(null);
        } else if (!staff && isOpen) {
            setFormData({ name: "", role: "", experience: "", phone: "", about: "", serviceIds: [] });
            setImagePreview(null);
            setImageFile(null);
        }
    }, [staff, isOpen]);

    const handleFileSelect = useCallback((file: File) => {
        if (!file.type.match(/^image\/(jpeg|png|webp)$/)) {
            toaster.create({ title: "Invalid file type", description: "Please upload JPG, PNG, or WEBP", type: "error" });
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toaster.create({ title: "File too large", description: "Max file size is 5MB", type: "error" });
            return;
        }
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    }, []);

    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFileSelect(file);
    }, [handleFileSelect]);

    const handleServiceToggle = (serviceId: string) => {
        setFormData(prev => ({
            ...prev,
            serviceIds: prev.serviceIds.includes(serviceId)
                ? prev.serviceIds.filter(id => id !== serviceId)
                : [...prev.serviceIds, serviceId],
        }));
    };

    const handleSaveStaff = async () => {
        if (!businessId) return;
        if (!formData.name || !formData.role || !formData.experience || formData.serviceIds.length === 0) {
            toaster.create({ title: "Validation Error", description: "Name, role, experience and at least one service are required", type: "error" });
            return;
        }

        setIsActionLoading(true);
        try {
            let result: Staff;

            // Base payload — strip empty optional strings
            const basePayload: CreateStaffDto = {
                name: formData.name,
                role: formData.role,
                experience: formData.experience,
                serviceIds: formData.serviceIds,
                ...(formData.phone ? { phone: formData.phone } : {}),
                ...(formData.about ? { about: formData.about } : {}),
            };

            if (staff) {
                // --- EDIT MODE ---
                let profilePictureUrl: string | undefined;

                // Step 1: Upload image first (we already have staffId)
                if (imageFile) {
                    try {
                        const uploadRes = await businessService.uploadStaffProfilePicture(businessId, staff.id, imageFile);
                        profilePictureUrl = uploadRes.profilePicture;
                    } catch {
                        toaster.create({ title: "Image upload failed", description: "Profile picture could not be uploaded", type: "error" });
                    }
                }

                // Step 2: Update staff, including profilePicture URL if we got one
                result = await businessService.updateStaff(businessId, staff.id, {
                    ...basePayload,
                    ...(profilePictureUrl ? { profilePicture: profilePictureUrl } : {}),
                });
                toaster.create({ title: "Staff Updated", type: "success" });

            } else {
                // --- CREATE MODE ---
                // Step 1: Create staff
                result = await businessService.createStaff(businessId, basePayload);

                // Step 2: Upload picture (now we have the staffId)
                if (imageFile && result.id) {
                    try {
                        const uploadRes = await businessService.uploadStaffProfilePicture(businessId, result.id, imageFile);

                        // Step 3: Update staff with the profile picture URL
                        result = await businessService.updateStaff(businessId, result.id, {
                            ...basePayload,
                            profilePicture: uploadRes.profilePicture,
                        });
                    } catch {
                        toaster.create({ title: "Image upload failed", description: "Staff saved, but profile picture could not be uploaded", type: "error" });
                    }
                }

                toaster.create({ title: "Staff Added", type: "success" });
            }

            onSuccess(result);
            onClose();
        } catch (error) {
            const err = error as { response?: { data?: { message?: string } } };
            toaster.create({
                title: "Error",
                description: err.response?.data?.message || `Failed to ${staff ? "update" : "add"} staff`,
                type: "error",
            });
        } finally {
            setIsActionLoading(false);
        }
    };


    return (
        <Dialog open={isOpen} onOpenChange={(val) => { if (!val) onClose(); }}>
            <DialogContent className="bg-white rounded-2xl sm:max-w-[560px] p-0 overflow-hidden border-none text-left">
                <div className="p-6 space-y-5">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-gray-900">
                            {staff ? "Edit Staff" : "Add New Staff"}
                        </DialogTitle>
                        <p className="text-xs font-normal text-gray-500">
                            {staff ? "Update staff details and specialized roles" : "Add new staffs and their specialized roles"}
                        </p>
                    </DialogHeader>

                    <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1 custom-scrollbar">
                        {/* Display Image */}
                        <div className="space-y-1.5">
                            <Label className="text-sm font-normal text-gray-500">Display Image</Label>
                            <div
                                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                                onDragLeave={() => setIsDragging(false)}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                                className={cn(
                                    "relative border-2 border-dashed rounded flex items-center justify-center cursor-pointer transition-colors h-20",
                                    isDragging ? "border-[#E59622] bg-amber-50" : "border-gray-200 hover:border-gray-300 bg-white"
                                )}
                            >
                                {imagePreview ? (
                                    <>
                                        <img src={imagePreview} alt="Preview" className="h-full w-full object-cover rounded-xl" />
                                        <button
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); setImageFile(null); setImagePreview(null); }}
                                            className="absolute top-2 right-2 h-6 w-6 bg-white rounded-full shadow flex items-center justify-center hover:bg-red-50"
                                        >
                                            <X className="h-3 w-3 text-gray-500" />
                                        </button>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center gap-2 text-gray-400">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 bg-gray-50 rounded-lg flex items-center justify-center">
                                                <Upload className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <span className="text-xs text-gray-500">Drag and Drop Here</span>
                                            <span className="text-sm text-gray-700 bg-gray-100 px-3 py-1 rounded-full font-medium hover:bg-gray-200 transition-colors">
                                                Choose file
                                            </span>
                                        </div>
                                    </div>
                                )}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    className="hidden"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) handleFileSelect(file);
                                    }}
                                />
                            </div>
                            <p className="text-xs text-gray-400">JPG, PNG, WEBP up to 5MB</p>
                        </div>

                        {/* Staff Name */}
                        <div className="space-y-1.5">
                            <Label className="text-sm font-normal text-gray-500">Staff Name</Label>
                            <Input
                                placeholder="John Doe"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="h-12 border border-gray-200 rounded text-gray-900 px-4"
                            />
                        </div>

                        {/* Phone Number */}
                        <div className="space-y-1.5">
                            <Label className="text-sm font-normal text-gray-500">Phone Number</Label>
                            <Input
                                placeholder="+234 800 0000 000"
                                value={formData.phone ?? ""}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="h-12 border border-gray-200 rounded text-gray-900 px-4"
                            />
                        </div>

                        {/* About Staff */}
                        <div className="space-y-1.5">
                            <Label className="text-sm font-normal text-gray-500">About Staff</Label>
                            <Textarea
                                placeholder="Specializes in skin fades, traditional straight razor shaves, and beard artistry."
                                value={formData.about ?? ""}
                                onChange={(e) => setFormData({ ...formData, about: e.target.value })}
                                className="border border-gray-200 rounded text-gray-900 px-4 py-3 min-h-[80px] resize-none"
                            />
                        </div>

                        {/* Role */}
                        <div className="space-y-1.5">
                            <Label className="text-sm font-normal text-gray-500">Role</Label>
                            <Input
                                placeholder="Hair Stylist"
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                className="h-12 border border-gray-200 rounded text-gray-900 px-4"
                            />
                        </div>

                        {/* Staff Experience */}
                        <div className="space-y-1.5">
                            <Label className="text-sm font-normal text-gray-500">Staff Experience</Label>
                            <CustomSelect
                                value={formData.experience}
                                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                                options={experienceLevels}
                                placeholder="Select experience level"
                                className="h-12 border border-gray-200 rounded text-gray-900 px-4"
                            />
                        </div>

                        {/* Services Associated To */}
                        {services.length > 0 && (
                            <div className="space-y-2">
                                <Label className="text-sm font-normal text-gray-500">Services Associated To</Label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {services.map((service) => {
                                        const isChecked = formData.serviceIds.includes(service.id);
                                        return (
                                            <div
                                                key={service.id}
                                                onClick={() => handleServiceToggle(service.id)}
                                                className="flex items-center gap-3 p-3 rounded border border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors"
                                            >
                                                <div className="h-9 w-9 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                                                    <Scissors className="h-4 w-4 text-blue-400" />
                                                </div>
                                                <span className="flex-1 text-sm font-medium text-gray-900 truncate">{service.name}</span>
                                                <Checkbox
                                                    checked={isChecked}
                                                    onCheckedChange={() => handleServiceToggle(service.id)}
                                                    className="h-4 w-4 border-2 border-gray-400 data-[state=checked]:bg-[#E59622] data-[state=checked]:border-[#E59622] rounded"
                                                />
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <Button
                            variant="outline"
                            onClick={onClose}
                            className="flex-1 h-12 rounded-xl font-semibold text-gray-600 border-gray-200 hover:bg-gray-50"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSaveStaff}
                            disabled={isActionLoading}
                            className="flex-1 h-12 bg-[#E59622] hover:bg-[#d48a1f] text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-2"
                        >
                            {isActionLoading
                                ? <Loader2 className="h-5 w-5 animate-spin" />
                                : staff ? "Update Staff" : "Add Staff"
                            }
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
