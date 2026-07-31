"use client";

import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OnboardingCtaBarProps {
    label: string;
    onClick: () => void;
    disabled?: boolean;
    isLoading?: boolean;
    hint?: string;
}

// Sticky mobile-only primary action for the onboarding wizard. This is an
// *additional* trigger for each step's existing submit handler — the desktop
// Back/Continue row (`hidden md:flex`) keeps its own untouched handler and
// validation toasts. `disabled` here mirrors the step's existing submit-guard
// condition so the affordance reads correctly on a small viewport; it never
// introduces a new validation rule.
export function OnboardingCtaBar({ label, onClick, disabled, isLoading, hint }: OnboardingCtaBarProps) {
    return (
        <div className="md:hidden fixed inset-x-0 bottom-0 z-30 bg-white/90 backdrop-blur border-t border-gray-200 px-4 py-3 pb-[calc(0.75rem+var(--safe-area-bottom))]">
            {hint && (
                <p className="mb-2 text-center text-[11px] text-gray-400">{hint}</p>
            )}
            <Button
                onClick={onClick}
                disabled={disabled || isLoading}
                className="w-full h-[52px] rounded-lg bg-[#E59622] hover:bg-[#d48a1f] text-white text-base font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : label}
            </Button>
        </div>
    );
}
