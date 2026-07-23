import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { CustomerFooter } from "@/components/modules/customer/customer-footer";
import { CustomerHeader } from "@/components/modules/customer/customer-header";
import { CustomerBottomNav } from "@/components/modules/customer/customer-bottom-nav";
import { PublicPageConfig } from "@/lib/public-pages";

type PublicInfoPageProps = {
    page: PublicPageConfig;
};

export function PublicInfoPage({ page }: PublicInfoPageProps) {
    return (
        <div className="min-h-screen bg-[#F9FAFB] text-gray-900">
            <CustomerHeader />
            <main>
                <section className="border-b border-gray-200 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20">
                        <p className="text-sm font-semibold uppercase tracking-wide text-[#E89D24]">{page.eyebrow}</p>
                        <div className="mt-4 max-w-4xl">
                            <h1 className="font-playfair text-3xl md:text-5xl font-bold leading-tight text-gray-950">
                                {page.title}
                            </h1>
                            <p className="mt-5 text-base md:text-lg leading-8 text-gray-600">
                                {page.description}
                            </p>
                        </div>

                        {(page.primaryAction || page.secondaryAction) && (
                            <div className="mt-8 flex flex-col sm:flex-row gap-3">
                                {page.primaryAction && (
                                    <Link
                                        href={page.primaryAction.href}
                                        className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-[#E89D24] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#d88c18]"
                                    >
                                        {page.primaryAction.label}
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                )}
                                {page.secondaryAction && (
                                    <Link
                                        href={page.secondaryAction.href}
                                        className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-gray-200 bg-white px-5 text-sm font-semibold text-gray-800 shadow-sm transition hover:border-[#E89D24] hover:text-[#E89D24]"
                                    >
                                        {page.secondaryAction.label}
                                    </Link>
                                )}
                            </div>
                        )}

                        {page.highlights && page.highlights.length > 0 && (
                            <div className="mt-10 grid gap-3 sm:grid-cols-3">
                                {page.highlights.map((highlight) => (
                                    <div key={highlight} className="flex items-center gap-2 rounded-md border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-700">
                                        <CheckCircle2 className="h-4 w-4 text-[#E89D24]" />
                                        {highlight}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>

                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
                    <div className="grid gap-5 md:grid-cols-2">
                        {page.sections.map((section) => (
                            <article key={section.title} className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                                <h2 className="text-xl font-bold text-gray-950">{section.title}</h2>
                                <p className="mt-3 text-sm leading-7 text-gray-600">{section.body}</p>
                                {section.items && section.items.length > 0 && (
                                    <ul className="mt-5 space-y-3">
                                        {section.items.map((item) => (
                                            <li key={item} className="flex gap-3 text-sm leading-6 text-gray-700">
                                                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#E89D24]" />
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </article>
                        ))}
                    </div>
                </section>
            </main>
            <CustomerFooter />
            <CustomerBottomNav />
        </div>
    );
}
