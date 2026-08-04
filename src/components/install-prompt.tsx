"use client";

import { Download, Share, X } from "lucide-react";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { useInstallPrompt } from "@/hooks/use-install-prompt";

// Global, mobile-only "Add to Home Screen" nudge. Floats above the bottom
// tab bars (CustomerBottomNav / MobileBottomNav, both z-30) rather than
// competing with OfflineBanner/Toaster for the already-contested top edge.
export function InstallPrompt() {
    const isMobile = useIsMobile();
    const { canInstallAndroid, canShowIosInstructions, promptInstall, dismiss } = useInstallPrompt(
        isMobile === true
    );

    if (!isMobile) return null;
    if (!canInstallAndroid && !canShowIosInstructions) return null;

    return (
        <div
            className="fixed inset-x-4 z-[9998] bottom-[calc(56px+var(--safe-area-bottom)+12px)] rounded-2xl border border-gray-100 bg-white p-4 shadow-xl animate-in slide-in-from-bottom-4 fade-in duration-300"
            role="dialog"
            aria-label="Install app"
        >
            <button
                onClick={dismiss}
                aria-label="Dismiss"
                className="absolute right-3 top-3 flex-shrink-0 rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            >
                <X className="h-4 w-4" />
            </button>

            <div className="flex items-start gap-3 pr-6">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FEF5E7]">
                    {canInstallAndroid ? (
                        <Download className="h-5 w-5 text-[#E59622]" />
                    ) : (
                        <Share className="h-5 w-5 text-[#E59622]" />
                    )}
                </div>
                <div className="min-w-0 flex-1">
                    <h3 className="text-[14px] font-bold text-gray-900">Install iBookam</h3>
                    {canInstallAndroid ? (
                        <>
                            <p className="mt-0.5 text-[12px] leading-relaxed text-gray-500">
                                Add iBookam to your home screen for quick, full-screen access.
                            </p>
                            <button
                                onClick={promptInstall}
                                className="mt-3 h-9 rounded-xl bg-[#E59622] px-4 text-[13px] font-bold text-white transition-colors hover:bg-[#d48a1f]"
                            >
                                Install
                            </button>
                        </>
                    ) : (
                        <p className="mt-0.5 text-[12px] leading-relaxed text-gray-500">
                            Tap the Share icon, then &quot;Add to Home Screen&quot; to install iBookam.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
