"use client";

import { useState } from "react";
import { Lock, Eye, EyeOff, CheckCircle2, Loader2, RefreshCcw } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { userService } from "@/services/user.service";
import { toaster } from "@/components/ui/toaster";

interface ChangePasswordModalProps {
    open: boolean;
    onClose: () => void;
}

export function ChangePasswordModal({ open, onClose }: ChangePasswordModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);

    const [formData, setFormData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleUpdatePassword = async () => {
        if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
            toaster.create({ title: "Please fill in all fields", type: "error" });
            return;
        }

        if (formData.newPassword.length < 8) {
            toaster.create({ title: "New password must be at least 8 characters", type: "error" });
            return;
        }

        if (formData.newPassword !== formData.confirmPassword) {
            toaster.create({ title: "Passwords do not match", type: "error" });
            return;
        }

        setIsLoading(true);
        try {
            await userService.changePassword({
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword,
            });
            toaster.create({ title: "Password updated successfully", type: "success" });
            // Reset form
            setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
            onClose();
        } catch (error: any) {
            toaster.create({
                title: "Failed to update password",
                description: error?.response?.data?.message || "Please check your current password and try again.",
                type: "error"
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
            <DialogContent className="sm:max-w-[480px] p-8 rounded-[24px] border border-gray-100 shadow-xl bg-white">
                {/* Header */}
                <div className="space-y-4 mb-2">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-[#FFF6ED] rounded-md flex items-center justify-center relative">
                                <RefreshCcw className="w-6 h-6 text-[#E89D24] absolute" />
                                <Lock className="w-3 h-3 text-[#E89D24] absolute z-10 fill-current bg-[#FFF6ED]" />
                            </div>
                            <h2 className="text-xl font-bold text-[#1F2937]">Security Settings</h2>
                        </div>
                        <p className="text-gray-500 text-sm">
                            Update your password and provide your 2FA code to secure your account.
                        </p>
                    </div>
                </div>

                {/* Form */}
                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-[#374151]">Current Password</label>
                        <div className="relative">
                            <input
                                type={showCurrentPassword ? "text" : "password"}
                                name="currentPassword"
                                value={formData.currentPassword}
                                onChange={handleInputChange}
                                placeholder="Enter your current password"
                                className="w-full h-12 px-4 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#E89D24]/20 focus:border-[#E89D24] transition-all font-medium text-gray-700 placeholder:text-gray-400 pr-12 text-[15px]"
                            />
                            <button
                                type="button"
                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                            >
                                {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-[#374151]">New Password</label>
                            <input
                                type="password"
                                name="newPassword"
                                value={formData.newPassword}
                                onChange={handleInputChange}
                                placeholder="Min. 8 characters"
                                className="w-full h-12 px-4 rounded-md border border-gray-200 focus:outline-none focus:ring-0 text-gray-700 placeholder:text-gray-400 text-[15px]"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-[#374151]">Confirm New Password</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                                placeholder="Repeat password"
                                className="w-full h-12 px-4 rounded-md border border-gray-200 focus:outline-none focus:ring-0 text-gray-700 placeholder:text-gray-400 text-[15px]"
                            />
                        </div>
                    </div>

                    <div className="pt-6 flex flex-col gap-2">
                        <Button
                            onClick={handleUpdatePassword}
                            disabled={isLoading}
                            className="w-full h-[52px] bg-[#E89D24] hover:bg-[#D58C1B] text-white font-semibold rounded-md shadow-md text-base flex flex-row items-center justify-center gap-2 transition-colors"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <CheckCircle2 className="w-5 h-5 bg-transparent" />
                                    Update Password
                                </>
                            )}
                        </Button>
                        <button
                            onClick={onClose}
                            className="w-full h-12 font-medium text-gray-600 hover:text-gray-900 transition-colors text-base"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
