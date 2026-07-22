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
    { icon: Store, label: "Business", href: "/dashboard/business", mobilePrimary: true },
    { icon: Briefcase, label: "Services", href: "/dashboard/services", mobilePrimary: true },
    { icon: Users, label: "Staffs", href: "/dashboard/staffs" },
    { icon: Clock, label: "Working Hours", href: "/dashboard/working-hours" },
    { icon: Settings, label: "Settings", href: "/dashboard/settings" },
];

export const contactSupportItem: DashboardNavItem = {
    icon: Headset,
    label: "Contact Support",
    href: "/dashboard/contact-support",
};
