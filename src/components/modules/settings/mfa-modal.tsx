"use client";

import { useState, useEffect } from "react";
import { Shield, Loader2, CheckCircle2, AlertCircle, Copy, Check } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { authService } from "@/services/auth.service";
import { toaster } from "@/components/ui/toaster";
import { handleApiError } from "@/lib/api";

interface MFAModalProps {
    open: boolean;
    onClose: () => void;
    mode: "enable" | "disable";
    onSuccess: () => void;
}

export function MFAModal({ open, onClose, mode, onSuccess }: MFAModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [setupData, setSetupData] = useState<{ qrCode: string; secret: string; backupCodes: string[] } | null>(null);
    const [otp, setOtp] = useState("");
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (open && mode === "enable" && !setupData) {
            handleGetSetup();
        }
    }, [open, mode]);

    const handleGetSetup = async () => {
        setIsLoading(true);
        try {
            const data = await authService.setupMfa();
            setSetupData(data);
        } catch (error: any) {
            handleApiError(error, "Setup Failed");
            onClose();
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyAndEnable = async () => {
        if (!otp || otp.length !== 6) {
            toaster.create({ title: "Please enter a valid 6-digit code", type: "error" });
            return;
        }

        setIsLoading(true);
        try {
            await authService.enableMfa(otp);
            toaster.create({ title: "MFA enabled successfully", type: "success" });
            onSuccess();
            onClose();
        } catch (error: any) {
            handleApiError(error, "Verification Failed");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDisable = async () => {
        if (!otp || otp.length !== 6) {
            toaster.create({ title: "Please enter your 6-digit code to disable MFA", type: "error" });
            return;
        }

        setIsLoading(true);
        try {
            await authService.disableMfa(otp);
            toaster.create({ title: "MFA disabled successfully", type: "success" });
            onSuccess();
            onClose();
        } catch (error: any) {
            handleApiError(error, "Disable Failed");
        } finally {
            setIsLoading(false);
        }
    };

    const copyToClipboard = () => {
        if (!setupData?.secret) return;
        navigator.clipboard.writeText(setupData.secret);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
            <DialogContent className="sm:max-w-[480px] p-8 rounded-[24px] border border-gray-100 shadow-xl bg-white">
                {/* Header */}
                <div className="space-y-4 mb-2">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[#FFF6ED] rounded-full flex items-center justify-center">
                                <Shield className="w-6 h-6 text-[#E89D24]" />
                            </div>
                            <h2 className="text-xl font-bold text-[#1F2937]">
                                {mode === "enable" ? "Set up Two-Factor Authentication" : "Disable MFA"}
                            </h2>
                        </div>
                        <p className="text-gray-500 text-sm">
                            {mode === "enable" 
                                ? "Scan the QR code with your authenticator app to get started." 
                                : "Enter the 6-digit code from your app to disable MFA."}
                        </p>
                    </div>
                </div>

                {/* Content */}
                <div className="space-y-6 mt-4">
                    {mode === "enable" && (
                        <>
                            <div className="flex justify-center p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                {isLoading && !setupData ? (
                                    <div className="h-[200px] flex items-center justify-center">
                                        <Loader2 className="w-8 h-8 animate-spin text-[#E89D24]" />
                                    </div>
                                ) : (
                                    setupData?.qrCode && (
                                        <img 
                                            src={setupData.qrCode} 
                                            alt="MFA QR Code" 
                                            className="w-[200px] h-[200px] rounded-lg shadow-sm bg-white p-2"
                                        />
                                    )
                                )}
                            </div>

                            <div className="space-y-2">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Manual Setup Key</p>
                                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-100 group">
                                    <code className="text-sm font-mono text-gray-700 flex-1 break-all">
                                        {setupData?.secret || "••••••••••••••••"}
                                    </code>
                                    <button 
                                        onClick={copyToClipboard}
                                        className="p-1.5 hover:bg-white rounded-md transition-colors text-gray-400 hover:text-[#E89D24]"
                                    >
                                        {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                        </>
                    )}

                    <div className="space-y-3">
                        <label className="text-sm font-bold text-gray-700">Verification Code</label>
                        <input
                            type="text"
                            maxLength={6}
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                            placeholder="000000"
                            className="w-full h-14 text-center text-2xl font-bold tracking-[0.5em] rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#E89D24]/20 focus:border-[#E89D24] transition-all placeholder:text-gray-200"
                        />
                    </div>

                    <div className="pt-4 flex flex-col gap-3">
                        <Button
                            onClick={mode === "enable" ? handleVerifyAndEnable : handleDisable}
                            disabled={isLoading || otp.length !== 6}
                            className="w-full h-[56px] bg-[#E89D24] hover:bg-[#D58C1B] text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition-all text-lg"
                        >
                            {isLoading ? (
                                <Loader2 className="w-6 h-6 animate-spin" />
                            ) : (
                                <>
                                    <CheckCircle2 className="w-6 h-6" />
                                    {mode === "enable" ? "Verify & Activate" : "Confirm Disable"}
                                </>
                            )}
                        </Button>
                        <button
                            onClick={onClose}
                            className="w-full h-12 font-medium text-gray-500 hover:text-gray-800 transition-colors text-base"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
