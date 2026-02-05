"use client"

import { useState, useEffect } from "react"
import { createRoot } from "react-dom/client"
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
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-full max-w-sm">
            {activeToasts.map((t) => (
                <div
                    key={t.id}
                    className={cn(
                        "relative flex items-start gap-3 rounded-lg border p-4 shadow-lg transition-all animate-in slide-in-from-right-full bg-white dark:bg-gray-950",
                        t.type === "error" && "border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-900",
                        t.type === "success" && "border-green-200 bg-green-50 dark:bg-green-900/10 dark:border-green-900",
                        t.type === "warning" && "border-yellow-200 bg-yellow-50 dark:bg-yellow-900/10 dark:border-yellow-900"
                    )}
                >
                    <div className="flex-1 space-y-1">
                        {t.title && <h5 className={cn("font-medium text-sm",
                            t.type === "error" ? "text-red-800 dark:text-red-400" :
                                t.type === "success" ? "text-green-800 dark:text-green-400" :
                                    "text-gray-900 dark:text-gray-100"
                        )}>{t.title}</h5>}
                        {t.description && <p className="text-sm text-gray-500 dark:text-gray-400">{t.description}</p>}
                    </div>
                    <button
                        onClick={() => toaster.dismiss(t.id)}
                        className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            ))}
        </div>
    )
}
