'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Cookies from 'js-cookie';
import { toaster } from "@/components/ui/toaster";

function CallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

    useEffect(() => {
        const handleCallback = async () => {
            try {
                // Get tokens from URL params (assuming backend redirects with tokens)
                const accessToken = searchParams.get('accessToken');
                const refreshToken = searchParams.get('refreshToken');
                const error = searchParams.get('error');

                if (error) {
                    setStatus('error');
                    toaster.create({
                        title: "Authentication failed",
                        description: error || "Google authentication failed. Please try again.",
                        type: "error"
                    });
                    setTimeout(() => router.push('/auth/login'), 2000);
                    return;
                }

                if (accessToken && refreshToken) {
                    // Store tokens
                    Cookies.set('accessToken', accessToken, { secure: true, sameSite: 'strict' });
                    Cookies.set('refreshToken', refreshToken, { secure: true, sameSite: 'strict' });

                    setStatus('success');
                    toaster.create({
                        title: "Login successful",
                        description: "Redirecting to dashboard...",
                        type: "success"
                    });

                    // Redirect to dashboard (or onboarding if needed - we'll check businesses later)
                    setTimeout(() => router.push('/dashboard'), 1000);
                } else {
                    setStatus('error');
                    toaster.create({
                        title: "Authentication failed",
                        description: "Invalid response from server. Please try again.",
                        type: "error"
                    });
                    setTimeout(() => router.push('/auth/login'), 2000);
                }
            } catch (error) {
                console.error('OAuth callback error:', error);
                setStatus('error');
                toaster.create({
                    title: "Error",
                    description: "An error occurred during authentication.",
                    type: "error"
                });
                setTimeout(() => router.push('/auth/login'), 2000);
            }
        };

        handleCallback();
    }, [searchParams, router]);

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
            <div className="text-center">
                {status === 'loading' && (
                    <>
                        <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-[#2D5B5E] mx-auto"></div>
                        <p className="text-gray-600">Completing authentication...</p>
                    </>
                )}
                {status === 'success' && (
                    <>
                        <div className="mb-4 text-green-500">
                            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <p className="text-gray-600">Authentication successful! Redirecting...</p>
                    </>
                )}
                {status === 'error' && (
                    <>
                        <div className="mb-4 text-red-500">
                            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <p className="text-gray-600">Authentication failed. Redirecting...</p>
                    </>
                )}
            </div>
        </div>
    );
}

export default function GoogleCallbackPage() {
    return (
        <Suspense fallback={
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-[#2D5B5E]"></div>
            </div>
        }>
            <CallbackContent />
        </Suspense>
    );
}
