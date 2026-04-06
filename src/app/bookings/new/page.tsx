"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
    User, Loader2, Calendar as CalendarIcon, MapPin,
    ChevronDown, Store, Home, Star
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { bookingPublicService } from "@/services/booking-public.service";
import { bookingService } from "@/services/booking.service";
import { paymentService } from "@/services/payment.service";
import { Business, Service, Staff } from "@/services/business.service";
import { toaster } from "@/components/ui/toaster";
import { useAuthStore } from "@/store/auth.store";

const formatTime12h = (time24: string) => {
    if (!time24) return "";
    const [hours, minutes] = time24.split(":");
    const h = parseInt(hours, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${minutes} ${ampm}`;
};

function BookingContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { user } = useAuthStore();

    const serviceId = searchParams.get("serviceId");
    const businessId = searchParams.get("businessId");

    // UI State
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isAvailabilityLoading, setIsAvailabilityLoading] = useState(false);
    const [paymentStatusText, setPaymentStatusText] = useState("");

    // Data state
    const [business, setBusiness] = useState<Business | null>(null);
    const [service, setService] = useState<Service | null>(null);
    const [staffs, setStaffs] = useState<Staff[]>([]);

    // Selection state
    const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null); // null means "Any"
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [availableSlots, setAvailableSlots] = useState<any[]>([]);
    const [selectedSlot, setSelectedSlot] = useState<any | null>(null);
    const [deliveryType, setDeliveryType] = useState<"in_location" | "home_service">("in_location");
    const [instructions, setInstructions] = useState("");

    // Fetch initial data
    useEffect(() => {
        if (!serviceId || !businessId) {
            router.push("/discover");
            return;
        }

        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [bizData, servicesData, staffData] = await Promise.all([
                    bookingPublicService.getBusinessProfile(businessId),
                    bookingPublicService.getBusinessServices(businessId),
                    bookingPublicService.getServiceStaff(businessId, serviceId)
                ]);

                setBusiness(bizData);
                const currentService = servicesData.find(s => s.id === serviceId);
                setService(currentService || null);
                setStaffs(staffData);

                // Set initial delivery type based on service support
                if (currentService) {
                    if (currentService.deliveryType === 'home_service') {
                        setDeliveryType("home_service");
                    } else {
                        setDeliveryType("in_location");
                    }
                }
            } catch (error) {
                console.error("Error fetching booking data:", error);
                toaster.create({ title: "Error", description: "Failed to load booking details.", type: "error" });
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [serviceId, businessId, router]);

    // Fetch availability
    useEffect(() => {
        if (businessId && serviceId && selectedDate) {
            const fetchAvailability = async () => {
                setIsAvailabilityLoading(true);
                try {
                    let data;
                    if (selectedStaff) {
                        data = await bookingPublicService.getStaffAvailability({
                            businessId,
                            serviceId,
                            staffId: selectedStaff.id,
                            date: selectedDate
                        });
                    } else {
                        data = await bookingPublicService.getGeneralAvailability({
                            businessId,
                            serviceId,
                            date: selectedDate
                        });
                    }
                    const allSlots = [...(data.availableSlots || []), ...(data.unavailableSlots || [])];
                    allSlots.sort((a, b) => a.startTime.localeCompare(b.startTime));

                    // Filter out past slots if today is selected
                    const now = new Date();
                    const todayStr = now.toISOString().split('T')[0];
                    let filteredSlots = allSlots;

                    if (selectedDate === todayStr) {
                        const currentHour = now.getHours();
                        const currentMinute = now.getMinutes();

                        filteredSlots = allSlots.filter(slot => {
                            const [slotHour, slotMinute] = slot.startTime.split(':').map(Number);
                            if (slotHour > currentHour) return true;
                            if (slotHour === currentHour && slotMinute > currentMinute) return true;
                            return false;
                        });
                    }

                    setAvailableSlots(filteredSlots);
                } catch (error) {
                    console.error("Error fetching availability:", error);
                    setAvailableSlots([]);
                } finally {
                    setIsAvailabilityLoading(false);
                }
            };
            fetchAvailability();
        } else {
            setAvailableSlots([]);
        }
    }, [businessId, serviceId, selectedStaff, selectedDate]);

    // Derived values
    const price = useMemo(() => {
        if (!service) return 0;
        return deliveryType === "home_service" && service.homeServicePrice
            ? service.homeServicePrice
            : service.price;
    }, [deliveryType, service]);

    // Removed client-side slot generation since API handles all availability

    const taxAmount = price * 0.075;
    const totalAmount = price + taxAmount;

    const handleConfirmBooking = async () => {
        if (!user) {
            toaster.create({ title: "Authentication Required", description: "Please sign in to complete your booking.", type: "error" });
            return;
        }

        if (!selectedSlot) {
            toaster.create({ title: "Selection Required", description: "Please select a time slot.", type: "error" });
            return;
        }

        setIsSubmitting(true);
        setPaymentStatusText("Booking your appointment...");
        try {
            const res = await bookingService.createBooking({
                businessId: businessId!,
                serviceId: serviceId!,
                staffId: selectedStaff?.id,
                bookingDate: selectedDate,
                startTime: selectedSlot.startTime,
                userId: user.id,
            });

            // Initialize Payment
            setPaymentStatusText("Redirecting to secure payment...");
            const paymentRes = await paymentService.initializePayment({
                bookingId: res.id
            });

            if (paymentRes.paymentLink) {
                window.location.href = paymentRes.paymentLink; // Redirect to Flutterwave
            } else {
                toaster.create({ title: "Success!", description: "Your appointment has been booked. Payment link missing.", type: "warning" });
                router.push("/my-bookings");
            }

        } catch (error: any) {
            toaster.create({
                title: "Booking Failed",
                description: error.response?.data?.message || "An unexpected error occurred.",
                type: "error"
            });
            setIsSubmitting(false);
            setPaymentStatusText("");
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-[#E89D24] animate-spin mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">Preparing your booking experience...</p>
                </div>
            </div>
        );
    }

    if (!business || !service) return null;

    return (
        <div className="min-h-screen bg-[#F9FAFB] text-gray-900">
            {/* Header */}
            <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-[#E89D24] rounded flex items-center justify-center">
                                <span className="text-white font-black text-sm">WP</span>
                            </div>
                            <span className="text-lg font-bold tracking-tight">WellnessPro</span>
                        </Link>
                        <div className="hidden md:flex items-center gap-2 text-xs font-bold text-gray-400">
                            Lagos
                            <ChevronDown className="w-3 h-3" />
                        </div>
                    </div>
                    <button
                        onClick={() => router.back()}
                        className="text-sm font-bold text-gray-400 hover:text-gray-900 transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-6 py-10">
                <div className="flex flex-col lg:flex-row gap-8 items-start">

                    {/* Left Column - Form */}
                    <div className="flex-1 space-y-6 w-full">

                        {/* Service Header Info */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-start justify-between gap-4">
                            <div>
                                <h1 className="text-xl font-bold mb-1">{service.name}</h1>
                                <div className="space-y-1.5">
                                    <div className="flex items-center gap-2 text-sm text-gray-400 font-medium">
                                        <Store className="w-4 h-4 text-[#E89D24]" />
                                        {business.businessName}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-400 font-medium">
                                        <MapPin className="w-4 h-4 text-[#E89D24]" />
                                        1.2 mi away
                                    </div>
                                </div>
                            </div>
                            <div className="text-right flex flex-col items-end">
                                <p className="text-xl font-bold text-gray-900">₦{service.price.toLocaleString()}</p>
                                <p className="text-xs text-gray-400 font-medium mt-1">{service.duration} minutes</p>
                                <Link 
                                    href={`/businesses/${businessId}`}
                                    className="text-[#E89D24] text-xs font-bold hover:underline mt-2 inline-block"
                                >
                                    Change service
                                </Link>
                            </div>
                        </div>

                        {/* Staff Selection */}
                        <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                            <div className="mb-6">
                                <h2 className="text-lg font-bold mb-1">Select Your Barber</h2>
                                <p className="text-sm text-gray-400">Choose your preferred barber or select "Any Available" for the fastest booking.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Any Staff Option */}
                                <div
                                    onClick={() => setSelectedStaff(null)}
                                    className={cn(
                                        "relative flex items-center gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer",
                                        selectedStaff === null
                                            ? "border-[#E89D24] bg-white"
                                            : "border-gray-50 hover:border-gray-100 bg-gray-50/30"
                                    )}
                                >
                                    <div className="w-16 h-16 rounded-lg bg-gray-50 flex items-center justify-center border border-gray-100">
                                        {/* Placeholder for "Any available" as seen in screenshot */}
                                    </div>
                                    <div className="flex-1 text-center pr-4">
                                        <h4 className="font-bold text-gray-900 text-sm">Any Available Barber</h4>
                                        <p className="text-[10px] text-gray-400 mt-1 leading-relaxed">We'll assign the next available barber. Fastest booking option</p>
                                    </div>
                                </div>

                                {staffs.map((staff) => (
                                    <div
                                        key={staff.id}
                                        onClick={() => setSelectedStaff(staff)}
                                        className={cn(
                                            "relative flex items-start gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer",
                                            selectedStaff?.id === staff.id
                                                ? "border-[#E89D24] bg-white"
                                                : "border-gray-50 hover:border-gray-100 bg-gray-50/30"
                                        )}
                                    >
                                        <div className="relative w-16 h-16 rounded-lg overflow-hidden shadow-sm flex-shrink-0">
                                            {staff.profilePicture ? (
                                                <Image src={staff.profilePicture} alt={staff.name} fill className="object-cover" />
                                            ) : (
                                                <div className="w-full h-full bg-amber-100 flex items-center justify-center">
                                                    <User className="w-8 h-8 text-amber-600" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start">
                                                <h4 className="font-bold text-gray-900 text-sm">{staff.name}</h4>
                                            </div>
                                            <p className="text-[10px] text-[#E89D24] font-bold">{staff.role}</p>
                                            <p className="text-[9px] text-gray-400 mt-1 line-clamp-2 leading-relaxed">Specializes in skin fades, traditional straight razor shaves, and beard artistry.</p>
                                            <div className="flex items-center gap-6 mt-2">
                                                <div className="flex items-center gap-1">
                                                    <Star className="w-3 h-3 text-gray-900 fill-gray-900" />
                                                    <span className="text-[11px] font-bold text-gray-900">4.6</span>
                                                </div>
                                                <span className="text-[10px] text-gray-400 font-medium">184 reviews</span>
                                            </div>
                                            <div className="flex flex-wrap gap-1 mt-2">
                                                {["Skin Fades", "Straight Razor", "Beard Work"].map(tag => (
                                                    <span key={tag} className="text-[8px] font-bold bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded border border-gray-200">{tag}</span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Date & Time Selection */}
                        <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                            <h2 className="text-lg font-bold mb-4">Select Date & Time</h2>

                            <div className="space-y-6">
                                <div className="max-w-full relative">
                                    <label className="text-[10px] font-bold text-gray-400 mb-2 block uppercase tracking-wide">Select Date</label>
                                    <div className="relative">
                                        <input
                                            type="date"
                                            value={selectedDate}
                                            onChange={(e) => {
                                                setSelectedDate(e.target.value);
                                                setSelectedSlot(null);
                                            }}
                                            min={new Date().toISOString().split('T')[0]}
                                            className="w-full h-12 pl-4 pr-12 bg-white border border-gray-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-1 focus:ring-[#E89D24] transition-all appearance-none"
                                        />
                                        <CalendarIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    </div>
                                </div>

                                <div>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                        {isAvailabilityLoading ? (
                                            <div className="col-span-full py-8 flex flex-col items-center justify-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                                <Loader2 className="w-6 h-6 text-[#E89D24] animate-spin mb-2" />
                                                <p className="text-gray-400 text-xs font-medium">Checking availability...</p>
                                            </div>
                                        ) : availableSlots.length > 0 ? (
                                            availableSlots.map((slot, idx) => (
                                                <button
                                                    key={idx}
                                                    disabled={!slot.isAvailable}
                                                    onClick={() => setSelectedSlot(slot)}
                                                    className={cn(
                                                        "h-12 rounded-lg text-xs font-bold transition-all border",
                                                        !slot.isAvailable ? "bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed" :
                                                            selectedSlot === slot
                                                                ? "border-[#E89D24] bg-[#E89D24] text-white"
                                                                : "border-gray-50 bg-gray-100 hover:bg-white hover:border-gray-200 text-gray-700"
                                                    )}
                                                >
                                                    {formatTime12h(slot.startTime)}
                                                </button>
                                            ))
                                        ) : (
                                            <div className="col-span-full py-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                                <p className="text-gray-400 text-xs font-medium">No slots available on this day</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Delivery Option */}
                        <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                            <h2 className="text-lg font-bold mb-6">Service Delivery</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div
                                    onClick={() => {
                                        if (service.deliveryType !== 'home_service') {
                                            setDeliveryType("in_location");
                                        }
                                    }}
                                    className={cn(
                                        "flex items-center justify-center gap-3 h-16 rounded-xl border-2 transition-all font-bold text-sm",
                                        service.deliveryType === 'home_service_only'
                                            ? "bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed"
                                            : deliveryType === "in_location"
                                                ? "border-[#E89D24] bg-white text-gray-900 cursor-pointer"
                                                : "border-gray-50 bg-white text-gray-400 hover:border-gray-100 cursor-pointer"
                                    )}
                                >
                                    <Store className={cn("w-5 h-5", service.deliveryType === 'home_service' ? "text-gray-300" : "text-[#E89D24]")} />
                                    In Store
                                </div>
                                <div
                                    onClick={() => {
                                        if (service.deliveryType !== 'in_location_only') {
                                            setDeliveryType("home_service");
                                        }
                                    }}
                                    className={cn(
                                        "flex items-center justify-center gap-3 h-16 rounded-xl border-2 transition-all font-bold text-sm",
                                        service.deliveryType === 'in_location_only'
                                            ? "bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed"
                                            : deliveryType === "home_service"
                                                ? "border-[#E89D24] bg-white text-gray-900 cursor-pointer"
                                                : "border-gray-50 bg-white text-gray-400 hover:border-gray-100 cursor-pointer"
                                    )}
                                >
                                    <Home className={cn("w-5 h-5", service.deliveryType === 'in_location_only' ? "text-gray-300" : "text-[#E89D24]")} />
                                    Home Service
                                </div>
                            </div>
                        </section>

                        {/* Add Details & Extras */}
                        <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                            <h2 className="text-lg font-bold mb-4">Add Details & Extras</h2>
                            <div>
                                <label className="text-xs font-bold text-gray-900 mb-2 block uppercase tracking-wide">Special Instructions (Optional)</label>
                                <textarea
                                    value={instructions}
                                    onChange={(e) => setInstructions(e.target.value)}
                                    placeholder="Any special requests, notes, or instructions for your baber"
                                    className="w-full h-28 p-4 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#E89D24] transition-all resize-none"
                                />
                            </div>
                        </section>
                    </div>

                    {/* Right Column - Summary Sidebar */}
                    <aside className="w-full lg:w-[360px] lg:sticky lg:top-24">
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="p-6 space-y-6">
                                <h2 className="text-lg font-bold">Booking Summary</h2>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-1">
                                            <p className="font-bold text-gray-900 text-sm leading-tight">{service.name}</p>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{service.duration} minutes • {business.businessName}</p>
                                            <p className="text-[10px] text-gray-400 font-bold">Barbershop</p>
                                        </div>
                                        <p className="font-bold text-gray-900 text-sm">₦{service.price.toLocaleString()}</p>
                                    </div>

                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold text-gray-900 uppercase tracking-widest">Date & Time</p>
                                        <p className="text-xs font-medium text-gray-500">
                                            {selectedSlot ? `${new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} at ${formatTime12h(selectedSlot.startTime)}` : "Not selected"}
                                        </p>
                                    </div>

                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold text-gray-900 uppercase tracking-widest">Service Delivery</p>
                                        <p className="text-xs font-medium text-gray-500 capitalize">{deliveryType.replace('_', ' ')}</p>
                                    </div>

                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold text-gray-900 uppercase tracking-widest">Staff</p>
                                        <p className="text-xs font-medium text-gray-500">{selectedStaff?.name || "Any Available Barber"}</p>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-gray-100 space-y-3">
                                    <div className="flex justify-between text-xs font-bold">
                                        <span className="text-gray-400">Subtotal</span>
                                        <span className="text-gray-900">₦{price.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-xs font-bold">
                                        <span className="text-gray-400">Tax (7.5%)</span>
                                        <span className="text-gray-900">₦{taxAmount.toLocaleString()}</span>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-gray-100 flex justify-between items-center mb-6">
                                    <span className="text-sm font-bold text-gray-900">Total</span>
                                    <span className="text-lg font-bold text-gray-900">₦{totalAmount.toLocaleString()}</span>
                                </div>

                                <Button
                                    onClick={handleConfirmBooking}
                                    disabled={isSubmitting || !selectedSlot}
                                    className="w-full h-12 bg-[#E89D24] hover:bg-[#E5A800] text-white font-bold text-sm rounded-lg transition-all active:scale-[0.98]"
                                >
                                    {isSubmitting ? (
                                        <div className="flex items-center gap-2">
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            {paymentStatusText || "Book Now"}
                                        </div>
                                    ) : (
                                        "Book Now"
                                    )}
                                </Button>
                                <p className="text-[8px] text-gray-400 text-center font-bold mt-3">You'll confirm payment on the next screen</p>
                            </div>
                        </div>
                    </aside>
                </div>
            </main>
        </div>
    );
}

export default function BookingPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-white">
                <Loader2 className="w-10 h-10 text-[#E89D24] animate-spin" />
            </div>
        }>
            <BookingContent />
        </Suspense>
    );
}
