"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth.store";
import { toaster } from "@/components/ui/toaster";

// Extracted from the identical logout handler previously duplicated in
// MobileBottomNav.tsx and onboarding/layout.tsx.
export function useLogout() {
    const router = useRouter();
    const { logout: logoutStore } = useAuthStore();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const purgeRuntimeCache = async () => {
        if (typeof window === "undefined" || !("caches" in window)) return;
        try {
            const cacheNames = await caches.keys();
            await Promise.all(
                cacheNames.filter((name) => name.startsWith("ibookam-runtime-")).map((name) => caches.delete(name))
            );
        } catch {
            // Cache API unavailable or blocked — nothing to clean up.
        }
    };

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            await authService.logout();
            logoutStore();
            await purgeRuntimeCache();
            toaster.create({
                title: "Logged out",
                description: "You have been successfully logged out.",
                type: "success",
            });
            router.push("/auth/login");
        } catch (error) {
            console.error("Logout error:", error);
            logoutStore();
            await purgeRuntimeCache();
            router.push("/auth/login");
        } finally {
            setIsLoggingOut(false);
        }
    };

    return { handleLogout, isLoggingOut };
}
