"use client";

import { useEffect, useState, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SheetProps {
    open: boolean;
    onClose: () => void;
    title?: string;
    children: ReactNode;
    footer?: ReactNode;
    className?: string;
}

// Bottom-sheet primitive: slides up from the viewport bottom instead of the
// centered-modal treatment in dialog.tsx. Mirrors the transition choreography
// already proven out in the dashboard's mobile "More" panel.
export function Sheet({ open, onClose, title, children, footer, className }: SheetProps) {
    const [isMounted, setIsMounted] = useState(open);
    const [isVisible, setIsVisible] = useState(false);
    const [prevOpen, setPrevOpen] = useState(open);

    // Derived-state-on-prop-change pattern (matches advance-filter-modal.tsx's
    // own prevOpen usage): keeps the sheet mounted for the close transition
    // without setting state synchronously inside an effect body.
    if (open !== prevOpen) {
        setPrevOpen(open);
        if (open) {
            setIsMounted(true);
        } else {
            setIsVisible(false);
        }
    }

    useEffect(() => {
        if (!isMounted) return;
        if (open) {
            const id = requestAnimationFrame(() => setIsVisible(true));
            return () => cancelAnimationFrame(id);
        }
        const timeout = setTimeout(() => setIsMounted(false), 200);
        return () => clearTimeout(timeout);
    }, [open, isMounted]);

    if (!isMounted) return null;

    return (
        <>
            <div
                className={cn(
                    "fixed inset-0 z-40 bg-black/30 transition-opacity duration-200",
                    isVisible ? "opacity-100" : "opacity-0"
                )}
                onClick={onClose}
            />
            <div
                className={cn(
                    "fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[85vh] w-full max-w-lg flex-col rounded-t-2xl bg-white shadow-2xl transition-transform duration-200 ease-out pb-[var(--safe-area-bottom)]",
                    isVisible ? "translate-y-0" : "translate-y-full",
                    className
                )}
            >
                {title && (
                    <div className="flex items-center justify-between px-4 pt-4 pb-2 shrink-0">
                        <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                        <button
                            onClick={onClose}
                            className="h-10 w-10 flex items-center justify-center hover:bg-gray-100 rounded-lg text-gray-400 transition-colors"
                        >
                            <X className="h-5 w-5" strokeWidth={2.5} />
                        </button>
                    </div>
                )}
                <div className="flex-1 min-h-0 overflow-y-auto">{children}</div>
                {footer && <div className="shrink-0 border-t px-4 py-3">{footer}</div>}
            </div>
        </>
    );
}
