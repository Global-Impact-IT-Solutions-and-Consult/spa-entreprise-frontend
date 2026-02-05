'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FiMail, FiLock } from 'react-icons/fi';

import { Button } from "@/components/ui/button";
import CustomInput from '@/components/ui/InputGroup';
import { toaster } from "@/components/ui/toaster";
import { authService } from '@/services/auth.service';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { SocialButtons } from '@/components/auth/SocialButtons';

function LoginContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const emailParam = searchParams.get('email');
        if (emailParam) {
            setEmail(emailParam);
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

            toaster.create({ title: "Login successful", type: "success" });

            if (data.user?.businesses && data.user.businesses.length > 0) {
                router.push('/dashboard');
            } else {
                router.push('/onboarding/business-info');
            }

        } catch (error: any) {
            const message = error.response?.data?.message || "Invalid credentials. Please try again.";
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
                    Don't have an account?{' '}
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
