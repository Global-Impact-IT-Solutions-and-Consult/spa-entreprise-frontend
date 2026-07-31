"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sparkles, Scissors, Smile, Brush } from "lucide-react";
import { businessService, BusinessType } from "@/services/business.service";
import { Skeleton } from "@/components/ui/skeleton";

const getCategoryIcon = (codeOrName: string) => {
    const code = codeOrName.toLowerCase();
    if (code.includes("spa")) return { icon: Sparkles, color: "bg-purple-50", iconColor: "text-purple-600" };
    if (code.includes("barber")) return { icon: Scissors, color: "bg-blue-50", iconColor: "text-blue-600" };
    if (code.includes("salon") || code.includes("hair")) return { icon: Smile, color: "bg-orange-50", iconColor: "text-orange-600" };
    if (code.includes("beauty") || code.includes("nail")) return { icon: Brush, color: "bg-pink-50", iconColor: "text-pink-600" };
    return { icon: Sparkles, color: "bg-gray-50", iconColor: "text-gray-600" };
};

export function CategoryBrowser() {
    const [businessTypes, setBusinessTypes] = useState<BusinessType[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBusinessTypes = async () => {
            try {
                const data = await businessService.getBusinessTypes();
                // Desktop's grid only ever shows the first 4 of these; the
                // mobile chip row uses all of them.
                setBusinessTypes(data.slice(0, 8));
            } catch (error) {
                console.error("Failed to fetch business types:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchBusinessTypes();
    }, []);

    if (loading) {
        return (
            <section className="py-6 md:py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between mb-3 md:mb-10">
                        <Skeleton className="h-6 w-40 md:h-10 md:w-48" />
                    </div>
                    <div className="md:hidden scroll-row gap-3 -mx-4 px-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="shrink-0 w-[82px] bg-white rounded-2xl shadow-sm p-2.5 flex flex-col items-center gap-2">
                                <Skeleton className="w-[46px] h-[46px] rounded-full" />
                                <Skeleton className="h-3 w-14" />
                            </div>
                        ))}
                    </div>
                    <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="bg-white rounded-2xl p-6 md:p-8 flex flex-col items-center">
                                <Skeleton className="w-12 h-12 md:w-16 md:h-16 rounded-full mb-4" />
                                <Skeleton className="h-6 w-24 mb-2" />
                                <Skeleton className="h-4 w-32" />
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (businessTypes.length === 0) return null;

    return (
        <section className="py-6 md:py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between mb-3 md:mb-10">
                    <h2 className="text-[17px] font-bold md:text-3xl text-gray-900">Trending Categories</h2>
                    {/* <Link href="/businesses" className="text-[#E89D24] hover:text-[#E5A800] font-semibold text-sm md:text-base">
                        View All
                    </Link> */}
                </div>

                {/* Mobile: horizontal-scroll icon chips */}
                <div className="md:hidden scroll-row gap-3 md:-mx-4 px-4">
                    {businessTypes.map((type) => {
                        const { icon: IconComponent, color, iconColor } = getCategoryIcon(type.code);
                        return (
                            <Link
                                key={type.id}
                                href={`/businesses?category=${type.code}`}
                                className="shrink-0 w-[82px] snap-start bg-white rounded md:rounded-2xl shadow-sm p-2.5 flex flex-col items-center gap-2 active:scale-95 transition-transform"
                            >
                                <span className={`${color} w-[46px] h-[46px] rounded-full flex items-center justify-center`}>
                                    <IconComponent className={`w-5 h-5 ${iconColor}`} />
                                </span>
                                <span className="text-[11px] font-semibold text-gray-800 text-center leading-tight line-clamp-2">
                                    {type.name}
                                </span>
                            </Link>
                        );
                    })}
                </div>

                {/* Desktop: unchanged grid, first 4 only */}
                <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    {businessTypes.slice(0, 4).map((type) => {
                        const { icon: IconComponent, color, iconColor } = getCategoryIcon(type.code);
                        return (
                            <Link
                                key={type.id}
                                href={`/businesses?category=${type.code}`}
                                className="group"
                            >
                                <div className="bg-white rounded-2xl p-6 md:p-8 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                                    <div className={`${color} w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4 group-hover:scale-110 transition-transform`}>
                                        <IconComponent className={`w-6 h-6 md:w-8 md:h-8 ${iconColor}`} />
                                    </div>
                                    <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-1 md:mb-2">{type.name}</h3>
                                    <p className="text-xs md:text-sm text-gray-600 line-clamp-1">{type.name} services</p>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
