"use client";

import { useAuthStore } from "@/store/auth.store";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { businessStatusBadge } from "@/lib/dashboard-status";
import { cn } from "@/lib/utils";

interface DashboardMobileHeroProps {
    onAvatarClick: () => void;
}

// Mobile-only navy header for the dashboard home route. Reads the business
// straight off useAuthStore (no new fetch) so it renders identically in the
// pending-verification branch, where the page deliberately fetches nothing.
export function DashboardMobileHero({ onAvatarClick }: DashboardMobileHeroProps) {
    const { user } = useAuthStore();
    const business = user?.businesses?.[0];
    const badge = businessStatusBadge(business?.status);
    const businessName = business?.businessName || "Your Business";

    const initials =
        businessName
            .split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map((word) => word.charAt(0).toUpperCase())
            .join("") || "B";

    return (
        <div className="lg:hidden shrink-0 bg-[#1A1F2C] px-4 pt-4 pb-8 text-white">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/40">
                        Dashboard
                    </p>
                    <h1 className="mt-1 text-[22px] font-bold leading-tight line-clamp-1">
                        {businessName}
                    </h1>
                    <div className="mt-2 flex items-center gap-2">
                        <span
                            className={cn(
                                "inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold",
                                badge.className
                            )}
                        >
                            {badge.label}
                        </span>
                        <span className="text-[11px] text-white/50 truncate">
                            Welcome back {user?.firstName}!
                        </span>
                    </div>
                </div>

                <button
                    onClick={onAvatarClick}
                    aria-label="Open business profile"
                    className="shrink-0 rounded-full ring-2 ring-white/15 active:scale-95 transition-transform motion-reduce:transition-none"
                >
                    <Avatar className="h-11 w-11">
                        <AvatarImage src={business?.profileImage || undefined} className="object-cover" />
                        <AvatarFallback className="bg-[#F59E0B] text-white text-sm font-bold">
                            {initials}
                        </AvatarFallback>
                    </Avatar>
                </button>
            </div>
        </div>
    );
}
