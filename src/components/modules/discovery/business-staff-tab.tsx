"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Staff {
    id: string;
    name: string;
    role: string;
    rating: number;
    reviews: number;
    about: string;
    specialties: string[];
    profilePicture?: string;
}

interface BusinessStaffTabProps {
    staffs: Staff[];
}

function StaffCard({ member }: { member: Staff }) {
    const [expanded, setExpanded] = useState(false);

    return (
        <div key={member.id} className="bg-white rounded-3xl border border-gray-100 px-4 py-4 shadow-sm transition-all hover:shadow-md flex gap-4">
            <div className="flex items-start gap-6 mb-6">
                <Avatar className="w-14 h-14 border-2 border-white bg-gray-100">
                    <AvatarImage src={member.profilePicture} />
                    <AvatarFallback className="bg-gray-200 font-bold text-gray-500 text-xl">
                        {member.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                </Avatar>
            </div>

            <div className="flex-1">
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

                <div className="mt-4 mb-2">
                    <p className={`text-gray-500 text-sm leading-relaxed ${expanded ? "" : "line-clamp-2"}`}>
                        {member.about}
                    </p>
                    {member.about && member.about.length > 110 && (
                        <button
                            onClick={() => setExpanded(prev => !prev)}
                            className="text-xs text-[#E89D24] font-bold mt-2 hover:underline"
                        >
                            {expanded ? "See less" : "See more"}
                        </button>
                    )}
                </div>

                <div className="flex flex-wrap gap-2">
                    {member.specialties.map((spec, i) => (
                        <span key={i} className="px-2 py-1 bg-orange-50 text-[#D48400] text-xs font-medium rounded-full border border-orange-100/50">
                            {spec}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}

export function BusinessStaffTab({ staffs }: BusinessStaffTabProps) {
    return (
        <div className="space-y-10">
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Meet Our Staffs</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {staffs.map((member) => (
                    <StaffCard key={member.id} member={member} />
                ))}
            </div>
        </div>
    );
}
