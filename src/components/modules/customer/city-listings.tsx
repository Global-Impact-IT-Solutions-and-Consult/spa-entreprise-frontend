"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MapPin, Loader2 } from "lucide-react";
import { businessService, CityWithCount } from "@/services/business.service";

export function CityListings() {
    const [cities, setCities] = useState<CityWithCount[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCities = async () => {
            try {
                const data = await businessService.getCitiesWithBusinessCounts();
                setCities(data);
            } catch (error) {
                console.error("Failed to fetch city stats:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCities();
    }, []);

    if (loading) {
        return (
            <div className="py-20 flex justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#E89D24]" />
            </div>
        );
    }

    // Show the top cities (up to 3) and aggregate the rest into a summary card
    const topCities = cities.slice(0, 3);
    const remainingCities = cities.slice(3);
    const remainingTotal = remainingCities.reduce((acc, c) => acc + c.businessCount, 0);
    const totalCities = cities.length;

    return (
        <section className="py-16 md:py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3" style={{ fontFamily: 'var(--font-playfair)' }}>
                        Available in Major Cities
                    </h2>
                    <p className="text-sm md:text-base text-gray-600">Find wellness services across Nigeria&apos;s top cities</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    {topCities.map((city, index) => (
                        <Link
                            key={index}
                            href={`/businesses?city=${encodeURIComponent(city.city)}`}
                            className="group"
                        >
                            <div className="bg-white border border-gray-100 rounded-2xl p-8 md:p-12 text-center shadow-sm hover:shadow-xl hover:border-[#E89D24]/30 transition-all duration-500 hover:-translate-y-1">
                                <div className="bg-gray-50 w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-500">
                                    <MapPin className="w-8 h-8 md:w-10 md:h-10 text-gray-400 group-hover:text-[#E89D24] transition-colors" />
                                </div>
                                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'var(--font-playfair)' }}>
                                    {city.city}
                                </h3>
                                <p className="text-sm md:text-base text-gray-500 font-medium">{city.businessCount} {city.businessCount === 1 ? 'Business' : 'Businesses'}</p>
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
                                {totalCities-3}+ Cities
                            </h3>
                            <p className="text-sm md:text-base text-gray-500 font-medium">{remainingTotal} Businesses</p>
                        </div>
                    </Link>
                </div>
            </div>
        </section>
    );
}
