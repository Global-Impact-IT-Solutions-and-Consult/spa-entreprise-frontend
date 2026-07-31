// Shared helpers over the business approval-status enum
// ('PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'SUSPENDED', see
// src/services/business.service.ts). Replaces four independent copies of
// the same `status === 'pending_approval' || status === 'pending'` check
// previously duplicated across dashboard/layout.tsx, dashboard/page.tsx,
// Sidebar.tsx, and MobileBottomNav.tsx.

export function isBusinessPending(status?: string | null): boolean {
    const s = status?.toLowerCase();
    return s === "pending_approval" || s === "pending";
}

export interface BusinessStatusBadge {
    label: string;
    className: string;
}

// Labeled "Verified"/"Pending"/"Suspended" rather than the mockup's
// "Open"/"Pending" — there's no trading-hours data backing an "Open"
// claim, only approval status.
export function businessStatusBadge(status?: string | null): BusinessStatusBadge {
    const s = status?.toLowerCase();
    if (s === "pending_approval" || s === "pending") {
        return { label: "Pending", className: "bg-amber-100 text-amber-700" };
    }
    if (s === "suspended") {
        return { label: "Suspended", className: "bg-red-100 text-red-600" };
    }
    if (s === "rejected") {
        return { label: "Rejected", className: "bg-red-100 text-red-600" };
    }
    return { label: "Verified", className: "bg-green-100 text-green-600" };
}
