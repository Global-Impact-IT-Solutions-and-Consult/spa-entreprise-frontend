"use client";

import { useState } from 'react';
import { FiEdit2, FiTrash2, FiClock, FiHome } from 'react-icons/fi';
import { Store } from 'lucide-react';
import { Service } from '@/services/business.service';

interface ServiceCardProps {
    service: Service;
    categoryName: string;
    onDelete: () => void;
    onEdit: () => void;
}

export const ServiceCard = ({ service, onDelete, onEdit }: ServiceCardProps) => {
    const isBoth = service.deliveryType?.toLowerCase() === 'both';
    const isHomeOnly = service.deliveryType?.toLowerCase() === 'home_service';
    const [expanded, setExpanded] = useState(false);

    return (
        <div className={`bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm flex flex-col ${expanded ? 'h-auto' : 'h-[420px]'}`}>
            {/* Image — flush to top, edit/delete overlaid */}
            <div className="relative w-full h-[175px] bg-gray-100 shrink-0">
                {service.imageUrl ? (
                    <img
                        src={service.imageUrl}
                        alt={service.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-300">
                        <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                        </svg>
                    </div>
                )}

                {/* Action buttons overlaid on image */}
                <div className="absolute top-2 left-0 flex justify-between gap-1.5 w-full px-2">
                    <div className="bg-white/80 backdrop-blur text-[#2F3E00] hover:bg-white rounded-xl shadow transition-colors p-1 px-2 text-xs">{service.category?.name}</div>
                    <div className="flex gap-2">
                        <button
                            onClick={onEdit}
                            className="p-1.5 bg-white/80 backdrop-blur text-blue-500 hover:bg-white rounded-full shadow transition-colors"
                        >
                            <FiEdit2 size={13} />
                        </button>
                        <button
                            onClick={onDelete}
                            className="p-1.5 bg-white/80 backdrop-blur text-red-500 hover:bg-white rounded-full shadow transition-colors"
                        >
                            <FiTrash2 size={13} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Card body */}
            <div className="flex flex-col gap-3 p-4 flex-1">
                {/* Name + description */}
                <div>
                    <h3 className="text-base font-bold text-gray-900 leading-snug">{service.name}</h3>
                    {service.description && (
                        <div className={`flex flex-col items-start ${expanded ? 'h-auto' : 'h-[58px]'}`}>
                            <p className={`text-xs text-gray-400 mt-1 leading-relaxed ${expanded ? '' : 'line-clamp-2'}`}>
                                {service.description}
                            </p>
                            {service.description.length > 110 && <button
                                onClick={() => setExpanded(v => !v)}
                                className="text-[10px] font-semibold text-amber-500 hover:text-amber-600 mt-0.5"
                            >
                                {expanded ? 'See less' : 'See more'}
                            </button>}
                        </div>
                    )}
                </div>

                <hr className="border-gray-100" />

                {/* Duration + buffer */}
                <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1.5 text-gray-500">
                        <FiClock className="h-4 w-4" />
                        <span className="font-semibold text-gray-800">{service.duration || 0}min</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-500">
                        <span className="text-xs text-gray-400">Buffer</span>
                        <span className="font-semibold text-gray-800">{service.bufferTime || 0}min</span>
                    </div>
                </div>

                <hr className="border-gray-100" />

                {/* Delivery type(s) */}
                <div className="flex items-center gap-4 text-sm">
                    {!isHomeOnly && (
                        <div className="flex items-center gap-1.5 text-gray-500">
                            <Store className="h-4 w-4" />
                            <span className="text-xs text-gray-500">On Site</span>
                        </div>
                    )}
                    {(isBoth || isHomeOnly) && (
                        <div className="flex items-center gap-1.5 text-gray-500">
                            <FiHome className="h-4 w-4" />
                            <span className="text-xs text-gray-500">Home Service</span>
                        </div>
                    )}
                </div>

                {/* Price(s) */}
                <div className="flex items-center gap-6 mt-auto pt-1">
                    {!isHomeOnly && (
                        <p className="text-base font-bold text-gray-900">
                            ₦{(service.price || 0).toLocaleString()}
                        </p>
                    )}
                    {(isBoth || isHomeOnly) && service.homeServicePrice ? (
                        <p className="text-base font-bold text-gray-900">
                            ₦{(service.homeServicePrice || 0).toLocaleString()}
                        </p>
                    ) : null}
                </div>
            </div>
        </div>
    );
};
