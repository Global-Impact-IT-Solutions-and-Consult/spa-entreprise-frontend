import {
    LayoutDashboard,
    Store,
    Briefcase,
    Calendar,
    Users,
    Clock,
    Settings,
    Headset,
    LucideIcon,
} from "lucide-react";

export interface DashboardNavItem {
    icon: LucideIcon;
    label: string;
    href: string;
    mobilePrimary?: boolean;
}

export const dashboardNavItems: DashboardNavItem[] = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard", mobilePrimary: true },
    { icon: Calendar, label: "Bookings", href: "/dashboard/bookings", mobilePrimary: true },
    // Business is intentionally not a mobile-primary tab — it's reachable from
    // the "More" sheet and from the dashboard-home Business Profile sheet.
    { icon: Store, label: "Business", href: "/dashboard/business" },
    { icon: Briefcase, label: "Services", href: "/dashboard/services", mobilePrimary: true },
    { icon: Users, label: "Staffs", href: "/dashboard/staffs", mobilePrimary: true },
    { icon: Clock, label: "Working Hours", href: "/dashboard/working-hours" },
    { icon: Settings, label: "Settings", href: "/dashboard/settings" },
];

export const contactSupportItem: DashboardNavItem = {
    icon: Headset,
    label: "Contact Support",
    href: "/dashboard/contact-support",
};
