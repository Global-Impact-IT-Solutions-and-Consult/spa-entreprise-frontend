'use client';

import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { FiCheck, FiChevronLeft, FiLogOut } from 'react-icons/fi';
import { useLogout } from '@/hooks/use-logout';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

const steps = [
    { id: 1, path: '/onboarding/business-info', title: 'Business Information' },
    { id: 2, path: '/onboarding/business-hours', title: 'Operating Hours' },
    { id: 3, path: '/onboarding/services', title: 'Create Services' },
    { id: 4, path: '/onboarding/staff', title: 'Add Staffs' },
    { id: 5, path: '/onboarding/account-info', title: 'Account Information' },
];

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const { handleLogout, isLoggingOut } = useLogout();

    // Determine current step index (1-based)
    const currentStepIndex = steps.findIndex(step => pathname.includes(step.path)) + 1 || 1;
    const currentStepTitle = steps[currentStepIndex - 1]?.title ?? '';

    // The completion screen is a terminal confirmation, not a wizard step —
    // it renders chrome-free (no sidebar, no mobile step bar, no CTA bar).
    if (pathname === '/onboarding/complete') {
        return <>{children}</>;
    }

    return (
        <div className="flex min-h-screen bg-[#F9FAFB]">
            {/* Left Sidebar */}
            <div className="hidden md:flex w-[320px] bg-[#111827] flex-col py-10 px-0 text-white shrink-0">
                {/* Logo & Brand */}
                <div className="px-8 mb-16 flex flex-col items-start gap-2">
                    <Image src="/Logo_White.svg" alt="iBookam Logo" width={150} height={50} />
                </div>

                {/* Steps Navigation */}
                <nav className="flex flex-col gap-2 flex-1">
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
                                        {stepNum} of {steps.length}
                                    </span>
                                ) : isCompleted ? (
                                    <FiCheck className="text-green-500 h-5 w-5" />
                                ) : null}
                            </div>
                        );
                    })}
                </nav>

                {/* Logout Button */}
                <div className="px-8 pb-8 mt-auto">
                    <Button
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        variant="outline"
                        className="w-full flex items-center justify-center gap-2 h-10 text-sm font-medium text-gray-300 hover:text-white hover:bg-red-600/20 border-gray-600 hover:border-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoggingOut ? <Loader2 className="h-4 w-4 animate-spin" /> : <FiLogOut className="h-4 w-4" />}
                        {isLoggingOut ? "Logging out..." : "Logout"}
                    </Button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Mobile Header — back / step chip / logout, plus progress bar */}
                <div className="md:hidden bg-[#111827] text-white shrink-0">
                    <div className="flex items-center justify-between px-2 py-2.5">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            aria-label="Go back"
                            className="h-10 w-10 flex items-center justify-center rounded-lg text-white/80 hover:bg-white/10 active:bg-white/10 transition-colors"
                        >
                            <FiChevronLeft className="h-5 w-5" strokeWidth={2.5} />
                        </button>

                        <span className="bg-[#E59622] text-white text-[11px] font-semibold px-2.5 py-1 rounded-full">
                            Step {currentStepIndex} of {steps.length}
                        </span>

                        <button
                            type="button"
                            onClick={handleLogout}
                            disabled={isLoggingOut}
                            aria-label="Logout"
                            className="h-10 w-10 flex items-center justify-center rounded-lg text-white/80 hover:bg-red-500/20 active:bg-red-500/20 transition-colors disabled:opacity-50"
                        >
                            {isLoggingOut
                                ? <Loader2 className="h-4 w-4 animate-spin" />
                                : <FiLogOut className="h-[18px] w-[18px]" />
                            }
                        </button>
                    </div>

                    {/* Progress bar */}
                    <div className="h-1 bg-white/10">
                        <div
                            className="h-full bg-[#E59622] transition-all duration-300"
                            style={{ width: `${(currentStepIndex / steps.length) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-y-auto bg-[#F9FAFB] flex flex-col items-center justify-start py-4 md:py-12 px-4 md:px-8 pb-28 md:pb-12">
                    {/* Mobile loses the sidebar's step list, so the current step's
                        title provides that context here instead. */}
                    <div className="md:hidden w-full mb-3">
                        <h1 className="text-[18px] font-bold text-gray-900">{currentStepTitle}</h1>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}
