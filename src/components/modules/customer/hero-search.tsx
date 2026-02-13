"use client";

import { Button } from "@/components/ui/button";
import { MapPin, Scissors, Calendar } from "lucide-react";

export function HeroSearch() {
    return (
        <section className="relative bg-gradient-to-br from-gray-50 to-gray-100 py-12 md:py-20">
            {/* Background Image Overlay */}
            <div className="absolute inset-0 opacity-10">
                <div
                    className="w-full h-full bg-cover bg-center"
                    style={{
                        backgroundImage: "url('https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1600&q=80')"
                    }}
                />
            </div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-8 md:mb-10">
                    <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight">
                        Find & Book Premium<br className="md:hidden" /> Wellness Services
                    </h1>
                </div>

                {/* Search Bar */}
                <div className="max-w-4xl mx-auto bg-white rounded-2xl md:rounded-full shadow-xl p-3 md:p-2">
                    <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 md:gap-2">
                        {/* Location Input */}
                        <div className="flex items-center flex-1 px-4 py-3 border md:border-r md:border-0 border-gray-200 rounded-lg md:rounded-none">
                            <MapPin className="w-5 h-5 text-gray-400 mr-2 flex-shrink-0" />
                            <input
                                type="text"
                                placeholder="Lagos, Nigeria"
                                className="flex-1 outline-none text-sm"
                            />
                        </div>

                        {/* Service Dropdown */}
                        <div className="flex items-center flex-1 px-4 py-3 border md:border-r md:border-0 border-gray-200 rounded-lg md:rounded-none">
                            <Scissors className="w-5 h-5 text-gray-400 mr-2 flex-shrink-0" />
                            <select className="flex-1 outline-none text-sm appearance-none bg-transparent">
                                <option value="">Haircut</option>
                                <option value="spa">Spa</option>
                                <option value="barber">Barber</option>
                                <option value="facial">Facial</option>
                                <option value="beauty">Beauty</option>
                            </select>
                        </div>

                        {/* Date Input */}
                        <div className="flex items-center flex-1 px-4 py-3 border border-gray-200 rounded-lg md:rounded-none md:border-0">
                            <Calendar className="w-5 h-5 text-gray-400 mr-2 flex-shrink-0" />
                            <input
                                type="text"
                                placeholder="Select Date"
                                className="flex-1 outline-none text-sm"
                            />
                        </div>

                        {/* Search Button */}
                        <Button className="bg-[#F5B800] hover:bg-[#E5A800] text-white rounded-lg md:rounded-full px-8 py-4 md:py-6 font-semibold w-full md:w-auto">
                            Search
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
}
