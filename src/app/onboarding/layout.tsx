'use client';

import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { FiCheck } from 'react-icons/fi';

const steps = [
    { id: 1, path: '/onboarding/business-info', title: 'Business Information' },
    { id: 2, path: '/onboarding/business-hours', title: 'Operating Hours' },
    { id: 3, path: '/onboarding/services', title: 'Create Services' },
    { id: 4, path: '/onboarding/staff', title: 'Add Staffs' },
];

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    // Determine current step index (1-based)
    const currentStepIndex = steps.findIndex(step => pathname.includes(step.path)) + 1 || 1;

    return (
        <div className="flex min-h-screen bg-[#F9FAFB]">
            {/* Left Sidebar */}
            <div className="hidden md:flex w-[320px] bg-[#111827] flex-col py-10 px-0 text-white shrink-0">
                {/* Logo & Brand */}
                <div className="px-8 mb-16 flex items-center gap-3">
                    <div className="bg-[#E59622] text-white p-2 rounded-lg font-bold text-xl w-10 h-10 flex items-center justify-center shadow-lg">
                        WP
                    </div>
                    <div>
                        <h2 className="text-lg font-bold leading-none">WellnessPro</h2>
                        <p className="text-[10px] opacity-70">Connecting Businesses</p>
                    </div>
                </div>

                {/* Steps Navigation */}
                <nav className="flex flex-col gap-2">
                    {steps.map((step, index) => {
                        const stepNum = index + 1;
                        const isCompleted = stepNum < currentStepIndex;
                        const isCurrent = stepNum === currentStepIndex;

                        return (
                            <div
                                key={step.id}
                                className={cn(
                                    "px-8 py-4 flex items-center justify-between transition-all duration-300",
                                    isCurrent ? "bg-[#E59622] text-white" : "text-gray-400"
                                )}
                            >
                                <span className={cn(
                                    "text-sm font-semibold",
                                    isCurrent ? "text-white" : "text-gray-400"
                                )}>
                                    {step.title}
                                </span>

                                {isCurrent ? (
                                    <span className="text-xs font-medium opacity-80">
                                        {stepNum} of 4
                                    </span>
                                ) : isCompleted ? (
                                    <FiCheck className="text-green-500 h-5 w-5" />
                                ) : null}
                            </div>
                        );
                    })}
                </nav>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Mobile Header (Simplified) */}
                <div className="md:hidden bg-[#111827] text-white p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="bg-[#E59622] text-white p-1.5 rounded-lg font-bold text-sm">WP</div>
                        <span className="font-bold">WellnessPro</span>
                    </div>
                    <span className="text-xs font-medium bg-[#E59622] px-2 py-1 rounded">Step {currentStepIndex} of 4</span>
                </div>

                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-y-auto bg-[#F9FAFB] flex flex-col items-center justify-start py-12 px-4 md:px-8">
                    {children}
                </div>
            </div>
        </div>
    );
}
