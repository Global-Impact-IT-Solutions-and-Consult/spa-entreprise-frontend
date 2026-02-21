"use client";

import { useState } from "react";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toaster } from "@/components/ui/toaster";
import { useAuthStore } from "@/store/auth.store";
import { supportService } from "@/services/support.service";

export default function ContactSupportPage() {
    const { user } = useAuthStore();

    const [name, setName] = useState(`${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim());
    const [email, setEmail] = useState(user?.email ?? "");
    const [message, setMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name || !email || !message) {
            toaster.create({
                title: "Validation Error",
                description: "Please fill in all fields.",
                type: "error",
            });
            return;
        }

        setIsSubmitting(true);
        try {
            await supportService.submitMessage({ name, email, message });
            toaster.create({
                title: "Message Sent",
                description: "We've received your message and will get back to you within 24 hours.",
                type: "success",
            });
            setMessage("");
        } catch (error: any) {
            toaster.create({
                title: "Failed to Send",
                description: error?.response?.data?.message || "Something went wrong. Please try again.",
                type: "error",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex items-start justify-center min-h-full">
            <div className="w-full max-w-lg">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10">
                    {/* Icon + Header */}
                    <div className="flex flex-col items-center text-center mb-8">
                        <div className="p-3 bg-blue-50 rounded-xl mb-4">
                            <Mail className="h-7 w-7 text-blue-500" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">Contact Support</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Your account is currently pending verification.<br />
                            Have questions? We're here to help.
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-gray-500">Your name</Label>
                            <Input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="John Doe"
                                className="h-12 rounded-lg border-gray-200 bg-white focus-visible:ring-[#F59E0B]"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-gray-500">Email address</Label>
                            <Input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="user@example.com"
                                className="h-12 rounded-lg border-gray-200 bg-white focus-visible:ring-[#F59E0B]"
                            />
                            <p className="text-[11px] text-gray-400">We'll reply to this address</p>
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-gray-500">Message</Label>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="How can we help you"
                                rows={5}
                                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-300 focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B] transition-all outline-none resize-none"
                            />
                        </div>

                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full h-12 bg-[#F59E0B] hover:bg-[#D97706] text-white font-bold rounded-lg text-sm"
                        >
                            {isSubmitting ? "Sending..." : "Send Message"}
                        </Button>
                    </form>

                    {/* Direct email footer */}
                    <div className="mt-6 text-center space-y-1">
                        <p className="text-xs text-gray-400">Prefer direct email?</p>
                        <a
                            href="mailto:support@gloimpact.com"
                            className="inline-flex items-center gap-1.5 text-sm text-[#F59E0B] hover:text-[#D97706] font-medium transition-colors"
                        >
                            <Mail className="h-3.5 w-3.5" />
                            support@gloimpact.com
                        </a>
                        <p className="text-[11px] text-gray-400">Response time: within 24 hours, Mon-Fri</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
