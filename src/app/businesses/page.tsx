"use client";

import { useEffect, useState, useCallback, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { State, City, IState, ICity } from "country-state-city";
import { CustomerHeader } from "@/components/modules/customer/customer-header";
import { CustomerFooter } from "@/components/modules/customer/customer-footer";
import { BusinessDirectoryCard } from "@/components/modules/discovery/business-directory-card";
import { businessService, BusinessType, SpaSearchResult, isBusinessOpen, Service } from "@/services/business.service";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from '@/store/auth.store';
import { useFavoritesStore } from '@/store/favorites.store';
import { favoritesService } from "@/services/favorites.service";
import { Heart, Store, Home, SlidersHorizontal, MapPin, Search, ChevronDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdvanceFilterModal, AdvancedFiltersState } from "@/components/modules/discovery/advance-filter-modal";

function BusinessDirectoryContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    // State for data
    const [businesses, setBusinesses] = useState<any[]>([]);
    const [businessTypes, setBusinessTypes] = useState<BusinessType[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [total, setTotal] = useState(0);

    const [states, setStates] = useState<IState[]>([]);
    const [cities, setCities] = useState<ICity[]>([]);
    const countryCode = "NG";
    
    const { isAuthenticated } = useAuthStore();
    const { businessIds: favoriteBusinessIds, setServiceIds: setFavoriteServiceIds, setBusinessIds: setFavoriteBusinessIds, clear: clearFavorites } = useFavoritesStore();

    // Filter State for Pills
    const [activeFilter, setActiveFilter] = useState("All Services");
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [advancedFilters, setAdvancedFilters] = useState<AdvancedFiltersState>({
        maxPrice: 100000,
        distance: "any",
        availability: [],
        rating: "any",
    });

    // Initial filter state from URL
    const initialFilters = {
        search: searchParams.get("search") || "",
        state: searchParams.get("state") || "",
        city: searchParams.get("city") || "",
        category: searchParams.get("category") || "All Businesses",
        minRating: searchParams.get("minRating") || "All Rating",
        limit: parseInt(searchParams.get("limit") || "12"),
    };

    const [filters, setFilters] = useState(initialFilters);
    const [pendingFilters, setPendingFilters] = useState(initialFilters);

    const [tempSearch, setTempSearch] = useState(initialFilters.search);

    // Fetch business types and states
    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await businessService.getBusinessTypes();
                setBusinessTypes(data);
                setStates(State.getStatesOfCountry(countryCode));
            } catch (error) {
                console.error("Failed to fetch business types/states:", error);
            }
        };
        fetchData();
    }, []);

    // Fetch cities when State changes
    useEffect(() => {
        if (pendingFilters.state) {
            const stateObj = states.find(s => s.name === pendingFilters.state);
            if (stateObj) {
                setCities(City.getCitiesOfState(countryCode, stateObj.isoCode));
            } else {
                setCities([]);
            }
        } else {
            setCities([]);
        }
    }, [pendingFilters.state, states]);

    // Fetch User Favorites
    useEffect(() => {
        if (isAuthenticated) {
            favoritesService.getUserFavorites().then(res => {
                const sIds: string[] = [];
                const bIds: string[] = [];
                
                // Extract Services
                const serviceList = Array.isArray(res?.services) ? res.services : 
                                   (Array.isArray(res) ? res.filter((f: any) => f.serviceId) : []);
                serviceList.forEach((item: any) => {
                    if (item.serviceId) sIds.push(item.serviceId);
                    else if (item.service?.id) sIds.push(item.service.id);
                });

                // Extract Businesses
                const businessList = Array.isArray(res?.businesses) ? res.businesses : 
                                    (Array.isArray(res) ? res.filter((f: any) => f.businessId) : []);
                businessList.forEach((item: any) => {
                    if (item.businessId) bIds.push(item.businessId);
                    else if (item.business?.id) bIds.push(item.business.id);
                });

                setFavoriteServiceIds(sIds);
                setFavoriteBusinessIds(bIds);
            }).catch(console.error);
        } else {
            clearFavorites();
        }
    }, [isAuthenticated, setFavoriteServiceIds, setFavoriteBusinessIds, clearFavorites]);

    // Main fetch function
    const fetchBusinesses = useCallback(async (currentFilters: typeof filters, isLoadMore = false) => {
        if (isLoadMore) setLoadingMore(true);
        else setLoading(true);

        try {
            const params: any = {};


            if (currentFilters.city) params.city = currentFilters.city;
            if (currentFilters.category !== "All Businesses") params.serviceTypes = currentFilters.category;
            if (currentFilters.minRating !== "All Rating") params.minRating = parseFloat(currentFilters.minRating);

            params.limit = currentFilters.limit;
            params.sortBy = 'rating';
            params.sortOrder = 'desc';

            const response = await businessService.searchSpasWithEnrichment(params);
            setBusinesses(response.data);
            setTotal(response.meta.total);
        } catch (error) {
            console.error("Failed to fetch businesses:", error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, []);

    // Trigger fetch on filter/limit change
    useEffect(() => {
        fetchBusinesses(filters);

        // Update URL
        const params = new URLSearchParams();
        if (filters.search) params.set("search", filters.search);
        if (filters.state) params.set("state", filters.state);
        if (filters.city) params.set("city", filters.city);
        if (filters.category !== "All Businesses") params.set("category", filters.category);
        if (filters.minRating !== "All Rating") params.set("minRating", filters.minRating);
        if (filters.limit > 12) params.set("limit", filters.limit.toString());

        router.push(`/businesses?${params.toString()}`, { scroll: false });
    }, [filters, fetchBusinesses, router]);

    // Derived filtered businesses
    const filteredBusinesses = useMemo(() => {
        let result = businesses;

        // Filter by delivery type
        if (activeFilter === "In-Store") {
            // We'll need to check if ANY service in the business is in-store
            // Since we enriched businesses with full data, let's assume they have deliveryTypes
            // If not, we'll need to update the enrichment query
            result = result.filter(b => b.availableDeliveryTypes?.includes('in_location_only') || b.availableDeliveryTypes?.includes('both'));
        } else if (activeFilter === "Home Service") {
            result = result.filter(b => b.availableDeliveryTypes?.includes('home_service') || b.availableDeliveryTypes?.includes('both'));
        } else if (activeFilter === "Saved") {
            const favoriteIdsSet = new Set(favoriteBusinessIds);
            result = result.filter(b => favoriteIdsSet.has(b.id));
        }

        // Apply Advanced Filters (Client-side for now)
        if (advancedFilters.rating !== "any") {
            const minR = parseFloat(advancedFilters.rating);
            result = result.filter(b => (typeof b.averageRating === 'string' ? parseFloat(b.averageRating) : (b.averageRating || 0)) >= minR);
        }

        return result;
    }, [businesses, activeFilter, favoriteBusinessIds, advancedFilters]);

    const handleApplyFilters = () => {
        const newFilters = { ...pendingFilters, search: tempSearch, limit: 12 };
        setFilters(newFilters);
        setPendingFilters(newFilters);
    };

    const handleLoadMore = () => {
        if (businesses.length < total) {
            const newLimit = filters.limit + 12;
            setFilters(prev => ({ ...prev, limit: newLimit }));
            setPendingFilters(prev => ({ ...prev, limit: newLimit }));
        }
    };

    const handleReset = () => {
        setTempSearch("");
        const resetState = {
            search: "",
            state: "",
            city: "",
            category: "All Businesses",
            minRating: "All Rating",
            limit: 12,
        };
        setPendingFilters(resetState);
        setFilters(resetState);
        setActiveFilter("All Services");
        setAdvancedFilters({
            maxPrice: 100000,
            distance: "any",
            availability: [],
            rating: "any",
        });
    };

    return (
        <div className="min-h-screen bg-[#F9FAFB]">
            <CustomerHeader />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
                {/* Header Section */}
                <div className="mb-10">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight font-playfair">Business Directory</h1>
                    <p className="text-gray-600 max-w-2xl leading-relaxed">
                        Find trusted barbershops, nail salons, spas, and wellness centers in your area. Verified businesses with quality services.
                    </p>
                </div>

                {/* Filter Container */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mb-12">
                    {/* Search Bar */}
                    <div className="flex flex-col lg:flex-row gap-4 mb-8 border border-gray-200 rounded-xl p-2 focus-within:ring-2 focus-within:ring-[#E89D24] transition-all">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search Business name"
                                value={tempSearch}
                                onChange={(e) => setTempSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()}
                                className="w-full pl-12 pr-4 h-12 focus:outline-none transition-all cursor-pointer font-medium text-gray-700"
                            />
                        </div>
                        {/* State Filter */}
                        <div className="relative lg:w-48">
                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <select
                                value={pendingFilters.state}
                                onChange={(e) => setPendingFilters(prev => ({ ...prev, state: e.target.value, city: "" }))}
                                className="w-full pl-12 pr-10 h-12 rounded-lg border border-transparent bg-gray-50/50 focus:outline-none appearance-none cursor-pointer font-medium text-gray-700"
                            >
                                <option value="">Select State</option>
                                {states.map(s => (
                                    <option key={s.isoCode} value={s.name}>{s.name}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                        {/* City Filter */}
                        <div className={`relative lg:w-44 ${!pendingFilters.state ? 'opacity-50' : ''}`}>
                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <select
                                value={pendingFilters.city}
                                onChange={(e) => setPendingFilters(prev => ({ ...prev, city: e.target.value }))}
                                disabled={!pendingFilters.state}
                                className="w-full pl-12 pr-10 h-12 rounded-lg border border-transparent bg-gray-50/50 focus:outline-none appearance-none cursor-pointer font-medium text-gray-700"
                            >
                                <option value="">Select City</option>
                                {cities.map((c, i) => (
                                    <option key={`${c.name}-${i}`} value={c.name}>{c.name}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                        {/* Category Filter */}
                        <div className="relative lg:w-52">
                            <SlidersHorizontal className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <select
                                value={pendingFilters.category}
                                onChange={(e) => setPendingFilters(prev => ({ ...prev, category: e.target.value }))}
                                className="w-full pl-12 pr-10 h-12 rounded-lg border border-transparent bg-gray-50/50 focus:outline-none appearance-none cursor-pointer font-medium text-gray-700"
                            >
                                <option>All Businesses</option>
                                {businessTypes.map(type => (
                                    <option key={type.id} value={type.id}>{type.name}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                        {/* Rating Filter */}
                        <div className="relative lg:w-44">
                            <SlidersHorizontal className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <select
                                value={pendingFilters.minRating}
                                onChange={(e) => setPendingFilters(prev => ({ ...prev, minRating: e.target.value }))}
                                className="w-full pl-12 pr-10 h-12 rounded-lg border border-transparent bg-gray-50/50 focus:outline-none appearance-none cursor-pointer font-medium text-gray-700"
                            >
                                <option>All Rating</option>
                                <option value="4.5">4.5+ Stars</option>
                                <option value="4.0">4.0+ Stars</option>
                                <option value="3.5">3.5+ Stars</option>
                                <option value="3.0">3.0+ Stars</option>
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                        <Button
                            onClick={handleApplyFilters}
                            className="h-12 px-8 bg-[#E89D24] hover:bg-[#E5A800] text-white font-bold rounded-xl shadow-lg shadow-yellow-500/20"
                        >
                            Search
                        </Button>
                    </div>

                    {/* Filter by Section (Pills) */}
                    <div className="flex flex-col gap-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-bold text-gray-900">Filter by</h3>
                            {/* <button onClick={() => setShowAdvanced(true)} className="flex items-center gap-2 text-sm font-bold text-[#E89D24] hover:text-[#E5A800] transition-colors">
                                <SlidersHorizontal className="w-4 h-4" />
                                Advance Filter Option
                            </button> */}
                        </div>
                        <div className="flex flex-wrap gap-3">
                            {[
                                { id: "All Services", label: "All Services", icon: null },
                                { id: "Saved", label: "Saved", icon: Heart },
                                { id: "In-Store", label: "In-Store", icon: Store },
                                { id: "Home Service", label: "Home Service", icon: Home },
                            ].map((filter) => (
                                <button
                                    key={filter.id}
                                    onClick={() => setActiveFilter(filter.id)}
                                    className={`flex items-center gap-2.5 px-6 py-3.5 rounded-full text-sm font-bold transition-all border ${activeFilter === filter.id
                                        ? "bg-[#E89D24] border-[#E89D24] text-white shadow-md scale-105"
                                        : "bg-white border-gray-100 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                                        }`}
                                >
                                    {filter.icon && <filter.icon className={`w-4 h-4 ${activeFilter === filter.id ? 'text-white' : 'text-gray-400'}`} />}
                                    {filter.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Client-side name filtering */}
                {(() => {
                    const finalBusinesses = filteredBusinesses;

                    return (
                        <>
                            {/* Grid Header */}
                            <div className="flex items-center justify-between mb-10">
                                <h2 className="text-3xl font-bold text-gray-900 tracking-tight" style={{ fontFamily: 'var(--font-playfair)' }}>
                                    {filters.search ? `Search Results for "${filters.search}"` : "All Businesses"}
                                </h2>
                                <p className="text-sm font-medium text-gray-500">{finalBusinesses.length} results found</p>
                            </div>
 
                            {/* Business Grid */}
                            {
                                loading ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                                        {[1, 2, 3, 4, 5, 6].map((i) => (
                                            <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm p-4 h-[400px]">
                                                <Skeleton className="h-48 w-full rounded-xl mb-4" />
                                                <Skeleton className="h-6 w-3/4 mb-2" />
                                                <Skeleton className="h-4 w-1/2 mb-4" />
                                                <div className="space-y-2">
                                                    <Skeleton className="h-4 w-full" />
                                                    <Skeleton className="h-4 w-5/6" />
                                                </div>
                                                <div className="mt-auto flex justify-between items-center pt-8">
                                                    <Skeleton className="h-8 w-24" />
                                                    <Skeleton className="h-10 w-28" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : finalBusinesses.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                                        {finalBusinesses.map((business: any) => (
                                            <BusinessDirectoryCard
                                                key={business.id}
                                                business={{
                                                    ...business,
                                                    isVerified: business.status === 'APPROVED',
                                                    isOpen: isBusinessOpen(business.operatingHours),
                                                }}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-20 text-center bg-white rounded-2xl border border-dashed border-gray-200">
                                        <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">No businesses found</h3>
                                        <p className="text-gray-500">Try adjusting your filters or search terms.</p>
                                        <Button variant="outline" onClick={handleReset} className="mt-6 rounded-xl">Clear All Filters</Button>
                                    </div>
                                )
                            }
                        </>
                    );
                })()}

                {/* Pagination */}
                {
                    businesses.length < total && (
                        <div className="flex justify-center pt-8 border-t border-gray-100 mb-12">
                            <Button
                                variant="outline"
                                disabled={loadingMore}
                                onClick={handleLoadMore}
                                className="h-12 px-10 rounded-xl border-gray-200 font-bold text-gray-700 hover:bg-gray-50 transition-colors min-w-[200px]"
                            >
                                {loadingMore ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                        Loading...
                                    </>
                                ) : (
                                    "Load More Businesses"
                                )}
                            </Button>
                        </div>
                    )
                }
 
                <AdvanceFilterModal
                    open={showAdvanced}
                    onClose={() => setShowAdvanced(false)}
                    initialFilters={advancedFilters}
                    onApply={(filters) => setAdvancedFilters(filters)}
                />
            </main >
 
            <CustomerFooter />
        </div >
    );
}

export default function BusinessDirectoryPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-10 h-10 animate-spin text-[#E89D24]" />
            </div>
        }>
            <BusinessDirectoryContent />
        </Suspense>
    );
}

const Building2 = ({ className }: { className?: string }) => (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="20" x="4" y="2" rx="2" ry="2" /><path d="M9 22v-4h6v4" /><path d="M8 6h.01" /><path d="M16 6h.01" /><path d="M8 10h.01" /><path d="M16 10h.01" /><path d="M8 14h.01" /><path d="M16 14h.01" /></svg>
);
