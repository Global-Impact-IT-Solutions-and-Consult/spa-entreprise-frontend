"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { State, City, IState, ICity } from "country-state-city";
import { Button } from "@/components/ui/button";
import { MapPin, Scissors, Calendar, ChevronDown } from "lucide-react";
import { businessService, BusinessType } from "@/services/business.service";

export function HeroSearch() {
    const router = useRouter();
    const [businessTypes, setBusinessTypes] = useState<BusinessType[]>([]);
    const [states, setStates] = useState<IState[]>([]);
    const [cities, setCities] = useState<ICity[]>([]);

    const [selectedState, setSelectedState] = useState("");
    const [city, setCity] = useState("");
    const [category, setCategory] = useState("");
    const [date, setDate] = useState("");

    const countryCode = "NG";

    useEffect(() => {
        const fetchBusinessTypes = async () => {
            try {
                const data = await businessService.getBusinessTypes();
                setBusinessTypes(data);
            } catch (error) {
                console.error("Failed to fetch business types:", error);
            }
        };
        fetchBusinessTypes();
        setStates(State.getStatesOfCountry(countryCode));
    }, []);

    useEffect(() => {
        if (selectedState) {
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

    const handleSearch = () => {
        const params = new URLSearchParams();
        if (selectedState) params.append("state", selectedState);
        if (city) params.append("city", city);
        if (category) params.append("category", category);
        if (date) params.append("date", date);

        router.push(`/businesses?${params.toString()}`);
    };

    return (
        <section className="relative bg-gradient-to-br from-gray-50 to-gray-100 py-12 md:py-40 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ">
            {/* Background Image Overlay */}
            <div className="absolute inset-0 overflow-hidden rounded-md">
                <div
                    className="w-full h-full bg-cover bg-center"
                    style={{
                        backgroundImage: "url('/assets/images/hero.jpg')"
                    }}
                />
                {/* Dark Overlay for contrast */}
                <div className="absolute inset-0 bg-black/20" />
            </div>
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Search Bar */}
                <div className="max-w-5xl mx-auto bg-white rounded-2xl md:rounded-full shadow-xl p-3 md:p-2">
                    <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 md:gap-1">

                        {/* State Dropdown */}
                        <div className="flex items-center flex-1 px-4 py-3 border md:border-r md:border-0 border-gray-200 rounded-lg md:rounded-none transition-all relative">
                            <MapPin className="w-5 h-5 text-gray-400 mr-2 flex-shrink-0" />
                            <select
                                value={selectedState}
                                onChange={(e) => {
                                    setSelectedState(e.target.value);
                                    setCity("");
                                }}
                                className="flex-1 outline-none text-sm appearance-none bg-transparent cursor-pointer font-medium"
                            >
                                <option value="">Select State</option>
                                {states.map((s) => (
                                    <option key={s.isoCode} value={s.name}>{s.name}</option>
                                ))}
                            </select>
                            <ChevronDown className="w-4 h-4 text-gray-400 pointer-events-none absolute right-4" />
                        </div>

                        {/* City Dropdown */}
                        <div className={`flex items-center flex-1 px-4 py-3 border md:border-r md:border-0 border-gray-200 rounded-lg md:rounded-none transition-all relative ${!selectedState ? 'opacity-50' : ''}`}>
                            <MapPin className="w-5 h-5 text-gray-400 mr-2 flex-shrink-0" />
                            <select
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                disabled={!selectedState}
                                className="flex-1 outline-none text-sm appearance-none bg-transparent cursor-pointer font-medium"
                            >
                                <option value="">Select City</option>
                                {cities.map((c, i) => (
                                    <option key={`${c.name}-${i}`} value={c.name}>{c.name}</option>
                                ))}
                            </select>
                            <ChevronDown className="w-4 h-4 text-gray-400 pointer-events-none absolute right-4" />
                        </div>

                        {/* Business Type Dropdown */}
                        <div className="flex items-center flex-1 px-4 py-3 border md:border-r md:border-0 border-gray-200 rounded-lg md:rounded-none transition-all relative">
                            <Scissors className="w-5 h-5 text-gray-400 mr-2 flex-shrink-0" />
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="flex-1 outline-none text-sm appearance-none bg-transparent cursor-pointer font-medium"
                            >
                                <option value="">Services</option>
                                {businessTypes.map((type) => (
                                    <option key={type.id} value={type.id}>{type.name}</option>
                                ))}
                            </select>
                            <ChevronDown className="w-4 h-4 text-gray-400 pointer-events-none absolute right-4" />
                        </div>

                        {/* Date Input */}
                        <div className="flex items-center flex-1 px-4 py-3 border border-gray-200 rounded-lg md:rounded-none md:border-0 transition-all">
                            <Calendar className="w-5 h-5 text-gray-400 mr-2 flex-shrink-0" />
                            <input
                                type={date ? "date" : "text"}
                                placeholder="Date"
                                value={date}
                                onFocus={(e) => (e.target.type = "date")}
                                onBlur={(e) => !date && (e.target.type = "text")}
                                onChange={(e) => setDate(e.target.value)}
                                className="flex-1 outline-none text-sm bg-transparent cursor-pointer font-medium"
                            />
                        </div>

                        {/* Search Button */}
                        <Button
                            onClick={handleSearch}
                            className="bg-[#E89D24] hover:bg-[#E5A800] text-white rounded-lg md:rounded-full px-8 py-4 md:py-6 font-semibold w-full md:w-auto transition-all active:scale-95 shadow-lg shadow-yellow-500/20"
                        >
                            Search
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
}
