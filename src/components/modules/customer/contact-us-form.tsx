"use client";

import { useState } from "react";
import { Loader2, Mail, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toaster } from "@/components/ui/toaster";
import { normalizeApiMessage } from "@/lib/api";
import { supportService } from "@/services/support.service";

export function ContactUsForm() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!name.trim() || !email.trim() || !message.trim()) {
            toaster.create({
                title: "Missing information",
                description: "Please fill in your name, email, and message.",
                type: "error",
            });
            return;
        }

        setIsSubmitting(true);
        try {
            await supportService.submitMessage({
                name: name.trim(),
                email: email.trim(),
                message: message.trim(),
            });

            toaster.create({
                title: "Message sent",
                description: "We have received your message and will get back to you shortly.",
                type: "success",
            });
            setName("");
            setEmail("");
            setMessage("");
        } catch (error) {
            toaster.create({
                title: "Could not send message",
                description: normalizeApiMessage((error as { response?: { data?: unknown } })?.response?.data),
                type: "error",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-md bg-[#FFF4E2] text-[#E89D24]">
                    <Mail className="h-5 w-5" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-950">Send us a message</h2>
                    <p className="text-sm text-gray-500">Support replies are sent to your email.</p>
                </div>
            </div>

            <div className="space-y-5">
                <div className="space-y-2">
                    <Label htmlFor="contact-name">Name</Label>
                    <Input
                        id="contact-name"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        placeholder="Your name"
                        className="h-11 rounded-md border-gray-200 bg-white"
                        disabled={isSubmitting}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="contact-email">Email</Label>
                    <Input
                        id="contact-email"
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="you@example.com"
                        className="h-11 rounded-md border-gray-200 bg-white"
                        disabled={isSubmitting}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="contact-message">Message</Label>
                    <Textarea
                        id="contact-message"
                        value={message}
                        onChange={(event) => setMessage(event.target.value)}
                        placeholder="How can we help?"
                        rows={6}
                        className="resize-none rounded-md border-gray-200 bg-white"
                        disabled={isSubmitting}
                    />
                </div>

                <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="h-11 w-full rounded-md bg-[#E89D24] text-white hover:bg-[#d88c18]"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Sending
                        </>
                    ) : (
                        <>
                            <Send className="h-4 w-4" />
                            Send message
                        </>
                    )}
                </Button>
            </div>
        </form>
    );
}
