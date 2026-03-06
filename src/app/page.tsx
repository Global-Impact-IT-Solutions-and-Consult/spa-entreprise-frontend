import { CustomerHeader } from "@/components/modules/customer/customer-header";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <CustomerHeader />
      <main>
        <div className="mb-5 md:mb-6 mt-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight font-playfair">
            Find & Book Premium<br className="md:hidden" /> Wellness Services
          </h1>
        </div>
      </main>
    </div>
  );
}
