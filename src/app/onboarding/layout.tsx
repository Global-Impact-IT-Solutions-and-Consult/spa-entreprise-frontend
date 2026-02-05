'use client';

import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
// import { FiCheck } from 'react-icons/fi';

const steps = [
    { id: 1, path: '/onboarding/business-info', title: 'Business Info' },
    { id: 2, path: '/onboarding/business-hours', title: 'Business Hours' },
    { id: 3, path: '/onboarding/staff', title: 'Staffs' },
    // { id: 4, path: '/onboarding/services', title: 'Services' },
];

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    // Determine current step index (1-based)
    const currentStepIndex = steps.findIndex(step => pathname.includes(step.path)) + 1 || 1;

    return (
        <div className="flex min-h-screen flex-col md:flex-row">
            {/* Left Sidebar */}
            <div className="relative flex w-full flex-col justify-between bg-[#2D5B5E] p-10 text-white md:w-[400px]">
                <div>
                    <h2 className="mb-12 text-lg font-bold">Logo</h2>

                    <div className="flex flex-col items-start gap-4">
                        <h1 className="text-4xl font-bold leading-tight">
                            {currentStepIndex === 1 && "Solutions Tailored For You"}
                            {currentStepIndex === 2 && "Tell Us When You Are Available"}
                            {currentStepIndex === 3 && "Offer More Than One Service?"}
                            {/* {currentStepIndex === 4 && "Offer More Than One Service?"} */}
                        </h1>
                        <p className="text-lg opacity-90">
                            {currentStepIndex === 1 && "Connecting you to more people while managing all the hassle for your business"}
                            {currentStepIndex === 2 && "Help us understand your business hours"}
                            {currentStepIndex >= 3 && "No Problem we’ve got you covered on that"}
                        </p>
                    </div>
                </div>

                {/* Decorative Diamonds */}
                <div className="mb-8 flex gap-4">
                    <div className="h-8 w-8 rotate-45 rounded-sm bg-pink-200 opacity-100" />
                    <div className="h-8 w-8 rotate-45 rounded-sm bg-pink-200 opacity-80" />
                    <div className="h-8 w-8 rotate-45 rounded-sm bg-pink-200 opacity-60" />
                    <div className="h-8 w-8 rotate-45 rounded-sm bg-pink-200 opacity-40" />
                </div>
            </div>

            {/* Right Content */}
            <div className="flex flex-1 flex-col bg-white">
                {/* Progress Bar */}
                <div className="px-10 py-8">
                    <div className="relative w-full">
                        {/* Background Line */}
                        <div className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-gray-200 z-0" />

                        {/* Active Progress Line */}
                        <div
                            className="absolute left-0 top-1/2 h-px -translate-y-1/2 bg-teal-600 transition-all duration-300 z-0"
                            style={{ width: `${((currentStepIndex - 1) / (steps.length - 1)) * 100}%` }}
                        />

                        {/* Steps Circles */}
                        <div className="relative z-10 flex justify-between">
                            {steps.map((step, index) => {
                                const stepNum = index + 1;
                                const isCompleted = stepNum < currentStepIndex;
                                const isCurrent = stepNum === currentStepIndex;

                                return (
                                    <div
                                        key={step.id}
                                        className={cn(
                                            "h-4 w-4 rounded-full border bg-white transition-colors duration-300",
                                            (isCompleted || isCurrent) ? "border-teal-600 bg-teal-600" : "border-gray-200"
                                        )}
                                    >
                                        {/* {isCompleted && <FiCheck className="text-white h-2 w-2 m-auto mt-[1px]" />} */}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-y-auto px-6 py-4 md:px-20">
                    {children}
                </div>
            </div>
        </div>
    );
}
