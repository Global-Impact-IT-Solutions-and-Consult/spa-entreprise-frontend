"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { State, City, IState, ICity } from "country-state-city";
import { CustomerHeader } from "@/components/modules/customer/customer-header";
import { CustomerFooter } from "@/components/modules/customer/customer-footer";
import { BusinessDirectoryCard } from "@/components/modules/discovery/business-directory-card";
import { businessService, BusinessType, isBusinessOpen } from "@/services/business.service";
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
    const PAGE_SIZE = 12;
    const [businesses, setBusinesses] = useState<any[]>([]);
    const [businessTypes, setBusinessTypes] = useState<BusinessType[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [meta, setMeta] = useState<{ page: number, limit: number, total: number, totalPages: number } | null>(null);

    const [states, setStates] = useState<IState[]>([]);
    const [cities, setCities] = useState<ICity[]>([]);
    const countryCode = "NG";
    
    const { isAuthenticated } = useAuthStore();
    const { setServiceIds: setFavoriteServiceIds, setBusinessIds: setFavoriteBusinessIds, clear: clearFavorites } = useFavoritesStore();

    // Filter State for Pills
    const [activeFilter, setActiveFilter] = useState(searchParams.get("type") || "All Services");
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [advancedFilters, setAdvancedFilters] = useState<AdvancedFiltersState>({
        maxPrice: searchParams.get("maxPrice") ? parseInt(searchParams.get("maxPrice")!) : 100000,
        availability: [],
        rating: searchParams.get("minRating") || "any",
    });

    // Initial filter state from URL
    const initialFilters = {
        search: searchParams.get("search") || "",
        state: searchParams.get("state") || "",
        city: searchParams.get("city") || "",
        category: searchParams.get("category") || "All Businesses",
        date: searchParams.get("date") || "",
    };

    const [filters, setFilters] = useState(initialFilters);
    const [tempFilters, setTempFilters] = useState(initialFilters);
    const [isLocationLoaded, setIsLocationLoaded] = useState(false);

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

    // Load default location filter from localStorage if not present in URL on mount
    useEffect(() => {
        if (!searchParams.get("state")) {
            try {
                const cached = localStorage.getItem("user_location_cache");
                if (cached) {
                    const parsed = JSON.parse(cached);
                    if (parsed.state) {
                        setFilters(prev => ({ ...prev, state: parsed.state }));
                        setTempFilters(prev => ({ ...prev, state: parsed.state }));
                    }
                }
            } catch (e) {
                console.error("Failed to parse cached location on mount:", e);
            }
        }
        setIsLocationLoaded(true);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Fetch cities when State changes
    useEffect(() => {
        if (tempFilters.state) {
            const stateObj = states.find(s => s.name === tempFilters.state);
            if (stateObj) {
                setCities(City.getCitiesOfState(countryCode, stateObj.isoCode));
            } else {
                setCities([]);
            }
        } else {
            setCities([]);
        }
    }, [tempFilters.state, states]);

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
    const fetchBusinesses = useCallback(async (page = 1, append = false) => {
        if (append) setLoadingMore(true);
        else setLoading(true);

        try {
            const params: any = {
                page,
                limit: PAGE_SIZE,
                sortBy: 'rating',
                sortOrder: 'desc',
            };

            if (filters.search) params.search = filters.search;
            if (filters.state) params.state = filters.state;
            if (filters.city) params.city = filters.city;
            if (filters.category !== "All Businesses") params.businessTypeCode = [filters.category];
            if (filters.date) params.date = filters.date;

            // Advanced Filters
            if (advancedFilters.rating !== "any") params.minRating = parseFloat(advancedFilters.rating);
            if (advancedFilters.maxPrice && advancedFilters.maxPrice !== 100000) params.maxPrice = advancedFilters.maxPrice;

            // Active Pills
            if (activeFilter === "Saved") {
                if (!isAuthenticated) {
                    setBusinesses([]);
                    setMeta(null);
                    setLoading(false);
                    setLoadingMore(false);
                    return;
                }
                params.favoritesOnly = true;
            }

            const response = await businessService.searchSpasWithEnrichment(params);
            
            // Client-side fallback for delivery types (since backend doesn't support it yet)
            let finalData = response.data;
            if (activeFilter === "In-Store") {
                finalData = finalData.filter((b: any) => b.availableDeliveryTypes?.includes('in_location_only') || b.availableDeliveryTypes?.includes('both'));
            } else if (activeFilter === "Home Service") {
                finalData = finalData.filter((b: any) => b.availableDeliveryTypes?.includes('home_service') || b.availableDeliveryTypes?.includes('both'));
            }

            if (append) {
                setBusinesses(prev => [...prev, ...finalData]);
            } else {
                setBusinesses(finalData);
            }
            setMeta(response.meta);
        } catch (error) {
            console.error("Failed to fetch businesses:", error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [filters, advancedFilters, activeFilter, isAuthenticated]);

    // Trigger fetch on filter change
    useEffect(() => {
        if (!isLocationLoaded) return;
        fetchBusinesses(1, false);

        // Update URL
        const params = new URLSearchParams();
        if (filters.search) params.set("search", filters.search);
        if (filters.state) params.set("state", filters.state);
        if (filters.city) params.set("city", filters.city);
        if (filters.category !== "All Businesses") params.set("category", filters.category);
        if (filters.date) params.set("date", filters.date);
        if (advancedFilters.rating !== "any") params.set("minRating", advancedFilters.rating);
        if (advancedFilters.maxPrice !== 100000) params.set("maxPrice", advancedFilters.maxPrice.toString());
        if (activeFilter !== "All Services") params.set("type", activeFilter);

        router.push(`/businesses?${params.toString()}`, { scroll: false });
    }, [filters, activeFilter, advancedFilters, fetchBusinesses, router, isLocationLoaded]);

    const handleApplyFilters = () => {
        setFilters(tempFilters);
    };

    const handleLoadMore = () => {
        if (meta && meta.page < meta.totalPages) {
            fetchBusinesses(meta.page + 1, true);
        }
    };

    const handleReset = () => {
        const resetState = {
            search: "",
            state: "",
            city: "",
            category: "All Businesses",
            date: "",
        };
        setTempFilters(resetState);
        setFilters(resetState);
        setActiveFilter("All Services");
        setAdvancedFilters({
            maxPrice: 100000,
            availability: [],
            rating: "any",
        });
    };

    const hasMore = meta ? meta.page < meta.totalPages : false;

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
                                value={tempFilters.search}
                                onChange={(e) => setTempFilters(prev => ({ ...prev, search: e.target.value }))}
                                onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()}
                                className="w-full pl-12 pr-4 h-12 focus:outline-none transition-all cursor-pointer font-medium text-gray-700"
                            />
                        </div>
                        {/* State Filter */}
                        <div className="relative lg:w-48">
                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <select
                                value={tempFilters.state}
                                onChange={(e) => setTempFilters(prev => ({ ...prev, state: e.target.value, city: "" }))}
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
                        <div className={`relative lg:w-44 ${!tempFilters.state ? 'opacity-50' : ''}`}>
                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <select
                                value={tempFilters.city}
                                onChange={(e) => setTempFilters(prev => ({ ...prev, city: e.target.value }))}
                                disabled={!tempFilters.state}
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
                                value={tempFilters.category}
                                onChange={(e) => setTempFilters(prev => ({ ...prev, category: e.target.value }))}
                                className="w-full pl-12 pr-10 h-12 rounded-lg border border-transparent bg-gray-50/50 focus:outline-none appearance-none cursor-pointer font-medium text-gray-700"
                            >
                                <option>All Businesses</option>
                                {businessTypes.map(type => (
                                    <option key={type.id} value={type.code}>{type.name}</option>
                                ))}
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
                            <button onClick={() => setShowAdvanced(true)} className="flex items-center gap-2 text-sm font-bold text-[#E89D24] hover:text-[#E5A800] transition-colors">
                                <SlidersHorizontal className="w-4 h-4" />
                                Advance Filter Option
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            {[
                                { id: "All Services", label: "All Services", icon: null },
                                { id: "Saved", label: "Saved", icon: Heart },
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

                {/* Grid Header */}
                <div className="flex items-center justify-between mb-10">
                    <h2 className="text-3xl font-bold text-gray-900 tracking-tight" style={{ fontFamily: 'var(--font-playfair)' }}>
                        {filters.search ? `Search Results for "${filters.search}"` : "All Businesses"}
                    </h2>
                    <p className="text-sm font-medium text-gray-500">
                        {loading ? "Searching..." : meta ? `${meta.total} results found` : "0 results found"}
                    </p>
                </div>

                {/* Business Grid */}
                {
                    loading && businesses.length === 0 ? (
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
                    ) : businesses.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                            {businesses.map((business: any) => (
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
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                {activeFilter === "Saved" ? (
                                    !isAuthenticated ? "Sign in to view saved businesses" : "No saved businesses yet"
                                ) : "No businesses found"}
                            </h3>
                            <p className="text-gray-500">
                                {activeFilter === "Saved" ? (
                                    !isAuthenticated
                                        ? "Log in to your account so you can save and access your favorite businesses here."
                                        : "Start exploring and mark the businesses you love by clicking the heart icon."
                                ) : "Try adjusting your filters or search terms."}
                            </p>
                            {activeFilter === "Saved" && !isAuthenticated ? (
                                <Link href="/auth/login">
                                    <Button className="mt-6 rounded-xl h-12 px-8 bg-[#E89D24] hover:bg-[#E5A800] text-white font-bold shadow-lg shadow-yellow-500/20">
                                        Login to Account
                                    </Button>
                                </Link>
                            ) : (
                                <Button variant="outline" onClick={handleReset} className="mt-6 rounded-xl">Clear All Filters</Button>
                            )}
                        </div>
                    )
                }

                {/* Pagination */}
                {
                    !loading && hasMore && (
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
                    onApply={(newFilters) => setAdvancedFilters(newFilters)}
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
