"use client";

import { useState, useRef } from "react";
import { Lock, Eye, EyeOff, CheckCircle2, Loader2, RefreshCcw } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { userService } from "@/services/user.service";
import { toaster } from "@/components/ui/toaster";
import { handleApiError } from "@/lib/api";

interface ChangePasswordModalProps {
    open: boolean;
    onClose: () => void;
    mfaEnabled?: boolean;
}

export function ChangePasswordModal({ open, onClose, mfaEnabled = false }: ChangePasswordModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);

    const [formData, setFormData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const [mfaCode, setMfaCode] = useState<string[]>(Array(6).fill(""));
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleMfaChange = (index: number, val: string) => {
        if (!/^\d*$/.test(val)) return;
        const newCode = [...mfaCode];
        newCode[index] = val.slice(-1);
        setMfaCode(newCode);

        // Auto focus next
        if (val && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleMfaKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !mfaCode[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleMfaPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text/plain').replace(/\D/g, '').slice(0, 6);
        if (pastedData) {
            const newCode = [...mfaCode];
            for (let i = 0; i < pastedData.length; i++) {
                newCode[i] = pastedData[i];
            }
            setMfaCode(newCode);
            const nextIndex = Math.min(pastedData.length, 5);
            inputRefs.current[nextIndex]?.focus();
        }
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

        const fullMfaCode = mfaCode.join("");
        if (mfaEnabled && fullMfaCode.length !== 6) {
            toaster.create({ title: "Please enter a complete 6-digit MFA code", type: "error" });
            return;
        }

        setIsLoading(true);
        try {
            await userService.changePassword({
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword,
                ...(mfaEnabled && { mfaCode: fullMfaCode }),
            });
            toaster.create({ title: "Password updated successfully", type: "success" });
            // Reset form
            setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
            setMfaCode(Array(6).fill(""));
            onClose();
        } catch (error: any) {
            handleApiError(error, "Update Failed");
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

                    {/* TWO-FACTOR AUTHENTICATION SECTION */}
                    {mfaEnabled && (
                        <div className="pt-2">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="h-px bg-gray-200 flex-1"></div>
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                    Two-Factor Authentication
                                </span>
                                <div className="h-px bg-gray-200 flex-1"></div>
                            </div>

                            <div className="bg-[#F8FAFC] p-6 rounded-xl border border-gray-100 flex flex-col items-center">
                                <h3 className="text-[15px] font-bold text-[#1F2937] mb-1">Verification Code</h3>
                                <p className="text-sm text-gray-500 mb-4 text-center">
                                    Enter the 6-digit code from your authenticator app.
                                </p>
                                
                                <div className="flex items-center justify-center gap-2">
                                    {[0, 1, 2].map((i) => (
                                        <input
                                            key={i}
                                            ref={(el) => { inputRefs.current[i] = el; }}
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={1}
                                            value={mfaCode[i]}
                                            onChange={(e) => handleMfaChange(i, e.target.value)}
                                            onKeyDown={(e) => handleMfaKeyDown(i, e)}
                                            onPaste={handleMfaPaste}
                                            className="w-12 h-14 text-center text-xl font-bold rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#E89D24]/20 focus:border-[#E89D24] transition-all bg-white"
                                        />
                                    ))}
                                    <span className="text-gray-300 font-bold mx-1">-</span>
                                    {[3, 4, 5].map((i) => (
                                        <input
                                            key={i}
                                            ref={(el) => { inputRefs.current[i] = el; }}
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={1}
                                            value={mfaCode[i]}
                                            onChange={(e) => handleMfaChange(i, e.target.value)}
                                            onKeyDown={(e) => handleMfaKeyDown(i, e)}
                                            onPaste={handleMfaPaste}
                                            className="w-12 h-14 text-center text-xl font-bold rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#E89D24]/20 focus:border-[#E89D24] transition-all bg-white"
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="pt-2 flex flex-col gap-2">
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
