import {
    Home,
    Compass,
    Building2,
    Calendar,
    Settings,
    Bookmark,
    History,
    Bell,
    LucideIcon,
} from "lucide-react";

export interface CustomerNavItem {
    icon: LucideIcon;
    label: string;
    href: string;
    mobilePrimary?: boolean;
    authRequired?: boolean;
}

export const customerNavItems: CustomerNavItem[] = [
    { icon: Home, label: "Home", href: "/", mobilePrimary: true },
    { icon: Calendar, label: "My Bookings", href: "/my-bookings", mobilePrimary: true },
    { icon: Compass, label: "Discover", href: "/discover", mobilePrimary: true },
    { icon: Building2, label: "Businesses", href: "/businesses", mobilePrimary: true },
    { icon: Settings, label: "Settings", href: "/settings", authRequired: true },
    { icon: Bookmark, label: "Saved", href: "/saved", authRequired: true },
    { icon: History, label: "History", href: "/history", authRequired: true },
    { icon: Bell, label: "Notifications", href: "/notifications", authRequired: true },
];
