"use client";

import { ShieldCheck, Lock, Star, Clock } from "lucide-react";

const features = [
    {
        id: 1,
        title: "Verified Business",
        description: "All businesses are thoroughly verified and approved by our team",
        icon: ShieldCheck,
        iconColor: "text-green-600",
        bgColor: "bg-green-100",
    },
    {
        id: 2,
        title: "Secure Payments",
        description: "Escrow protection ensures your payment is safe until service completion",
        icon: Lock,
        iconColor: "text-blue-600",
        bgColor: "bg-blue-100",
    },
    {
        id: 3,
        title: "Customer Reviews",
        description: "Read authentic reviews from other customers before booking",
        icon: Star,
        iconColor: "text-purple-600",
        bgColor: "bg-purple-100",
    },
    {
        id: 4,
        title: "Real-time Availability",
        description: "See real-time availability and book instantly without calls",
        icon: Clock,
        iconColor: "text-orange-600",
        bgColor: "bg-orange-100",
    },
];

export function TrustFeatures() {
    return (
        <section className="py-12 md:py-16 bg-[#F5D5A8]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-10 md:mb-12">
                    <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 md:mb-4">
                        Why Choose WellnessPro
                    </h2>
                    <p className="text-sm md:text-base text-gray-700 max-w-2xl mx-auto px-4">
                        We ensure safe, reliable, and premium experiences for all our customers
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    {features.map((feature) => {
                        const IconComponent = feature.icon;
                        return (
                            <div
                                key={feature.id}
                                className="bg-white rounded-2xl p-6 text-center hover:shadow-lg transition-shadow"
                            >
                                <div className={`${feature.bgColor} w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center mx-auto mb-4`}>
                                    <IconComponent className={`w-7 h-7 md:w-8 md:h-8 ${feature.iconColor}`} />
                                </div>
                                <h3 className="text-base md:text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                                <p className="text-xs md:text-sm text-gray-600">{feature.description}</p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
