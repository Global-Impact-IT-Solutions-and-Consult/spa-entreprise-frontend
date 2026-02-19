"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MapPin, Loader2 } from "lucide-react";
import { businessService } from "@/services/business.service";

interface CityStat {
    name: string;
    businesses: number;
}

export function CityListings() {
    const [cityStats, setCityStats] = useState<CityStat[]>([]);
    const [otherTotal, setOtherTotal] = useState(0);
    const [loading, setLoading] = useState(true);

    const majorCities = ["Lagos", "Abuja", "Port Harcourt"];

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // 1. Fetch counts for major cities in parallel
                const cityPromises = majorCities.map(async (cityName) => {
                    const res = await businessService.searchSpas({ city: cityName, limit: 1 });
                    return { name: cityName, businesses: res.meta.total };
                });

                // 2. Fetch global total
                const globalTotalPromise = businessService.listSpas({ limit: 1 });

                const [cities, globalRes] = await Promise.all([
                    Promise.all(cityPromises),
                    globalTotalPromise
                ]);

                // 3. Calculate "Others"
                const top3Sum = cities.reduce((acc, curr) => acc + curr.businesses, 0);
                const totalBusinesses = globalRes.meta.total;
                const remaining = Math.max(0, totalBusinesses - top3Sum);

                setCityStats(cities);
                setOtherTotal(remaining);
            } catch (error) {
                console.error("Failed to fetch city stats:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="py-20 flex justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#E89D24]" />
            </div>
        );
    }

    return (
        <section className="py-16 md:py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3" style={{ fontFamily: 'var(--font-playfair)' }}>
                        Available in Major Cities
                    </h2>
                    <p className="text-sm md:text-base text-gray-600">Find wellness services across Nigeria's top cities</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    {cityStats.map((city, index) => (
                        <Link
                            key={index}
                            href={`/businesses?city=${encodeURIComponent(city.name)}`}
                            className="group"
                        >
                            <div className="bg-white border border-gray-100 rounded-2xl p-8 md:p-12 text-center shadow-sm hover:shadow-xl hover:border-[#E89D24]/30 transition-all duration-500 hover:-translate-y-1">
                                <div className="bg-gray-50 w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-500">
                                    <MapPin className="w-8 h-8 md:w-10 md:h-10 text-gray-400 group-hover:text-[#E89D24] transition-colors" />
                                </div>
                                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'var(--font-playfair)' }}>
                                    {city.name}
                                </h3>
                                <p className="text-sm md:text-base text-gray-500 font-medium">{city.businesses} Businesses</p>
                            </div>
                        </Link>
                    ))}

                    {/* Summary Card */}
                    <Link href="/businesses" className="group">
                        <div className="bg-white border border-gray-100 rounded-2xl p-8 md:p-12 text-center shadow-sm hover:shadow-xl hover:border-[#E89D24]/30 transition-all duration-500 hover:-translate-y-1">
                            <div className="bg-gray-50 w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-500">
                                <MapPin className="w-8 h-8 md:w-10 md:h-10 text-gray-400 group-hover:text-[#E89D24] transition-colors" />
                            </div>
                            <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'var(--font-playfair)' }}>
                                20 + Cities
                            </h3>
                            <p className="text-sm md:text-base text-gray-500 font-medium">{otherTotal} Businesses</p>
                        </div>
                    </Link>
                </div>
            </div>
        </section>
    );
}
