import Link from "next/link";
import { BusinessDirectoryCard } from "@/components/modules/discovery/business-directory-card";

const businesses = [
    {
        id: "precision-cut", // Changed to string to match directory patterns
        name: "Elite Barber Lounge",
        location: "Lekki Phase 1, Lagos",
        description: "Premium barbershop offering haircuts, beard grooming, and traditional shaves with modern styling techniques.",
        rating: 4.7,
        reviews: 124,
        price: "3,000",
        image: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&q=80",
        isOpen: true,
        verified: true,
    },
    {
        id: "2",
        name: "Facial Star",
        location: "Ring Rd, Warri, Delta",
        description: "We specialize in facial massages, to bring bring out the glow of your skin",
        rating: 4.5,
        reviews: 184,
        price: "10,000",
        image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&q=80",
        isOpen: true,
        verified: false,
    },
    {
        id: "3",
        name: "Glow Beauty Salon",
        location: "Abuja Central",
        description: "Full-service beauty salon specializing in hair styling, makeup, facials, and nail services. Certified...",
        rating: 4.7,
        reviews: 154,
        price: "4,500",
        image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&q=80",
        isOpen: true,
        verified: true,
    },
    {
        id: "4",
        name: "Serenity Spa & Wellness",
        location: "Victoria Island, Lagos",
        description: "Premium wellness center offering spa treatments, massage therapy, and relaxation services in a tranquil...",
        rating: 4.7,
        reviews: 98,
        price: "6,500",
        image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&q=80",
        isOpen: true,
        verified: true,
    },
];

export function FeaturedBusinesses() {
    return (
        <section className="py-12 md:py-16 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between mb-8 md:mb-10">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 font-playfair">Featured Businesses</h2>
                    <Link href="/businesses" className="text-[#E89D24] hover:text-[#E5A800] font-semibold text-sm md:text-base">
                        View All
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {businesses.map((business) => (
                        <BusinessDirectoryCard key={business.id} business={business} />
                    ))}
                </div>
            </div>
        </section>
    );
}

// Building2 icon removed as it's now in BusinessDirectoryCard
