"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sparkles, Scissors, Smile, Brush, Loader2 } from "lucide-react";
import { businessService, ServiceCategory } from "@/services/business.service";

const getCategoryIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes("spa")) return { icon: Sparkles, color: "bg-purple-50", iconColor: "text-purple-600" };
    if (n.includes("barber")) return { icon: Scissors, color: "bg-blue-50", iconColor: "text-blue-600" };
    if (n.includes("facial") || n.includes("skin")) return { icon: Smile, color: "bg-orange-50", iconColor: "text-orange-600" };
    if (n.includes("beauty") || n.includes("nail")) return { icon: Brush, color: "bg-pink-50", iconColor: "text-pink-600" };
    return { icon: Sparkles, color: "bg-gray-50", iconColor: "text-gray-600" };
};

export function CategoryBrowser() {
    const [categories, setCategories] = useState<ServiceCategory[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await businessService.getServiceCategories();
                // Filter to show top 4 categories for the homepage or just first 4
                setCategories(data.slice(0, 4));
            } catch (error) {
                console.error("Failed to fetch categories:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    if (loading) {
        return (
            <div className="py-12 flex justify-center items-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#E89D24]" />
            </div>
        );
    }

    if (categories.length === 0) return null;

    return (
        <section className="py-12 md:py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between mb-8 md:mb-10">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Browse Category</h2>
                    <Link href="/categories" className="text-[#E89D24] hover:text-[#E5A800] font-semibold text-sm md:text-base">
                        View All
                    </Link>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    {categories.map((category) => {
                        const { icon: IconComponent, color, iconColor } = getCategoryIcon(category.name);
                        return (
                            <Link
                                key={category.id}
                                href={`/businesses?category=${category.id}`}
                                className="group"
                            >
                                <div className="bg-white rounded-2xl p-6 md:p-8 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                                    <div className={`${color} w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4 group-hover:scale-110 transition-transform`}>
                                        <IconComponent className={`w-6 h-6 md:w-8 md:h-8 ${iconColor}`} />
                                    </div>
                                    <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-1 md:mb-2">{category.name}</h3>
                                    <p className="text-xs md:text-sm text-gray-600 line-clamp-1">{category.name} treatments</p>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
