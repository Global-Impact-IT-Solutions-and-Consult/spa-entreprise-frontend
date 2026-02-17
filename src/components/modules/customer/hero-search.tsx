"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { MapPin, Scissors, Calendar } from "lucide-react";
import { businessService, ServiceCategory } from "@/services/business.service";

export function HeroSearch() {
    const router = useRouter();
    const [categories, setCategories] = useState<ServiceCategory[]>([]);
    const [city, setCity] = useState("Lagos");
    const [category, setCategory] = useState("");
    const [date, setDate] = useState("");

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await businessService.getServiceCategories();
                setCategories(data);
            } catch (error) {
                console.error("Failed to fetch categories:", error);
            }
        };
        fetchCategories();
    }, []);

    const handleSearch = () => {
        const params = new URLSearchParams();
        if (city) params.append("city", city);
        if (category) params.append("category", category);
        if (date) params.append("date", date);

        router.push(`/businesses?${params.toString()}`);
    };

    return (
        <section className="relative bg-gradient-to-br from-gray-50 to-gray-100 py-12 md:py-40 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ">
            {/* Background Image Overlay */}
            <div className="absolute inset-0 opacity-10">
                <div
                    className="w-full h-full bg-cover bg-center rounded-md"
                    style={{
                        backgroundImage: "url('https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1600&q=80')"
                    }}
                />
            </div>
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Search Bar */}
                <div className="max-w-4xl mx-auto bg-white rounded-2xl md:rounded-full shadow-xl p-3 md:p-2">
                    <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 md:gap-2">
                        {/* Location Input */}
                        <div className="flex items-center flex-1 px-4 py-3 border md:border-r md:border-0 border-gray-200 rounded-lg md:rounded-none focus-within:ring-2 focus-within:ring-[#E89D24] focus-within:ring-inset transition-all">
                            <MapPin className="w-5 h-5 text-gray-400 mr-2 flex-shrink-0" />
                            <input
                                type="text"
                                placeholder="Lagos, Nigeria"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                className="flex-1 outline-none text-sm bg-transparent"
                            />
                        </div>

                        {/* Service Dropdown */}
                        <div className="flex items-center flex-1 px-4 py-3 border md:border-r md:border-0 border-gray-200 rounded-lg md:rounded-none focus-within:ring-2 focus-within:ring-[#E89D24] focus-within:ring-inset transition-all">
                            <Scissors className="w-5 h-5 text-gray-400 mr-2 flex-shrink-0" />
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="flex-1 outline-none text-sm appearance-none bg-transparent cursor-pointer"
                            >
                                <option value="">All Services</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Date Input */}
                        <div className="flex items-center flex-1 px-4 py-3 border border-gray-200 rounded-lg md:rounded-none md:border-0 focus-within:ring-2 focus-within:ring-[#E89D24] focus-within:ring-inset transition-all">
                            <Calendar className="w-5 h-5 text-gray-400 mr-2 flex-shrink-0" />
                            <input
                                type="date"
                                placeholder="Select Date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="flex-1 outline-none text-sm bg-transparent cursor-pointer"
                            />
                        </div>

                        {/* Search Button */}
                        <Button
                            onClick={handleSearch}
                            className="bg-[#E89D24] hover:bg-[#E5A800] text-white rounded-lg md:rounded-full px-8 py-4 md:py-6 font-semibold w-full md:w-auto transition-all active:scale-95"
                        >
                            Search
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
}
