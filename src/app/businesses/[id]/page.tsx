"use client";

import { useState } from "react";
import { CustomerHeader } from "@/components/modules/customer/customer-header";
import { CustomerFooter } from "@/components/modules/customer/customer-footer";
import { BusinessHeader } from "@/components/modules/discovery/business-header";
import { BusinessInfoSidebar } from "@/components/modules/discovery/business-info-sidebar";
import { ServiceCard } from "@/components/modules/discovery/service-card";
import { Button } from "@/components/ui/button";
import { BusinessStaffTab } from "@/components/modules/discovery/business-staff-tab";
import { BusinessAboutTab } from "@/components/modules/discovery/business-about-tab";
import { BusinessReviewsTab } from "@/components/modules/discovery/business-reviews-tab";
import { BusinessGalleryTab } from "@/components/modules/discovery/business-gallery-tab";

const MOCK_BUSINESS = {
    id: "precision-cut",
    name: "Precision Cut Barbershop",
    rating: 4.6,
    reviews: 247,
    category: "Barbershop",
    distance: "1.2 mi away",
    startingPrice: "4,500",
    bannerImage: "https://images.unsplash.com/photo-1512690196246-86e580db7940?w=1600&q=80",
    profileImage: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800&q=80",
    address: "123 Barber Street, Mainland Ikeja, Lagos",
    phone: "(415) 555-0123",
    email: "info@precisioncutbarbers.com",
    status: "Open now • Closes at 7:00 PM",
    description: `Established in 2015, Precision Cut Barbershop has been serving the Downtown community with exceptional barbering services. Our shop combines traditional barbering techniques with modern styles to provide the perfect look for every client.\n\nWe specialize in precision haircuts, detailed beard work, and traditional straight razor shaves. Our barbers are trained in the latest techniques and trends, ensuring you always leave looking your best.`,
    ratingDistribution: [
        { stars: 5, count: 173 },
        { stars: 4, count: 49 },
        { stars: 3, count: 15 },
        { stars: 2, count: 7 },
        { stars: 1, count: 3 },
    ],
    gallery: [
        "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800&q=80",
        "https://images.unsplash.com/photo-1512690196246-86e580db7940?w=800&q=80",
        "https://images.unsplash.com/photo-1621605815841-28d9446e3a53?w=800&q=80",
        "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&q=80",
        "https://images.unsplash.com/photo-1599351431613-18ef1fdd27e1?w=800&q=80",
        "https://images.unsplash.com/photo-1516914943479-89db7d9ae7d1?w=800&q=80",
    ],
    staffs: [
        {
            id: "st1",
            name: "Marcus Johnson",
            role: "Expert Barber",
            rating: 4.6,
            reviews: 184,
            description: "Specializes in skin fades, traditional straight razor shaves, and beard artistry. Trained in London and New York.",
            specialties: ["Skin Fades", "Straight Razor", "Beard Work"],
        },
        {
            id: "st2",
            name: "Marcus Johnson",
            role: "Expert Barber",
            rating: 4.6,
            reviews: 184,
            description: "Specializes in skin fades, traditional straight razor shaves, and beard artistry. Trained in London and New York.",
            specialties: ["Skin Fades", "Straight Razor", "Beard Work"],
        }
    ],
    hours: [
        { day: "Monday", time: "9:00 AM - 7:00 PM" },
        { day: "Tuesday", time: "9:00 AM - 7:00 PM" },
        { day: "Wednesday", time: "9:00 AM - 7:00 PM", isToday: true },
        { day: "Thursday", time: "9:00 AM - 7:00 PM" },
        { day: "Friday", time: "9:00 AM - 7:00 PM" },
        { day: "Saturday", time: "9:00 AM - 7:00 PM" },
        { day: "Sunday", time: "9:00 AM - 7:00 PM" },
    ]
};

