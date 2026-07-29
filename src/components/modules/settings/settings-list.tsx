"use client";

import { Children, type ReactNode } from "react";
import { ChevronRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface SettingsGroupProps {
    label: string;
    children: ReactNode;
}

// Mobile-only grouped settings list — white rounded card per section, with
// inset dividers between rows (62px = 16px padding + 34px icon chip + 12px gap).
export function SettingsGroup({ label, children }: SettingsGroupProps) {
    const rows = Children.toArray(children);

    return (
        <section>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2 px-1">{label}</p>
            <div className="bg-white rounded-[18px] shadow-sm overflow-hidden">
                {rows.map((row, i) => (
                    <div key={i}>
                        {i > 0 && <div className="h-px bg-gray-100 ml-[62px]" />}
                        {row}
                    </div>
                ))}
            </div>
        </section>
    );
}

interface SettingsRowProps {
    icon: LucideIcon;
    iconClassName?: string;
    label: string;
    subtitle?: string;
    meta?: string;
    trailing?: ReactNode;
    onClick?: () => void;
    tone?: "default" | "danger";
}

export function SettingsRow({
    icon: Icon,
    iconClassName,
    label,
    subtitle,
    meta,
    trailing,
    onClick,
    tone = "default",
}: SettingsRowProps) {
    const content = (
        <>
            <span
                className={cn(
                    "w-[34px] h-[34px] rounded-[10px] flex items-center justify-center shrink-0",
                    iconClassName
                )}
            >
                <Icon className="w-4 h-4" />
            </span>
            <span className="flex-1 min-w-0 text-left">
                <span
                    className={cn(
                        "block text-[14px] font-medium",
                        tone === "danger" ? "text-red-600" : "text-gray-900"
                    )}
                >
                    {label}
                </span>
                {subtitle && <span className="block text-[11px] text-gray-400 mt-0.5">{subtitle}</span>}
            </span>
            {meta && <span className="text-[12px] text-gray-400 font-medium shrink-0">{meta}</span>}
            {trailing ?? (onClick && <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />)}
        </>
    );

    const rowClassName = "w-full flex items-center gap-3 px-4 py-3 min-h-[52px]";

    // A <Switch> is itself a <button> — nesting it inside another <button>
    // (the onClick row variant) is invalid HTML, so the two variants render
    // different root elements rather than always using one.
    if (trailing) {
        return <div className={rowClassName}>{content}</div>;
    }

    return (
        <button type="button" onClick={onClick} className={rowClassName}>
            {content}
        </button>
    );
}
