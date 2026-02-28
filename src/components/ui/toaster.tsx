"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

// Simple Event Bus for Toasts
type ToastType = "success" | "error" | "warning" | "info"

interface ToastOptions {
    title?: string
    description?: string
    type?: ToastType
    duration?: number
}

interface Toast extends ToastOptions {
    id: number
}

let toastId = 0
const listeners: ((toasts: Toast[]) => void)[] = []
let toasts: Toast[] = []

const emitChange = () => {
    listeners.forEach((listener) => listener([...toasts]))
}

export const toaster = {
    create: (options: ToastOptions) => {
        const id = ++toastId
        const toast = { ...options, id }
        toasts = [...toasts, toast]
        emitChange()

        const duration = options.duration || 5000
        setTimeout(() => {
            toaster.dismiss(id)
        }, duration)
    },
    dismiss: (id: number) => {
        toasts = toasts.filter((t) => t.id !== id)
        emitChange()
    },
}

export function Toaster() {
    const [activeToasts, setActiveToasts] = useState<Toast[]>([])

    useEffect(() => {
        listeners.push(setActiveToasts)
        return () => {
            const index = listeners.indexOf(setActiveToasts)
            if (index > -1) {
                listeners.splice(index, 1)
            }
        }
    }, [])

    if (activeToasts.length === 0) return null

    return (
        <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 w-full max-w-md">
            {activeToasts.map((t) => (
                <div
                    key={t.id}
                    className={cn(
                        "relative flex items-start gap-4 rounded-xl border-l-4 p-5 shadow-xl transition-all animate-in slide-in-from-right-full bg-white",
                        t.type === "error" && "border-l-red-500 bg-white border border-red-100",
                        t.type === "success" && "border-l-green-500 bg-white border border-green-100",
                        t.type === "warning" && "border-l-yellow-500 bg-white border border-yellow-100",
                        t.type === "info" && "border-l-[#E59622] bg-white border border-[#FEF5E7]"
                    )}
                >
                    {/* Icon indicator */}
                    <div className={cn(
                        "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
                        t.type === "error" && "bg-red-50",
                        t.type === "success" && "bg-green-50",
                        t.type === "warning" && "bg-yellow-50",
                        t.type === "info" && "bg-[#FEF5E7]"
                    )}>
                        {t.type === "success" && (
                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        )}
                        {t.type === "error" && (
                            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        )}
                        {t.type === "warning" && (
                            <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        )}
                        {t.type === "info" && (
                            <svg className="w-5 h-5 text-[#E59622]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        )}
                    </div>
                    <div className="flex-1 space-y-1 min-w-0">
                        {t.title && <h5 className={cn("font-bold text-base",
                            t.type === "error" ? "text-red-900" :
                                t.type === "success" ? "text-green-900" :
                                    t.type === "warning" ? "text-yellow-900" :
                                        "text-gray-900"
                        )}>{t.title}</h5>}
                        {t.description && <p className={cn("text-sm leading-relaxed",
                            t.type === "error" ? "text-red-700" :
                                t.type === "success" ? "text-green-700" :
                                    t.type === "warning" ? "text-yellow-700" :
                                        "text-gray-600"
                        )}>{t.description}</p>}
                    </div>
                    <button
                        onClick={() => toaster.dismiss(t.id)}
                        className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            ))}
        </div>
    )
}
