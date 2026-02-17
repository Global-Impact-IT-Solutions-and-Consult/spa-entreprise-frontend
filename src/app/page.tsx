import { CustomerHeader } from "@/components/modules/customer/customer-header";
import { HeroSearch } from "@/components/modules/customer/hero-search";
import { CategoryBrowser } from "@/components/modules/customer/category-browser";
import { FeaturedBusinesses } from "@/components/modules/customer/featured-businesses";
import { TrustFeatures } from "@/components/modules/customer/trust-features";
import { CityListings } from "@/components/modules/customer/city-listings";
import { CustomerFooter } from "@/components/modules/customer/customer-footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <CustomerHeader />
      <main>
        <div className="mb-5 md:mb-6 mt-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight">
              Find & Book Premium<br className="md:hidden" /> Wellness Services
          </h1>
        </div>
        <HeroSearch />
        <CategoryBrowser />
        <FeaturedBusinesses />
        <TrustFeatures />
        <CityListings />
      </main>
      <CustomerFooter />
    </div>
  );
}
