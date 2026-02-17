'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FiMail, FiLock } from 'react-icons/fi';

import { Button } from "@/components/ui/button";
import CustomInput from '@/components/ui/InputGroup';
import { toaster } from "@/components/ui/toaster";
import { authService } from '@/services/auth.service';
import { businessService } from '@/services/business.service';
import { useAuthStore } from '@/store/auth.store';
import { useOnboardingStore } from '@/store/onboarding.store';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { SocialButtons } from '@/components/auth/SocialButtons';
import { determineOnboardingStep } from '@/lib/onboarding-utils';

function LoginContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { login: setAuthStore } = useAuthStore();
    const { setBusinessId } = useOnboardingStore();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const emailParam = searchParams.get('email');
        if (emailParam) {
            setEmail(emailParam);
        }

        // Check if redirected due to token expiration
        const expired = searchParams.get('expired');
        if (expired === 'true') {
            toaster.create({
                title: "Session Expired",
                description: "Your session has expired. Please log in again to continue.",
                type: "warning"
            });
        }
    }, [searchParams]);

    const handleLogin = async () => {
        if (!email || !password) {
            toaster.create({ title: "Please fill all fields", type: "error" });
            return;
        }

        setIsLoading(true);
        try {
            const data = await authService.login({ email, password });

            if (data.accessToken && data.user) {
                // Store user in auth store
                setAuthStore(data.user, data.accessToken, data.refreshToken || '');

                // Small delay to ensure cookies are set before making API calls
                // This is especially important on localhost where cookie setting might be async
                await new Promise(resolve => setTimeout(resolve, 100));

                // Fetch user's businesses
                try {
                    const businesses = await businessService.getMyBusinesses();

                    if (businesses && businesses.length > 0) {
                        const business = businesses[0];
                        setBusinessId(business.id);

                        // Check business status
                        if (business.status === 'REJECTED' || business.status === 'SUSPENDED') {
                            toaster.create({
                                title: "Account Status",
                                description: `Your business is ${business.status.toLowerCase()}. Please contact support.`,
                                type: "error"
                            });
                            return;
                        }

                        // Determine the correct onboarding step based on completion status
                        // Pass the business object directly instead of just the ID to avoid extra API call
                        const nextStep = await determineOnboardingStep(business);
                        router.push(nextStep);
                    } else {
                        // No business found, start onboarding
                        router.push('/onboarding/business-info');
                    }
                } catch (error) {
                    // If we can't fetch businesses, still try to proceed
                    console.error('Failed to fetch businesses:', error);
                    router.push('/onboarding/business-info');
                }

                toaster.create({ title: "Login successful", type: "success" });
            } else {
                toaster.create({ title: "Login failed", description: "Invalid response from server", type: "error" });
            }

        } catch (error) {
            const err = error as { response?: { data?: { message?: string } } };
            const message = err.response?.data?.message || "Invalid credentials. Please try again.";
            toaster.create({ title: "Login failed", description: message, type: "error" });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout>
            <div className="flex flex-col text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
                <p className="text-sm text-gray-500">
                    Don&apos;t have an account?{' '}
                    <Link href="/auth/register" className="text-[#E59622] hover:underline">
                        Create one
                    </Link>
                </p>
            </div>

            <div className="flex flex-col gap-6">
                <CustomInput
                    label="Email"
                    type="email"
                    placeholder="example@example.com"
                    leftIcon={FiMail}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <div className="flex flex-col gap-2">
                    <CustomInput
                        label="Password"
                        type="password"
                        placeholder="********"
                        leftIcon={FiLock}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    <div className="flex items-center justify-between mt-2">
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <div className="relative flex items-center">
                                <input
                                    type="checkbox"
                                    className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-gray-300 transition-all checked:bg-[#E59622] checked:border-[#E59622]"
                                />
                                <svg
                                    className="absolute h-3.5 w-3.5 text-white opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                            </div>
                            <span className="text-sm text-gray-500 group-hover:text-gray-700 transition-colors">Remember me</span>
                        </label>
                        <Link href="/auth/forgot-password" title="forgot password?" className="text-sm text-[#E59622] hover:underline">
                            Forgot password?
                        </Link>
                    </div>
                </div>

                <Button
                    size="lg"
                    className="w-full h-[56px] rounded-lg bg-[#E59622] text-lg font-bold hover:bg-[#d48a1f] transition-colors text-white mt-4"
                    onClick={handleLogin}
                    disabled={isLoading}
                >
                    {isLoading ? "Signing in..." : "Sign In"}
                </Button>

                <SocialButtons />
            </div>
        </AuthLayout>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
            <LoginContent />
        </Suspense>
    );
}
