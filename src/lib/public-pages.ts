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
        {
            title: "How are payments and refunds handled?",
            body: "Payments are processed through iBookam's payment provider. Cancellation eligibility, fees, approval, and refund timing depend on the booking status and the applicable cancellation terms shown during the booking flow.",
        },
        {
            title: "Does iBookam use cookies?",
            body: "iBookam uses essential browser storage for sign-in, security, preferences, and core features. Optional analytics is only enabled after you accept it, and you can change that choice from Cookie Settings in the footer.",
        },
        {
            title: "How can I delete my account or request my data?",
            body: "Use the account settings available to you or contact support. Account deletion starts a limited recovery period before permanent cleanup, although some transaction, booking, audit, fraud-prevention, or legal records may need to be retained.",
        },
    ],
};

export const privacyPage: PublicPageConfig = {
    eyebrow: "Privacy Policy",
    title: "How iBookam handles personal and business information",
    description:
        "Effective 23 September 2026. This policy explains how iBookam collects and uses information when customers, businesses, staff, and visitors use our marketplace.",
    primaryAction: { label: "Contact privacy support", href: "/contact" },
    sections: [
        {
            title: "Information we collect",
            body: "We collect information you provide, including your name, email address, phone number, account credentials, profile details, booking details, reviews, support messages, notification choices, and business, staff, service, pricing, availability, gallery, and verification information. For home services, booking information may include the service address and access instructions.",
        },
        {
            title: "Payments, uploads, and technical data",
            body: "Payment providers process payment details; iBookam receives transaction references, amounts, status, refund information, and related records rather than full card details. We also process images and documents you upload, approximate or selected location, IP address, device and browser information, security logs, and site activity needed to operate and protect the service.",
        },
        {
            title: "How and why we use information",
            body: "We use information to provide and secure accounts; verify users and businesses; display and personalise listings; match searches by location and availability; create and manage bookings; process payments, tips, cancellations, and refunds; send service, email, SMS, and push notifications; respond to support requests; prevent fraud and abuse; enforce our terms; meet legal obligations; and improve iBookam. Depending on the activity, we rely on your consent, performance of our agreement, legal obligations, or our legitimate interests in running a safe marketplace.",
        },
        {
            title: "Who receives information",
            body: "We share the information needed to fulfil a booking between the customer, the relevant business, and assigned staff. We also use vetted service providers for payments, hosting, media storage, email, SMS, analytics, and technical operations. Administrators may access records for support, safety, fraud prevention, disputes, and compliance. We may disclose information where legally required or as part of a business transfer, and we do not sell personal information.",
        },
        {
            title: "Cookies and browser storage",
            body: "Essential cookies and local storage support authentication, security, session management, location preferences, offline features, and installation prompts. Google Analytics is optional and is not loaded until you choose Accept analytics. You can reject it on your first visit or reopen Cookie Settings from the footer; rejecting analytics does not prevent the core service from working.",
        },
        {
            title: "Retention and account deletion",
            body: "We keep information only as long as needed for the purposes described here. When you request account deletion, we use a seven-day soft-deletion period before eligible account and business-profile data is permanently removed. We may retain limited booking, payment, refund, support, security, fraud-prevention, audit, or legal records where required, with access restricted to the relevant purpose.",
        },
        {
            title: "Your rights and choices",
            body: "Subject to applicable law, including the Nigeria Data Protection Act 2023, you may ask to access, correct, delete, restrict, or obtain a copy of your personal data, object to certain processing, withdraw consent, or complain to the Nigeria Data Protection Commission. You can update some details and notification choices in the product, change optional analytics through Cookie Settings, or contact us for other privacy requests. Withdrawing consent does not affect earlier lawful processing.",
        },
        {
            title: "Security, children, and international processing",
            body: "We use reasonable technical and organisational safeguards, but no online service can guarantee absolute security. iBookam is not intended for children under 18, and users must be legally able to enter a binding agreement. Some providers may process information outside Nigeria; where this occurs, we use appropriate contractual or legal safeguards.",
        },
        {
            title: "Contact and policy updates",
            body: "For privacy questions or rights requests, use the Contact Us page and select the relevant subject. We may update this policy as the platform, providers, or law changes; material updates will be communicated through the site or other appropriate channels, and the effective date above will be revised.",
        },
    ],
};

