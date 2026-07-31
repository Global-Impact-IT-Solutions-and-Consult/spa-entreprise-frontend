"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

// Mobile-only Home search entry point. A real input (not a static button) —
// per the product call, it still needs to "take effect," it just takes
// effect the same way the desktop hero search already does: submit, then
// navigate somewhere for the result (here, Discover, which already reads
// `?search=` into its filter state on mount).
export function MobileSearchEntry() {
    const router = useRouter();
    const [query, setQuery] = useState("");

    const submit = () => {
        const params = query.trim() ? `?search=${encodeURIComponent(query.trim())}` : "";
        router.push(`/discover${params}`);
    };

    return (
        <div className="flex items-center gap-3 w-full h-12 px-4 rounded-[14px] bg-white shadow-sm">
            <Search className="w-4 h-4 text-gray-400 shrink-0" />
            <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submit()}
                enterKeyHint="search"
                placeholder="Search spas, salons, barbers..."
                className="flex-1 min-w-0 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
            />
        </div>
    );
}
