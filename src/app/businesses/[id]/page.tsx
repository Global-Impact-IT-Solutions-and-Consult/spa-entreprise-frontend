"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
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
import { businessService, Business, Service, Staff, BusinessImage } from "@/services/business.service";
import { Loader2, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function BusinessDetailsPage() {
    const params = useParams();
    const id = params.id as string;

    const [activeTab, setActiveTab] = useState("Services");
    const [business, setBusiness] = useState<Business | null>(null);
    const [services, setServices] = useState<Service[]>([]);
    const [staff, setStaff] = useState<Staff[]>([]);
    const [gallery, setGallery] = useState<BusinessImage[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const tabs = ["Services", "About", "Reviews", "Gallery", "Staff's"];

    useEffect(() => {
        const fetchAllData = async () => {
            if (!id) return;
            setLoading(true);
            setError(null);
            try {
                const [businessData, servicesData, galleryData] = await Promise.all([
                    businessService.getBusinessProfile(id),
                    businessService.getServices(id),
                    // businessService.getAllStaff(id),
                    businessService.getGalleryImages(id)
                ]);

                setBusiness(businessData);
                setServices(servicesData);
                // setStaff(staffData);
                setGallery(galleryData);
            } catch (err: any) {
                console.error("Error fetching business profile data:", err);
                setError(err.message || "Failed to load business profile. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-white">
                <CustomerHeader />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <Skeleton className="h-[400px] w-full rounded-3xl mb-12" />
                    <div className="flex flex-col lg:flex-row gap-12">
                        <div className="flex-1 space-y-8">
                            <Skeleton className="h-14 w-full max-w-2xl rounded-2xl" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <Skeleton className="h-64 rounded-2xl" />
                                <Skeleton className="h-64 rounded-2xl" />
                            </div>
                        </div>
                        <aside className="w-96 hidden lg:block">
                            <Skeleton className="h-[600px] rounded-3xl" />
                        </aside>
                    </div>
                </div>
                <CustomerFooter />
            </div>
        );
    }

    if (error || !business) {
        return (
            <div className="min-h-screen bg-gray-50/10">
                <CustomerHeader />
                <main className="max-w-7xl mx-auto px-4 py-20 text-center">
                    <div className="bg-white p-12 rounded-3xl shadow-sm max-w-md mx-auto">
                        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Oops!</h2>
                        <p className="text-gray-600 mb-8">{error || "Business not found."}</p>
                        <Button
                            href="/businesses"
                            className="bg-[#E89D24] hover:bg-[#E5A800] text-white px-8 py-3 rounded-xl font-bold"
                        >
                            Back to Directory
                        </Button>
                    </div>
                </main>
                <CustomerFooter />
            </div>
        );
    }

    // Transform API data for components
    const transformedBusiness = {
        ...business,
        name: business.businessName,
        rating: typeof business.averageRating === 'string' ? parseFloat(business.averageRating) : (business.averageRating || 0),
        reviews: business.totalReviews || 0,
        category: business.businessTypeCode || "Wellness",
        distance: "1.2 mi away", // Potential future enhancement
        startingPrice: services.length > 0 ? Math.min(...services.map(s => s.price)).toLocaleString() : "---",
        bannerImage: business.coverImage || "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=1600&q=80",
        profileImage: business.primaryImageUrl || "https://images.unsplash.com/photo-1512690196246-86e580db7940?w=800&q=80",
        address: business.address || business.addressDetails?.address || "Lagos, Nigeria",
        phone: business.phone || "---",
        email: business.email || "---",
        status: business.operatingHours ? "Open now" : "Contact for hours", // Simplified for now
        description: business.description || "No description available.",
        gallery: gallery.map(img => img.url),
        staffs: staff.map(s => ({
            ...s,
            rating: 4.5, // Mock as backend doesn't provide staff ratings yet
            reviews: 0,
            description: "Experienced wellness professional.",
            specialties: []
        })),
        hours: business.operatingHours ? Object.entries(business.operatingHours).map(([day, hrs]) => ({
            day: day.charAt(0).toUpperCase() + day.slice(1),
            time: hrs.closed ? "Closed" : `${hrs.open} - ${hrs.close}`,
            isToday: new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase() === day.toLowerCase()
        })) : []
    };

    return (
        <div className="min-h-screen bg-gray-50/10">
            <CustomerHeader />

            <BusinessHeader business={transformedBusiness} />

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
                                {services.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {services.map((service) => (
                                            <ServiceCard
                                                key={service.id}
                                                service={{
                                                    ...service,
                                                    businessName: business.businessName,
                                                    businessId: business.id,
                                                    image: transformedBusiness.profileImage, // Fallback image for service
                                                    rating: transformedBusiness.rating,
                                                    reviews: transformedBusiness.reviews,
                                                    location: transformedBusiness.address,
                                                    distance: transformedBusiness.distance
                                                }}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 py-10 text-center bg-white rounded-3xl border border-dashed border-gray-200">
                                        No services available at the moment.
                                    </p>
                                )}
                            </div>
                        )}

                        {activeTab === "About" && (
                            <BusinessAboutTab
                                businessName={business.businessName}
                                description={transformedBusiness.description}
                            />
                        )}

                        {activeTab === "Reviews" && (
                            <BusinessReviewsTab
                                rating={transformedBusiness.rating}
                                totalReviews={transformedBusiness.reviews}
                                ratingDistribution={[]} // Mock if backend doesn't provide
                                reviews={[]} // Mock until review endpoint is confirmed
                            />
                        )}

                        {activeTab === "Gallery" && (
                            <BusinessGalleryTab images={transformedBusiness.gallery} />
                        )}

                        {activeTab === "Staff's" && (
                            <BusinessStaffTab staffs={transformedBusiness.staffs} />
                        )}
                    </div>

                    {/* Sidebar Area */}
                    <aside className="w-full lg:w-96 order-last lg:order-none">
                        <BusinessInfoSidebar business={transformedBusiness} />
                    </aside>

                </div>
            </main>

            <CustomerFooter />
        </div>
    );
}
