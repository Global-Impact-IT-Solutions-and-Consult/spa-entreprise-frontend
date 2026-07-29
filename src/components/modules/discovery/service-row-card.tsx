"use client";

import Image from "next/image";
import { Star } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { getFallbackImage } from "@/lib/image.utils";
import { useServiceActions } from "@/hooks/use-service-actions";
import { AuthRequiredModal } from "./auth-required-modal";

interface ServiceRowCardProps {
    service: {
        id: string;
        name: string;
        businessName: string;
        businessId: string;
        businessSlug?: string;
        imageUrl: string;
        duration: number;
        price: number;
        rating: number | string;
    };
}

// Mobile-only compact row variant of ServiceCard for Discover's results list.
export function ServiceRowCard({ service }: ServiceRowCardProps) {
    const {
        handleBooking,
        authModalOpen,
        setAuthModalOpen,
        handleCardClick,
    } = useServiceActions(service);

    const rating = typeof service.rating === 'string' ? parseFloat(service.rating) : service.rating;

    return (
        <div
            onClick={handleCardClick}
            className="flex items-center gap-3 bg-white rounded-2xl shadow-sm p-3 cursor-pointer"
        >
            <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0">
                <Image src={service.imageUrl || getFallbackImage(service.name)} alt={service.name} fill className="object-cover" />
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-[14px] font-semibold text-gray-900 line-clamp-1">{service.name}</p>
                <p className="text-[11px] text-gray-400 line-clamp-1 mt-0.5">{service.businessName} · {service.duration}min</p>
                <div className="flex items-center gap-1 mt-1">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span className="text-[11px] font-medium text-gray-600">{rating || "New"}</span>
                </div>
            </div>
            <div className="shrink-0 flex flex-col items-end gap-1.5">
                <span className="text-[13px] font-bold text-gray-900">₦{service.price.toLocaleString()}</span>
                <button
                    onClick={handleBooking}
                    className="h-7 px-3 rounded-md bg-[#E89D24] text-white text-[11px] font-bold active:scale-95 transition-transform"
                >
                    Book
                </button>
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

export function ServiceRowSkeleton() {
    return (
        <div className="flex items-center gap-3 bg-white rounded-2xl shadow-sm p-3">
            <Skeleton className="w-16 h-16 rounded-xl shrink-0" />
            <div className="flex-1 space-y-2">
                <Skeleton className="h-3.5 w-2/3" />
                <Skeleton className="h-3 w-1/3" />
            </div>
            <Skeleton className="h-7 w-14 rounded-full" />
        </div>
    );
}
