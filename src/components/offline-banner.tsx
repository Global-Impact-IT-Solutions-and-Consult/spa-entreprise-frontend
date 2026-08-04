"use client";

import { WifiOff } from "lucide-react";
import { useOnlineStatus } from "@/hooks/use-online-status";

// App-wide, zero-per-page minimal offline indicator. Sits above Toaster
// (z-[9999]) so it's never hidden behind a toast.
export function OfflineBanner() {
    const isOnline = useOnlineStatus();

    if (isOnline) return null;

    return (
        <div className="fixed top-0 inset-x-0 z-[10000] flex items-center justify-center gap-2 bg-gray-900 px-4 py-2 text-center text-[12px] font-semibold text-white">
            <WifiOff className="h-3.5 w-3.5 shrink-0" />
            You&apos;re offline. Some information may be out of date.
        </div>
    );
}
