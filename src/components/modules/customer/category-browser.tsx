"use client";

import Link from "next/link";
import { Sparkles, Scissors, Smile, Brush } from "lucide-react";

const categories = [
    {
        id: 1,
        name: "Spa",
        description: "Massage & Relaxation",
        icon: Sparkles,
        color: "bg-purple-50",
        iconColor: "text-purple-600",
    },
    {
        id: 2,
        name: "Barber",
        description: "HairCut & Grooming",
        icon: Scissors,
        color: "bg-blue-50",
        iconColor: "text-blue-600",
    },
    {
        id: 3,
        name: "Facial",
        description: "Skin care",
        icon: Smile,
        color: "bg-orange-50",
        iconColor: "text-orange-600",
    },
    {
        id: 4,
        name: "Beauty",
        description: "Makeup & Treatment",
        icon: Brush,
        color: "bg-pink-50",
        iconColor: "text-pink-600",
    },
];

export function CategoryBrowser() {
    return (
        <section className="py-12 md:py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between mb-8 md:mb-10">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Browse Category</h2>
                    <Link href="/categories" className="text-[#F5B800] hover:text-[#E5A800] font-semibold text-sm md:text-base">
                        View All
                    </Link>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    {categories.map((category) => {
                        const IconComponent = category.icon;
                        return (
                            <Link
                                key={category.id}
                                href={`/categories/${category.name.toLowerCase()}`}
                                className="group"
                            >
                                <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                                    <div className={`${category.color} w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4 group-hover:scale-110 transition-transform`}>
                                        <IconComponent className={`w-6 h-6 md:w-8 md:h-8 ${category.iconColor}`} />
                                    </div>
                                    <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-1 md:mb-2">{category.name}</h3>
                                    <p className="text-xs md:text-sm text-gray-600">{category.description}</p>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
