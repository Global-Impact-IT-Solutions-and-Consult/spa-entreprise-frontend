"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ServiceCard, ServiceSkeleton } from "@/components/modules/discovery/service-card";
import { ServiceCardCompact, ServiceCompactSkeleton } from "@/components/modules/discovery/service-card-compact";
import { businessService, EnrichedService } from "@/services/business.service";
import { useUserLocation } from "@/hooks/use-user-location";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

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
            <section className="py-6 md:py-16 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-3 md:mb-10">
                        <div className="h-5 w-40 md:h-10 md:w-64 bg-gray-200 animate-pulse rounded-md" />
                    </div>
                    <div className="md:hidden scroll-row gap-3 -mx-4 px-4">
                        {[1, 2, 3].map((i) => (
                            <ServiceCompactSkeleton key={i} />
                        ))}
                    </div>
                    <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map((i) => (
                            <ServiceSkeleton key={i} />
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="py-6 md:py-16 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-3 md:mb-10">
                    <h2 className="text-[17px] font-bold md:text-3xl text-gray-900 font-playfair mb-0 md:mb-0">
                        Services near you
                    </h2>
                    <Link href="/discover" className="text-[#E89D24] hover:text-[#E5A800] font-semibold text-sm md:text-base">
                        View All
                    </Link>
                </div>

                {services.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-12 text-center shadow-sm max-w-2xl mx-auto">
                        <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4 text-[#E89D24]">
                            <MapPin className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">No services found in {state || "your location"}</h3>
                        <p className="text-gray-500 text-sm mb-6">
                            We couldn't find any services matching your location. You can view all services available or search in other areas.
                        </p>
                        <Link href="/discover">
                            <Button className="bg-[#E89D24] hover:bg-[#E5A800] text-white font-bold px-6 py-2 h-10 rounded-lg">
                                Explore All Services
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="md:hidden scroll-row gap-3 -mx-4 px-4">
                            {services.map((service) => (
                                <ServiceCardCompact key={service.id} service={service} />
                            ))}
                        </div>
                        <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {services.map((service) => (
                                <ServiceCard key={service.id} service={service} />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </section>
    );
}
