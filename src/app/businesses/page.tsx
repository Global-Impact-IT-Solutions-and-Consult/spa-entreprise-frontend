"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { State, City, IState, ICity } from "country-state-city";
import { CustomerHeader } from "@/components/modules/customer/customer-header";
import { CustomerFooter } from "@/components/modules/customer/customer-footer";
import { BusinessDirectoryCard } from "@/components/modules/discovery/business-directory-card";
import { Search, ChevronDown, Loader2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { businessService, BusinessType, SpaSearchResult, isBusinessOpen } from "@/services/business.service";
import { Skeleton } from "@/components/ui/skeleton";

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

    // Initial filter state from URL
    const [filters, setFilters] = useState({
        search: searchParams.get("search") || "",
        state: searchParams.get("state") || "",
        city: searchParams.get("city") || "",
        category: searchParams.get("category") || "All Businesses",
        minRating: searchParams.get("minRating") || "All Rating",
        limit: parseInt(searchParams.get("limit") || "10"),
        verifiedOnly: searchParams.get("verifiedOnly") === "true",
    });

    const [tempSearch, setTempSearch] = useState(filters.search);

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

    // Main fetch function
    const fetchBusinesses = useCallback(async (currentFilters: typeof filters, isLoadMore = false) => {
        if (isLoadMore) setLoadingMore(true);
        else setLoading(true);

        try {
            const params: any = {
                limit: currentFilters.limit,
                sortBy: 'rating',
                sortOrder: 'desc',
            };


            if (currentFilters.city) params.city = currentFilters.city;
            if (currentFilters.category !== "All Businesses") params.serviceTypes = JSON.stringify([currentFilters.category]);
            if (currentFilters.minRating !== "All Rating") params.minRating = parseFloat(currentFilters.minRating);

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
        if (filters.limit > 10) params.set("limit", filters.limit.toString());
        if (filters.verifiedOnly) params.set("verifiedOnly", "true");

        router.push(`/businesses?${params.toString()}`, { scroll: false });
    }, [filters, fetchBusinesses, router]);

    const handleApplyFilters = () => {
        setFilters(prev => ({ ...prev, search: tempSearch, limit: 10 }));
    };

    const handleLoadMore = () => {
        if (businesses.length < total) {
            setFilters(prev => ({ ...prev, limit: prev.limit + 10 }));
        }
    };

    const handleReset = () => {
        setTempSearch("");
        setFilters({
            search: "",
            state: "",
            city: "",
            category: "All Businesses",
            minRating: "All Rating",
            limit: 10,
            verifiedOnly: false,
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
                <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-sm mb-12">
                    {/* Search Input */}
                    <div className="relative mb-8 border border-gray-200 rounded-xl p-2 focus-within:ring-2 focus-within:ring-[#E89D24] transition-all">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <div className="flex flex-col md:flex-row gap-4">
                            <input
                                type="text"
                                placeholder="Search Business name"
                                value={tempSearch}
                                onChange={(e) => setTempSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()}
                                className="flex-1 pl-14 pr-4 h-12 focus:outline-none text-gray-700 font-medium"
                            />
                            <Button
                                onClick={handleApplyFilters}
                                className="h-12 px-12 bg-[#E89D24] hover:bg-[#E5A800] font-bold text-white rounded-xl shadow-lg shadow-yellow-500/10"
                            >
                                Search
                            </Button>
                        </div>
                    </div>

                    {/* Detailed Filters */}
                    <div className="space-y-6">
                        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            Filter by
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                            {/* State Filter */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">State</label>
                                <div className="relative">
                                    <select
                                        value={filters.state}
                                        onChange={(e) => setFilters(prev => ({ ...prev, state: e.target.value, city: "", limit: 10 }))}
                                        className="w-full h-12 px-4 rounded-xl border border-gray-100 bg-gray-50/50 text-sm font-medium focus:ring-2 focus:ring-[#E89D24] transition-all appearance-none cursor-pointer"
                                    >
                                        <option value="">Select State</option>
                                        {states.map(s => (
                                            <option key={s.isoCode} value={s.name}>{s.name}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                                </div>
                            </div>
                            {/* City Filter */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">City</label>
                                <div className="relative">
                                    <select
                                        value={filters.city}
                                        onChange={(e) => setFilters(prev => ({ ...prev, city: e.target.value, limit: 10 }))}
                                        disabled={!filters.state}
                                        className={`w-full h-12 px-4 rounded-xl border border-gray-100 bg-gray-50/50 text-sm font-medium focus:ring-2 focus:ring-[#E89D24] transition-all appearance-none cursor-pointer ${!filters.state ? 'opacity-50' : ''}`}
                                    >
                                        <option value="">Select City</option>
                                        {cities.map((c, i) => (
                                            <option key={`${c.name}-${i}`} value={c.name}>{c.name}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                                </div>
                            </div>
                            {/* Business Category */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Category</label>
                                <div className="relative">
                                    <select
                                        value={filters.category}
                                        onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value, limit: 10 }))}
                                        className="w-full h-12 px-4 rounded-xl border border-gray-100 bg-gray-50/50 text-sm font-medium focus:ring-2 focus:ring-[#E89D24] transition-all appearance-none cursor-pointer"
                                    >
                                        <option>All Businesses</option>
                                        {businessTypes.map(type => (
                                            <option key={type.id} value={type.id}>{type.name}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                                </div>
                            </div>

                            {/* Minimum Rating */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Minimum Rating</label>
                                <div className="relative">
                                    <select
                                        value={filters.minRating}
                                        onChange={(e) => setFilters(prev => ({ ...prev, minRating: e.target.value, limit: 10 }))}
                                        className="w-full h-12 px-4 rounded-xl border border-gray-100 bg-gray-50/50 text-sm font-medium focus:ring-2 focus:ring-[#E89D24] transition-all appearance-none cursor-pointer"
                                    >
                                        <option>All Rating</option>
                                        <option value="4.5">4.5+ Stars</option>
                                        <option value="4.0">4.0+ Stars</option>
                                        <option value="3.5">3.5+ Stars</option>
                                        <option value="3.0">3.0+ Stars</option>
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                                </div>
                            </div>
                        </div>

                        {/* Bottom Filter Controls */}
                        <div className="flex flex-col sm:flex-row items-center justify-between pt-4 gap-4">
                            <label className="flex items-center gap-3 cursor-pointer group self-start">
                                <div className="relative w-6 h-6 rounded-lg border-2 border-gray-200 group-hover:border-[#E89D24] transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={filters.verifiedOnly}
                                        onChange={(e) => setFilters(prev => ({ ...prev, verifiedOnly: e.target.checked, limit: 10 }))}
                                        className="absolute opacity-0 w-full h-full cursor-pointer peer"
                                    />
                                    <div className="absolute inset-0 bg-[#E89D24] rounded-sm scale-0 peer-checked:scale-100 transition-transform flex items-center justify-center text-white">
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                    </div>
                                </div>
                                <span className="text-sm font-bold text-gray-600 group-hover:text-gray-900 transition-colors">Verified businesses only</span>
                            </label>

                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                <Button
                                    variant="ghost"
                                    onClick={handleReset}
                                    className="flex-1 sm:flex-none h-12 px-8 font-bold text-gray-500 hover:text-gray-700 rounded-xl"
                                >
                                    Reset All
                                </Button>
                                <Button
                                    onClick={handleApplyFilters}
                                    className="flex-1 sm:flex-none h-12 px-8 bg-[#E89D24] hover:bg-[#E5A800] font-bold text-white rounded-xl"
                                >
                                    Apply Filters
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Client-side name filtering */}
                {(() => {
                    const filteredBusinesses = filters.search
                        ? businesses.filter(b => (b.businessName || b.name || '').toLowerCase().includes(filters.search.toLowerCase()))
                        : businesses;

                    return (
                        <>
                            {/* Grid Header */}
                            <div className="flex items-center justify-between mb-10">
                                <h2 className="text-3xl font-bold text-gray-900 tracking-tight" style={{ fontFamily: 'var(--font-playfair)' }}>
                                    {filters.search ? `Search Results for "${filters.search}"` : "All Businesses"}
                                </h2>
                                <p className="text-sm font-medium text-gray-500">{filteredBusinesses.length} results found</p>
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
                                ) : filteredBusinesses.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                                        {filteredBusinesses.map((business) => (
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
