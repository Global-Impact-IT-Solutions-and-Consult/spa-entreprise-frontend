"use client";

import { WifiOff } from "lucide-react";

interface CachedDataBadgeProps {
    className?: string;
}

// Shown whenever a page is rendering data while offline — the data may be
// from a previous session or served from the service worker's runtime
// cache; either way it's honestly labeled "may be stale."
export function CachedDataBadge({ className = "" }: CachedDataBadgeProps) {
    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-semibold text-gray-500 ${className}`}
        >
            <WifiOff className="h-3 w-3" />
            Showing cached data &middot; offline
        </span>
    );
}
