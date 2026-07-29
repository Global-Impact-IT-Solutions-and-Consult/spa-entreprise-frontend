"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";

// Routes that render without header/footer/bottom-nav chrome — booking and
// account flows one level deeper than a tab root. Matches the pattern already
// used for hiding CustomerBottomNav on these same routes.
const FLOW_ROUTE_PATTERNS = [
    /^\/bookings\/new/,
    /^\/bookings\/[^/]+\/cancel/,
    /^\/reschedule\//,
    /^\/reviews\//,
    /^\/payment\//,
    /^\/tip\//,
];

function isFlowRoute(pathname: string) {
    return FLOW_ROUTE_PATTERNS.some((pattern) => pattern.test(pathname));
}

export function PageTransition({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [prevPathname, setPrevPathname] = useState(pathname);

    const enteringFlow = isFlowRoute(pathname);
    const leavingFlow = pathname !== prevPathname && isFlowRoute(prevPathname) && !enteringFlow;

    // Derived-state-on-prop-change pattern (mirrors sheet.tsx's own prevOpen
    // usage) so the transition direction is known before this render paints,
    // without mutating a ref during render.
    if (pathname !== prevPathname) {
        setPrevPathname(pathname);
    }

    const animationClass = enteringFlow
        ? "page-slide-in"
        : leavingFlow
            ? "page-slide-back"
            : "page-fade-in";

    return (
        <div key={pathname} className={animationClass}>
            {children}
        </div>
    );
}
