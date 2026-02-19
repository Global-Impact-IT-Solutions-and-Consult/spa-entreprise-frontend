"use client";

import { MapPin, Phone, Mail, Navigation2, PhoneCall, Instagram, Twitter, Facebook } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BusinessSidebarProps {
    business: {
        address?: string;
        addressDetails?: {
            address: string;
        };
        phone: string;
        email: string;
        hours?: {
            day: string;
            time: string;
            isToday?: boolean;
        }[];
        operatingHours?: {
            [key: string]: {
                open: string;
                close: string;
                closed: boolean;
            };
        };
        status: string;
    };
}

export function BusinessInfoSidebar({ business }: BusinessSidebarProps) {
    const address = business.addressDetails?.address || business.address || "Lagos, Nigeria";

    // Map operatingHours object to the hours array format if available
    const daysOrder = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
    const currentDay = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

    const displayHours = business.hours || (business.operatingHours ? daysOrder.map(day => {
        const info = business.operatingHours?.[day];
        if (!info) return null;
        return {
            day: day.charAt(0).toUpperCase() + day.slice(1),
            time: info.closed ? "Closed" : `${info.open} - ${info.close}`,
            isToday: currentDay === day
        };
    }).filter(Boolean) as { day: string; time: string; isToday?: boolean }[] : []);

    return (
        <div className="space-y-8">
            {/* Contact & Info Card */}
            <div className="bg-white rounded-3xl border border-gray-100 p-6 md:p-8 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Contact & Information</h3>

                <div className="space-y-6">
                    <div className="flex gap-3">
                        <MapPin className="w-5 h-5 text-[#E89D24]" />
                        <div>
                            <p className="text-sm font-bold text-gray-900 mb-1">Address</p>
                            <p className="text-sm text-gray-500 leading-relaxed">{address}</p>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <Phone className="w-5 h-5 text-[#E89D24]" />
                        <div>
                            <p className="text-sm font-bold text-gray-900 mb-1">Phone</p>
                            <p className="text-sm text-gray-500">{business.phone}</p>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <Mail className="w-5 h-5 text-[#E89D24]" />
                        <div>
                            <p className="text-sm font-bold text-gray-900 mb-1">Email</p>
                            <p className="text-sm text-blue-600 hover:underline cursor-pointer">{business.email}</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-3 mt-8">
                    <Button variant="outline" className="h-12 rounded-md border-gray-100 bg-gray-50/50 font-bold gap-2 text-gray-700 hover:bg-gray-100">
                        <Navigation2 className="w-4 h-4" />
                        Get Directions
                    </Button>
                    <Button variant="outline" className="h-12 rounded-md border-gray-100 bg-gray-50/50 font-bold gap-2 text-gray-700 hover:bg-gray-100">
                        <PhoneCall className="w-4 h-4" />
                        Call Business
                    </Button>
                </div>
            </div>

            {/* Business Hours Card */}
            <div className="bg-white rounded-3xl border border-gray-100 p-6 md:p-8 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Business Hours</h3>

                <div className="space-y-4">
                    {displayHours.map((hour, idx) => (
                        <div key={idx} className="flex justify-between items-center text-sm">
                            <span className={`font-bold ${hour.isToday ? 'text-[#E89D24]' : 'text-gray-900'}`}>{hour.day}</span>
                            <span className={`font-medium ${hour.isToday ? 'text-[#E89D24]' : 'text-gray-500'}`}>{hour.time}</span>
                        </div>
                    ))}
                </div>

                <div className="mt-8 p-4 bg-[#4CA0541A] rounded-md flex items-center justify-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#4CA054] animate-pulse" />
                    <span className="text-sm font-bold text-[#4CA054]">{business.status}</span>
                </div>
            </div>

            {/* Socials */}
            <div className="bg-white rounded-3xl border border-gray-100 p-6 md:p-8 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Follow Us</h3>
                <div className="flex gap-4">
                    {[Instagram, Twitter, Facebook].map((Icon, i) => (
                        <button key={i} className="p-3 bg-gray-50 rounded-md text-gray-500 hover:text-[#E89D24] hover:bg-yellow-50 transition-all">
                            <Icon className="w-5 h-5" />
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
