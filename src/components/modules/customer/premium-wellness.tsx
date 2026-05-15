"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BusinessDirectoryCard } from "@/components/modules/discovery/business-directory-card";
import { Skeleton } from "@/components/ui/skeleton";
import { businessService } from "@/services/business.service";
import { useUserLocation } from "@/hooks/use-user-location";

export function PremiumWellness() {
    const [businesses, setBusinesses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { location, loading: locationLoading } = useUserLocation();

    useEffect(() => {
        const fetchTopRated = async () => {
            setLoading(true);
            try {
                // Fetch highest rated businesses
                const response = await businessService.searchSpasWithEnrichment({ 
                    sortBy: 'rating',
                    sortOrder: 'desc',
                    limit: 3
                });

                const enrichedData = response.data || [];
                
                const mappedBusinesses = enrichedData.map((b: any) => ({
                    id: b.id,
                    name: b.businessName,
                    location: b.addressDetails?.city?.name || (typeof b.city === 'string' ? b.city : " "),
                    description: b.description || "Top-tier wellness experience as rated by our community.",
                    rating: b.averageRating || 0,
                    reviews: b.totalReviews || 0,
                    price: b.startingPrice || "---",
                    profileImage: b.profileImage,
                    primaryImageUrl: b.primaryImageUrl,
                    isOpen: true,
                    verified: true,
                }));

                setBusinesses(mappedBusinesses);
            } catch (error) {
                console.error("Failed to fetch premium wellness businesses:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTopRated();

        window.addEventListener('location:changed' as any, fetchTopRated);
        return () => window.removeEventListener('location:changed' as any, fetchTopRated);
    }, []);

    if (businesses.length === 0 && !loading) return null;
    
    return (
        <section className="py-12 md:py-16 bg-white border-t border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between mb-8 md:mb-10">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 font-playfair">Premium Wellness in {locationLoading ? "..." : location}</h2>
                    <Link href="/businesses?sortBy=rating" className="text-[#E89D24] hover:text-[#E5A800] font-semibold text-sm md:text-base">
                        View All
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading ? (
                        [1, 2, 3].map((i) => (
                            <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm p-4 h-[400px]">
                                <Skeleton className="h-48 w-full rounded-xl mb-4" />
                                <Skeleton className="h-6 w-3/4 mb-2" />
                                <Skeleton className="h-4 w-1/2 mb-4" />
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-5/6" />
                                </div>
                                <div className="mt-auto flex justify-between items-center pt-8">
                                    <Skeleton className="h-8 w-24" />
                                    <Skeleton className="h-10 w-28" />
                                </div>
                            </div>
                        ))
                    ) : (
                        businesses.map((business) => (
                            <BusinessDirectoryCard key={business.id} business={business} />
                        ))
                    )}
                </div>
            </div>
        </section>
    );
}
