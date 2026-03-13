'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { FiCheck, FiLogOut } from 'react-icons/fi';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/auth.store';
import { toaster } from '@/components/ui/toaster';
import { Button } from '@/components/ui/button';

const steps = [
    { id: 1, path: '/onboarding/business-info', title: 'Business Information' },
    { id: 2, path: '/onboarding/business-hours', title: 'Operating Hours' },
    { id: 3, path: '/onboarding/services', title: 'Create Services' },
    { id: 4, path: '/onboarding/staff', title: 'Add Staffs' },
];

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const { logout: logoutStore } = useAuthStore();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    // Determine current step index (1-based)
    const currentStepIndex = steps.findIndex(step => pathname.includes(step.path)) + 1 || 1;

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            await authService.logout();
            logoutStore();
            toaster.create({
                title: "Logged out",
                description: "You have been successfully logged out.",
                type: "success"
            });
            router.push('/auth/login');
        } catch (error) {
            console.error("Logout error:", error);
            // Even if API call fails, clear local state and redirect
            logoutStore();
            router.push('/auth/login');
        } finally {
            setIsLoggingOut(false);
        }
    };

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
                {/* Mobile Header (Simplified) */}
                <div className="md:hidden bg-[#111827] text-white p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="bg-[#E59622] text-white p-1.5 rounded-lg font-bold text-sm">WP</div>
                        <span className="font-bold">WellnessPro</span>
                    </div>
                    <span className="text-xs font-medium bg-[#E59622] px-2 py-1 rounded">Step {currentStepIndex} of {steps.length}</span>
                </div>

                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-y-auto bg-[#F9FAFB] flex flex-col items-center justify-start py-12 px-4 md:px-8">
                    {children}
                </div>
            </div>
        </div>
    );
}
