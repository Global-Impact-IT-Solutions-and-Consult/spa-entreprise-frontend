export type PublicPageAction = {
    label: string;
    href: string;
};

export type PublicPageSection = {
    title: string;
    body: string;
    items?: string[];
};

export type PublicPageConfig = {
    eyebrow: string;
    title: string;
    description: string;
    primaryAction?: PublicPageAction;
    secondaryAction?: PublicPageAction;
    highlights?: string[];
    sections: PublicPageSection[];
};

export const helpPage: PublicPageConfig = {
    eyebrow: "Help Center",
    title: "Get help with bookings, accounts, and business setup",
    description:
        "Find quick answers for using iBookam as a customer or a wellness business. If you still need help, send us a message and the support team will follow up.",
    primaryAction: { label: "Contact support", href: "/contact" },
    secondaryAction: { label: "Browse services", href: "/discover" },
    highlights: ["Bookings and payments", "Account access", "Business onboarding"],
    sections: [
        {
            title: "Booking help",
            body: "Customers can search by location, service, date, price, rating, and availability, then complete bookings from the service page.",
            items: [
                "Use My Bookings to view upcoming and previous appointments.",
                "Reschedule from the booking details page when the business allows changes.",
                "Use the cancellation flow if you can no longer attend an appointment.",
            ],
        },
        {
            title: "Account and verification",
            body: "Email verification protects user accounts and keeps booking notifications reliable.",
            items: [
                "New users should verify their email with the OTP sent during signup.",
                "If a code expires, request a new code from the verification page.",
                "Keep your profile details current so businesses can contact you when needed.",
            ],
        },
        {
            title: "Business support",
            body: "Businesses can manage services, staff, hours, gallery images, bookings, payouts, and customer support from the dashboard after approval.",
            items: [
                "Complete onboarding with business information, services, staff, and working hours.",
                "Use clear service images and accurate prices for on-site and home services.",
                "Contact support if your approval status or dashboard access looks incorrect.",
            ],
        },
    ],
};

export const safetyPage: PublicPageConfig = {
    eyebrow: "Safety Guidelines",
    title: "Book and provide wellness services with confidence",
    description:
        "iBookam helps customers and businesses coordinate appointments, but safe service experiences also depend on clear communication, accurate listings, and responsible conduct.",
    primaryAction: { label: "Report a concern", href: "/contact" },
    secondaryAction: { label: "View FAQ", href: "/faq" },
    highlights: ["Verified communication", "Transparent service details", "Issue reporting"],
    sections: [
        {
            title: "For customers",
            body: "Review the business profile, service details, pricing, staff, and location before booking.",
            items: [
                "Book through iBookam so your appointment history is recorded.",
                "For home services, confirm the address, arrival window, and any access instructions before the appointment.",
                "If anything feels wrong, pause the booking and contact support.",
            ],
        },
        {
            title: "For businesses",
            body: "Keep service descriptions, delivery options, working hours, prices, and staff profiles accurate.",
            items: [
                "Only accept appointments your team can safely and professionally complete.",
                "Use the booking dashboard to manage reschedules, cancellations, and customer updates.",
                "Report abusive, fraudulent, or unsafe behavior to support.",
            ],
        },
        {
            title: "Payments and records",
            body: "Use platform-supported payment and booking flows where available so disputes and support requests can be handled with proper context.",
        },
    ],
};

export const faqPage: PublicPageConfig = {
    eyebrow: "FAQ",
    title: "Common questions about iBookam",
    description:
        "Short answers to the questions customers and wellness businesses ask most often.",
    primaryAction: { label: "Ask a question", href: "/contact" },
    secondaryAction: { label: "Start searching", href: "/discover" },
    sections: [
        {
            title: "What can I book on iBookam?",
            body: "You can discover and book wellness, beauty, grooming, spa, salon, barbershop, nail, and related services from listed businesses.",
        },
        {
            title: "Can a service be home service and in-store?",
            body: "Yes. Delivery method belongs to each service, so one business may offer some services in-store and others at home.",
        },
        {
            title: "Why do I need to verify my email?",
            body: "Verification confirms that booking updates, OTPs, receipts, and account notices reach the right person.",
        },
        {
            title: "How do businesses join?",
            body: "A business owner creates an account, completes onboarding, adds business details, services, staff, hours, and waits for admin approval.",
        },
        {
            title: "How do I contact support?",
            body: "Use the Contact Us page. The message is sent to the support team and saved so the team can track replies.",
        },
    ],
};

export const privacyPage: PublicPageConfig = {
    eyebrow: "Privacy Policy",
    title: "How iBookam handles personal and business information",
    description:
        "This page summarizes the information iBookam uses to run bookings, accounts, payments, support, safety, and business operations.",
    primaryAction: { label: "Contact privacy support", href: "/contact" },
    sections: [
        {
            title: "Information we collect",
            body: "We collect account details, contact information, booking information, service and business profile data, support messages, device/session details, and payment-related references needed to provide the platform.",
        },
        {
            title: "How we use information",
            body: "We use information to create accounts, verify users, show relevant businesses and services, manage bookings, process payments, send notifications, prevent abuse, support customers, and improve the platform.",
        },
        {
            title: "Sharing and access",
            body: "We share booking details with the customer and business involved in the appointment. Admins may access operational records where needed for support, safety, fraud prevention, and compliance.",
        },
        {
            title: "Retention and deletion",
            body: "We retain records needed for account, booking, support, audit, legal, and operational purposes. Deleted accounts may be soft deleted first before permanent cleanup where the system requires a waiting period.",
        },
        {
            title: "Your choices",
            body: "You can update your profile, manage notifications where available, and contact support for account or privacy requests.",
        },
    ],
};

