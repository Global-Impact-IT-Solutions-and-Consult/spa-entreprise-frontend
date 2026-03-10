"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { MapPin, User, Home, Calendar, Compass, Building2, Menu, X, Settings, Bell, LogOut, Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { authService } from "@/services/auth.service";
import { toaster } from "@/components/ui/toaster";

export function CustomerHeader() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const pathname = usePathname();
    const router = useRouter();
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const { user, isAuthenticated, logout: logoutStore } = useAuthStore();

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
        setMobileMenuOpen(false);
    };

    const userInitials = user
        ? `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase() || "U"
        : "U";

    return (
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex gap-5">
                        {/* Logo and Brand */}
                        <Link href="/" className="flex items-center space-x-2">
                            <div className="bg-[#E89D24] px-2 py-1 rounded">
                                <span className="text-white font-bold text-sm">WP</span>
                            </div>
                            <div className="hidden sm:block">
                                <h1 className="font-bold text-lg text-gray-900">WellnessPro</h1>
                            </div>
                        </Link>

                        {/* Desktop: City Selector */}
                        <div className="hidden md:flex items-center space-x-2">
                            <select className="px-2 py-2 text-sm">
                                <option>Lagos</option>
                                <option>Abuja</option>
                                <option>Port Harcourt</option>
                                <option>Ibadan</option>
                            </select>
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
                                        className="flex items-center space-x-2 hover:opacity-80 transition"
                                    >
                                        <User className="w-5 h-5 text-gray-600" />
                                        <span className="text-sm font-medium text-gray-700">Profile</span>
                                    </button>

                                    {/* Profile Dropdown */}
                                    {profileDropdownOpen && (
                                        <div className="absolute right-0 mt-3 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                                            <Link
                                                href="/settings"
                                                onClick={() => setProfileDropdownOpen(false)}
                                                className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                            >
                                                <Settings className="w-4 h-4 text-gray-500" />
                                                Settings
                                            </Link>
                                            <Link
                                                href="/notifications"
                                                onClick={() => setProfileDropdownOpen(false)}
                                                className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                            >
                                                <Bell className="w-4 h-4 text-gray-500" />
                                                Notifications
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

                    {/* Mobile: Hamburger Menu Button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden p-2 rounded-md hover:bg-gray-100"
                    >
                        {mobileMenuOpen ? (
                            <X className="w-6 h-6 text-gray-700" />
                        ) : (
                            <Menu className="w-6 h-6 text-gray-700" />
                        )}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            {/* Mobile Menu Drawer - Slides from Left */}
            <div
                className={`fixed top-0 left-0 h-full w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out md:hidden ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                {/* Drawer Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <div className="flex items-center space-x-2">
                        <div className="bg-[#E89D24] px-2 py-1 rounded">
                            <span className="text-white font-bold text-sm">WP</span>
                        </div>
                        <h3 className="font-bold text-lg">WellnessPro</h3>
                    </div>
                    <button
                        onClick={() => setMobileMenuOpen(false)}
                        className="p-2 rounded-md hover:bg-gray-100"
                    >
                        <X className="w-6 h-6 text-gray-700" />
                    </button>
                </div>

                {/* City Selector in Drawer */}
                <div className="p-4 border-b border-gray-200">
                    <label className="block text-xs font-medium text-gray-600 mb-2">Select City</label>
                    <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E89D24]">
                        <option>Lagos</option>
                        <option>Abuja</option>
                        <option>Port Harcourt</option>
                        <option>Ibadan</option>
                    </select>
                </div>

                {/* Navigation Links */}
                <nav className="flex flex-col p-4 space-y-1">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`flex items-center space-x-3 rounded-lg px-3 py-3 transition font-medium ${isActive(link.href)
                                ? "text-[#E89D24] bg-gray-50"
                                : "text-gray-700 hover:text-[#E89D24] hover:bg-gray-50"
                                }`}
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            <link.icon className="w-5 h-5" />
                            <span>{link.label}</span>
                        </Link>
                    ))}

                    {/* Settings & Notification links for logged-in mobile users */}
                    {isAuthenticated && user && (
                        <>
                            <div className="border-t border-gray-100 my-2" />
                            <Link
                                href="/settings"
                                className="flex items-center space-x-3 rounded-lg px-3 py-3 transition font-medium text-gray-700 hover:text-[#E89D24] hover:bg-gray-50"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <Settings className="w-5 h-5" />
                                <span>Settings</span>
                            </Link>
                            <Link
                                href="/notifications"
                                className="flex items-center space-x-3 rounded-lg px-3 py-3 transition font-medium text-gray-700 hover:text-[#E89D24] hover:bg-gray-50"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <Bell className="w-5 h-5" />
                                <span>Notifications</span>
                            </Link>
                        </>
                    )}
                </nav>

                {/* Bottom Action */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
                    {isAuthenticated && user ? (
                        <Button
                            onClick={handleLogout}
                            disabled={isLoggingOut}
                            variant="outline"
                            className="w-full flex items-center justify-center space-x-2 py-3 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoggingOut ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
                            <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
                        </Button>
                    ) : (
                        <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                            <Button className="w-full bg-[#E89D24] hover:bg-[#E5A800] text-white flex items-center justify-center space-x-2 py-3">
                                <User className="w-4 h-4" />
                                <span>Sign in</span>
                            </Button>
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
}
