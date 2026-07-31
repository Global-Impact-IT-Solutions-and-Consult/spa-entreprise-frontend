"use client";

import { useMemo, useState } from "react";
import { City, type IState, type ICity } from "country-state-city";
import { X } from "lucide-react";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { Button } from "@/components/ui/button";

export interface AdvancedFiltersState {
    maxPrice: number;
    availability: string[];
    rating: string;
}

export interface LocationFilters {
    state: string;
    city: string;
    category: string;
}

interface AdvanceFilterModalProps {
    open: boolean;
    onClose: () => void;
    initialFilters: AdvancedFiltersState;
    onApply: (filters: AdvancedFiltersState) => void;
    // Optional: only supplied by mobile search bars (Discover, Businesses),
    // which have no room for the desktop's separate State/City/Category
    // dropdowns — folding them into this sheet gives mobile users the same
    // filters back. When omitted (desktop's own call site), this block
    // simply doesn't render.
    locationFilters?: LocationFilters;
    onLocationChange?: (next: LocationFilters) => void;
    states?: IState[];
    categories?: { id: string; name: string }[];
    // Label/value for the "no category selected" option — callers use
    // different sentinel strings ("All Categories" on Discover, "All
    // Businesses" on the business directory) for their own filter state.
    allCategoriesLabel?: string;
}

const DEFAULT_FILTERS: AdvancedFiltersState = {
    maxPrice: 50000,
    availability: [],
    rating: "any",
};

