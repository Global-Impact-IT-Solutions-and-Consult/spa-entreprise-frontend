"use client";

import { WifiOff } from "lucide-react";

interface OfflineFallbackProps {
    message?: string;
    onRetry?: () => void;
    className?: string;
}

// Swapped in when a fetch has genuinely failed offline with nothing cached
// to fall back to — stops a loading spinner from spinning forever.
export function OfflineFallback({
    message = "You're offline and this hasn't loaded before.",
    onRetry,
    className = "",
}: OfflineFallbackProps) {
    return (
        <div className={`flex flex-col items-center justify-center py-16 text-center px-4 ${className}`}>
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                <WifiOff className="h-6 w-6 text-gray-400" />
            </div>
            <p className="text-[14px] font-semibold text-gray-700">You&apos;re offline</p>
            <p className="mt-1 max-w-xs text-[12px] text-gray-400">{message}</p>
            {onRetry && (
                <button
                    onClick={onRetry}
                    className="mt-4 h-9 rounded-xl bg-gray-100 px-4 text-[12px] font-semibold text-gray-600"
                >
                    Try Again
                </button>
            )}
        </div>
    );
}
