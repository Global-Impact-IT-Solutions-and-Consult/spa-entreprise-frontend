"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BusinessDirectoryCard } from "@/components/modules/discovery/business-directory-card";
import { businessService, SpaSearchResult } from "@/services/business.service";
import { Loader2 } from "lucide-react";

export function FeaturedBusinesses() {
    const [businesses, setBusinesses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFeatured = async () => {
            try {
                // Fetch top rated businesses
                const response = await businessService.listSpas({ limit: 4, sortBy: 'rating', sortOrder: 'desc' });

                // Map API results to the format expected by BusinessDirectoryCard
                const mappedBusinesses = response.data.map((b: SpaSearchResult) => ({
                    id: b.id,
                    name: b.businessName,
                    location: `${b.city}, ${b.address}`,
                    description: "Premium spa and wellness services for your relaxation and beauty needs.", // Fallback description
                    rating: b.averageRating || 0,
                    reviews: b.totalReviews || 0,
                    price: "5,000", // Fallback price as it's not in the list API
                    image: b.primaryImageUrl || "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&q=80",
                    isOpen: true,
                    verified: true,
                }));

                setBusinesses(mappedBusinesses);
            } catch (error) {
                console.error("Failed to fetch featured businesses:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchFeatured();
    }, []);

    if (loading) {
        return (
            <div className="py-12 bg-gray-50 flex justify-center items-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#E89D24]" />
            </div>
        );
    }

    if (businesses.length === 0) return null;

    return (
        <section className="py-12 md:py-16 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between mb-8 md:mb-10">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 font-playfair">Featured Businesses</h2>
                    <Link href="/businesses" className="text-[#E89D24] hover:text-[#E5A800] font-semibold text-sm md:text-base">
                        View All
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {businesses.map((business) => (
                        <BusinessDirectoryCard key={business.id} business={business} />
                    ))}
                </div>
            </div>
        </section>
    );
}

// Building2 icon removed as it's now in BusinessDirectoryCard
