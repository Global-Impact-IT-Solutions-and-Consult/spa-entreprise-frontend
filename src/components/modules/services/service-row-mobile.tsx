"use client";

import { useEffect, useRef, useState } from "react";
import { ImageIcon, Pencil, Store, Trash2 } from "lucide-react";
import { FiHome } from "react-icons/fi";
import { SwipeableRow, type SwipeAction } from "@/components/ui/swipeable-row";
import type { Service } from "@/services/business.service";

interface ServiceRowMobileProps {
    service: Service;
    onEdit: () => void;
    onDelete: () => void;
}

// Mobile-only compact service row. Delete is a two-tap armed action: the first
// tap keeps the swipe tray open and re-labels to "Sure?", the second tap calls
// the page's existing delete handler. Auto-disarms after 3s.
export function ServiceRowMobile({ service, onEdit, onDelete }: ServiceRowMobileProps) {
    const [isArmed, setIsArmed] = useState(false);
    const disarmTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => () => {
        if (disarmTimer.current) clearTimeout(disarmTimer.current);
    }, []);

    const handleDeleteTap = () => {
        if (disarmTimer.current) clearTimeout(disarmTimer.current);
        if (isArmed) {
            setIsArmed(false);
            onDelete();
            return;
        }
        setIsArmed(true);
        disarmTimer.current = setTimeout(() => setIsArmed(false), 3000);
    };

    // Delivery-type derivation matches ServiceCard.tsx exactly.
    const isBoth = service.deliveryType?.toLowerCase() === 'both';
    const isHomeOnly = service.deliveryType?.toLowerCase() === 'home_service';

    const actions: SwipeAction[] = [
        {
            key: "edit",
            label: "Edit",
            icon: Pencil,
            onClick: onEdit,
            className: "bg-gray-100 text-gray-700",
        },
        {
            key: "delete",
            label: isArmed ? "Sure?" : "Delete",
            icon: Trash2,
            onClick: handleDeleteTap,
            className: isArmed ? "bg-[#B91C1C] text-white" : "bg-[#E74C3C] text-white",
            keepOpen: !isArmed,
        },
    ];

    const price = isHomeOnly ? service.homeServicePrice : service.price;

    return (
        <SwipeableRow actions={actions} className="shadow-sm">
            <div className="flex items-center gap-3 p-4">
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                    {service.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={service.imageUrl} alt={service.name} className="h-full w-full object-cover" />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center text-gray-300">
                            <ImageIcon className="h-5 w-5" />
                        </div>
                    )}
                </div>

                <div className="min-w-0 flex-1">
                    <p className="text-[15px] font-bold text-gray-900 line-clamp-1">{service.name}</p>
                    <p className="mt-0.5 text-[12px] text-gray-400 line-clamp-1">
                        {service.category?.name || "Service"} · {service.duration || 0} min · ₦{(price || 0).toLocaleString()}
                    </p>

                    <div className="mt-2 flex items-center gap-1.5">
                        {!isHomeOnly && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600">
                                <Store className="h-3 w-3" />
                                In-store
                            </span>
                        )}
                        {(isBoth || isHomeOnly) && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-[#E89D24]">
                                <FiHome className="h-3 w-3" />
                                Home service
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex shrink-0 flex-col items-center gap-1.5">
                    <button
                        type="button"
                        onClick={onEdit}
                        aria-label="Edit service"
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-600 active:scale-90 transition-transform"
                    >
                        <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                        type="button"
                        onClick={onDelete}
                        aria-label="Delete service"
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-red-50 text-red-500 active:scale-90 transition-transform"
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                    </button>
                </div>
            </div>
        </SwipeableRow>
    );
}