export function AdvanceFilterModal({
    open,
    onClose,
    initialFilters,
    onApply,
    locationFilters,
    onLocationChange,
    states,
    categories,
    allCategoriesLabel = "All Categories",
}: AdvanceFilterModalProps) {
    const [filters, setFilters] = useState<AdvancedFiltersState>(initialFilters);
    const [location, setLocation] = useState<LocationFilters>(
        locationFilters ?? { state: "", city: "", category: allCategoriesLabel }
    );
    const [prevOpen, setPrevOpen] = useState(open);

    if (open !== prevOpen) {
        setPrevOpen(open);
        if (open) {
            setFilters(initialFilters);
            if (locationFilters) setLocation(locationFilters);
        }
    }

    const localCities = useMemo<ICity[]>(() => {
        if (!location.state || !states) return [];
        const stateObj = states.find(s => s.name === location.state);
        return stateObj ? City.getCitiesOfState("NG", stateObj.isoCode) : [];
    }, [location.state, states]);

    const handleReset = () => {
        setFilters(DEFAULT_FILTERS);
    };

    const handleApply = () => {
        onApply(filters);
        onLocationChange?.(location);
        onClose();
    };

    const toggleAvailability = (value: string) => {
        setFilters(prev => {
            const current = [...prev.availability];
            if (current.includes(value)) {
                return { ...prev, availability: current.filter(item => item !== value) };
            } else {
                return { ...prev, availability: [...current, value] };
            }
        });
    };

    // Calculate percentage for slider styling
    const minPrice = 2000;
    const maxPriceLimit = 100000;
    const progressPercent = ((filters.maxPrice - minPrice) / (maxPriceLimit - minPrice)) * 100;

    return (
        <ResponsiveModal
            open={open}
            onClose={onClose}
            title="Advance Filter"
            // Desktop tree restored verbatim from the pre-Sheet-migration
            // Dialog markup (84dd093^ — this modal was migrated a commit
            // earlier than the others).
            desktopContentClassName="sm:max-w-[480px] m-auto p-6 rounded-[24px] border border-gray-100 shadow-xl bg-white focus:outline-none max-h-[90vh] overflow-y-auto"
            desktopHeader={
                <div className="flex items-center justify-between mb-1">
                    <h2 className="text-xl font-bold font-playfair text-[#1F2937]">Advance Filter</h2>
                    <button onClick={onClose} className="p-2 -mr-2 text-gray-400 hover:text-gray-600 focus:outline-none">
                        <X className="w-5 h-5" />
                    </button>
                </div>
            }
            // Originally `flex gap-4 mt-5`; as a grid sibling under
            // `DialogContent`'s `grid gap-4` the `mt-5` here restores the
            // same 36px gap above the actions row.
            desktopFooterClassName="mt-5"
            footer={
                <div className="flex gap-4">
                    <Button
                        variant="outline"
                        onClick={handleReset}
                        className="flex-1 h-[52px] rounded font-bold text-gray-700 border-gray-100 hover:bg-gray-50"
                    >
                        Reset
                    </Button>
                    <Button
                        onClick={handleApply}
                        className="flex-1 h-[52px] rounded bg-[#E89D24] hover:bg-[#D58C1B] text-white font-bold shadow-lg shadow-yellow-500/20"
                    >
                        Apply Filters
                    </Button>
                </div>
            }
        >
            {/* `md:contents` dissolves this mobile padding wrapper on the
                desktop branch so the filter sections sit directly in
                `DialogContent`'s grid, exactly as they did pre-migration. */}
            <div className="p-6 md:contents">
                    {/* Mobile-only (already `md:hidden` before this revert): the
                        desktop surfaces have their own State/City/Category
                        dropdowns. `mb-3` replaces the `space-y-3` it used to
                        inherit from the removed wrapper. */}
                    {locationFilters && onLocationChange && states && categories && (
                        <div className="md:hidden space-y-3 pb-2 mb-3">
                            <h3 className="text-[15px] font-semibold text-gray-800">Location &amp; Category</h3>
                            <select
                                value={location.state}
                                onChange={(e) => setLocation(prev => ({ ...prev, state: e.target.value, city: "" }))}
                                className="w-full h-11 px-3 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700"
                            >
                                <option value="">Select State</option>
                                {states.map(s => (
                                    <option key={s.isoCode} value={s.name}>{s.name}</option>
                                ))}
                            </select>
                            <select
                                value={location.city}
                                onChange={(e) => setLocation(prev => ({ ...prev, city: e.target.value }))}
                                disabled={!location.state}
                                className="w-full h-11 px-3 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 disabled:opacity-50"
                            >
                                <option value="">Select City</option>
                                {localCities.map((c, i) => (
                                    <option key={`${c.name}-${i}`} value={c.name}>{c.name}</option>
                                ))}
                            </select>
                            <select
                                value={location.category}
                                onChange={(e) => setLocation(prev => ({ ...prev, category: e.target.value }))}
                                className="w-full h-11 px-3 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700"
                            >
                                <option>{allCategoriesLabel}</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                    )}
                    <div className="space-y-3">
                        {/* Price Range */}
                        <div className="space-y-4">
                            <h3 className="text-[15px] font-semibold text-gray-800">Price Range</h3>
                            <div className="pt-2">
                                <div className="flex items-center gap-4">
                                    <span className="text-sm font-medium text-gray-400">₦2k</span>
                                    <div className="relative flex-1 h-10 flex items-center">
                                        <input
                                            type="range"
                                            min={minPrice}
                                            max={maxPriceLimit}
                                            step={1000}
                                            value={filters.maxPrice}
                                            onChange={(e) => setFilters({ ...filters, maxPrice: parseInt(e.target.value) })}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        />
                                        {/* Custom Track */}
                                        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1.5 bg-gray-200 rounded-full" />
                                        <div
                                            className="absolute top-1/2 -translate-y-1/2 h-1.5 bg-[#3B82F6] rounded-full"
                                            style={{ width: `${progressPercent}%` }}
                                        />
                                        {/* Custom Thumb */}
                                        <div
                                            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-gray-500 border-2 border-white rounded-full shadow-sm -ml-2 pointer-events-none"
                                            style={{ left: `${progressPercent}%` }}
                                        />
                                    </div>
                                    <span className="text-xs font-medium text-gray-400">₦100k+</span>
                                </div>
                                <div className="text-center mt-3">
                                    <span className="text-[#E89D24] text-sm font-medium">
                                        Up to ₦{(filters.maxPrice / 1000).toFixed(0)}k
                                    </span>
                                </div>
                            </div>
                        </div>



                        {/* Availability */}
                        <div className="space-y-4">
                            <h3 className="text-[15px] font-semibold text-gray-800">Availability</h3>
                            <div className="space-y-1">
                                {[
                                    { label: "Available today", value: "today" },
                                    { label: "Weekend availability", value: "weekend" },
                                    { label: "Evening sessions", value: "evening" },
                                ].map((option) => (
                                    <label key={option.value} className="flex items-center gap-3 cursor-pointer group">
                                        <div className="relative flex items-center justify-center">
                                            <input
                                                type="checkbox"
                                                checked={filters.availability.includes(option.value)}
                                                onChange={() => toggleAvailability(option.value)}
                                                className="peer sr-only"
                                            />
                                            <div className="w-4 h-4 border-[1px] border-gray-300 rounded peer-checked:bg-white peer-checked:border-gray-500 transition-colors" />
                                            {/* Custom checkmark using SVG or text when checked can be added here, but the design shows a simple empty square vs unchecked? Wait, the design shows an empty square and no checked state is visible in the design. We will just use standard checkbox styling */}
                                            <svg
                                                className="absolute w-3.5 h-3.5 text-gray-700 opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                                strokeWidth={3}
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                        <span className="text-sm font-medium text-gray-800 group-hover:text-gray-900">{option.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Rating */}
                        <div className="space-y-4">
                            <h3 className="text-[15px] font-semibold text-gray-800">Rating</h3>
                            <div className="flex flex-wrap gap-3">
                                {[
                                    { label: "4+ stars", value: "4+" },
                                    { label: "3+ stars", value: "3+" },
                                    { label: "Any rating", value: "any" },
                                ].map((option) => (
                                    <button
                                        key={option.value}
                                        onClick={() => setFilters({ ...filters, rating: option.value })}
                                        className={`px-3 py-2.5 rounded-full text-xs font-medium transition-colors ${filters.rating === option.value
                                            ? "bg-[#FFF6ED] text-[#E89D24]"
                                            : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                                            }`}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
            </div>
        </ResponsiveModal>
    );
}
