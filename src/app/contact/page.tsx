import { Mail, MapPin } from "lucide-react";
import { CustomerFooter } from "@/components/modules/customer/customer-footer";
import { CustomerHeader } from "@/components/modules/customer/customer-header";
import { CustomerBottomNav } from "@/components/modules/customer/customer-bottom-nav";
import { ContactUsForm } from "@/components/modules/customer/contact-us-form";

export default function ContactPage() {
    return (
        <div className="min-h-screen bg-[#F9FAFB] text-gray-900">
            <CustomerHeader />
            <main>
                <section className="border-b border-gray-200 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20">
                        <p className="text-sm font-semibold uppercase tracking-wide text-[#E89D24]">Contact Us</p>
                        <div className="mt-4 max-w-4xl">
                            <h1 className="font-playfair text-3xl md:text-5xl font-bold leading-tight text-gray-950">
                                Talk to the iBookam support team
                            </h1>
                            <p className="mt-5 text-base md:text-lg leading-8 text-gray-600">
                                Send booking questions, business onboarding issues, payment concerns, safety reports, or general support requests.
                            </p>
                        </div>
                    </div>
                </section>

                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
                    <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
                        <div className="space-y-4">
                            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                                <div className="flex items-start gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#FFF4E2] text-[#E89D24]">
                                        <Mail className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h2 className="font-bold text-gray-950">Email support</h2>
                                        <p className="mt-2 text-sm leading-6 text-gray-600">
                                            Use the form and we will route your message to the support queue. You can also email us directly.
                                        </p>
                                        <a href="mailto:support@ibookam.com" className="mt-3 inline-flex text-sm font-semibold text-[#E89D24] hover:text-[#d88c18]">
                                            support@ibookam.com
                                        </a>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                                <div className="flex items-start gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#FFF4E2] text-[#E89D24]">
                                        <MapPin className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h2 className="font-bold text-gray-950">What to include</h2>
                                        <p className="mt-2 text-sm leading-6 text-gray-600">
                                            For booking issues, include the booking reference, service name, business name, and the email used on your account.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <ContactUsForm />
                    </div>
                </section>
            </main>
            <CustomerFooter />
            <CustomerBottomNav />
        </div>
    );
}
