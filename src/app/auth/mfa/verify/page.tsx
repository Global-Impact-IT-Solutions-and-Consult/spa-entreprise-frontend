'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FiShield, FiArrowRight } from 'react-icons/fi';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toaster } from "@/components/ui/toaster";
import { authService } from '@/services/auth.service';

function MfaVerifyContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get('email');

    const [otp, setOtp] = useState('');
    const [password, setPassword] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);

    const handleVerify = async () => {
        if (!otp || otp.length < 6) {
            toaster.create({ title: "Invalid code", description: "Please enter a valid 6-digit code.", type: "error" });
            return;
        }
        if (!email) {
            toaster.create({ title: "Session Error", description: "Email not found. Please login again.", type: "error" });
            router.push('/auth/login');
            return;
        }
        if (!password) {
            toaster.create({ title: "Password Required", description: "Please enter your password to confirm identity.", type: "error" });
            return;
        }

        setIsVerifying(true);
        try {
            await authService.verifyMfaLogin({ email, password, mfaCode: otp });

            toaster.create({ title: "Verification successful", type: "success" });
            router.push('/');
        } catch (error: any) {
            const message = error.response?.data?.message || "Verification failed. Please try again.";
            toaster.create({ title: "Error", description: message, type: "error" });
        } finally {
            setIsVerifying(false);
        }
    };

    return (
        <div className="flex w-full flex-col items-center gap-6">
            <FiShield className="h-12 w-12 text-teal-500" />

            <div className="text-center">
                <h2 className="mb-2 text-xl font-bold text-gray-900">Two-Factor Authentication</h2>
                <p className="text-gray-500">
                    Enter your password and the 6-digit code from your authenticator app.
                </p>
            </div>

            <div className="w-full space-y-4">
                <Input
                    placeholder="Enter your password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <Input
                    placeholder="Enter 6-digit code"
                    className="text-center text-lg tracking-widest"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={6}
                />
            </div>

            <Button
                size="lg"
                className="w-full bg-[#2D5B5E] hover:bg-[#254E50]"
                onClick={handleVerify}
                disabled={isVerifying}
            >
                {isVerifying ? "Verifying..." : (
                    <>
                        Verify <FiArrowRight className="ml-2" />
                    </>
                )}
            </Button>

            <Button
                variant="ghost"
                size="sm"
                className="text-gray-500 hover:text-gray-900"
                onClick={() => router.push('/auth/login')}
            >
                Back to Login
            </Button>
        </div>
    );
}

export default function MfaVerifyPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
            <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
                <Suspense fallback={<div className="text-center">Loading...</div>}>
                    <MfaVerifyContent />
                </Suspense>
            </div>
        </div>
    );
}
