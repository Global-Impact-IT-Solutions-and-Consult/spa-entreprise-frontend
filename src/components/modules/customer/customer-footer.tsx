"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Facebook, Twitter, Instagram, Loader2 } from "lucide-react";
import { miscService } from "@/services/misc.service";
import { toaster } from "@/components/ui/toaster";

export function CustomerFooter() {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubscribe = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email) {
            toaster.create({ title: "Email required", description: "Please enter your email address to subscribe.", type: "error" });
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            toaster.create({ title: "Invalid email", description: "Please enter a valid email address.", type: "error" });
            return;
        }

        setIsLoading(true);
        try {
            await miscService.subscribeNewsletter(email);
            toaster.create({ title: "Subscribed Successfully!", description: "Thank you for subscribing to our newsletter.", type: "success" });
            setEmail("");
        } catch (error: Error | unknown) {
            console.error("Newsletter error:", error);
            const err = error as any;
            toaster.create({
                title: "Subscription Failed",
                description: err?.response?.data?.message || "Something went wrong. Please try again.",
                type: "error"
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <footer className="bg-[#2C3E50] text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 md:pt-12 pb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Brand Column */}
                    <div>
                        <div className="flex items-center space-x-2 mb-4">
                            <div className="bg-[#E89D24] px-2 py-1 rounded">
                                <span className="text-white font-bold text-sm">WP</span>
                            </div>
                            <h3 className="font-bold text-lg">WellnessPro</h3>
                        </div>
                        <p className="text-gray-300 text-sm mb-4">
                            Nigeria&apos;s leading wellness and beauty services marketplace.
                        </p>
                        <div className="flex items-center space-x-4">
                            <Link href="https://facebook.com" className="hover:text-[#E89D24] transition">
                                <Facebook className="w-5 h-5" />
                            </Link>
                            <Link href="https://twitter.com" className="hover:text-[#E89D24] transition">
                                <Twitter className="w-5 h-5" />
                            </Link>
                            <Link href="https://instagram.com" className="hover:text-[#E89D24] transition">
                                <Instagram className="w-5 h-5" />
                            </Link>
                        </div>
                    </div>

                    {/* Support Column */}
                    <div>
                        <h4 className="font-bold text-base md:text-lg mb-4">Support</h4>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/help" className="text-gray-300 hover:text-[#E89D24] text-sm transition">
                                    Help Center
                                </Link>
                            </li>
                            <li>
                                <Link href="/safety" className="text-gray-300 hover:text-[#E89D24] text-sm transition">
                                    Safety Guidelines
                                </Link>
                            </li>
                            <li>
                                <Link href="/contact" className="text-gray-300 hover:text-[#E89D24] text-sm transition">
                                    Contact Us
                                </Link>
                            </li>
                            <li>
                                <Link href="/faq" className="text-gray-300 hover:text-[#E89D24] text-sm transition">
                                    FAQ
                                </Link>
                            </li>
                            <li>
                                <Link href="/privacy" className="text-gray-300 hover:text-[#E89D24] text-sm transition">
                                    Privacy Policy
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Quick Links Column */}
                    <div>
                        <h4 className="font-bold text-base md:text-lg mb-4">Quick Links</h4>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/" className="text-gray-300 hover:text-[#E89D24] text-sm transition">
                                    Home
                                </Link>
                            </li>
                            <li>
                                <Link href="/how-it-works" className="text-gray-300 hover:text-[#E89D24] text-sm transition">
                                    How it Works
                                </Link>
                            </li>
                            <li>
                                <Link href="/services" className="text-gray-300 hover:text-[#E89D24] text-sm transition">
                                    Browse Services
                                </Link>
                            </li>
                            <li>
                                <Link href="/for-businesses" className="text-gray-300 hover:text-[#E89D24] text-sm transition">
                                    For Businesses
                                </Link>
                            </li>
                            <li>
                                <Link href="/blog" className="text-gray-300 hover:text-[#E89D24] text-sm transition">
                                    Blog
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Newsletter Column */}
                    <div>
                        <h4 className="font-bold text-base md:text-lg mb-4">Stay Updated</h4>
                        <p className="text-gray-300 text-sm mb-4">
                            Subscribe to our newsletter for updates and offers.
                        </p>
                        <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2">
                            <input
                                type="email"
                                placeholder="Your Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={isLoading}
                                className="flex-1 px-4 py-2 rounded-md text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#E89D24] disabled:opacity-50 disabled:bg-gray-100"
                            />
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="bg-[#E89D24] hover:bg-[#E5A800] text-white whitespace-nowrap px-6 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center min-w-[120px]"
                            >
                                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Subscribe"}
                            </Button>
                        </form>
                    </div>
                </div>

                {/* Copyright */}
                <div className="border-t border-gray-700 mt-8 pt-4 text-center">
                    <p className="text-gray-400 text-sm">@copyright 2026</p>
                </div>
            </div>
        </footer>
    );
}
