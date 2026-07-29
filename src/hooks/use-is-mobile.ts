"use client";

import { useSyncExternalStore } from "react";

const MOBILE_QUERY = "(max-width: 767px)";

function subscribe(callback: () => void) {
    const mql = window.matchMedia(MOBILE_QUERY);
    mql.addEventListener("change", callback);
    return () => mql.removeEventListener("change", callback);
}

function getSnapshot() {
    return window.matchMedia(MOBILE_QUERY).matches;
}

function getServerSnapshot() {
    return null;
}

// This is the one documented exception to the app's default CSS-toggled
// (`md:hidden` / `hidden md:block`) responsive pattern — reserved for cases
// where a mobile-only variant needs to avoid triggering the desktop
// variant's side effects (data fetching) rather than just its markup.
// Returns null until the client has mounted and the media query resolves.
export function useIsMobile(): boolean | null {
    return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
