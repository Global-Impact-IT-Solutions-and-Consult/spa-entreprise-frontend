"use client";

import { useState } from "react";
import { Trash2, AlertTriangle, Loader2, X, AlertCircle, Eye, EyeOff } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { userService } from "@/services/user.service";
import { useAuthStore } from "@/store/auth.store";
import { toaster } from "@/components/ui/toaster";
import { useRouter } from "next/navigation";
import { handleApiError } from "@/lib/api";

interface DeleteAccountModalProps {
    open: boolean;
    onClose: () => void;
}

export function DeleteAccountModal({ open, onClose }: DeleteAccountModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [confirmationText, setConfirmationText] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const { logout } = useAuthStore();
    const router = useRouter();

    const handleDeleteAccount = async () => {
        if (confirmationText !== "DELETE") {
            toaster.create({ 
                title: "Invalid confirmation", 
                description: "Please type DELETE in all caps to confirm.", 
                type: "error" 
            });
            return;
        }

        setIsLoading(true);
        try {
            await userService.deleteAccount({
                confirmationText: "DELETE",
                currentPassword: password || undefined,
            });
            
            toaster.create({ 
                title: "Account deleted", 
                description: "Your account has been permanently removed.", 
                type: "success" 
            });
            
            // Log out and redirect
            logout();
            router.push("/");
            onClose();
        } catch (error: any) {
            handleApiError(error, "Deletion Failed");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
            <DialogContent className="sm:max-w-[480px] p-8 rounded-[24px] border border-red-100 shadow-xl bg-white">
                {/* Header */}
                <div className="space-y-2 mb-2">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center">
                            <h2 className="text-xl font-bold text-gray-900 font-inter">Delete Account</h2>
                        </div>

                        <div className="p-4 px-2 bg-red-50 border-l-4 border-red-500 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4 text-red-500" />
                            <p className="text-sm text-red-700">
                                Are you sure you want to Delete this account?
                            </p>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <div className="space-y-4">

                    <div className="space-y-2">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Confirm by typing <span className="text-red-600">DELETE</span></label>
                            <input
                                type="text"
                                value={confirmationText}
                                onChange={(e) => setConfirmationText(e.target.value)}
                                placeholder="TYPE DELETE"
                                className="w-full h-12 px-4 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all font-normal text-gray-900"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Enter your password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Your current password"
                                    className="w-full h-12 px-4 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all font-normal text-gray-900 pr-12"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                    </div>

                    <p className="text-xs text-gray-500">This action will soft delete your account, and permanently delete after 30 days from deleteion </p>

                    <div className="flex flex-col gap-3">
                        <Button
                            onClick={handleDeleteAccount}
                            disabled={isLoading || confirmationText !== "DELETE"}
                            className="w-full h-[52px] bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition-all"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <Trash2 className="w-5 h-5" />
                                    Delete My Account
                                </>
                            )}
                        </Button>
                        <button
                            onClick={onClose}
                            className="w-full h-12 font-medium text-gray-500 hover:text-gray-800 transition-colors text-base"
                        >
                            Cancel, keep my account
                        </button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
