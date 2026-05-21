"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BusinessDirectoryCard } from "@/components/modules/discovery/business-directory-card";
import { Skeleton } from "@/components/ui/skeleton";
import { businessService } from "@/services/business.service";
import { useUserLocation } from "@/hooks/use-user-location";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

export function BusinessesNearYou() {
    const { state, loading: locationLoading } = useUserLocation();
    const [businesses, setBusinesses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBusinesses = async () => {
            if (locationLoading) return;

            // If state is invalid or not available, stop loading and return
            if (!state || state === "Detecting..." || state === "Location unavailable" || state === "Nigeria") {
                setLoading(false);
                return;
            }

            try {
                // Fetch spas in the user's city
                const response = await businessService.searchSpasWithEnrichment({ 
                    state: state,
                    limit: 3
                });

                const enrichedData = response.data || [];
                
                const mappedBusinesses = enrichedData.map((b: any) => ({
                    id: b.id,
                    name: b.businessName,
                    location: b.addressDetails?.city?.name || (typeof b.city === 'string' ? b.city : " "),
                    description: b.description || "Premium spa and wellness services for your relaxation and beauty needs.",
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
                console.error("Failed to fetch businesses near you:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchBusinesses();
    }, [state, locationLoading]);

    if (locationLoading || loading) {
        return (
            <section className="py-12 md:py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between mb-8 md:mb-10">
                        <Skeleton className="h-10 w-64" />
                        <Skeleton className="h-6 w-20" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map((i) => (
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
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="py-12 md:py-16 bg-white border-t border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 md:mb-10">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 font-playfair mb-2 md:mb-0">
                        Businesses in {state && state !== "Location unavailable" && state !== "Nigeria" ? `${state} State` : "your location"}
                    </h2>
                    <Link href={state && state !== "Location unavailable" && state !== "Nigeria" ? `/businesses?city=${encodeURIComponent(state)}` : "/businesses"} className="text-[#E89D24] hover:text-[#E5A800] font-semibold text-sm md:text-base">
                        View All
                    </Link>
                </div>

                {businesses.length === 0 ? (
                    <div className="bg-gray-50 rounded-2xl border border-gray-100 p-8 md:p-12 text-center shadow-sm max-w-2xl mx-auto">
                        <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4 text-[#E89D24]">
                            <MapPin className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">No businesses found in {state && state !== "Location unavailable" && state !== "Nigeria" ? `${state} State` : "your location"}</h3>
                        <p className="text-gray-500 text-sm mb-6">
                            We couldn't find any wellness businesses registered in your state yet. Try changing your search query or browse our featured list.
                        </p>
                        <Link href="/businesses">
                            <Button className="bg-[#E89D24] hover:bg-[#E5A800] text-white font-bold px-6 py-2 h-10 rounded-lg">
                                Explore All Businesses
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {businesses.map((business) => (
                            <BusinessDirectoryCard key={business.id} business={business} />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
