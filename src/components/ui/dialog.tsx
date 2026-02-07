"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"

// Simplified Dialog for MVP - not full headless UI but functional
interface DialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    children: React.ReactNode
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
    if (!open) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in-0">
            {children}
        </div>
    )
}

export function DialogContent({ children, className }: { children: React.ReactNode, className?: string }) {
    return (
        <div className={cn("relative z-50 grid w-full max-w-lg gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg md:w-full animate-in zoom-in-95 slide-in-from-bottom-5", className)}>
            {children}
        </div>
    )
}

export function DialogHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)}
            {...props}
        >
            {children}
        </div>
    )
}

export function DialogFooter({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)}
            {...props}
        >
            {children}
        </div>
    )
}

export function DialogTitle({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
    return (
        <h3
            className={cn("text-lg font-semibold leading-none tracking-tight", className)}
            {...props}
        >
            {children}
        </h3>
    )
}

// Helper for close button if needed inside content, but usually handled by parent.
// For this MVP, we will let the parent handle the close via onOpenChange passed to Dialog 
// but we really need a close button inside Content often.
