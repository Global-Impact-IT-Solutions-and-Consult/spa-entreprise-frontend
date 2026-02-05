'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiChevronLeft, FiMail, FiInfo } from 'react-icons/fi';

import { Button } from "@/components/ui/button";
import CustomInput from '@/components/ui/InputGroup';
import { authService } from '@/services/auth.service';
import { AuthLayout } from '@/components/auth/AuthLayout';
import Image from 'next/image';

export default function ForgotPasswordPage() {
    const router = useRouter(); // Correction: used location.href in original, better to use router or just native link if outside app, but this looks internal.
    const [email, setEmail] = useState('');

    const handleSendVerificationCode = async () => {
        const response = await authService.forgotPassword(email)
        //navigate to verify email page
        router.push(`/auth/reset-password?email=${email}&redirectTo=reset`);
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

            <div className="relative z-10 w-full max-w-[1440px] px-4 md:px-32 flex flex-col md:flex-row items-center justify-center py-12">
                <div className="w-full flex justify-center">
                    <div className="bg-white rounded-lg shadow-2xl p-8 md:p-12 w-full max-w-lg overflow-y-auto">
                        <div className="mb-6 flex flex-col gap-6 text-center">
                            <div>
                                <h1 className="mb-3 text-2xl font-bold text-gray-800">
                                    Forgot Password
                                </h1>
                                <p className="px-4 text-sm text-gray-500">
                                    Enter your email address and we'll send you a verification code to reset your password.
                                </p>
                            </div>

                            <CustomInput
                                type="email"
                                placeholder="example.com"
                                leftIcon={FiMail}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />

                            <Button
                                className="w-full h-[56px] rounded-lg bg-[#E59622] text-lg font-bold hover:bg-[#d48a1f] transition-colors text-white mt-4"
                                size="lg"
                                onClick={handleSendVerificationCode}
                            >
                                Send Verification Code
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
