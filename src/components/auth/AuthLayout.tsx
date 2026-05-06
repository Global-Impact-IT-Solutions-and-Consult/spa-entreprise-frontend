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
                className="absolute top-15 left-0 px-4 md:px-32 z-20 flex items-center gap-2 text-white/80 hover:text-white transition-colors text-sm font-medium"
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
                <div className="absolute inset-0 bg-black/5" />
            </div>

            <div className="relative z-10 w-full max-w-[1440px] px-4 md:px-32 flex flex-col md:flex-row items-start justify-between min-h-screen py-12 mt-10">
                {/* Left Side: Text and Logo */}
                <div className="w-full md:w-1/2 flex flex-col justify-between h-[600px] text-white">
                    <div className="max-w-xl">
                        <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                            Join the network where 2,000+ wellness pros are growing their bookings.
                        </h1>
                    </div>

                    <div className="flex flex-col items-start gap-0">
                        <Link href="/" className="hover:opacity-80 transition-opacity inline-block">
                            <Image src="/Logo_White.svg" alt="iBookam Logo" width={200} height={100} />
                        </Link>
                    </div>
                </div>

                {/* Right Side: Form Card */}
                <div className="w-full md:w-[700px] flex justify-center md:justify-end">
                    <div className="bg-white rounded-lg shadow-2xl p-8 md:p-12 w-full max-w-lg h-[700px] overflow-y-auto">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};
