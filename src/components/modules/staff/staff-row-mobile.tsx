"use client";

import { useEffect, useRef, useState } from "react";
import { Pencil, Star, Trash2 } from "lucide-react";
import { SwipeableRow, type SwipeAction } from "@/components/ui/swipeable-row";
import type { Staff } from "@/services/business.service";

interface StaffRowMobileProps {
    staff: Staff;
    serviceNames: string[];
    onEdit: () => void;
    onDelete: () => void;
}

// Mobile-only compact staff row. Remove uses the same two-tap armed pattern as
// the service row: first tap keeps the tray open and re-labels to "Sure?",
// second tap calls the page's existing delete handler, auto-disarm after 3s.
export function StaffRowMobile({ staff, serviceNames, onEdit, onDelete }: StaffRowMobileProps) {
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

    const actions: SwipeAction[] = [
        {
            key: "edit",
            label: "Edit",
            icon: Pencil,
            onClick: onEdit,
            className: "bg-gray-100 text-gray-700",
        },
        {
            key: "remove",
            label: isArmed ? "Sure?" : "Remove",
            icon: Trash2,
            onClick: handleDeleteTap,
            className: isArmed ? "bg-[#B91C1C] text-white" : "bg-[#E74C3C] text-white",
            keepOpen: !isArmed,
        },
    ];

    const initials =
        staff.name
            .split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map((word) => word.charAt(0).toUpperCase())
            .join("") || "S";

    // No rating is rendered at all when there are no reviews — "0.0" reads as a
    // bad score rather than "not rated yet".
    const rating = Number(staff.rating);
    const hasRating = !!staff.reviewCount && Number.isFinite(rating) && rating > 0;

    return (
        <SwipeableRow actions={actions} className="shadow-sm">
            <div className="p-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-amber-50 text-[13px] font-bold text-[#E89D24]">
                        {staff.profilePicture ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={staff.profilePicture} alt={staff.name} className="h-full w-full object-cover" />
                        ) : (
                            initials
                        )}
                    </div>

                    <div className="min-w-0 flex-1">
                        <p className="text-[15px] font-bold text-gray-900 line-clamp-1">{staff.name}</p>
                        <p className="mt-0.5 text-[12px] text-gray-400 line-clamp-1">
                            {staff.experience ? `${staff.experience} ${staff.role}` : staff.role}
                        </p>
                    </div>

                    {hasRating && (
                        <div className="flex shrink-0 items-center gap-1 text-[12px] font-semibold text-gray-700">
                            <Star className="h-3.5 w-3.5 fill-[#F59E0B] text-[#F59E0B]" />
                            {rating.toFixed(1)}
                        </div>
                    )}

                    <div className="flex shrink-0 items-center gap-1.5">
                        <button
                            type="button"
                            onClick={onEdit}
                            aria-label="Edit staff"
                            className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-600 active:scale-90 transition-transform"
                        >
                            <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                            type="button"
                            onClick={onDelete}
                            aria-label="Remove staff"
                            className="flex h-8 w-8 items-center justify-center rounded-full bg-red-50 text-red-500 active:scale-90 transition-transform"
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                        </button>
                    </div>
                </div>

                {serviceNames.length > 0 && (
                    <div className="scroll-row mt-3 gap-2">
                        {serviceNames.map((name, i) => (
                            <span
                                key={i}
                                className="shrink-0 rounded-full border border-amber-100 bg-amber-50 px-2.5 py-1 text-[10px] font-medium text-amber-700"
                            >
                                {name}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </SwipeableRow>
    );
}
