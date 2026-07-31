"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";

// Routes one level deeper than a tab root, which get a directional slide
// instead of a fade. This list only picks the animation class below — chrome
// (header/footer/bottom-nav) visibility is decided independently by each
// layout, so adding a route here changes nothing but its transition.
const FLOW_ROUTE_PATTERNS = [
    /^\/bookings\/new/,
    /^\/bookings\/[^/]+\/cancel/,
    /^\/reschedule\//,
    /^\/reviews\//,
    /^\/payment\//,
    /^\/tip\//,
    // Dashboard detail routes reached from the Business Profile sheet / More
    // sheet rather than the bottom nav.
    /^\/dashboard\/working-hours/,
    /^\/dashboard\/business/,
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
