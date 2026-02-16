"use client";

import { Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Staff {
    id: string;
    name: string;
    role: string;
    rating: number;
    reviews: number;
    description: string;
    specialties: string[];
    avatar?: string;
}

interface BusinessStaffTabProps {
    staffs: Staff[];
}

export function BusinessStaffTab({ staffs }: BusinessStaffTabProps) {
    return (
        <div className="space-y-10">
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Meet Our Staffs</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {staffs.map((member) => (
                    <div key={member.id} className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm transition-all hover:shadow-md">
                        <div className="flex items-start gap-6 mb-6">
                            <Avatar className="w-20 h-20 border-4 border-white shadow-xl bg-gray-100">
                                <AvatarImage src={member.avatar} />
                                <AvatarFallback className="bg-gray-200 font-bold text-gray-500 text-xl">
                                    {member.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                            </Avatar>
                            <div className="pt-2">
                                <h4 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h4>
                                <p className="text-[#E89D24] font-bold text-sm mb-3">{member.role}</p>
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-1">
                                        {[1, 2, 3, 4, 5].map((s) => (
                                            <Star
                                                key={s}
                                                className={`w-3.5 h-3.5 ${s <= Math.floor(member.rating) ? "fill-[#E89D24] text-[#E89D24]" : "text-gray-200"}`}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-sm font-bold text-gray-900">{member.rating}</span>
                                    <span className="text-xs text-gray-400 font-medium">({member.reviews} reviews)</span>
                                </div>
                            </div>
                        </div>

                        <p className="text-gray-500 leading-relaxed font-medium mb-8">
                            {member.description}
                        </p>

                        <div className="flex flex-wrap gap-2">
                            {member.specialties.map((spec, i) => (
                                <span key={i} className="px-4 py-2 bg-orange-50 text-[#D48400] text-xs font-bold rounded-lg border border-orange-100/50">
                                    {spec}
                                </span>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
