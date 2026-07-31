"use client";

import type { ReactNode } from "react";
import { Sheet } from "@/components/ui/sheet";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useIsMobile, MOBILE_MAX } from "@/hooks/use-is-mobile";

interface ResponsiveModalProps {
    open: boolean;
    onClose: () => void;
    // Breakpoint (max-width, px) below which the Sheet renders instead of
    // the Dialog. Defaults to the app-wide 767 (`md`); dashboard call sites
    // should pass 1023 (`lg`) since the dashboard splits on `lg` instead.
    breakpoint?: number;
    // Sheet header title (mobile only).
    title?: string;
    // Shared footer content, rendered inside Sheet's own footer slot on
    // mobile and inside a `desktopFooterClassName`-wrapped div on desktop.
    footer?: ReactNode;
    // Verbatim original Dialog header block (desktop only) — pass the
    // pre-existing `DialogHeader`/heading markup recovered from before a
    // Dialog->Sheet migration, not a re-derived approximation.
    desktopHeader?: ReactNode;
    // Verbatim original `DialogContent` className (desktop only).
    desktopContentClassName?: string;
    // Verbatim original footer wrapper className (desktop only).
    desktopFooterClassName?: string;
    // Sheet panel className passthrough (mobile only).
    className?: string;
    children: ReactNode;
}

// Dual-tree modal shell: exactly one of {Sheet, Dialog} mounts at a time,
// switched by `useIsMobile(breakpoint)`. Standing rule for this app (see
// project plan): no modal should be a full Dialog->Sheet replacement —
// desktop always keeps its original Dialog-based presentation, mobile
// always gets the Sheet. Use this instead of a CSS `md:hidden`/`hidden
// md:block` dual tree whenever the modal holds refs or otherwise can't
// tolerate being mounted twice (e.g. an input ref array indexed by
// position) — a CSS dual tree would double-mount both branches and let
// the second one silently steal ref assignments from the first.
export function ResponsiveModal({
    open,
    onClose,
    breakpoint = MOBILE_MAX,
    title,
    footer,
    desktopHeader,
    desktopContentClassName,
    desktopFooterClassName,
    className,
    children,
}: ResponsiveModalProps) {
    const isMobile = useIsMobile(breakpoint);

    if (isMobile === null) return null;

    if (isMobile) {
        return (
            <Sheet open={open} onClose={onClose} title={title} footer={footer} className={className}>
                {children}
            </Sheet>
        );
    }

    return (
        <Dialog open={open} onOpenChange={(next) => { if (!next) onClose(); }}>
            <DialogContent className={desktopContentClassName}>
                {desktopHeader}
                {children}
                {footer && <div className={desktopFooterClassName}>{footer}</div>}
            </DialogContent>
        </Dialog>
    );
}
