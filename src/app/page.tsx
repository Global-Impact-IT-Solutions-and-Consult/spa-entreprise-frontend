import { CustomerHeader } from "@/components/modules/customer/customer-header";
import { HeroSearch } from "@/components/modules/customer/hero-search";
import { MobileSearchEntry } from "@/components/modules/customer/mobile-search-entry";
import { CategoryBrowser } from "@/components/modules/customer/category-browser";
import { BusinessesNearYou } from "@/components/modules/customer/businesses-near-you";
import { ServicesNearYou } from "@/components/modules/customer/services-near-you";
import { TrendingTreatments } from "@/components/modules/customer/trending-treatments";
import { RecentlyJoined } from "@/components/modules/customer/recently-joined";
import { PremiumWellness } from "@/components/modules/customer/premium-wellness";
import { TrustFeatures } from "@/components/modules/customer/trust-features";
import { CityListings } from "@/components/modules/customer/city-listings";
import { CustomerFooter } from "@/components/modules/customer/customer-footer";
import { MobileFooterStrip } from "@/components/modules/customer/mobile-footer-strip";
import { CustomerBottomNav } from "@/components/modules/customer/customer-bottom-nav";
import { FeaturedBusinesses } from "@/components/modules/customer/featured-businesses";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F9FAFB] pb-20 md:pb-0">
      <CustomerHeader />
      <main className="flex-1">
        <div className="mb-3 md:mb-6 mt-4 md:mt-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-[27px] md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 md:mb-4 leading-tight font-playfair">
            Find & Book Premium Wellness Services
          </h1>
          <div className="md:hidden">
            <MobileSearchEntry />
          </div>
        </div>
        <div className="hidden md:block">
          <HeroSearch />
        </div>
        <CategoryBrowser />
        <ServicesNearYou />
        <BusinessesNearYou />
        {/* <TrendingTreatments /> */}
        {/* <FeaturedBusinesses /> */}
        <TrustFeatures />
        <div className="hidden md:block">
          <CityListings />
        </div>
      </main>
      <div className="hidden md:block">
        <CustomerFooter />
      </div>
      <MobileFooterStrip />
      <CustomerBottomNav />
    </div>
  );
}
