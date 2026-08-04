"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { State, City, IState, ICity } from "country-state-city";
import { CustomerHeader } from "@/components/modules/customer/customer-header";
import { CustomerFooter } from "@/components/modules/customer/customer-footer";
import { MobileFooterStrip } from "@/components/modules/customer/mobile-footer-strip";
import { CustomerBottomNav } from "@/components/modules/customer/customer-bottom-nav";
import { ServiceCard, ServiceSkeleton } from "@/components/modules/discovery/service-card";
import { ServiceRowCard, ServiceRowSkeleton } from "@/components/modules/discovery/service-row-card";
import { Search, MapPin, SlidersHorizontal, Heart, Store, Home, ChevronDown, Loader2, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { businessService, EnrichedService, ServiceCategory, PaginationMeta, SearchServicesParams } from "@/services/business.service";
import { useAuthStore } from '@/store/auth.store';
import { useFavoritesStore } from '@/store/favorites.store';
import { favoritesService } from "@/services/favorites.service";
import Link from "next/link";
import { AdvanceFilterModal, AdvancedFiltersState } from "@/components/modules/discovery/advance-filter-modal";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { OfflineFallback } from "@/components/offline-fallback";

function DiscoverContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const [categories, setCategories] = useState<ServiceCategory[]>([]);
    const [loadingCategories, setLoadingCategories] = useState(true);

    const [states, setStates] = useState<IState[]>([]);
    const [cities, setCities] = useState<ICity[]>([]);
    const countryCode = "NG";

    const { isAuthenticated } = useAuthStore();
    const { setServiceIds: setFavoriteServiceIds, setBusinessIds: setFavoriteBusinessIds, clear: clearFavorites } = useFavoritesStore();
    const isOnline = useOnlineStatus();

    // Filter State
    const [activeFilter, setActiveFilter] = useState(searchParams.get("type") || "All Services");
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [filters, setFilters] = useState({
        search: searchParams.get("search") || "",
        state: searchParams.get("state") || "",
        city: searchParams.get("city") || "",
        category: searchParams.get("category") || "All Categories",
    });
    
    // Temp filters for search bar before applying
    const [tempFilters, setTempFilters] = useState({
        search: filters.search,
        state: filters.state,
        city: filters.city,
        category: filters.category,
    });

    const [advancedFilters, setAdvancedFilters] = useState<AdvancedFiltersState>({
        maxPrice: 100000,
        availability: [],
        rating: "any",
    });

    const [isLocationLoaded, setIsLocationLoaded] = useState(false);

    // Results State
    const PAGE_SIZE = 12;
    const [results, setResults] = useState<EnrichedService[]>([]);
    const [meta, setMeta] = useState<PaginationMeta | null>(null);
    const [isSearching, setIsSearching] = useState(true);

    const deliveryFilters = [
        { id: "All Services", label: "All Services", icon: null },
        { id: "Favorite", label: "Favorite", icon: Heart },
        { id: "In-Store", label: "In-Store", icon: Store },
        { id: "Home Service", label: "Home Service", icon: Home },
    ];

    // Fetch categories and states on mount
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const categoriesData = await businessService.getServiceCategories();
                setCategories(categoriesData);
                setStates(State.getStatesOfCountry(countryCode));
            } catch (error) {
                console.error("Failed to fetch initial data:", error);
            } finally {
                setLoadingCategories(false);
            }
        };
        fetchInitialData();
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

    // Fetch Cities when State changes (in temp filters)
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
                                   (Array.isArray(res) ? res.filter((f: { serviceId?: string; service?: { id: string } }) => f.serviceId || f.service?.id) : []);
                serviceList.forEach((item: { serviceId?: string; service?: { id: string } }) => {
                    if (item.serviceId) sIds.push(item.serviceId);
                    else if (item.service?.id) sIds.push(item.service.id);
                });

                // Extract Businesses
                const businessList = Array.isArray(res?.businesses) ? res.businesses : 
                                    (Array.isArray(res) ? res.filter((f: { businessId?: string; business?: { id: string } }) => f.businessId || f.business?.id) : []);
                businessList.forEach((item: { businessId?: string; business?: { id: string } }) => {
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

    // Sync URL with filters
    useEffect(() => {
        if (!isLocationLoaded) return;
        const params = new URLSearchParams();
        if (filters.search) params.set("search", filters.search);
        if (filters.state) params.set("state", filters.state);
        if (filters.city) params.set("city", filters.city);
        if (filters.category !== "All Categories") params.set("category", filters.category);
        if (activeFilter !== "All Services") params.set("type", activeFilter);

        router.push(`/discover?${params.toString()}`, { scroll: false });
    }, [filters, activeFilter, router, isLocationLoaded]);

    const fetchServices = async (page = 1, append = false) => {
        setIsSearching(true);
        try {
            const params: SearchServicesParams = {
                page,
                limit: PAGE_SIZE,
            };

            if (filters.search) params.search = filters.search;
            if (filters.state) params.state = filters.state;
            if (filters.city) params.city = filters.city;

            // Categories
            if (filters.category !== "All Categories") {
                params.categoryIds = [filters.category];
            }

            // Delivery & Favorites
            if (activeFilter === "In-Store") params.delivery = "in_store";
            else if (activeFilter === "Home Service") params.delivery = "home_service";
            else if (activeFilter === "Favorite") {
                if (!isAuthenticated) {
                    setResults([]);
                    setMeta(null);
                    setIsSearching(false);
                    return;
                }
                params.favoritesOnly = true;
            }

            // Advanced Filters
            if (advancedFilters.maxPrice < 100000) params.maxPrice = advancedFilters.maxPrice;
            if (advancedFilters.rating !== "any") {
                params.minRating = advancedFilters.rating === "4+" ? 4 : 3;
            }

            // Availability
            if (advancedFilters.availability.includes("today")) params.availableToday = true;
            if (advancedFilters.availability.includes("weekend")) params.weekendAvailability = true;
            if (advancedFilters.availability.includes("evening")) params.eveningSessions = true;


            const response = await businessService.discoverServicesFilter(params);
            
            if (append) {
                setResults(prev => [...prev, ...response.data]);
            } else {
                setResults(response.data);
            }
            setMeta(response.meta);
        } catch (error) {
            console.error("Backend search failed:", error);
        } finally {
            setIsSearching(false);
        }
    };

    // Trigger search whenever applied filters change
    useEffect(() => {
        if (!isLocationLoaded) return;
        fetchServices(1, false);
    }, [filters, activeFilter, advancedFilters, isLocationLoaded]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleSearchClick = () => {
        setFilters({
            search: tempFilters.search || "",
            state: tempFilters.state || "",
            city: tempFilters.city || "",
            category: tempFilters.category || "All Categories"
        });
    };

    const handleLoadMore = () => {
        if (meta && meta.page < meta.totalPages) {
            fetchServices(meta.page + 1, true);
        }
    };

    const handleReset = () => {
        const resetFilters = {
            search: "",
            state: "",
            city: "",
            category: "All Categories",
        };
        setFilters(resetFilters);
        setTempFilters(resetFilters);
        setActiveFilter("All Services");
        setAdvancedFilters({
            maxPrice: 100000,
            availability: [],
            rating: "any",
        });
    };

    const hasMore = meta ? meta.page < meta.totalPages : false;

    return (
        <div className="min-h-screen flex flex-col bg-[#F9FAFB] pb-20 md:pb-0">
            <CustomerHeader />

            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-12 w-full">
                {/* Header Section */}
                <div className="mb-4 md:mb-10">
                    <h1 className="text-[24px] sm:text-3xl md:text-4xl font-bold text-gray-900 mb-1 md:mb-4 tracking-tight font-playfair">Discover services</h1>
                    <p className="text-gray-600 max-w-2xl leading-relaxed hidden md:block">
                        Browse wellness services from trusted businesses. Book in-store or home services at your convenience.
                    </p>
                </div>

                {/* Mobile: search bar + filter icon + single-line pills */}
                <div className="md:hidden mb-6">
                    <div className="flex gap-2">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search services"
                                value={tempFilters.search}
                                onChange={(e) => setTempFilters(prev => ({ ...prev, search: e.target.value }))}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearchClick()}
                                onBlur={() => tempFilters.search !== filters.search && handleSearchClick()}
                                className="w-full h-11 pl-10 pr-3 rounded-[14px] bg-white shadow-sm text-sm focus:outline-none"
                            />
                        </div>
                        <button
                            onClick={() => setShowAdvanced(true)}
                            className="w-11 h-11 rounded-[14px] bg-white shadow-sm grid place-items-center shrink-0"
                        >
                            <SlidersHorizontal className="w-4 h-4 text-gray-600" />
                        </button>
                    </div>
                    <div className="scroll-row gap-6 -mx-4 px-4 mt-3 border-b border-gray-200">
                        {deliveryFilters.map((filter) => (
                            <button
                                key={filter.id}
                                onClick={() => setActiveFilter(filter.id)}
                                className={`shrink-0 whitespace-nowrap pb-3 text-sm font-bold transition-colors relative ${activeFilter === filter.id
                                    ? "text-[#E89D24]"
                                    : "text-gray-500 hover:text-gray-700"
                                    }`}
                            >
                                {filter.label}
                                {activeFilter === filter.id && (
                                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E89D24] rounded-t-full" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Search & Filter Container — desktop */}
                <div className="hidden md:block bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mb-12">
                    {/* Search Bar */}
                    <div className="flex flex-col md:flex-row gap-4 mb-8 border border-gray-200 rounded-xl p-2 focus-within:ring-2 focus-within:ring-[#E89D24] transition-all">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search services"
                                value={tempFilters.search}
                                onChange={(e) => setTempFilters(prev => ({ ...prev, search: e.target.value }))}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearchClick()}
                                className="w-full pl-12 pr-4 h-12 focus:outline-none transition-all cursor-pointer font-medium"
                            />
                        </div>
                        {/* State Filter */}
                        <div className="relative md:w-56">
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
                        <div className={`relative md:w-48 ${!tempFilters.state ? 'opacity-50' : ''}`}>
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
                        <div className="relative md:w-64">
                            <SlidersHorizontal className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <select
                                value={tempFilters.category}
                                onChange={(e) => setTempFilters(prev => ({ ...prev, category: e.target.value }))}
                                className="w-full pl-12 pr-10 h-12 rounded-lg border border-transparent bg-gray-50/50 focus:outline-none appearance-none cursor-pointer font-medium text-gray-700"
                            >
                                <option>All Categories</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                        <Button
                            onClick={handleSearchClick}
                            className="h-12 px-8 w-full md:w-auto bg-[#E89D24] hover:bg-[#E5A800] text-white font-bold rounded-xl shadow-lg shadow-yellow-500/20"
                        >
                            Search
                        </Button>
                    </div>

                    {/* Delivery Type Filters */}
                    <div className="flex flex-col gap-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-bold text-gray-900">Filter by</h3>
                            <button onClick={() => setShowAdvanced(true)} className="flex items-center gap-2 text-sm font-bold text-[#E89D24] hover:text-[#E5A800] transition-colors">
                                <SlidersHorizontal className="w-4 h-4" />
                                Advance Filter Option
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            {deliveryFilters.map((filter) => (
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

                {/* Results Info */}
                <div className="mb-3 md:mb-8 flex items-center justify-between">
                    <p className="text-[11px] md:text-sm font-medium text-gray-500">
                        {isSearching ? (
                            <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin text-[#E89D24]" /> Searching...</span>
                        ) : meta ? (
                            <>Showing <span className="text-gray-900 font-bold">{results.length}</span> of <span className="text-gray-900 font-bold">{meta.total}</span> services</>
                        ) : null}
                    </p>
                </div>

                {/* Services — mobile compact rows */}
                {isSearching && results.length === 0 ? (
                    <div className="md:hidden space-y-2.5 mb-8">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <ServiceRowSkeleton key={i} />
                        ))}
                    </div>
                ) : results.length > 0 ? (
                    <div className="md:hidden space-y-2.5 mb-8">
                        {results.map((service) => (
                            <ServiceRowCard key={service.id} service={service} />
                        ))}
                    </div>
                ) : null}

                {/* Services — desktop grid */}
                {isSearching && results.length === 0 ? (
                    <div className="hidden md:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <ServiceSkeleton key={i} />
                        ))}
                    </div>
                ) : results.length > 0 ? (
                    <div className="hidden md:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                        {results.map((service) => (
                            <ServiceCard key={service.id} service={service} />
                        ))}
                    </div>
                ) : !isOnline ? (
                    <div className="py-10 md:py-20 mb-8 md:mb-0">
                        <OfflineFallback message="Services will appear here once you're back online." />
                    </div>
                ) : (
                    <div className="py-10 md:py-20 mb-8 md:mb-0 text-center bg-white rounded-2xl border border-dashed border-gray-200 px-4">
                        <Building2 className="w-10 h-10 md:w-16 md:h-16 text-gray-300 mx-auto mb-3 md:mb-4" />
                        <h3 className="text-base md:text-xl font-bold text-gray-900 mb-1.5 md:mb-2">
                            {activeFilter === "Favorite" ? (
                                !isAuthenticated ? "Sign in to view favorites" : "No favorite services yet"
                            ) : "No services found"}
                        </h3>
                        <p className="text-[13px] md:text-base text-gray-500">
                            {activeFilter === "Favorite" ? (
                                !isAuthenticated
                                    ? "Log in to your account so you can save and access your favorite services here."
                                    : "Start exploring and mark the services you love by clicking the heart icon."
                            ) : "Try adjusting your filters or search terms."}
                        </p>
                        {activeFilter === "Favorite" && !isAuthenticated ? (
                            <Link href="/auth/login">
                                <Button className="mt-6 rounded-xl h-11 w-full md:w-auto md:h-12 md:px-8 bg-[#E89D24] hover:bg-[#E5A800] text-white font-bold shadow-lg shadow-yellow-500/20">
                                    Login to Account
                                </Button>
                            </Link>
                        ) : (
                            <Button
                                variant="outline"
                                onClick={handleReset}
                                className="mt-6 rounded-xl"
                            >
                                Clear All Filters
                            </Button>
                        )}
                    </div>
                )}

                {/* Load More */}
                {!isSearching && hasMore && (
                    <div className="flex justify-center pt-8 border-t border-gray-100">
                        <Button
                            variant="outline"
                            onClick={handleLoadMore}
                            className="h-11 w-full md:h-12 md:w-auto md:px-10 rounded-xl border-gray-200 font-bold text-gray-700 hover:bg-gray-50 transition-colors md:min-w-[200px]"
                        >
                            Load More Services
                        </Button>
                    </div>
                )}
                {isSearching && results.length > 0 && (
                    <div className="flex justify-center pt-8 border-t border-gray-100">
                        <Loader2 className="w-8 h-8 animate-spin text-[#E89D24]" />
                    </div>
                )}

                <AdvanceFilterModal
                    open={showAdvanced}
                    onClose={() => setShowAdvanced(false)}
                    initialFilters={advancedFilters}
                    onApply={(newFilters) => {
                        setAdvancedFilters(newFilters);
                    }}
                    locationFilters={{
                        state: tempFilters.state,
                        city: tempFilters.city,
                        category: tempFilters.category,
                    }}
                    onLocationChange={(next) => {
                        setTempFilters(prev => ({ ...prev, state: next.state, city: next.city, category: next.category }));
                        setFilters(prev => ({ ...prev, state: next.state, city: next.city, category: next.category }));
                    }}
                    states={states}
                    categories={categories}
                />
            </main>

            <div className="hidden md:block">
                <CustomerFooter />
            </div>
            <MobileFooterStrip />
            <CustomerBottomNav />
        </div>
    );
}

export default function DiscoverPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-10 h-10 animate-spin text-[#E89D24]" />
            </div>
        }>
            <DiscoverContent />
        </Suspense>
    );
}