export const termsPage: PublicPageConfig = {
    eyebrow: "Terms of Service",
    title: "The rules for using iBookam",
    description:
        "These terms explain the basic responsibilities for customers, businesses, and administrators using the iBookam platform.",
    primaryAction: { label: "Create an account", href: "/auth/register" },
    secondaryAction: { label: "Contact support", href: "/contact" },
    sections: [
        {
            title: "Platform role",
            body: "iBookam helps customers discover and book services from independent wellness and beauty businesses. Businesses are responsible for the accuracy, quality, pricing, and delivery of their services.",
        },
        {
            title: "Customer responsibilities",
            body: "Customers should provide accurate booking details, arrive on time, follow cancellation or reschedule rules, and treat businesses and staff respectfully.",
        },
        {
            title: "Business responsibilities",
            body: "Businesses should maintain accurate profiles, publish correct prices and availability, honor accepted bookings, protect customer information, and comply with applicable laws.",
        },
        {
            title: "Payments, cancellations, and disputes",
            body: "Payment, refund, cancellation, and dispute handling may depend on the booking status, business policies, payment provider rules, and the evidence available to support.",
        },
        {
            title: "Account enforcement",
            body: "iBookam may restrict, suspend, or remove accounts, listings, content, or bookings that appear unsafe, fraudulent, abusive, misleading, or harmful to the platform.",
        },
    ],
};

export const howItWorksPage: PublicPageConfig = {
    eyebrow: "How it Works",
    title: "Search, compare, book, and manage wellness appointments",
    description:
        "iBookam connects customers with wellness and beauty businesses, then keeps appointment details in one place from discovery to follow-up.",
    primaryAction: { label: "Find a service", href: "/discover" },
    secondaryAction: { label: "List your business", href: "/for-businesses" },
    highlights: ["Choose a location", "Pick a service", "Book a time"],
    sections: [
        {
            title: "1. Search with useful filters",
            body: "Start from the homepage or Discover page and filter by state, city, service, date, price, rating, and availability.",
        },
        {
            title: "2. Compare real service details",
            body: "Review service images, prices, delivery options, staff, business profile details, ratings, and availability before booking.",
        },
        {
            title: "3. Book and track appointments",
            body: "Confirm your appointment, receive updates, and manage bookings from My Bookings or History.",
        },
        {
            title: "4. Review the experience",
            body: "After an appointment, customers can leave reviews and tips where available, helping strong businesses stand out.",
        },
    ],
};

export const servicesPage: PublicPageConfig = {
    eyebrow: "Browse Services",
    title: "Explore beauty, grooming, and wellness services near you",
    description:
        "Use iBookam to find services across spas, salons, barbershops, nail studios, beauty professionals, and wellness providers.",
    primaryAction: { label: "Open service discovery", href: "/discover" },
    secondaryAction: { label: "View businesses", href: "/businesses" },
    highlights: ["Spa and wellness", "Hair and grooming", "Nails and beauty"],
    sections: [
        {
            title: "Spa and wellness",
            body: "Find massages, facials, body treatments, relaxation sessions, and other wellness experiences from listed providers.",
        },
        {
            title: "Hair, grooming, and beauty",
            body: "Discover barbershops, hair salons, nail salons, makeup services, lashes, brows, and related beauty services.",
        },
        {
            title: "Home and in-store options",
            body: "Delivery options are shown at service level, so each business can offer different appointment types for different services.",
        },
    ],
};

export const forBusinessesPage: PublicPageConfig = {
    eyebrow: "For Businesses",
    title: "Bring your wellness business online with iBookam",
    description:
        "iBookam gives beauty and wellness businesses a practical dashboard for listings, services, staff, working hours, bookings, gallery images, support, and customer reach.",
    primaryAction: { label: "Register your business", href: "/auth/register" },
    secondaryAction: { label: "Contact sales support", href: "/contact" },
    highlights: ["Service catalog", "Booking management", "Customer discovery"],
    sections: [
        {
            title: "Create a business profile",
            body: "Add your business information, logo, gallery, location, contact details, and approval documents during onboarding.",
        },
        {
            title: "Manage services and staff",
            body: "Publish services with clear prices, duration, delivery options, images, and staff assignments so customers know exactly what they are booking.",
        },
        {
            title: "Control bookings and operations",
            body: "Track appointments, working hours, customer requests, notifications, payout settings, and support messages from the business dashboard.",
        },
    ],
};

export const blogPage: PublicPageConfig = {
    eyebrow: "Blog",
    title: "Guides for better wellness bookings",
    description:
        "Practical notes for customers choosing services and businesses improving their online booking experience.",
    primaryAction: { label: "Browse services", href: "/discover" },
    secondaryAction: { label: "Join as a business", href: "/for-businesses" },
    sections: [
        {
            title: "How to choose the right wellness service",
            body: "Compare service descriptions, prices, photos, delivery options, staff details, and recent reviews before booking.",
        },
        {
            title: "Preparing for a home service appointment",
            body: "Confirm the address, access instructions, timing, and any setup requirements before the staff member arrives.",
        },
        {
            title: "Listing tips for wellness businesses",
            body: "Use clear names, accurate pricing, realistic durations, updated images, and specific descriptions for each service.",
        },
        {
            title: "Why availability matters",
            body: "Customers are more likely to book when your working hours, staff schedules, and service durations are kept up to date.",
        },
    ],
};
