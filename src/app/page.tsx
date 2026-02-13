import { CustomerHeader } from "@/components/modules/customer/customer-header";
import { HeroSearch } from "@/components/modules/customer/hero-search";
import { CategoryBrowser } from "@/components/modules/customer/category-browser";
import { FeaturedBusinesses } from "@/components/modules/customer/featured-businesses";
import { TrustFeatures } from "@/components/modules/customer/trust-features";
import { CityListings } from "@/components/modules/customer/city-listings";
import { CustomerFooter } from "@/components/modules/customer/customer-footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <CustomerHeader />
      <main>
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
