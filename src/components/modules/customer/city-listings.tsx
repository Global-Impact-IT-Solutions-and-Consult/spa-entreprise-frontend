"use client";

import Link from "next/link";
import { MapPin } from "lucide-react";

const cities = [
    {
        id: 1,
        name: "Lagos",
        businesses: 245,
    },
    {
        id: 2,
        name: "Abuja",
        businesses: 146,
    },
    {
        id: 3,
        name: "Port Harcourt",
        businesses: 82,
    },
];

export function CityListings() {
    return (
        <section className="py-12 md:py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-8 md:mb-10">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Available in Major Cities</h2>
                    <p className="text-sm md:text-base text-gray-600">Find wellness services across Nigeria's top cities</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    {cities.map((city) => (
                        <Link
                            key={city.id}
                            href={`/cities/${city.name.toLowerCase()}`}
                            className="group"
                        >
                            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 text-center hover:shadow-lg hover:border-[#F5B800] transition-all duration-300">
                                <div className="bg-white w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-[#F5B800] transition-colors">
                                    <MapPin className="w-7 h-7 md:w-8 md:h-8 text-gray-600 group-hover:text-white transition-colors" />
                                </div>
                                <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-1">{city.name}</h3>
                                <p className="text-sm text-gray-600">{city.businesses} Businesses</p>
                            </div>
                        </Link>
                    ))}

                    {/* View All Card */}
                    <Link href="/cities" className="group">
                        <div className="bg-[#F5B800] border border-[#F5B800] rounded-2xl p-8 text-center hover:shadow-lg hover:bg-[#E5A800] transition-all duration-300">
                            <div className="bg-white w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <MapPin className="w-7 h-7 md:w-8 md:h-8 text-[#F5B800]" />
                            </div>
                            <h3 className="text-lg md:text-xl font-bold text-white mb-1">View All</h3>
                            <p className="text-sm text-white">20+ cities</p>
                        </div>
                    </Link>
                </div>
            </div>
        </section>
    );
}
