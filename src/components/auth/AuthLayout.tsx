'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface AuthLayoutProps {
    children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
    return (
        <div className="relative min-h-screen w-full overflow-hidden flex items-center justify-center bg-[#D4A373]">
            {/* Floating Back Button */}
            <Link
                href="/"
                className="absolute hidden md:flex top-8 md:top-16 left-6 sm:left-12 lg:left-32 z-20 flex items-center gap-2 text-white/80 hover:text-white transition-colors text-sm font-medium"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to Home
            </Link>

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
                <div className="absolute inset-0 bg-black/10" />
            </div>

            <div className="relative z-10 w-full max-w-[1440px] px-6 sm:px-12 lg:px-32 flex flex-col md:flex-row items-center md:items-start justify-center md:justify-between min-h-screen py-0 md:py-24 my-5 md:mt-0">
                {/* Left Side: Text and Logo */}
                <div className="hidden md:flex w-full md:w-1/2 flex-col justify-center md:justify-between md:h-[600px] text-white mb-12 md:mb-0 text-center md:text-left">
                    <div className="max-w-xl mx-auto md:mx-0">
                        <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold leading-tight">
                            Join the network where 2,000+ wellness pros are growing their bookings.
                        </h1>
                    </div>

                    <div className="hidden md:flex flex-col items-start gap-0">
                        <Link href="/" className="hover:opacity-80 transition-opacity inline-block">
                            <Image src="/Logo_White.svg" alt="iBookam Logo" width={200} height={100} />
                        </Link>
                    </div>
                </div>

                {/* Right Side: Form Card */}
                <div className="w-full md:w-[600px] flex flex-col justify-center items-center">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-10 md:p-12 w-full max-w-lg min-h-[500px] md:min-h-[700px] overflow-y-auto">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};
