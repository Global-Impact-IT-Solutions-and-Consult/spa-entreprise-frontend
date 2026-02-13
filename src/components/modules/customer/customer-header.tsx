"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { MapPin, User, Home, Calendar, Compass, Building2, Menu, X } from "lucide-react";

export function CustomerHeader() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const pathname = usePathname();

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

    return (
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo and Brand */}
                    <Link href="/" className="flex items-center space-x-2">
                        <div className="bg-[#F5B800] px-2 py-1 rounded">
                            <span className="text-white font-bold text-sm">WP</span>
                        </div>
                        <div className="hidden sm:block">
                            <h1 className="font-bold text-lg text-gray-900">WellnessPro</h1>
                        </div>
                    </Link>

                    {/* Desktop: City Selector */}
                    <div className="hidden md:flex items-center space-x-2">
                        <select className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F5B800]">
                            <option>Lagos</option>
                            <option>Abuja</option>
                            <option>Port Harcourt</option>
                            <option>Ibadan</option>
                        </select>
                    </div>

                    {/* Desktop: Navigation */}
                    <nav className="hidden md:flex items-center space-x-6">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`flex items-center space-x-1 transition font-medium ${isActive(link.href)
                                        ? "text-[#F5B800]"
                                        : "text-gray-700 hover:text-[#F5B800]"
                                    }`}
                            >
                                <link.icon className="w-4 h-4" />
                                <span className="text-sm">{link.label}</span>
                            </Link>
                        ))}
                    </nav>

                    {/* Desktop: Sign In Button */}
                    <div className="hidden md:flex items-center space-x-4">
                        <Link href="/auth/login">
                            <Button variant="outline" className="flex items-center space-x-2 border-gray-300 hover:border-[#F5B800] hover:text-[#F5B800]">
                                <User className="w-4 h-4" />
                                <span>Sign in</span>
                            </Button>
                        </Link>
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
                        <div className="bg-[#F5B800] px-2 py-1 rounded">
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
                    <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F5B800]">
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
                                    ? "text-[#F5B800] bg-gray-50"
                                    : "text-gray-700 hover:text-[#F5B800] hover:bg-gray-50"
                                }`}
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            <link.icon className="w-5 h-5" />
                            <span>{link.label}</span>
                        </Link>
                    ))}
                </nav>

                {/* Sign In Button at Bottom */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
                    <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                        <Button className="w-full bg-[#F5B800] hover:bg-[#E5A800] text-white flex items-center justify-center space-x-2 py-3">
                            <User className="w-4 h-4" />
                            <span>Sign in</span>
                        </Button>
                    </Link>
                </div>
            </div>
        </header>
    );
}
