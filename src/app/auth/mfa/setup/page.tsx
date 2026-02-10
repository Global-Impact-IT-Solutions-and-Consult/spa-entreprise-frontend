'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { FiSmartphone, FiArrowRight } from 'react-icons/fi';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toaster } from "@/components/ui/toaster";
import { authService } from '@/services/auth.service';
import { useOnboardingStore } from '@/store/onboarding.store';
import { cn } from '@/lib/utils'; // Assuming you might use this, though mostly standard classes here

function MfaSetupContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const mode = searchParams.get('mode'); // 'unverified' or null (authenticated)

    const { tempCredentials } = useOnboardingStore();

    const [isLoading, setIsLoading] = useState(true);
    const [isVerifying, setIsVerifying] = useState(false);

    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [secret, setSecret] = useState('');
    const [otp, setOtp] = useState('');

    useEffect(() => {
        const fetchMfaSetup = async () => {
            try {
                let data;
                if (mode === 'unverified') {
                    if (!tempCredentials) {
                        toaster.create({ title: "Session Error", description: "Registration session expired. Please register again.", type: "error" });
                        router.push('/auth/register');
                        return;
                    }
                    data = await authService.setupMfaUnverified(tempCredentials);
                } else {
                    // Authenticated mode (Bearer token)
                    data = await authService.setupMfa();
                }

                setQrCodeUrl(data.qrCode);
                setSecret(data.secret);
            } catch (error) {
                const err = error as any;
                toaster.create({
                    title: "Error fetching MFA setup",
                    description: err.response?.data?.message || "Please try again.",
                    type: "error"
                });
                if (mode !== 'unverified') router.push('/');
            } finally {
                setIsLoading(false);
            }
        };

        if (isLoading) {
            fetchMfaSetup();
        }
    }, [mode, tempCredentials, router, isLoading]);

    const handleVerify = async () => {
        if (!otp || otp.length < 6) {
            toaster.create({ title: "Invalid code", description: "Please enter a 6-digit code.", type: "error" });
            return;
        }

        setIsVerifying(true);
        try {
            if (mode === 'unverified') {
                if (!tempCredentials) return;

                await authService.verifyMfaUnverified({ ...tempCredentials, code: otp });

                // Background Login
                await authService.login(tempCredentials);

                toaster.create({ title: "MFA Enabled", description: "Redirecting to onboarding...", type: "success" });
                router.push('/onboarding/business-info');
            } else {
                await authService.enableMfa(otp);

                toaster.create({ title: "MFA Enabled", type: "success" });
                router.push('/dashboard');
            }
        } catch (error) {
            const err = error as any;
            const message = err.response?.data?.message || "Verification failed. Check the code and try again.";
            toaster.create({ title: "Error", description: message, type: "error" });
        } finally {
            setIsVerifying(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex min-h-[200px] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-500 border-t-transparent" />
            </div>
        );
    }

    return (
        <div className="flex w-full flex-col items-center gap-6">
            <FiSmartphone className="h-12 w-12 text-teal-500" />

            <div className="text-center">
                <h2 className="mb-2 text-2xl font-bold text-gray-800">Set up 2-Factor Authentication</h2>
                <p className="text-gray-500">
                    Scan the QR code with your authenticator app
                </p>
            </div>

            <div className="overflow-hidden rounded-lg border border-gray-100 bg-gray-50 p-4">
                {qrCodeUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <div className="relative h-[200px] w-[200px] mix-blend-multiply">
                        <Image
                            src={qrCodeUrl}
                            alt="MFA QR Code"
                            width={200}
                            height={200}
                            className="h-full w-full object-contain"
                        />
                    </div>
                ) : (
                    <div className="h-[200px] w-[200px] rounded-md bg-gray-200" />
                )}
            </div>

            <div className="flex w-full flex-col gap-2">
                <p className="text-sm font-medium text-gray-700">
                    1. Scan the QR code with your authenticator app (Google Authenticator, Authy, etc.).
                </p>
                {secret && (
                    <p className="rounded-sm bg-gray-100 p-1 font-mono text-xs text-gray-500">
                        Manual Key: {secret}
                    </p>
                )}
                <p className="text-sm font-medium text-gray-700">
                    2. Enter the 6-digit code generated by the app below.
                </p>
            </div>

            <div className="w-full">
                <Input
                    placeholder="Enter 6-digit code"
                    className="text-center text-lg tracking-widest"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={6}
                    autoFocus
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
                        Verify & Enable <FiArrowRight className="ml-2" />
                    </>
                )}
            </Button>
        </div>
    );
}

export default function MfaSetupPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
            <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
                <Suspense fallback={<div className="flex justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-transparent" /></div>}>
                    <MfaSetupContent />
                </Suspense>
            </div>
        </div>
    );
}
