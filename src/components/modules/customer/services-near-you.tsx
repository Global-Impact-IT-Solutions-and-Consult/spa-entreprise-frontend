"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ServiceCard, ServiceSkeleton } from "@/components/modules/discovery/service-card";
import { businessService, EnrichedService } from "@/services/business.service";
import { useUserLocation } from "@/hooks/use-user-location";

export function ServicesNearYou() {
    const { state, loading: locationLoading } = useUserLocation();
    const [services, setServices] = useState<EnrichedService[]>([]);
    const [loading, setLoading] = useState(true);

    // console.log(latitude, longitude, "latitude, longitude")

    useEffect(() => {
        const fetchServices = async () => {
            if (locationLoading) return;

            // If coordinates are not available, stop loading and return
            if (state === null) {
                setLoading(false);
                return;
            }

            try {
                // Fetch services near the user (default radius 20km)
                const response = await businessService.discoverServicesFilter({ 
                    state,
                });

                setServices(response.data || []);
            } catch (error) {
                console.error("Failed to fetch services near you:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchServices();
    }, [state, locationLoading]);

    if (locationLoading || loading) {
        return (
            <section className="py-12 md:py-16 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between mb-8 md:mb-10">
                        <div className="h-10 w-64 bg-gray-200 animate-pulse rounded-md" />
                        <div className="h-6 w-20 bg-gray-200 animate-pulse rounded-md" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map((i) => (
                            <ServiceSkeleton key={i} />
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (services.length === 0) return null;

    return (
        <section className="py-12 md:py-16 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between mb-8 md:mb-10">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 font-playfair">
                        Services near you
                    </h2>
                    <Link href="/discover" className="text-[#E89D24] hover:text-[#E5A800] font-semibold text-sm md:text-base">
                        View All
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {services.map((service) => (
                        <ServiceCard key={service.id} service={service} />
                    ))}
                </div>
            </div>
        </section>
    );
}
