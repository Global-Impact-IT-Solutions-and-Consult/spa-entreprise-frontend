"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SwipeAction {
    key: string;
    label: string;
    icon: LucideIcon;
    onClick: () => void;
    className?: string;
    // Keeps the swipe tray open after this action fires instead of the
    // default auto-close — used for a two-tap "armed" destructive action
    // (e.g. Delete -> "Sure?" -> Delete) where the row needs to stay open
    // between taps.
    keepOpen?: boolean;
}

interface SwipeableRowProps {
    actions: SwipeAction[];
    children: React.ReactNode;
    disabled?: boolean;
    actionWidth?: number;
    className?: string;
}

// Registry of currently-open rows' close functions, so opening one closes
// every other one. Module-scoped by design — there's only ever one list of
// swipeable rows visible at a time in this app.
const openRowClosers = new Set<() => void>();

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

// Touch/pointer-only swipe-to-reveal-actions primitive (no gesture library).
// Lives next to Sheet since it's content-agnostic and reusable anywhere a
// row needs hidden actions (saved businesses, notifications, etc.).
export function SwipeableRow({ actions, children, disabled, actionWidth = 76, className }: SwipeableRowProps) {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const faceRef = useRef<HTMLDivElement>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    const totalWidth = actions.length * actionWidth;

    const drag = useRef({
        startX: 0,
        startY: 0,
        startOffset: 0,
        axis: "undecided" as "undecided" | "horizontal" | "vertical",
        didDrag: false,
        lastX: 0,
        lastT: 0,
        velocity: 0,
    });

    // Stable identity across renders so the open-row registry can add/remove
    // this exact function rather than comparing closures that change every render.
    const closeSelf = useCallback(() => setIsOpen(false), []);

    useEffect(() => {
        if (isOpen) {
            openRowClosers.forEach((close) => {
                if (close !== closeSelf) close();
            });
            openRowClosers.add(closeSelf);
        } else {
            openRowClosers.delete(closeSelf);
        }
        return () => {
            openRowClosers.delete(closeSelf);
        };
    }, [isOpen, closeSelf]);

    // Close on outside interaction or scroll — an open row left open while
    // the user scrolls away from it reads as broken.
    useEffect(() => {
        if (!isOpen) return;
        const handlePointerDown = (e: PointerEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        const handleScroll = () => setIsOpen(false);
        document.addEventListener("pointerdown", handlePointerDown);
        window.addEventListener("scroll", handleScroll, { passive: true, capture: true });
        return () => {
            document.removeEventListener("pointerdown", handlePointerDown);
            window.removeEventListener("scroll", handleScroll, true);
        };
    }, [isOpen]);

    const onPointerDown = (e: React.PointerEvent) => {
        if (disabled || e.pointerType === "mouse" || actions.length === 0) return;
        drag.current = {
            startX: e.clientX,
            startY: e.clientY,
            startOffset: isOpen ? -totalWidth : 0,
            axis: "undecided",
            didDrag: false,
            lastX: e.clientX,
            lastT: performance.now(),
            velocity: 0,
        };
    };

    const onPointerMove = (e: React.PointerEvent) => {
        if (disabled || e.pointerType === "mouse" || actions.length === 0) return;
        const state = drag.current;
        if (state.axis === "vertical") return;

        const dx = e.clientX - state.startX;
        const dy = e.clientY - state.startY;

        if (state.axis === "undecided") {
            if (Math.hypot(dx, dy) < 8) return;
            if (Math.abs(dx) > Math.abs(dy) * 1.5) {
                state.axis = "horizontal";
                e.currentTarget.setPointerCapture(e.pointerId);
                setIsDragging(true);
            } else {
                state.axis = "vertical";
                return;
            }
        }

        if (Math.abs(dx) > 8) state.didDrag = true;

        const now = performance.now();
        const dt = now - state.lastT;
        if (dt > 0) state.velocity = (e.clientX - state.lastX) / dt;
        state.lastX = e.clientX;
        state.lastT = now;

        let next = state.startOffset + dx;
        if (next > 0) {
            next *= 0.3;
        } else if (next < -totalWidth) {
            next = -totalWidth + (next + totalWidth) * 0.3;
        }
        next = clamp(next, -(totalWidth + 24), 24);

        if (faceRef.current) {
            faceRef.current.style.transform = `translate3d(${next}px,0,0)`;
        }
        e.preventDefault();
    };

    const onPointerUp = (e: React.PointerEvent) => {
        if (disabled || e.pointerType === "mouse" || actions.length === 0) return;
        const state = drag.current;
        if (state.axis !== "horizontal") return;

        const dx = e.clientX - state.startX;
        const finalOffset = state.startOffset + dx;
        const shouldOpen = finalOffset < -(totalWidth * 0.4) || state.velocity < -0.5;

        setIsDragging(false);
        setIsOpen(shouldOpen);
        state.axis = "undecided";
    };

    const onClickCapture = (e: React.MouseEvent) => {
        if (drag.current.didDrag) {
            e.preventDefault();
            e.stopPropagation();
            drag.current.didDrag = false;
            return;
        }
        if (isOpen) {
            e.preventDefault();
            e.stopPropagation();
            setIsOpen(false);
        }
    };

    const onActionsBlur = (e: React.FocusEvent<HTMLDivElement>) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
            setIsOpen(false);
        }
    };

    return (
        <div ref={wrapperRef} className={cn("relative overflow-hidden rounded-2xl", className)}>
            {!disabled && actions.length > 0 && (
                <div
                    className="absolute inset-y-0 right-0 flex"
                    style={{ width: totalWidth }}
                    onFocus={() => setIsOpen(true)}
                    onBlur={onActionsBlur}
                >
                    {actions.map((action) => (
                        <button
                            key={action.key}
                            type="button"
                            onClick={() => {
                                if (!action.keepOpen) setIsOpen(false);
                                action.onClick();
                            }}
                            style={{ width: actionWidth }}
                            className={cn(
                                "flex flex-col items-center justify-center gap-1 h-full text-[10px] font-semibold",
                                action.className
                            )}
                        >
                            <action.icon className="w-4 h-4" />
                            {action.label}
                        </button>
                    ))}
                </div>
            )}
            <div
                ref={faceRef}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp}
                onLostPointerCapture={onPointerUp}
                onClickCapture={onClickCapture}
                className={cn(
                    "relative bg-white touch-pan-y will-change-transform motion-reduce:transition-none",
                    !isDragging && "transition-transform duration-[var(--duration-base)] ease-[var(--ease-standard)]"
                )}
                style={{ transform: `translate3d(${isOpen ? -totalWidth : 0}px,0,0)` }}
            >
                {children}
            </div>
        </div>
    );
}