const MOCK_REVIEWS = [
    {
        id: "r1",
        userName: "Michael Chen",
        rating: 5,
        date: "2 weeks ago",
        comment: "Marcus gave me the best fade I've ever had! Attention to detail is incredible. The hot towel treatment was the perfect finishing touch. Will definitely be back regularly.",
        service: "Skin Fade & Beard Trim",
        provider: "Marcus",
    },
    {
        id: "r2",
        userName: "Sarah Johnson",
        rating: 4,
        date: "3 weeks ago",
        comment: "Took my 8-year-old son here for his first real haircut. David was amazing with him - so patient and made the experience fun. My son loves his new haircut and can't wait to come back!",
        service: "Kids Haircut",
        provider: "David",
    },
];

const MOCK_SERVICES = [
    {
        id: "s1",
        title: "Gel Manicure with Design",
        businessName: "Precision Cut Barbershop",
        category: "Nail Service",
        duration: "60min",
        buffer: "20min",
        inStorePrice: "7,000",
        homePrice: "15,000",
        rating: 4.8,
        reviews: 124,
        image: "https://images.unsplash.com/photo-1604654894610-df4906ecefe7?w=800&q=80",
        location: "Ikeja GRA",
        distance: "1.2 mi",
    },
    {
        id: "s2",
        title: "Skin Fade with Line Up",
        businessName: "Precision Cut Barbershop",
        category: "Barbing",
        duration: "60min",
        buffer: "20min",
        inStorePrice: "7,000",
        homePrice: "15,000",
        rating: 4.7,
        reviews: 98,
        image: "https://images.unsplash.com/photo-1599351431247-f57933842922?w=800&q=80",
        location: "Downtown",
        distance: "0.8 mi",
    },
];

export default function BusinessDetailsPage() {
    const [activeTab, setActiveTab] = useState("Services");

    const tabs = ["Services", "About", "Reviews", "Gallery", "Staff's"];

    return (
        <div className="min-h-screen bg-gray-50/10">
            <CustomerHeader />

            <BusinessHeader business={MOCK_BUSINESS} />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 pb-20">
                <div className="flex flex-col lg:flex-row gap-12">

                    {/* Main Content Area */}
                    <div className="flex-1 min-w-0">
                        {/* Tabs */}
                        <div className="bg-gray-100/50 p-1.5 rounded-2xl flex gap-1 mb-10 w-fit w-full overflow-auto">
                            {tabs.map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-8 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === tab
                                        ? "bg-[#E89D24] text-white shadow-lg shadow-yellow-500/20"
                                        : "text-gray-500 hover:text-gray-700 hover:bg-white/50"
                                        }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        {/* Render Active Tab Content */}
                        {activeTab === "Services" && (
                            <div>
                                <h2 className="text-3xl font-bold text-gray-900 tracking-tight mb-8">Our Services</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {MOCK_SERVICES.map((service) => (
                                        <ServiceCard key={service.id} service={service} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === "About" && (
                            <BusinessAboutTab
                                businessName={MOCK_BUSINESS.name}
                                description={MOCK_BUSINESS.description}
                            />
                        )}

                        {activeTab === "Reviews" && (
                            <BusinessReviewsTab
                                rating={MOCK_BUSINESS.rating}
                                totalReviews={MOCK_BUSINESS.reviews}
                                ratingDistribution={MOCK_BUSINESS.ratingDistribution}
                                reviews={MOCK_REVIEWS}
                            />
                        )}

                        {activeTab === "Gallery" && (
                            <BusinessGalleryTab images={MOCK_BUSINESS.gallery} />
                        )}

                        {activeTab === "Staff's" && (
                            <BusinessStaffTab staffs={MOCK_BUSINESS.staffs} />
                        )}
                    </div>

                    {/* Sidebar Area */}
                    <aside className="w-full lg:w-96 order-last lg:order-none">
                        <BusinessInfoSidebar business={MOCK_BUSINESS} />
                    </aside>

                </div>
            </main>

            <CustomerFooter />
        </div>
    );
}
