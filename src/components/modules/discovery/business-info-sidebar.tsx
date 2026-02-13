"use client";

import { MapPin, Phone, Mail, Navigation2, PhoneCall, Instagram, Twitter, Facebook } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BusinessSidebarProps {
    business: {
        address: string;
        phone: string;
        email: string;
        hours: {
            day: string;
            time: string;
            isToday?: boolean;
        }[];
        status: string;
    };
}

export function BusinessInfoSidebar({ business }: BusinessSidebarProps) {
    return (
        <div className="space-y-8">
            {/* Contact & Info Card */}
            <div className="bg-white rounded-3xl border border-gray-100 p-6 md:p-8 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Contact & Information</h3>

                <div className="space-y-6">
                    <div className="flex gap-4">
                        <div className="bg-yellow-50 p-2.5 rounded-xl self-start">
                            <MapPin className="w-5 h-5 text-[#F5B800]" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-900 mb-1">Address</p>
                            <p className="text-sm text-gray-500 leading-relaxed">{business.address}</p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="bg-yellow-50 p-2.5 rounded-xl self-start">
                            <Phone className="w-5 h-5 text-[#F5B800]" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-900 mb-1">Phone</p>
                            <p className="text-sm text-gray-500">{business.phone}</p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="bg-yellow-50 p-2.5 rounded-xl self-start">
                            <Mail className="w-5 h-5 text-[#F5B800]" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-900 mb-1">Email</p>
                            <p className="text-sm text-blue-600 hover:underline cursor-pointer">{business.email}</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-3 mt-8">
                    <Button variant="outline" className="h-12 rounded-xl border-gray-100 bg-gray-50/50 font-bold gap-2 text-gray-700 hover:bg-gray-100">
                        <Navigation2 className="w-4 h-4" />
                        Get Directions
                    </Button>
                    <Button variant="outline" className="h-12 rounded-xl border-gray-100 bg-gray-50/50 font-bold gap-2 text-gray-700 hover:bg-gray-100">
                        <PhoneCall className="w-4 h-4" />
                        Call Business
                    </Button>
                </div>
            </div>

            {/* Business Hours Card */}
            <div className="bg-white rounded-3xl border border-gray-100 p-6 md:p-8 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Business Hours</h3>

                <div className="space-y-4">
                    {business.hours.map((hour, idx) => (
                        <div key={idx} className="flex justify-between items-center text-sm">
                            <span className={`font-bold ${hour.isToday ? 'text-[#F5B800]' : 'text-gray-900'}`}>{hour.day}</span>
                            <span className={`font-medium ${hour.isToday ? 'text-[#F5B800]' : 'text-gray-500'}`}>{hour.time}</span>
                        </div>
                    ))}
                </div>

                <div className="mt-8 p-4 bg-green-50 rounded-2xl flex items-center justify-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-sm font-bold text-green-700">{business.status}</span>
                </div>
            </div>

            {/* Socials */}
            <div className="bg-white rounded-3xl border border-gray-100 p-6 md:p-8 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Follow Us</h3>
                <div className="flex gap-4">
                    {[Instagram, Twitter, Facebook].map((Icon, i) => (
                        <button key={i} className="p-3 bg-gray-50 rounded-xl text-gray-500 hover:text-[#F5B800] hover:bg-yellow-50 transition-all">
                            <Icon className="w-5 h-5" />
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
