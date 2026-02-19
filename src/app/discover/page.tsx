"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { State, City, IState, ICity } from "country-state-city";
import { CustomerHeader } from "@/components/modules/customer/customer-header";
import { CustomerFooter } from "@/components/modules/customer/customer-footer";
import { ServiceCard, ServiceSkeleton } from "@/components/modules/discovery/service-card";
import { Search, MapPin, SlidersHorizontal, Heart, Store, Home, ChevronDown, Loader2, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { businessService, EnrichedService, ServiceCategory } from "@/services/business.service";

function DiscoverContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    // Data State
    const [services, setServices] = useState<EnrichedService[]>([]);
    const [categories, setCategories] = useState<ServiceCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [total, setTotal] = useState(0);

    const [states, setStates] = useState<IState[]>([]);
    const [cities, setCities] = useState<ICity[]>([]);
    const countryCode = "NG";

    // Filter State
    const [activeFilter, setActiveFilter] = useState(searchParams.get("type") || "All Services");
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [filters, setFilters] = useState({
        search: searchParams.get("search") || "",
        state: searchParams.get("state") || "",
        city: searchParams.get("city") || "",
        category: searchParams.get("category") || "All Categories",
        limit: parseInt(searchParams.get("limit") || "12"),
    });

    const [tempSearch, setTempSearch] = useState(filters.search);

    const deliveryFilters = [
        { id: "All Services", label: "All Services", icon: null },
        { id: "Favorite", label: "Favorite", icon: Heart },
        { id: "In-Store", label: "In-Store", icon: Store },
        { id: "Home Service", label: "Home Service", icon: Home },
    ];

    // Fetch Categories and States
    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await businessService.getServiceCategories();
                setCategories(data);
                setStates(State.getStatesOfCountry(countryCode));
            } catch (error) {
                console.error("Failed to fetch categories/states:", error);
            }
        };
        fetchData();
    }, []);

    // Fetch Cities when State changes
    useEffect(() => {
        if (filters.state) {
            const stateObj = states.find(s => s.name === filters.state);
            if (stateObj) {
                setCities(City.getCitiesOfState(countryCode, stateObj.isoCode));
            } else {
                setCities([]);
            }
        } else {
            setCities([]);
        }
    }, [filters.state, states]);

    // Main Fetch Function
    const fetchServices = useCallback(async (currentFilters: typeof filters, isLoadMore = false) => {
        if (isLoadMore) setLoadingMore(true);
        else setLoading(true);

        try {
            const params: any = {
                limit: currentFilters.limit,
                sortBy: 'newest',
                sortOrder: 'desc',
            };

            if (currentFilters.search) params.serviceName = currentFilters.search;
            if (currentFilters.city) params.city = currentFilters.city;
            if (currentFilters.category !== "All Categories") params.serviceTypes = [currentFilters.category];

            const response = await businessService.searchServices(params);

            // Client-side filtering for delivery type
            let result = response.data;
            if (activeFilter === "In-Store") {
                result = result.filter(s => s.deliveryType?.toLowerCase() === 'in_location_only' || s.deliveryType?.toLowerCase() === 'both');
            } else if (activeFilter === "Home Service") {
                result = result.filter(s => s.deliveryType?.toLowerCase() === 'home_service_only' || s.deliveryType?.toLowerCase() === 'both');
            }

            setServices(result);
            setTotal(response.meta.total);
        } catch (error) {
            console.error("Failed to fetch services:", error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [activeFilter]);

    // Sync with Filters/URL
    useEffect(() => {
        fetchServices(filters);

        const params = new URLSearchParams();
        if (filters.search) params.set("search", filters.search);
        if (filters.state) params.set("state", filters.state);
        if (filters.city) params.set("city", filters.city);
        if (filters.category !== "All Categories") params.set("category", filters.category);
        if (activeFilter !== "All Services") params.set("type", activeFilter);
        if (filters.limit > 12) params.set("limit", filters.limit.toString());

        router.push(`/discover?${params.toString()}`, { scroll: false });
    }, [filters, activeFilter, fetchServices, router]);

    const handleSearch = () => {
        setFilters(prev => ({ ...prev, search: tempSearch, limit: 12 }));
    };

    const handleLoadMore = () => {
        setFilters(prev => ({ ...prev, limit: prev.limit + 12 }));
    };

    return (
        <div className="min-h-screen bg-[#F9FAFB]">
            <CustomerHeader />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
                {/* Header Section */}
                <div className="mb-10">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight" style={{ fontFamily: 'var(--font-playfair)' }}>Discover services</h1>
                    <p className="text-gray-600 max-w-2xl leading-relaxed">
                        Browse wellness services from trusted businesses. Book in-store or home services at your convenience.
                    </p>
                </div>

                {/* Search & Filter Container */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mb-12">
                    {/* Search Bar */}
                    <div className="flex flex-col md:flex-row gap-4 mb-8 border border-gray-200 rounded-xl p-2 focus-within:ring-2 focus-within:ring-[#E89D24] transition-all">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search services"
                                value={tempSearch}
                                onChange={(e) => setTempSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                className="w-full pl-12 pr-4 h-12 focus:outline-none transition-all cursor-pointer font-medium"
                            />
                        </div>
                        {/* State Filter */}
                        <div className="relative md:w-56">
                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <select
                                value={filters.state}
                                onChange={(e) => setFilters(prev => ({ ...prev, state: e.target.value, city: "", limit: 12 }))}
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
                        <div className={`relative md:w-48 ${!filters.state ? 'opacity-50' : ''}`}>
                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <select
                                value={filters.city}
                                onChange={(e) => setFilters(prev => ({ ...prev, city: e.target.value, limit: 12 }))}
                                disabled={!filters.state}
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
                                value={filters.category}
                                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value, limit: 12 }))}
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
                            onClick={handleSearch}
                            className="h-12 px-8 bg-[#E89D24] hover:bg-[#E5A800] text-white font-bold rounded-xl shadow-lg shadow-yellow-500/20"
                        >
                            Search
                        </Button>
                    </div>

                    {/* Delivery Type Filters */}
                    <div className="flex flex-col gap-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-bold text-gray-900">Delivery Type</h3>
                            <button onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-2 text-sm font-bold text-[#E89D24] hover:text-[#E5A800] transition-colors">
                                <SlidersHorizontal className="w-4 h-4" />
                                {showAdvanced ? "Hide filters" : "Advance Filter Option"}
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
                <div className="mb-8 flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-500">Showing <span className="text-gray-900 font-bold">{services.length} services</span></p>
                </div>

                {/* Services Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <ServiceSkeleton key={i} />
                        ))}
                    </div>
                ) : services.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                        {services.map((service) => (
                            <ServiceCard key={service.id} service={service} />
                        ))}
                    </div>
                ) : (
                    <div className="py-20 text-center bg-white rounded-2xl border border-dashed border-gray-200">
                        <Loader2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No services found</h3>
                        <p className="text-gray-500">Try adjusting your filters or search terms.</p>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setTempSearch("");
                                setFilters({ search: "", state: "", city: "", category: "All Categories", limit: 12 });
                                setActiveFilter("All Services");
                            }}
                            className="mt-6 rounded-xl"
                        >
                            Clear All Filters
                        </Button>
                    </div>
                )}

                {/* Load More */}
                {!loading && services.length > 0 && services.length < total * 2 && ( // Rough estimate since total is spas
                    <div className="flex justify-center pt-8 border-t border-gray-100">
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
                                "Load More Services"
                            )}
                        </Button>
                    </div>
                )}
            </main>

            <CustomerFooter />
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
