"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { favoritesService } from "@/services/favorites.service";
import { useAuthStore } from "@/store/auth.store";
import { useFavoritesStore } from "@/store/favorites.store";
import { toaster } from "@/components/ui/toaster";

interface ServiceActionsInput {
    id: string;
    businessId: string;
    businessSlug?: string;
}

// Shared auth-gate/booking-nav/favorite-toggle logic behind every service
// card variant (desktop ServiceCard, mobile ServiceCardCompact/ServiceRowCard)
// so the three don't drift from each other.
export function useServiceActions(service: ServiceActionsInput) {
    const router = useRouter();
    const pathname = usePathname();
    const [isFavLoading, setIsFavLoading] = useState(false);
    const [authModalOpen, setAuthModalOpen] = useState(false);
    const { isAuthenticated } = useAuthStore();
    const { serviceIds: favoriteServiceIds, addService, removeService } = useFavoritesStore();

    const isFavorite = favoriteServiceIds.includes(service.id);

    const handleFavoriteToggle = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isAuthenticated) {
            setAuthModalOpen(true);
            return;
        }

        if (!service.id) return;

        setIsFavLoading(true);
        try {
            if (isFavorite) {
                await favoritesService.removeServiceFavorite(service.id);
                removeService(service.id);
                toaster.create({ title: "Removed from favorites", type: "success" });
            } else {
                await favoritesService.addFavorite({ serviceId: service.id });
                addService(service.id);
                toaster.create({ title: "Added to favorites", type: "success" });
            }
        } catch (error) {
            console.error('Failed to toggle favorite status:', error);
            toaster.create({ title: "Failed to update favorite status", type: "error" });
        } finally {
            setIsFavLoading(false);
        }
    };

    const handleBooking = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isAuthenticated) {
            setAuthModalOpen(true);
            return;
        }

        router.push(`/bookings/new?serviceId=${service.id}&businessId=${service.businessId}`);
    };

    const businessSlug = service.businessSlug || service.businessId;
    const businessProfilePath = `/businesses/${businessSlug}`;
    const isAtDestination = pathname === businessProfilePath;

    const handleCardClick = () => {
        if (isAtDestination) return;
        router.push(businessProfilePath);
    };

    return {
        isFavorite,
        isFavLoading,
        handleFavoriteToggle,
        handleBooking,
        authModalOpen,
        setAuthModalOpen,
        businessProfilePath,
        isAtDestination,
        handleCardClick,
    };
}
