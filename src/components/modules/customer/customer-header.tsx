"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { MapPin, User, Home, Calendar, Compass, Building2, Settings, Bell, LogOut, Loader2, Bookmark, History, ChevronDown, LayoutDashboard } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { authService } from "@/services/auth.service";
import { notificationService } from "@/services/notification.service";
import { toaster } from "@/components/ui/toaster";
import Image from "next/image";
import { useUserLocation } from "@/hooks/use-user-location";
import { Select } from "@/components/ui/select";
import { NotificationPreviewSheet } from "@/components/modules/customer/notification-preview-sheet";

const NIGERIAN_STATES = [
    "Abia", "Abuja", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno", 
    "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "Gombe", 
    "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", 
    "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", 
    "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara"
];

export function CustomerHeader() {
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const pathname = usePathname();
    const router = useRouter();
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const { state: detectedState, loading, error } = useUserLocation();
    const { user, isAuthenticated, logout: logoutStore } = useAuthStore();
    const [unreadCount, setUnreadCount] = useState(0);
    const [selectedState, setSelectedState] = useState("");
    const [notifSheetOpen, setNotifSheetOpen] = useState(false);

    useEffect(() => {
        if (!loading) {
            setSelectedState(detectedState || "Undetected");
        }
    }, [detectedState, loading]);

    const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newState = e.target.value;
        if (!newState || newState === "Undetected") return;

        setSelectedState(newState);

        // Update localStorage cache for API client
        try {
            const cached = localStorage.getItem('user_location_cache');
            let parsed = cached ? JSON.parse(cached) : { timestamp: Date.now() };
            
            parsed.state = newState;
            parsed.city = newState; // Default city to state for simplicity in manual override
            parsed.timestamp = Date.now();
            parsed.isManual = true;
            
            localStorage.setItem('user_location_cache', JSON.stringify(parsed));
            
            toaster.create({
                title: "Location Updated",
                description: `Location set to ${newState} State`,
                type: "success"
            });
            
            // Dispatch custom event to trigger refetch in components without full reload
            window.dispatchEvent(new CustomEvent('location:changed', { detail: { state: newState } }));
        } catch (err) {
            console.error("Failed to update location cache", err);
        }
    };

    // Fetch unread notifications count
    const fetchUnreadCount = async () => {
        try {
            const data = await notificationService.getNotifications({ limit: 1 });
            setUnreadCount(data.unreadCount);
        } catch (error) {
            console.error("Failed to fetch unread count", error);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchUnreadCount();

            // Optional: poll every 5 minutes
            const interval = setInterval(fetchUnreadCount, 1 * 60 * 1000);

            // Listen for manual refresh events
            const handleRefresh = () => fetchUnreadCount();
            window.addEventListener('notifications:refresh', handleRefresh);

            return () => {
                clearInterval(interval);
                window.removeEventListener('notifications:refresh', handleRefresh);
            };
        }
    }, [isAuthenticated]);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setProfileDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const isActive = (path: string) => {
        if (path === "/" && pathname !== "/") return false;
        return pathname.startsWith(path);
    };

    const navLinks = [
        { href: "/", label: "Home", icon: Home },
        { href: "/my-bookings", label: "My Bookings", icon: Calendar },
        { href: "/discover", label: "Discover", icon: Compass },
        { href: "/businesses", label: "Businesses", icon: Building2 },
    ];

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            await authService.logout();
            logoutStore();
            toaster.create({ title: "Logged out successfully", type: "success" });
            // router.push("/");
        } catch {
            logoutStore();
            // router.push("/");
        } finally {
            setIsLoggingOut(false);
        }
        setProfileDropdownOpen(false);
    };

    const userInitials = user
        ? `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase() || "U"
        : "U";

    return (
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
            {/* Mobile: slim bar — logo + location pill + notification bell */}
            <div className="md:hidden h-14 px-4 flex items-center justify-between">
                <Link href="/" className="flex items-center">
                    <Image src="/Logo.svg" alt="iBookam Logo" width={100} height={40} />
                </Link>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <div className="inline-flex items-center gap-1.5 bg-gray-100 rounded-full px-3 h-9 text-xs font-medium text-gray-700 pointer-events-none">
                            <MapPin className="w-3.5 h-3.5 text-[#E89D24] shrink-0" />
                            {loading ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                                <span className="max-w-[90px] truncate">
                                    {selectedState === "Undetected" ? "Set location" : selectedState}
                                </span>
                            )}
                        </div>
                        {!loading && (
                            <select
                                value={selectedState}
                                onChange={handleStateChange}
                                aria-label="Select location"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            >
                                <option value="Undetected" disabled>Undetected</option>
                                {NIGERIAN_STATES.map(s => (
                                    <option key={s} value={s}>{s} State</option>
                                ))}
                            </select>
                        )}
                    </div>
                    {isAuthenticated && user && (
                        <button
                            onClick={() => setNotifSheetOpen(true)}
                            className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100"
                        >
                            <Bell className="w-5 h-5 text-gray-700" />
                            {unreadCount > 0 && (
                                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 border-2 border-white rounded-full" />
                            )}
                        </button>
                    )}
                </div>
            </div>
            {/* Mobile-only: this sheet replaced nothing on desktop (it's opened
                from the `md:hidden` bell), but gate it anyway so no Sheet can
                ever surface at >=768px. */}
            <div className="md:hidden">
                <NotificationPreviewSheet open={notifSheetOpen} onClose={() => setNotifSheetOpen(false)} />
            </div>

            {/* Desktop: full header, unchanged */}
            <div className="hidden md:block max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex gap-5">
                        {/* Logo and Brand */}
                        <Link href="/" className="flex items-center space-x-2">
                            <Image src="/Logo.svg" alt="iBookam Logo" width={120} height={100} />
                        </Link>

                        {/* City Selector / Location — visible at all widths now that mobile nav lives in the bottom bar */}
                        <div className="flex items-center space-x-2 bg-gray-50 px-2 sm:px-3 py-1 rounded-lg border border-gray-100 min-w-[110px] sm:min-w-[160px]">
                            <MapPin className="w-4 h-4 text-[#E89D24] shrink-0" />
                            {loading ? (
                                <span className="text-sm text-gray-500 flex items-center gap-2">
                                    <Loader2 className="w-3 h-3 animate-spin" /> <span className="hidden sm:inline">Detecting...</span>
                                </span>
                            ) : (
                                <div className="relative flex items-center w-full min-w-0">
                                    <select
                                        value={selectedState}
                                        onChange={handleStateChange}
                                        className="bg-transparent text-sm font-medium text-gray-700 outline-none cursor-pointer w-full appearance-none pr-5 truncate"
                                    >
                                        <option value="Undetected" disabled>Undetected</option>
                                        {NIGERIAN_STATES.map(s => (
                                            <option key={s} value={s}>{s} State</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-0 pointer-events-none" />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-5">
                        {/* Desktop: Navigation */}
                        <nav className="hidden md:flex items-center space-x-6">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`flex items-center space-x-1 transition font-medium ${isActive(link.href)
                                        ? "text-[#E89D24]"
                                        : "text-gray-700 hover:text-[#E89D24]"
                                        }`}
                                >
                                    <link.icon className="w-4 h-4" />
                                    <span className="text-sm">{link.label}</span>
                                </Link>
                            ))}
                        </nav>

                        {/* Desktop: Auth Area */}
                        <div className="hidden md:flex items-center space-x-4">
                            {isAuthenticated && user ? (
                                <div className="relative" ref={dropdownRef}>
                                    <button
                                        onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                                        className="flex items-center space-x-2 hover:opacity-80 transition relative"
                                    >
                                        <div className="relative">
                                            <User className="w-5 h-5 text-gray-600" />
                                            {unreadCount > 0 && (
                                                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full" />
                                            )}
                                        </div>
                                        <span className="text-sm font-medium text-gray-700">Profile</span>
                                    </button>

                                    {/* Profile Dropdown */}
                                    {profileDropdownOpen && (
                                        <div className="absolute right-0 mt-3 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                                            {user?.role === 'business' && (
                                                <Link
                                                    href="/dashboard"
                                                    onClick={() => setProfileDropdownOpen(false)}
                                                    className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                                >
                                                    <LayoutDashboard className="w-4 h-4 text-gray-500" />
                                                    Dashboard
                                                </Link>
                                            )}
                                            <Link
                                                href="/settings"
                                                onClick={() => setProfileDropdownOpen(false)}
                                                className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                            >
                                                <Settings className="w-4 h-4 text-gray-500" />
                                                Settings
                                            </Link>
                                            <Link
                                                href="/saved"
                                                onClick={() => setProfileDropdownOpen(false)}
                                                className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                            >
                                                <Bookmark className="w-4 h-4 text-gray-500" />
                                                Saved
                                            </Link>
                                            <Link
                                                href="/history"
                                                onClick={() => setProfileDropdownOpen(false)}
                                                className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                            >
                                                <History className="w-4 h-4 text-gray-500" />
                                                History
                                            </Link>
                                            <Link
                                                href="/notifications"
                                                onClick={() => setProfileDropdownOpen(false)}
                                                className="flex items-center justify-between px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Bell className="w-4 h-4 text-gray-500" />
                                                    Notifications
                                                </div>
                                                {unreadCount > 0 && (
                                                    <span className="bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[20px] text-center">
                                                        {unreadCount > 9 ? "9+" : unreadCount}
                                                    </span>
                                                )}
                                            </Link>
                                            <div className="border-t border-gray-100 my-1" />
                                            <button
                                                onClick={handleLogout}
                                                disabled={isLoggingOut}
                                                className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors w-full text-left disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {isLoggingOut ? <Loader2 className="w-4 h-4 text-gray-500 animate-spin" /> : <LogOut className="w-4 h-4 text-gray-500" />}
                                                {isLoggingOut ? "Logging out..." : "Logout"}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <Link href="/auth/login">
                                    <Button variant="outline" className="flex items-center space-x-1 border-none text-gray-700 hover:text-[#E89D24] shadow-none">
                                        <User className="w-4 h-4" />
                                        <span className="font-medium">Sign in</span>
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
