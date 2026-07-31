import Link from "next/link";

// Mobile-only replacement for the full <CustomerFooter/>, which is hidden on
// mobile — keeps Privacy/Terms/Help reachable without the full column layout.
export function MobileFooterStrip() {
    return (
        <div className="md:hidden flex items-center justify-center gap-3 text-[11px] text-gray-400 py-4">
            <Link href="/privacy" className="hover:text-gray-600">Privacy</Link>
            <span>·</span>
            <Link href="/terms" className="hover:text-gray-600">Terms</Link>
            <span>·</span>
            <Link href="/help" className="hover:text-gray-600">Help</Link>
            <span>·</span>
            <Link href="/contact" className="hover:text-gray-600">Contact</Link>
            <span>·</span>
            <Link href="/safety" className="hover:text-gray-600">Safety</Link>
            <span>·</span>
            <Link href="/faq" className="hover:text-gray-600">FAQ</Link>
            <span>·</span>
            <span>© 2026</span>
        </div>
    );
}
