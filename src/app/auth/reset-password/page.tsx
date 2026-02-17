'use client';

import { useState, useEffect, Suspense } from 'react';

import { useRouter, useSearchParams } from 'next/navigation';
import { FiLock, FiCheckCircle } from 'react-icons/fi';

import { Button } from "@/components/ui/button";
import CustomInput from '@/components/ui/InputGroup';
import { cn } from '@/lib/utils';
import { authService } from '@/services/auth.service';
import { toaster } from "@/components/ui/toaster";
import Image from 'next/image';

function ResetPasswordContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const email = searchParams.get('email') || '';
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [strength, setStrength] = useState({
        length: false,
        number: false,
        special: false,
    });

    useEffect(() => {
        setStrength({
            length: password.length >= 8,
            number: /\d/.test(password),
            special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
        });
    }, [password]);

    const handleReset = async () => {
        if (!otp || !password || !confirmPassword) {
            toaster.create({ title: "Please fill all fields", type: "error" });
            return;
        }

        if (password !== confirmPassword) {
            toaster.create({ title: "Passwords do not match", type: "error" });
            return;
        }

        if (!strength.length || !strength.number || !strength.special) {
            toaster.create({ title: "Password does not meet requirements", type: "error" });
            return;
        }

        setIsLoading(true);
        try {
            await authService.resetPassword({
                email,
                otp,
                password: password
            });
            toaster.create({ title: "Password reset successful", description: "You can now login with your new password.", type: "success" });
            setIsSuccess(true);
        } catch (error) {
            const err = error as { response?: { data?: { message?: string } } };
            const message = err.response?.data?.message || "Reset password failed.";
            toaster.create({ title: "Error", description: message, type: "error" });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen w-full overflow-hidden flex items-center justify-center bg-[#D4A373]">
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="/auth-bg.jpg" // We'll save the generated image here
                    alt="Auth Background"
                    fill
                    className="object-cover blur-xl"
                    priority
                />
                {/* Semi-transparent overlay to match the warm tone in the screenshot if needed */}
                <div className="absolute inset-0 bg-black/5" />
            </div>

            <div className="relative z-10 w-full max-w-[1440px] px-4 md:px-32 flex items-center justify-center min-h-screen py-12">
                <div className="w-full flex justify-center">
                    <div className="bg-white rounded-lg shadow-2xl p-8 md:p-12 w-full max-w-lg">

                        {isSuccess ? (
                            <div className="flex flex-col items-center text-center">
                                <div className="flex justify-center mb-8">
                                    <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center">
                                        <FiCheckCircle className="h-12 w-12 text-green-500" />
                                    </div>
                                </div>
                                <h1 className="text-3xl font-bold text-gray-900 mb-4">Password Reset Successful</h1>
                                <p className="text-gray-500 font-medium mb-10">
                                    Your password has been successfully reset. You can now log in to your account with your new password.
                                </p>
                                <Button
                                    size="lg"
                                    className="w-full h-[56px] rounded-lg bg-[#E59622] text-lg font-bold hover:bg-[#d48a1f] transition-colors text-white"
                                    onClick={() => router.push(`/auth/login?email=${encodeURIComponent(email)}`)}
                                >
                                    Back to Login
                                </Button>
                            </div>
                        ) : (
                            <>
                                <div className="flex flex-col text-center mb-8">
                                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Password</h1>
                                    <p className="text-sm text-gray-500">
                                        Your password must be different from previous passwords
                                    </p>
                                </div>

                                <div className="flex flex-col gap-5">
                                    <CustomInput
                                        label="OTP"
                                        type="text"
                                        placeholder="Enter otp"
                                        leftIcon={FiLock}
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                    />

                                    <CustomInput
                                        label="New Password"
                                        type="password"
                                        placeholder="Enter new password"
                                        leftIcon={FiLock}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />

                                    <div className="flex items-start gap-2">
                                        <FiCheckCircle className={cn("h-4 w-4 mt-0.5 shrink-0", (strength.length && strength.number && strength.special) ? "text-green-500" : "text-gray-300")} />
                                        <p className="text-xs text-gray-500 leading-tight">
                                            At least 8 characters, Contains a number and a special charachter
                                        </p>
                                    </div>

                                    <CustomInput
                                        label="Confirm New Password"
                                        type="password"
                                        placeholder="Re-enter new password"
                                        leftIcon={FiLock}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                    />

                                    <Button
                                        size="lg"
                                        className="w-full h-[56px] rounded-lg bg-[#E59622] text-lg font-bold hover:bg-[#d48a1f] transition-colors text-white mt-4"
                                        onClick={handleReset}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? "Resetting..." : "Reset password and sign in"}
                                    </Button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
            <ResetPasswordContent />
        </Suspense>
    );
}
