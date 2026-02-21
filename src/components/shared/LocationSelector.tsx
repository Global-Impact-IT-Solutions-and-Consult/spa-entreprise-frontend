"use client";

import { useState, useEffect } from "react";
import { State, City, IState, ICity } from "country-state-city";
import { ChevronDown, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

interface LocationSelectorProps {
    onLocationChange: (location: { state: string; city: string }) => void;
    initialState?: string;
    initialCity?: string;
    className?: string;
    variant?: "horizontal" | "vertical" | "inline";
    showIcons?: boolean;
}

export function LocationSelector({
    onLocationChange,
    initialState = "",
    initialCity = "",
    className,
    variant = "vertical",
    showIcons = true,
}: LocationSelectorProps) {
    const countryCode = "NG"; // Default to Nigeria
    const [states, setStates] = useState<IState[]>([]);
    const [cities, setCities] = useState<ICity[]>([]);
    const [selectedState, setSelectedState] = useState(initialState);
    const [selectedCity, setSelectedCity] = useState(initialCity);

    useEffect(() => {
        setStates(State.getStatesOfCountry(countryCode));
    }, []);

    useEffect(() => {
        if (selectedState) {
            // Find the state code for the selected state name
            const stateObj = states.find(s => s.name === selectedState);
            if (stateObj) {
                setCities(City.getCitiesOfState(countryCode, stateObj.isoCode));
            } else {
                setCities([]);
            }
        } else {
            setCities([]);
        }
    }, [selectedState, states]);

    const handleStateChange = (stateName: string) => {
        setSelectedState(stateName);
        setSelectedCity(""); // Reset city when state changes
        onLocationChange({ state: stateName, city: "" });
    };

    const handleCityChange = (cityName: string) => {
        setSelectedCity(cityName);
        onLocationChange({ state: selectedState, city: cityName });
    };

    const containerClasses = cn(
        "flex gap-4",
        variant === "vertical" ? "flex-col" : "flex-row items-center",
        className
    );

    const selectClasses = "w-full h-12 pl-12 pr-10 rounded-xl border border-gray-100 bg-gray-50/50 text-sm font-medium focus:ring-2 focus:ring-[#E89D24] transition-all appearance-none cursor-pointer";

    if (variant === "inline") {
        return (
            <div className={cn("flex flex-col md:flex-row gap-4 w-full", className)}>
                <div className="relative flex-1">
                    {showIcons && <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />}
                    <select
                        value={selectedState}
                        onChange={(e) => handleStateChange(e.target.value)}
                        className={selectClasses}
                    >
                        <option value="">Select State</option>
                        {states.map((state) => (
                            <option key={state.isoCode} value={state.name}>
                                {state.name}
                            </option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
                <div className="relative flex-1">
                    {showIcons && <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />}
                    <select
                        value={selectedCity}
                        onChange={(e) => handleCityChange(e.target.value)}
                        disabled={!selectedState}
                        className={cn(selectClasses, !selectedState && "opacity-50 cursor-not-allowed")}
                    >
                        <option value="">Select City</option>
                        {cities.map((city, index) => (
                            <option key={`${city.name}-${index}`} value={city.name}>
                                {city.name}
                            </option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
            </div>
        );
    }

    return (
        <div className={containerClasses}>
            <div className="space-y-1.5 flex-1 w-full">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">State</label>
                <div className="relative">
                    <select
                        value={selectedState}
                        onChange={(e) => handleStateChange(e.target.value)}
                        className={selectClasses}
                    >
                        <option value="">All States</option>
                        {states.map((state) => (
                            <option key={state.isoCode} value={state.name}>
                                {state.name}
                            </option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
            </div>

            <div className="space-y-1.5 flex-1 w-full">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">City</label>
                <div className="relative">
                    <select
                        value={selectedCity}
                        onChange={(e) => handleCityChange(e.target.value)}
                        disabled={!selectedState}
                        className={cn(selectClasses, !selectedState && "opacity-50 cursor-not-allowed")}
                    >
                        <option value="">{selectedState ? "All Cities" : "Select State First"}</option>
                        {cities.map((city, index) => (
                            <option key={`${city.name}-${index}`} value={city.name}>
                                {city.name}
                            </option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
            </div>
        </div>
    );
}
