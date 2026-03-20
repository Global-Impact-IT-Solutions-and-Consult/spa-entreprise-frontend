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
import { businessService, Business, Service, Staff, BusinessImage, BusinessReview, isBusinessOpen } from "@/services/business.service";
import { Loader2, AlertCircle, Share2, Copy, Check } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toaster } from "@/components/ui/toaster";
import { getFallbackImage } from "@/lib/image.utils";

export default function BusinessDetailsPage() {
    const params = useParams();
    const id = params.id as string;

    const [activeTab, setActiveTab] = useState("Services");
    const [business, setBusiness] = useState<Business | null>(null);
    const [services, setServices] = useState<Service[]>([]);
    const [staff, setStaff] = useState<Staff[]>([]);
    const [gallery, setGallery] = useState<BusinessImage[]>([]);
    const [reviews, setReviews] = useState<BusinessReview[]>([]);
    const [reviewStats, setReviewStats] = useState<{ averageRating: number; ratingDistribution: { stars: number; count: number }[] }>({
        averageRating: 0,
        ratingDistribution: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    const [businessUrl, setBusinessUrl] = useState("");

    const tabs = ["Services", "About", "Reviews", "Gallery", "Staff"];

    useEffect(() => {
        setBusinessUrl(window.location.href);
    }, []);

    useEffect(() => {
        const fetchAllData = async () => {
            if (!id) return;
            setLoading(true);
            setError(null);
            try {
                const [businessData, servicesData, staffData, galleryData, reviewsData] = await Promise.all([
                    businessService.getBusinessProfile(id),
                    businessService.getServices(id),
                    businessService.getAllStaffPublic(id),
                    businessService.getGalleryImages(id),
                    businessService.getBusinessReviews(id).catch(() => ({
                        data: [],
                        meta: { total: 0, page: 1, limit: 10, totalPages: 0 },
                        averageRating: 0,
                        ratingDistribution: []
                    }))
                ]);

                setBusiness(businessData);
                setServices(servicesData);
                setStaff(staffData);
                setGallery(galleryData);
                setReviews(reviewsData.data);
                setReviewStats({
                    averageRating: reviewsData.averageRating,
                    ratingDistribution: reviewsData.ratingDistribution
                });
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
                            onClick={() => window.location.href = '/discover'}
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

    // Compute open/closed status from operating hours
    const isOpen = isBusinessOpen(business.operatingHours);

    // Transform API data for components
    const transformedBusiness = {
        ...business,
        name: business.businessName,
        rating: typeof business.averageRating === 'string' ? parseFloat(business.averageRating) : (business.averageRating || 0),
        reviews: business.totalReviews || 0,
        category: business?.businessType?.name || "Wellness",
        distance: "", // No placeholder — only show if API provides it
        startingPrice: services.length > 0 ? Math.min(...services.map(s => s.price)).toLocaleString() : "---",
        bannerImage: business.coverImage || getFallbackImage(business.businessName),
        profileImage: business.profileImage || getFallbackImage(business.businessName),
        address: business.addressRelation ? 
            `${business.addressRelation.address}, ${business.addressRelation.city?.name}, ${business.addressRelation.state?.name}` :
            (business.address || business.addressDetails?.address),
        phone: business.phone || "---",
        email: business.email || "---",
        status: isOpen ? "Open now" : "Closed",
        description: business.description || "No description available.",
        facebookUrl: business.facebookUrl,
        instagramUrl: business.instagramUrl,
        twitterUrl: business.twitterUrl,
        gallery: gallery.map(img => img.url),
        staffs: staff.map(s => ({
            ...s,
            rating: 4.5, // Backend doesn't provide staff ratings yet
            reviews: 0,
            description: "Experienced wellness professional.",
            about: s.about || "Experienced wellness professional.",
            profilePicture: s.profilePicture || undefined,
            specialties: (s.serviceIds || [])
                .map(id => services.find(svc => svc.id === id)?.name)
                .filter(Boolean) as string[],
        })),
        hours: business.operatingHours ? ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
            .filter(day => business.operatingHours?.[day])
            .map(day => {
                const hrs = business.operatingHours![day];
                return {
                    day: day.charAt(0).toUpperCase() + day.slice(1),
                    time: hrs.closed ? "Closed" : `${hrs.open} - ${hrs.close}`,
                    isToday: new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase() === day
                };
            }) : []
    };

    // Map API reviews to the component's expected format
    const mappedReviews = reviews.map(r => ({
        id: r.id,
        userName: `${r.user.firstName} ${r.user.lastName}`,
        userAvatar: undefined,
        rating: r.rating,
        date: new Date(r.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
        comment: r.comment,
        service: r.service?.name || "General",
        provider: r.staff?.name || "---"
    }));

    const handleCopyLink = () => {
        navigator.clipboard.writeText(businessUrl);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
        toaster.create({ title: "Link copied to clipboard", type: "success" });
    };

    return (
        <div className="min-h-screen bg-gray-50/10">
            <CustomerHeader />

            <BusinessHeader 
                business={transformedBusiness} 
                onShareClick={() => setIsShareModalOpen(true)}
            />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 pb-20">
                <div className="flex flex-col lg:flex-row gap-12">

                    {/* Main Content Area */}
                    <div className="flex-1 min-w-0">
                        {/* Tabs */}
                        <div className="bg-gray-100/50 p-1.5 rounded-md flex gap-1 mb-10 w-fit w-full overflow-auto">
                            {tabs.map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-8 py-3 rounded-md text-sm font-bold transition-all ${activeTab === tab
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
                                                    rating: transformedBusiness.rating,
                                                    reviews: transformedBusiness.reviews,
                                                    location: transformedBusiness.address,
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
                                rating={reviewStats.averageRating || transformedBusiness.rating}
                                totalReviews={reviews.length || transformedBusiness.reviews}
                                ratingDistribution={reviewStats.ratingDistribution}
                                reviews={mappedReviews}
                            />
                        )}

                        {activeTab === "Gallery" && (
                            <BusinessGalleryTab images={transformedBusiness.gallery} />
                        )}

                        {activeTab === "Staff" && (
                            <BusinessStaffTab staffs={transformedBusiness?.staffs || []} />
                        )}
                    </div>

                    {/* Sidebar Area */}
                    <aside className="w-full lg:w-96 order-last lg:order-none">
                        <BusinessInfoSidebar business={transformedBusiness} />
                    </aside>

                </div>
            </main>

            <CustomerFooter />

            {/* Share Modal */}
            <Dialog open={isShareModalOpen} onOpenChange={setIsShareModalOpen}>
                <DialogContent className="sm:max-w-lg bg-white rounded-lg p-0 overflow-hidden border-none cursor-default">
                    <div className="p-8">
                        <DialogHeader className="mb-6">
                            <DialogTitle className="text-2xl font-bold text-gray-900">Share Business</DialogTitle>
                            <DialogDescription className="text-gray-500 font-medium">
                                Share this business profile with your friends and family.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-6">
                            <div className="flex items-center space-x-2">
                                <div className="grid flex-1 gap-2">
                                    <Label htmlFor="link" className="sr-only">Link</Label>
                                    <Input
                                        id="link"
                                        defaultValue={businessUrl}
                                        readOnly
                                        className="h-12 bg-gray-50 border-gray-100 rounded-xl focus-visible:ring-[#E89D24]"
                                    />
                                </div>
                                <Button
                                    type="button"
                                    onClick={handleCopyLink}
                                    className="h-12 px-6 bg-[#E89D24] hover:bg-[#D48616] text-white font-bold rounded-xl flex items-center gap-2 min-w-[120px]"
                                >
                                    {isCopied ? (
                                        <>
                                            <Check className="h-4 w-4" />
                                            Copied
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="h-4 w-4" />
                                            Copy
                                        </>
                                    )}
                                </Button>
                            </div>

                            <div className="flex justify-center gap-4 pt-4 border-t border-gray-50">
                                <p className="text-xs text-gray-400 font-medium">
                                    Publicly accessible at the link above
                                </p>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
