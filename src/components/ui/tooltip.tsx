"use client"

import React, { useState } from "react"
import { cn } from "@/lib/utils"

interface TooltipProps {
    content: string
    children: React.ReactNode
    className?: string
}

export function Tooltip({ content, children, className }: TooltipProps) {
    const [isVisible, setIsVisible] = useState(false)

    return (
        <div
            className="relative inline-block"
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
        >
            {children}
            {isVisible && content?.trim() && (
                <div className={cn(
                    "absolute bottom-full left-1/2 -translate-x-1/2 -ms-8 mb-2 px-3 py-2 bg-gray-900 text-white text-[11px] font-bold rounded-lg whitespace-nowrap z-[110] shadow-xl animate-in fade-in zoom-in-95 duration-200",
                    className
                )}>
                    {content}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-gray-900" />
                </div>
            )}
        </div>
    )
}
