"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Star, Wallet, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { bookingService } from "@/services/booking.service";
import { reviewService } from "@/services/review.service";
import { toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getFallbackImage } from "@/lib/image.utils";
import { businessService } from "@/services/business.service";
import { Skeleton } from "@/components/ui/skeleton";

export default function ReviewPage() {
    const params = useParams();
    const router = useRouter();
    const bookingId = params.bookingId as string;

    const [rating, setRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [comment, setComment] = useState("");
    const [tipAmount, setTipAmount] = useState("");
    const [booking, setBooking] = useState<any>(null);
    const [staff, setStaff] = useState<any>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchBookingContext = async () => {
            if (!bookingId) return;
            try {
                // 1. Get the booking
                const res = await bookingService.getUserBookings({ limit: 100 });
                const foundBooking = res.data.find((b: any) => b.id === bookingId);
                
                if (foundBooking) {
                    setBooking(foundBooking);
                    
                    // 2. If it has a staffId, fetch the staff profile picture
                    if (foundBooking.staffId && foundBooking.businessId) {
                        try {
                            const staffList = await businessService.getAllStaffPublic(foundBooking.businessId);
                            const foundStaff = staffList.find(s => s.id === foundBooking.staffId);
                            if (foundStaff) {
                                setStaff(foundStaff);
                            }
                        } catch (err) {
                            console.error("Failed to fetch staff details", err);
                        }
                    }
                }
            } catch (error) {
                console.error("Failed to fetch booking details", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchBookingContext();
    }, [bookingId]);

    const handleSubmit = async () => {
        if (rating === 0) {
            toaster.create({ title: "Error", description: "Please provide a star rating.", type: "error" });
            return;
        }

        setIsSubmitting(true);
        try {
            await reviewService.submitReview({
                bookingId,
                rating,
                reviewText: comment,
                tipAmount: tipAmount ? parseFloat(tipAmount) : undefined
            });
            toaster.create({ title: "Success", description: "Thank you! Your review has been submitted.", type: "success" });
            router.push("/history");
        } catch (error) {
            console.error("Failed to submit review", error);
            toaster.create({ title: "Error", description: "Failed to submit review. Please try again.", type: "error" });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Minimal Header */}
            <header className="bg-white px-4 md:px-8 py-4 flex items-center justify-between border-b border-gray-100 sticky top-0 z-[1000]">
                <Link href="/" className="flex items-center gap-2">
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-[#E89D24] rounded-lg flex items-center justify-center text-white font-bold text-lg md:text-xl">
                        WP
                    </div>
                    <span className="font-bold text-gray-900 text-sm md:text-base">WellnessPro</span>
                </Link>
                <div className="hidden md:flex items-center gap-2 text-gray-400 font-bold text-sm ml-8 mr-auto">
                    <span>Lagos</span>
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </div>
                <button
                    onClick={() => router.back()}
                    className="text-gray-400 hover:text-gray-600 font-bold text-xs md:text-sm uppercase tracking-wider"
                >
                    Cancel
                </button>
            </header>

            <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8">
                <div className="max-w-xl w-full text-center mb-12">
                    <h1 className="text-3xl md:text-4xl font-black text-gray-900 font-playfair mb-3">How was your experience?</h1>
                    <p className="text-gray-400 font-medium tracking-widest text-[10px] md:text-xs">We'd love to hear your feedback</p>
                </div>

                {/* Review Card */}
                <div className="bg-white rounded-xl shadow-xl shadow-gray-200/50 w-full max-w-2xl p-8 md:p-12 border border-gray-50">
                    <div className="text-center mb-4">
                        {isLoading ? (
                            <div className="flex flex-col items-center gap-4">
                                <Skeleton className="w-32 h-32 rounded-full" />
                                <Skeleton className="h-8 w-64" />
                                <Skeleton className="h-4 w-32" />
                            </div>
                        ) : (
                            <div className="flex flex-col items-center">
                                {/* Staff Avatar */}
                                <Avatar className="w-28 h-28 border-4 border-white shadow-xl mb-6">
                                    <AvatarImage 
                                        src={staff?.profilePicture || getFallbackImage(staff?.name || booking?.staffName || "Staff")} 
                                        className="object-cover"
                                    />
                                    <AvatarFallback className="bg-orange-50 text-[#E89D24] text-4xl font-black">
                                        {(staff?.name || booking?.staffName || "S").charAt(0)}
                                    </AvatarFallback>
                                </Avatar>

                                <div className="space-y-1">
                                    <h2 className="text-base md:text-lg text-gray-900 flex items-center justify-center gap-2">
                                        {staff?.name || booking?.staffName || "Wellness Professional"}
                                        <span className="font-bold">@{booking?.businessName || "WellnessPro"}</span>
                                    </h2>
                                    <p className="text-gray-400 text-xs md:text-sm font-medium tracking-widest leading-loose">
                                        Service - {booking?.serviceName || "Treatment"}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Star Rating */}
                    <div className="flex flex-col items-center mb-5">
                        <div className="flex items-center gap-1 mb-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    onMouseEnter={() => setHoveredRating(star)}
                                    onMouseLeave={() => setHoveredRating(0)}
                                    onClick={() => setRating(star)}
                                    className="transition-transform active:scale-90 p-1"
                                >
                                    <Star
                                        className={cn(
                                            "w-10 h-10 md:w-10 md:h-10 transition-colors",
                                            (hoveredRating || rating) >= star
                                                ? "fill-[#E89D24] text-[#E89D24]"
                                                : "text-gray-200 fill-gray-200"
                                        )}
                                    />
                                </button>
                            ))}
                        </div>
                        <span className="text-[10px] md:text-xs text-gray-400 tracking-widest">(click to rate)</span>
                    </div>

                    <hr className="border-gray-50 mb-5" />

                    {/* Tip Section */}
                    <div className="mb-10">
                        <div className="flex items-center gap-4 mb-3">
                            <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
                                <Wallet className="w-5 h-5 text-[#E89D24]" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 text-sm md:text-base">Leave a tip (optional)</h3>
                            </div>
                        </div>
                        <p className="text-gray-400 text-xs md:text-sm font-medium tracking-wider mb-1">Show appreciation for great service</p>

                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-gray-900 text-sm md:text-base">₦</div>
                            <Input
                                type="number"
                                placeholder="500"
                                value={tipAmount}
                                onChange={(e) => setTipAmount(e.target.value)}
                                className="pl-10 h-14 bg-gray-50 border-gray-500 rounded-md text-gray-900 focus:outline-none focus:ring-[#E89D24] focus:border-[#E89D24] transition-all"
                            />
                        </div>
                        <p className="text-xs text-gray-400 tracking-wider mt-1 ml-1">Tip will be added to the total and paid directly to the staff.</p>
                    </div>

                    {/* Comments Section */}
                    <div className="mb-10 text-left">
                        <label className="block font-semibold text-gray-900 text-base mb-3 ml-1">Additional comments (optional)</label>
                        <Textarea
                            placeholder="Tell us more about your experience....."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="bg-white border-gray-200 rounded-md] min-h-[120px] p-3 font-medium text-gray-700 focus:ring-[#E89D24] focus:border-[#E89D24] transition-all"
                        />
                    </div>

                    {/* Submit Button */}
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting || rating === 0}
                        className="w-full h-16 bg-[#E89D24] hover:bg-[#D97706] text-white rounded-md font-semibold text-sm md:text-base uppercase tracking-widest shadow-xl shadow-orange-100 transition-all active:scale-[0.98] disabled:opacity-50"
                    >
                        {isSubmitting ? "Submitting..." : "Submit Review & Tip"}
                    </Button>

                    <p className="text-center mt-6 text-xs md:text-sm text-gray-500 tracking-widest">
                        Your feedback helps others make better choices
                    </p>
                </div>
            </main>
        </div>
    );
}
