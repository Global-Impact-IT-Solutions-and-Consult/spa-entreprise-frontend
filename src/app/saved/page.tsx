"use client";

import { useState, useEffect } from "react";
import { CustomerHeader } from "@/components/modules/customer/customer-header";
import { CustomerFooter } from "@/components/modules/customer/customer-footer";
import { SavedBusinessCard, SavedBusinessSkeleton } from "@/components/modules/customer/saved-business-card";
import { ServiceCard, ServiceSkeleton } from "@/components/modules/discovery/service-card";
import { favoritesService } from "@/services/favorites.service";
import { useAuthStore } from "@/store/auth.store";
import { toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";
import { Bookmark, Heart, Grid3X3, Store } from "lucide-react";

export default function SavedPage() {
    const { isAuthenticated } = useAuthStore();
    const [activeTab, setActiveTab] = useState<"businesses" | "services">("businesses");
    const [savedBusinesses, setSavedBusinesses] = useState<any[]>([]);
    const [savedServices, setSavedServices] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchFavorites = async () => {
        if (!isAuthenticated) return;

        setIsLoading(true);
        try {
            const data = await favoritesService.getUserFavorites();

            // Assuming data structure: { businesses: [...], services: [...] }
            // If data is array (old format), we might need to filter or map
            const bizList = Array.isArray(data?.businesses) ? data.businesses :
                (Array.isArray(data) ? data.filter((f: any) => f.businessId && f.business) : []);

            const serviceList = Array.isArray(data?.services) ? data.services :
                (Array.isArray(data) ? data.filter((f: any) => f.serviceId && f.service) : []);

            setSavedBusinesses(bizList.map((f: any) => ({
                ...(f.business || {}),
                id: f.businessId,
                // Add default fields if missing
                startingPrice: f.business?.startingPrice || 3000,
                isOpen: true,
                isVerified: true
            })));

            setSavedServices(serviceList.map((f: any) => {
                const s = f.service || {};
                return {
                    ...s,
                    id: f.serviceId || s.id,
                    businessId: s.businessId || s.business?.id,
                    businessName: s.business?.businessName || "Wellness Business",
                    location: s.business?.city?.name || s.business?.city || "Lagos",
                    imageUrl: s.imageUrl || "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&q=80",
                    category: s.category || { id: "1", name: "Wellness" },
                    rating: s.averageRating || 4.5,
                    reviews: s.totalReviews || 120,
                    deliveryType: s.deliveryType || "both"
                };
            }));
        } catch (error) {
            console.error("Failed to fetch favorites", error);
            toaster.create({ title: "Error", description: "Failed to load saved items.", type: "error" });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchFavorites();
    }, [isAuthenticated]);

    const handleRemoveBusiness = async (id: string) => {
        try {
            await favoritesService.removeBusinessFavorite(id);
            setSavedBusinesses(prev => prev.filter(b => b.id !== id));
            toaster.create({ title: "Removed from saved", type: "success" });
        } catch (error) {
            toaster.create({ title: "Error", description: "Failed to remove item.", type: "error" });
        }
    };

    return (
        <div className="min-h-screen bg-[#F9FAFB]">
            <CustomerHeader />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
                {/* Page Header */}
                <div className="mb-10">
                    <h1 className="text-3xl md:text-4xl font-black text-gray-900 font-playfair mb-3">Saved</h1>
                    <p className="text-gray-500 font-medium">Your Saved Businesses and Services</p>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-8 mb-8 border-b border-gray-100">
                    <button
                        onClick={() => setActiveTab("businesses")}
                        className={cn(
                            "pb-4 text-sm font-bold transition-all relative",
                            activeTab === "businesses" ? "text-[#E89D24]" : "text-gray-400 hover:text-gray-600"
                        )}
                    >
                        Saved Businesses
                        {activeTab === "businesses" && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E89D24]" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab("services")}
                        className={cn(
                            "pb-4 text-sm font-bold transition-all relative",
                            activeTab === "services" ? "text-[#E89D24]" : "text-gray-400 hover:text-gray-600"
                        )}
                    >
                        Saved Services
                        {activeTab === "services" && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E89D24]" />
                        )}
                    </button>
                </div>

                {/* Grid Content */}
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map((i) => (
                            activeTab === "businesses" ? <SavedBusinessSkeleton key={i} /> : <ServiceSkeleton key={i} />
                        ))}
                    </div>
                ) : (activeTab === "businesses" ? savedBusinesses : savedServices).length === 0 ? (
                    <div className="py-20 flex flex-col items-center justify-center text-center bg-white rounded-3xl border border-dashed border-gray-200 shadow-sm">
                        <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mb-6">
                            {activeTab === "businesses" ? (
                                <Store className="w-8 h-8 text-[#E89D24]" />
                            ) : (
                                <Heart className="w-8 h-8 text-[#E89D24]" />
                            )}
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No saved {activeTab} yet</h3>
                        <p className="text-gray-500 max-w-xs mx-auto mb-8 font-medium">
                            Explore our directory and save your favorite {activeTab === "businesses" ? "places" : "services"} for quick access later.
                        </p>
                        <a href={activeTab === "businesses" ? "/businesses" : "/discover"} className="bg-[#E89D24] hover:bg-[#D97706] text-white px-8 h-12 flex items-center justify-center rounded-xl font-bold text-sm transition-all active:scale-95 shadow-lg shadow-orange-100">
                            Start Exploring
                        </a>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {activeTab === "businesses" ? (
                            savedBusinesses.map((biz) => (
                                <SavedBusinessCard
                                    key={biz.id}
                                    business={biz}
                                    onRemove={handleRemoveBusiness}
                                />
                            ))
                        ) : (
                            savedServices.map((service) => (
                                <ServiceCard
                                    key={service.id}
                                    service={service}
                                />
                            ))
                        )}
                    </div>
                )}
            </main>

            <CustomerFooter />
        </div>
    );
}
