'use client';

import { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { FiChevronLeft } from 'react-icons/fi';

import { Button } from "@/components/ui/button";
import CustomInput from '@/components/ui/InputGroup';
import { toaster } from "@/components/ui/toaster";
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/auth.store';

import { useOnboardingStore } from '@/store/onboarding.store';
import { businessService } from '@/services/business.service';
import { determineOnboardingStep } from '@/lib/onboarding-utils';

import Image from 'next/image';

function VerifyEmailContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { login: setAuthStore } = useAuthStore();
    const { setBusinessId, tempCredentials } = useOnboardingStore();
    const email = searchParams.get('email') || '';
    const role = searchParams.get('role') || 'customer';
    const [code, setCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [timeLeft, setTimeLeft] = useState(25);

    useEffect(() => {
        if (timeLeft <= 0) return;
        const timer = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);
        return () => clearInterval(timer);
    }, [timeLeft]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')} left to resend code`;
    };

    const handleVerify = async () => {
        if (!code) {
            toaster.create({ title: "Please enter the verification code", type: "error" });
            return;
        }
        if (!email) {
            toaster.create({ title: "Email not found in URL", type: "error" });
            return;
        }

        setIsLoading(true);
        try {
            await authService.verifyEmail({ email, otp: code });
            toaster.create({ title: "Email verified!", type: "success" });

            // Auto-login: use the stored temp credentials from registration
            if (tempCredentials?.email && tempCredentials?.password) {
                try {
                    const loginData = await authService.login({
                        email: tempCredentials.email,
                        password: tempCredentials.password,
                    });

                    if (loginData.accessToken && loginData.user) {
                        setAuthStore(loginData.user, loginData.accessToken, loginData.refreshToken || '');

                        // Small delay to ensure cookies are set
                        await new Promise(resolve => setTimeout(resolve, 100));

                        // Route based on role
                        if (loginData.user.role === 'customer') {
                            router.push('/');
                        } else if (loginData.user.role === 'admin') {
                            router.push('/admin');
                        } else {
                            // Business role: check onboarding status
                            try {
                                const businesses = await businessService.getMyBusinesses();
                                if (businesses && businesses.length > 0) {
                                    const business = businesses[0];
                                    setBusinessId(business.id);
                                    const nextStep = await determineOnboardingStep(business);
                                    router.push(nextStep);
                                } else {
                                    router.push('/onboarding/business-info');
                                }
                            } catch {
                                router.push('/onboarding/business-info');
                            }
                        }
                        return;
                    }
                } catch (loginError) {
                    console.error('Auto-login failed after verification:', loginError);
                    // Fall through to manual login redirect
                }
            }

            // Fallback: if auto-login fails or no temp credentials, redirect to login
            router.push(`/auth/login?email=${encodeURIComponent(email)}`);

        } catch (error) {
            const err = error as { response?: { data?: { message?: string } } };
            const message = err.response?.data?.message || "Verification failed.";
            toaster.create({ title: "Error", description: message, type: "error" });
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        if (!email) return;
        setIsResending(true);
        try {
            await authService.resendVerification(email);
            toaster.create({ title: "Code sent!", description: "Check your email inbox.", type: "success" });
            setTimeLeft(60);
        } catch (error) {
            const err = error as { response?: { data?: { message?: string } } };
            const message = err.response?.data?.message || "Failed to resend code.";
            toaster.create({ title: "Error", description: message, type: "error" });
        } finally {
            setIsResending(false);
        }
    };

    return (
        <div className="relative min-h-screen w-full overflow-hidden flex items-center justify-center bg-[#D4A373]">
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="/auth-bg.jpg"
                    alt="Auth Background"
                    fill
                    className="object-cover blur-xl"
                    priority
                />
                <div className="absolute inset-0 bg-black/5" />
            </div>
            <div className="relative z-10 w-full max-w-[1440px] px-4 md:px-32 flex flex-col md:flex-row items-center justify-center py-12">
                <div className="w-full flex justify-center">
                    <div className="bg-white rounded-lg shadow-2xl p-8 md:p-12 w-full max-w-lg">
                        <div className="flex flex-col text-center mb-8">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Verify Email Address</h1>
                            <p className="text-sm text-gray-500">
                                A 6 digit code has been sent to your mail
                            </p>
                        </div>

                        <div className="flex flex-col gap-6">
                            <CustomInput
                                type="text"
                                placeholder="enter code"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                className="text-left"
                            />

                            <div className="flex items-center justify-between text-[11px] font-medium">
                                <div className="flex items-center gap-1.5 text-gray-400">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-clock"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                                    {formatTime(timeLeft)}
                                </div>
                                <button
                                    onClick={(e) => { e.preventDefault(); handleResend(); }}
                                    className="text-[#E59622] hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={isResending || timeLeft > 0}
                                >
                                    {isResending ? "Sending..." : "Resend Code"}
                                </button>
                            </div>

                            <Button
                                size="lg"
                                className="w-full h-[56px] rounded-lg bg-[#E59622] text-lg font-bold hover:bg-[#d48a1f] transition-colors text-white mt-4"
                                onClick={handleVerify}
                                disabled={isLoading}
                            >
                                {isLoading ? "Verifying..." : "Verify & Sign In"}
                            </Button>
                            <Link href="/auth/login" className="text-sm text-gray-500 flex items-center justify-center">
                                <FiChevronLeft className="inline-block mr-2" />
                                Back to Login
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
            <VerifyEmailContent />
        </Suspense>
    );
}
