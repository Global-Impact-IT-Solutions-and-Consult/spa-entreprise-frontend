"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ServiceCard, ServiceSkeleton } from "@/components/modules/discovery/service-card";
import { businessService, EnrichedService } from "@/services/business.service";
import { useUserLocation } from "@/hooks/use-user-location";

export function TrendingTreatments() {
    const [services, setServices] = useState<EnrichedService[]>([]);
    const [loading, setLoading] = useState(true);
    const { location, loading: locationLoading } = useUserLocation();

    useEffect(() => {
        const fetchServices = async () => {
            setLoading(true);
            try {
                // Fetch top rated services globally
                const response = await businessService.discoverServicesFilter({ 
                    minRating: 3,
                    limit: 4
                });
                setServices(response.data || []);
            } catch (error) {
                console.error("Failed to fetch trending treatments:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchServices();

        window.addEventListener('location:changed' as any, fetchServices);
        return () => window.removeEventListener('location:changed' as any, fetchServices);
    }, []);

    if (services.length === 0 && !loading) return null;

    return (
        <section className="py-12 md:py-16 bg-white border-t border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between mb-8 md:mb-10">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 font-playfair">
                        Trending Services on iBookAm Platform
                    </h2>
                    <Link href="/discover?minRating=4" className="text-[#E89D24] hover:text-[#E5A800] font-semibold text-sm md:text-base">
                        View All
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {loading ? (
                        [1, 2, 3, 4].map((i) => (
                            <ServiceSkeleton key={i} />
                        ))
                    ) : (
                        services.map((service) => (
                            <ServiceCard key={service.id} service={service} />
                        ))
                    )}
                </div>
            </div>
        </section>
    );
}
