"use client";

import Image from "next/image";
import { Heart, Star } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { getFallbackImage } from "@/lib/image.utils";
import { useServiceActions } from "@/hooks/use-service-actions";
import { AuthRequiredModal } from "./auth-required-modal";

interface ServiceCardCompactProps {
    service: {
        id: string;
        name: string;
        businessName: string;
        businessId: string;
        businessSlug?: string;
        imageUrl: string;
        price: number;
        rating: number | string;
    };
}

// Mobile-only compact variant of ServiceCard for horizontal-scroll rows
// (Home's "Services near you"). Shares its booking/favorite logic with the
// desktop card via useServiceActions.
export function ServiceCardCompact({ service }: ServiceCardCompactProps) {
    const {
        isFavorite,
        isFavLoading,
        handleFavoriteToggle,
        authModalOpen,
        setAuthModalOpen,
        handleCardClick,
    } = useServiceActions(service);

    const rating = typeof service.rating === 'string' ? parseFloat(service.rating) : service.rating;

    return (
        <div
            onClick={handleCardClick}
            className="shrink-0 w-[180px] snap-start bg-white rounded-2xl shadow-sm overflow-hidden text-left active:scale-[0.98] transition-transform cursor-pointer"
        >
            <div className="relative h-[104px]">
                <Image
                    src={service.imageUrl || getFallbackImage(service.name)}
                    alt={service.name}
                    fill
                    className="object-cover"
                />
                <span className="absolute bottom-2 left-2 bg-white/95 backdrop-blur-sm rounded-full px-2 py-0.5 text-[11px] font-bold text-gray-900">
                    ₦{service.price.toLocaleString()}
                </span>
                <button
                    onClick={handleFavoriteToggle}
                    disabled={isFavLoading}
                    className="absolute top-2 right-2 w-7 h-7 bg-white/90 backdrop-blur-sm rounded-full shadow-sm flex items-center justify-center disabled:opacity-70"
                >
                    <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
                </button>
            </div>
            <div className="p-3">
                <p className="text-[13px] font-semibold text-gray-900 line-clamp-1">{service.name}</p>
                <p className="text-[11px] text-gray-400 line-clamp-1 mt-0.5">{service.businessName}</p>
                <div className="flex items-center gap-1 mt-1.5">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span className="text-[11px] font-medium text-gray-600">{rating || "New"}</span>
                </div>
            </div>

            <AuthRequiredModal
                isOpen={authModalOpen}
                onClose={setAuthModalOpen}
                title="Sign In to Book"
                description="Sign in or create an account to book this service. Managing your appointments is easier with an account!"
            />
        </div>
    );
}

export function ServiceCompactSkeleton() {
    return (
        <div className="shrink-0 w-[180px] bg-white rounded-2xl shadow-sm overflow-hidden">
            <Skeleton className="h-[104px] w-full" />
            <div className="p-3 space-y-2">
                <Skeleton className="h-3.5 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
            </div>
        </div>
    );
}
