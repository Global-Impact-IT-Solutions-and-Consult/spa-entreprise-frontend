"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
    readonly platforms: string[];
    readonly userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
    prompt(): Promise<void>;
}

const DISMISSED_AT_KEY = "pwa_install_dismissed_at";
const VISIT_COUNT_KEY = "pwa_install_visit_count";
const INSTALLED_KEY = "pwa_installed";
const COOLDOWN_MS = 14 * 24 * 60 * 60 * 1000; // 14 days — long enough not to nag within one visit/week, short enough to resurface on the customer's next booking visit.
const MIN_VISITS_BEFORE_PROMPT = 3;

interface UseInstallPromptResult {
    canInstallAndroid: boolean;
    canShowIosInstructions: boolean;
    promptInstall: () => Promise<void>;
    dismiss: () => void;
}

// `enabled` is passed in from the component (isMobile === true) rather than
// checked internally, so on desktop we never preventDefault()/capture the
// event at all — Chrome's own native omnibox install icon keeps working.
export function useInstallPrompt(enabled: boolean): UseInstallPromptResult {
    const deferredPromptRef = useRef<BeforeInstallPromptEvent | null>(null);
    const enabledRef = useRef(enabled);
    useEffect(() => {
        enabledRef.current = enabled;
    }, [enabled]);

    const [canInstallAndroid, setCanInstallAndroid] = useState(false);
    const [mountState, setMountState] = useState({ isIOS: false, dismissed: false, visitCount: 0 });
    const { isIOS, dismissed: mountDismissed, visitCount } = mountState;
    const [manuallyDismissed, setManuallyDismissed] = useState(false);
    const dismissed = mountDismissed || manuallyDismissed;

    useEffect(() => {
        function detect() {
            const ua = window.navigator.userAgent;
            const iOSByUA = /iPad|iPhone|iPod/.test(ua);
            // iPadOS 13+ reports as "MacIntel" in the UA string; touch-point count
            // is the only reliable way to distinguish it from a real Mac.
            const iOSByTouchMac = navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;

            const standaloneIOS = (window.navigator as { standalone?: boolean }).standalone === true;
            const standaloneMedia = window.matchMedia("(display-mode: standalone)").matches;
            const standalone = standaloneIOS || standaloneMedia;

            let installedFlag = false;
            try {
                installedFlag = localStorage.getItem(INSTALLED_KEY) === "true";
            } catch {
                // localStorage unavailable (private browsing/quota) — degrade to showing more often, never throw.
            }

            let recentlyDismissed = false;
            try {
                const raw = localStorage.getItem(DISMISSED_AT_KEY);
                const ts = raw ? Number(raw) : NaN;
                if (!Number.isNaN(ts) && Date.now() - ts < COOLDOWN_MS) recentlyDismissed = true;
            } catch {
                // Same as above.
            }

            let count = 0;
            try {
                count = Number(localStorage.getItem(VISIT_COUNT_KEY) || "0") + 1;
                localStorage.setItem(VISIT_COUNT_KEY, String(count));
            } catch {
                count = MIN_VISITS_BEFORE_PROMPT; // can't persist a count — don't permanently block eligibility either.
            }

            setMountState({
                isIOS: iOSByUA || iOSByTouchMac,
                dismissed: recentlyDismissed || installedFlag || standalone,
                visitCount: count,
            });
        }

        detect();
    }, []);

    useEffect(() => {
        function handleBeforeInstallPrompt(e: Event) {
            if (!enabledRef.current) return;
            e.preventDefault();
            deferredPromptRef.current = e as BeforeInstallPromptEvent;
            setCanInstallAndroid(true);
        }

        function handleAppInstalled() {
            deferredPromptRef.current = null;
            setCanInstallAndroid(false);
            setManuallyDismissed(true);
            try {
                localStorage.setItem(INSTALLED_KEY, "true");
            } catch {
                // Ignore — nothing to fall back to for persistence here.
            }
        }

        window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
        window.addEventListener("appinstalled", handleAppInstalled);
        return () => {
            window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
            window.removeEventListener("appinstalled", handleAppInstalled);
        };
    }, []);

    const promptInstall = useCallback(async () => {
        const event = deferredPromptRef.current;
        if (!event) return;
        await event.prompt();
        const choice = await event.userChoice;
        deferredPromptRef.current = null;
        setCanInstallAndroid(false);
        if (choice.outcome !== "accepted") {
            try {
                localStorage.setItem(DISMISSED_AT_KEY, String(Date.now()));
            } catch {
                // Ignore.
            }
            setManuallyDismissed(true);
        }
        // If accepted, `appinstalled` fires separately and persists INSTALLED_KEY.
    }, []);

    const dismiss = useCallback(() => {
        try {
            localStorage.setItem(DISMISSED_AT_KEY, String(Date.now()));
        } catch {
            // Ignore.
        }
        setManuallyDismissed(true);
    }, []);

    const eligible = enabled && !dismissed && visitCount >= MIN_VISITS_BEFORE_PROMPT;

    return {
        canInstallAndroid: eligible && canInstallAndroid,
        canShowIosInstructions: eligible && isIOS,
        promptInstall,
        dismiss,
    };
}
