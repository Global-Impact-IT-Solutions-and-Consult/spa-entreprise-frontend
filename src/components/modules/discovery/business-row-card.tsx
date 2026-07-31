import Link from "next/link";
import Image from "next/image";
import { BadgeCheck, Star } from "lucide-react";
import { getFallbackImage } from "@/lib/image.utils";

interface BusinessRowCardProps {
    // Same flexible shape BusinessDirectoryCard accepts, so both cards can
    // be fed the exact same business object without the call site having
    // to pre-normalize it.
    business: {
        id: string | number;
        name?: string;
        businessName?: string;
        slug?: string;
        location?: string;
        city?: string | { name: string };
        addressDetails?: {
            city?: { name: string };
            state?: { name: string };
        };
        rating: number | string | { average?: number; rating?: number; totalReviews?: number };
        reviews?: number;
        totalReviews?: number;
        price?: string | number;
        startingPrice?: string | number;
        profileImage?: string | null;
        primaryImageUrl?: string | null;
        isVerified?: boolean;
        verified?: boolean;
    };
}

// Mobile-only compact ROW variant of BusinessDirectoryCard — used for Home's
// "Businesses near you" and the Businesses directory results — no
// description, no favorite heart, matching the mockup's dense list treatment.
export function BusinessRowCard({ business }: BusinessRowCardProps) {
    const verified = business.verified ?? business.isVerified;
    const price = business.price ?? business.startingPrice;
    const name = business.businessName ?? business.name ?? "Wellness Business";
    const businessSlug = business.slug || business.id.toString();
    const image = business.profileImage || business.primaryImageUrl || getFallbackImage(name);
    const location =
        business.addressDetails?.city?.name ||
        (typeof business.city === 'string' ? business.city : business.city?.name) ||
        business.location;

    let ratingValue = 0;
    let reviewsCount = business.totalReviews ?? business.reviews ?? 0;
    if (typeof business.rating === 'string') {
        ratingValue = parseFloat(business.rating);
    } else if (typeof business.rating === 'number') {
        ratingValue = business.rating;
    } else if (business.rating && typeof business.rating === 'object') {
        ratingValue = business.rating.average || business.rating.rating || 0;
        if (business.rating.totalReviews) reviewsCount = business.rating.totalReviews;
    }

    return (
        <Link
            href={`/businesses/${businessSlug}`}
            className="flex items-center gap-3 bg-white rounded-2xl shadow-sm p-3 active:bg-gray-50 transition-colors"
        >
            <div className="relative w-[76px] h-[76px] rounded-[14px] overflow-hidden shrink-0">
                <Image src={image} alt={name} fill className="object-cover" />
            </div>
            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1">
                    <p className="text-[14px] font-semibold text-gray-900 line-clamp-1">{name}</p>
                    {verified && <BadgeCheck className="w-3.5 h-3.5 text-blue-500 shrink-0" />}
                </div>
                {location && (
                    <p className="text-[11px] text-gray-400 line-clamp-1 mt-0.5">{location}</p>
                )}
                <div className="flex items-center gap-1 mt-1">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span className="text-[11px] font-semibold text-gray-900">{ratingValue || "New"}</span>
                    <span className="text-[11px] text-gray-400">({reviewsCount})</span>
                </div>
            </div>
            <div className="shrink-0 text-right">
                <p className="text-[10px] text-gray-400">from</p>
                <p className="text-[13px] font-bold text-gray-900">₦{price ?? "---"}</p>
            </div>
        </Link>
    );
}
