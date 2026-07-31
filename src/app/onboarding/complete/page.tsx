'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Check } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useOnboardingStore } from '@/store/onboarding.store';

// Terminal confirmation for the onboarding wizard. Shared on both breakpoints
// (there was previously no confirmation screen on any surface). Rendered
// chrome-free — `onboarding/layout.tsx` skips its sidebar/step bar/CTA bar for
// this route.
export default function OnboardingCompletePage() {
    const router = useRouter();
    const { businessId } = useOnboardingStore();

    // Direct URL access without an onboarding session in progress has nothing
    // to confirm — send those visitors to the dashboard instead.
    useEffect(() => {
        if (!businessId) {
            router.replace('/dashboard');
        }
    }, [businessId, router]);

    if (!businessId) return null;

    return (
        <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center px-4 py-12">
            <div className="w-full max-w-[520px] flex flex-col items-center text-center">
                <div className="h-20 w-20 md:h-24 md:w-24 rounded-full bg-green-100 flex items-center justify-center animate-in zoom-in-50 duration-500 motion-reduce:animate-none">
                    <Check className="h-10 w-10 md:h-12 md:w-12 text-green-600" strokeWidth={3} />
                </div>

                <h1 className="mt-6 text-[24px] md:text-4xl font-bold text-gray-900">
                    Onboarding Complete!
                </h1>

                <p className="mt-3 text-sm md:text-base text-gray-500 leading-relaxed">
                    Waiting for admin to verify business, while waiting you can go on to add more services,
                    staffs and so on. Bookings will remain locked untill admin&apos;s verification.
                </p>

                <Button
                    onClick={() => router.push('/dashboard')}
                    className="mt-8 w-full md:w-auto h-[52px] md:h-[56px] md:px-10 rounded-lg bg-[#E59622] hover:bg-[#d48a1f] transition-colors text-white text-base md:text-lg font-bold"
                >
                    Go to Dashboard
                </Button>
            </div>
        </div>
    );
}
