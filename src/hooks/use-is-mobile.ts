"use client";

import { useMemo, useSyncExternalStore } from "react";

export const MOBILE_MAX = 767;
export const DASHBOARD_MOBILE_MAX = 1023;

interface QueryStore {
    subscribe: (callback: () => void) => () => void;
    getSnapshot: () => boolean;
}

// Memoized per query string so useSyncExternalStore gets referentially
// stable subscribe/getSnapshot across renders regardless of which
// breakpoint a given caller asks about.
const stores = new Map<string, QueryStore>();

function getStore(maxWidth: number): QueryStore {
    const query = `(max-width: ${maxWidth}px)`;
    let store = stores.get(query);
    if (!store) {
        store = {
            subscribe(callback) {
                const mql = window.matchMedia(query);
                mql.addEventListener("change", callback);
                return () => mql.removeEventListener("change", callback);
            },
            getSnapshot() {
                return window.matchMedia(query).matches;
            },
        };
        stores.set(query, store);
    }
    return store;
}

function getServerSnapshot() {
    return null;
}

// This is the one documented exception to the app's default CSS-toggled
// (`md:hidden` / `hidden md:block`) responsive pattern — reserved for cases
// where a mobile-only variant needs to avoid triggering the desktop
// variant's side effects (data fetching, refs) rather than just its markup,
// or where an overlay primitive holds internal state/refs that a duplicated
// CSS dual-tree would double-mount.
// Returns null until the client has mounted and the media query resolves.
//
// `maxWidth` defaults to the app's standard `md` breakpoint (767). The
// dashboard splits on `lg` instead, so dashboard call sites should pass
// `DASHBOARD_MOBILE_MAX`.
export function useIsMobile(maxWidth: number = MOBILE_MAX): boolean | null {
    const { subscribe, getSnapshot } = useMemo(() => getStore(maxWidth), [maxWidth]);
    return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
