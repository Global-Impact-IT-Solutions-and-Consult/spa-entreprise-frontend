"use client";

import { AlertTriangle, Trash2, X } from "lucide-react";
import { Button } from "./button";

interface ConfirmModalProps {
    isOpen: boolean;
    title?: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: "danger" | "warning" | "default";
    onConfirm: () => void;
    onCancel: () => void;
    isLoading?: boolean;
}

export function ConfirmModal({
    isOpen,
    title = "Are you sure?",
    message,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    variant = "default",
    onConfirm,
    onCancel,
    isLoading = false,
}: ConfirmModalProps) {
    if (!isOpen) return null;

    const iconMap = {
        danger: <Trash2 className="h-6 w-6 text-red-500" />,
        warning: <AlertTriangle className="h-6 w-6 text-amber-500" />,
        default: <AlertTriangle className="h-6 w-6 text-blue-500" />,
    };

    const iconBgMap = {
        danger: "bg-red-50",
        warning: "bg-amber-50",
        default: "bg-blue-50",
    };

    const confirmBtnMap = {
        danger: "bg-red-500 hover:bg-red-600 text-white",
        warning: "bg-amber-500 hover:bg-amber-600 text-white",
        default: "bg-[#F59E0B] hover:bg-[#D97706] text-white",
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
                {/* Close button */}
                <button
                    onClick={onCancel}
                    className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <X className="h-4 w-4" />
                </button>

                {/* Icon + Title */}
                <div className="flex flex-col items-center text-center gap-3">
                    <div className={`p-3 rounded-full ${iconBgMap[variant]}`}>
                        {iconMap[variant]}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{message}</p>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-1">
                    <Button
                        type="button"
                        onClick={onCancel}
                        disabled={isLoading}
                        className="flex-1 h-11 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl"
                    >
                        {cancelLabel}
                    </Button>
                    <Button
                        type="button"
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={`flex-1 h-11 font-bold rounded-xl ${confirmBtnMap[variant]}`}
                    >
                        {isLoading ? "Please wait..." : confirmLabel}
                    </Button>
                </div>
            </div>
        </div>
    );
}
