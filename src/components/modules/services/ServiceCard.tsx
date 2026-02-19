"use client";

import { FiEdit2, FiTrash2, FiClock, FiHome } from 'react-icons/fi';
import { Service } from '@/services/business.service';
import { Store } from 'lucide-react';

interface ServiceCardProps {
    service: Service;
    categoryName: string;
    onDelete: () => void;
    onEdit: () => void;
}

export const ServiceCard = ({ service, categoryName, onDelete, onEdit }: ServiceCardProps) => {
    return (
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm flex flex-col gap-4 relative h-full">
            <div className="flex justify-between items-center">
                <span className="px-3 py-1 bg-gray-100 rounded-full text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                    {categoryName}
                </span>
                <div className="flex gap-2">
                    <button onClick={onEdit} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                        <FiEdit2 size={14} />
                    </button>
                    <button onClick={onDelete} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <FiTrash2 size={14} />
                    </button>
                </div>
            </div>

            <div className="flex flex-col gap-1">
                <div className="h-32 bg-gray-100 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                    {/* Placeholder for image if not available */}
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-300">
                        <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                        </svg>
                    </div>
                </div>
                <h3 className="text-lg font-bold text-gray-900">{service.name}</h3>
                <p className="text-xs text-gray-400 leading-relaxed line-clamp-2">
                    {service.description || "Fully body therapeutic massage with essential oils for relaxation and pain relief."}
                </p>
            </div>

            <div className="grid grid-cols-2 gap-y-4 pt-4 border-t border-gray-50 mt-auto">
                <div className="flex items-center gap-2 text-gray-400">
                    <FiClock className="h-4 w-4" />
                    <span className="text-xs font-bold text-gray-800">{service.duration || 0}min</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400 pl-4 border-l border-gray-50">
                    <span className="text-xs font-medium text-gray-400">Buffer</span>
                    <span className="text-xs font-bold text-gray-800">{service.bufferTime || 0}min</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                    <Store className="h-4 w-4" />
                    <span className="text-xs font-medium text-gray-400">
                        {service.deliveryType?.toLowerCase() === 'home_service_only' ? 'Home Service' : 'On Site'}
                    </span>
                </div>
                <div className="flex items-center gap-2 text-gray-400 pl-4 border-l border-gray-50">
                    {service.deliveryType?.toLowerCase() === 'both' && (
                        <>
                            <FiHome className="h-4 w-4" />
                            <span className="text-xs font-medium text-gray-400">Home Service</span>
                        </>
                    )}
                </div>
                <div className="col-span-1">
                    <p className="text-lg font-bold text-gray-900 leading-none">₦{(service.price || 0).toLocaleString()}</p>
                </div>
                <div className="col-span-1 pl-4 border-l border-gray-50">
                    {(service.deliveryType?.toLowerCase() === 'both' || service.deliveryType?.toLowerCase() === 'home_service_only') && service.homeServicePrice && (
                        <p className="text-lg font-bold text-gray-900 leading-none">₦{(service.homeServicePrice || 0).toLocaleString()}</p>
                    )}
                </div>
            </div>
        </div>
    );
};
