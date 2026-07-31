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

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            await authService.logout();
            logoutStore();
            toaster.create({
                title: "Logged out",
                description: "You have been successfully logged out.",
                type: "success",
            });
            router.push("/auth/login");
        } catch (error) {
            console.error("Logout error:", error);
            logoutStore();
            router.push("/auth/login");
        } finally {
            setIsLoggingOut(false);
        }
    };

    return { handleLogout, isLoggingOut };
}