export const termsPage: PublicPageConfig = {
    eyebrow: "Terms of Service",
    title: "The rules for using iBookam",
    description:
        "Effective 23 September 2026. These terms govern how customers, business owners, and staff use the iBookam beauty and wellness marketplace.",
    primaryAction: { label: "Create an account", href: "/auth/register" },
    secondaryAction: { label: "Contact support", href: "/contact" },
    sections: [
        {
            title: "Agreement and eligibility",
            body: "By creating an account, listing a business, making a booking, or otherwise using iBookam, you agree to these terms and our Privacy Policy. You must be at least 18 years old and legally able to enter a binding agreement. You are responsible for accurate account information, protecting your credentials, and activity under your account.",
        },
        {
            title: "iBookam's role",
            body: "iBookam is a marketplace that helps customers discover and book services from independent beauty and wellness businesses. Unless expressly stated otherwise, iBookam is not the provider or employer of listed businesses or staff and does not control the manner in which services are performed. Businesses remain responsible for service quality, safety, licensing, pricing, descriptions, availability, and fulfilment.",
        },
        {
            title: "Customer responsibilities",
            body: "Customers should provide accurate booking details, arrive on time, follow cancellation or reschedule rules, and treat businesses and staff respectfully.",
        },
        {
            title: "Business responsibilities",
            body: "Businesses must have authority to operate and list their services; maintain accurate profiles, prices, delivery methods, staff, qualifications, locations, images, and availability; honour accepted bookings; provide services safely and professionally; protect customer information; and comply with tax, employment, consumer-protection, licensing, health, and other applicable obligations.",
        },
        {
            title: "Payments, cancellations, and disputes",
            body: "Prices and applicable charges are shown during booking. Payments and tips may be processed by a third-party payment provider and are subject to that provider's terms. Cancellation eligibility, fees, approvals, and refund amounts depend on booking timing, status, the applicable policy shown in the booking flow, and payment-provider rules. Refund processing times may depend on the relevant bank or provider. Contact support promptly if a charge or service is disputed.",
        },
        {
            title: "Home services and safety",
            body: "For home services, customers must provide a safe and accurate service location and businesses must confirm that assigned staff can fulfil the appointment. Each party is responsible for reasonable personal safety, respectful conduct, and compliance with the Safety Guidelines. Users should report suspected fraud, harassment, abuse, unsafe conduct, or misleading listings promptly.",
        },
        {
            title: "Reviews, images, and other content",
            body: "You retain ownership of content you submit but grant iBookam a worldwide, non-exclusive, royalty-free licence to host, store, reproduce, display, format, and distribute it as needed to operate and promote the platform. You must have the necessary rights and permissions and must not upload unlawful, deceptive, infringing, abusive, or privacy-violating content. Reviews must reflect genuine experiences.",
        },
        {
            title: "Acceptable use",
            body: "You may not misuse accounts, impersonate others, scrape or disrupt the service, bypass security or payment flows, introduce malicious code, make fraudulent bookings or payments, harvest personal information, or use iBookam for unlawful, harmful, or misleading activity.",
        },
        {
            title: "Account enforcement",
            body: "iBookam may investigate and restrict, suspend, ban, or remove accounts, businesses, listings, content, or bookings where reasonably necessary for safety, suspected fraud, legal compliance, repeated complaints, non-payment, or a breach of these terms. Where appropriate, we may notify affected users and provide a route to contact support. You may request account deletion, subject to retention required for transactions, disputes, safety, or law.",
        },
        {
            title: "Service availability and liability",
            body: "We work to keep iBookam accurate and available, but the platform and third-party services may occasionally be interrupted or contain errors. To the extent permitted by law, iBookam is not liable for indirect or consequential losses or for the acts, omissions, quality, or safety of independent service providers. Nothing in these terms excludes rights or liability that cannot legally be excluded, including applicable consumer rights.",
        },
        {
            title: "Changes, governing law, and contact",
            body: "We may update these terms as the service or law changes. Material changes will be communicated through the platform or other appropriate channels, and continued use after they take effect means you accept the revised terms. These terms are governed by the laws of the Federal Republic of Nigeria. Before starting formal proceedings, please contact support so we can try to resolve the issue promptly.",
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
