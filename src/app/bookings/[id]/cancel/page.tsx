"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Info, Clock, Calendar as CalendarIcon, Loader2, CheckCircle2, ChevronLeft, AlertCircle, X, Check, FileClock, Verified } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { bookingService, Booking } from "@/services/booking.service";
import { businessService, Staff } from "@/services/business.service";
import Image from "next/image";
import { getFallbackImage } from "@/lib/image.utils";
import { BiChat } from "react-icons/bi";

type CancelStep = 'details' | 'success' | 'cancelled';

export default function CancellationPage() {
    const params = useParams();
    const router = useRouter();
    const bookingId = params.id as string;

    const [booking, setBooking] = useState<Booking | null>(null);
    const [staff, setStaff] = useState<Staff | null>(null);
    const [businessImage, setBusinessImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [step, setStep] = useState<CancelStep>('details');
    const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
    const [hasAgreedToTerms, setHasAgreedToTerms] = useState(false);
    const [canCancel, setCanCancel] = useState(true);
    const [timeRemainingMinutes, setTimeRemainingMinutes] = useState<string | number | null>(null);
    const [isBeforeStart, setIsBeforeStart] = useState(false);

    // Helper functions for formatting
    const formatTime12h = (time24: string) => {
        if (!time24) return "";
        try {
            const [hoursStr, minutes] = time24.split(':');
            const hours = parseInt(hoursStr, 10);
            const period = hours >= 12 ? 'PM' : 'AM';
            const displayHours = hours % 12 || 12;
            return `${displayHours}:${minutes}${period}`;
        } catch (e) {
            return time24;
        }
    };

    const formatDateDisplay = (dateString: string) => {
        if (!dateString) return "";
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            });
        } catch (e) {
            return dateString;
        }
    };

    const getBookingEndDateTime = (bookingData: Booking) => {
        if (!bookingData || !bookingData.bookingDate || !bookingData.endTime) return null;
        try {
            const datePart = bookingData.bookingDate.split('T')[0];
            const timePart = bookingData.endTime;
            const formattedTime = timePart.split(':').length === 3 ? timePart : `${timePart}:00`;
            return new Date(`${datePart}T${formattedTime}`);
        } catch (e) {
            console.error("Failed to parse end date/time", e);
            return null;
        }
    };

    useEffect(() => {
        if (!booking) return;

        const calculateTimeRemaining = () => {
            // Determine if we are before the appointment start
            try {
                const datePart = booking.bookingDate.split('T')[0];
                const startTimePart = booking.startTime;
                const formattedStart = startTimePart.split(':').length === 3 ? startTimePart : `${startTimePart}:00`;
                const startDateTime = new Date(`${datePart}T${formattedStart}`);
                const now = new Date();
                if (startDateTime > now) {
                    setIsBeforeStart(true);
                    setCanCancel(true);
                    setTimeRemainingMinutes(null);
                    return;
                }
            } catch { /* fall through to end-time logic */ }

            setIsBeforeStart(false);
            const endDateTime = getBookingEndDateTime(booking);
            if (!endDateTime) return;

            const cancellationDeadline = new Date(endDateTime.getTime() + 30 * 60 * 1000);
            const now = new Date();
            const diffMs = cancellationDeadline.getTime() - now.getTime();

            if (diffMs <= 0) {
                setCanCancel(false);
                setTimeRemainingMinutes(booking?.endTime || null);
            } else {
                setCanCancel(true);
                setTimeRemainingMinutes(Math.ceil(diffMs / (60 * 1000)));
            }
        };

        calculateTimeRemaining();
        const timer = setInterval(calculateTimeRemaining, 30000);
        return () => clearInterval(timer);
    }, [booking]);

    useEffect(() => {
        const fetchBookingAndStaff = async () => {
            if (!bookingId) return;
            setIsLoading(true);
            try {
                const bookingData = await bookingService.getBookingById(bookingId);
                setBooking(bookingData);

                // If cancellation is already pending or has been requested, jump to success screen
                if (bookingData.cancellationRequested || bookingData.status === 'cancellation_pending_approval') {
                    setStep('success');
                }

                // Fetch staff details
                if (bookingData.businessId) {
                    try {
                        const [staffs, businessProfile] = await Promise.all([
                            bookingData.staffId ? businessService.getAllStaffPublic(bookingData.businessId) : Promise.resolve([]),
                            businessService.getBusinessProfile(bookingData.businessId)
                        ]);

                        if (bookingData.staffId) {
                            const staffMember = staffs.find(s => s.id === bookingData.staffId);
                            if (staffMember) {
                                setStaff(staffMember);
                            }
                        }

                        if (businessProfile?.profileImage) {
                            setBusinessImage(businessProfile.profileImage);
                        } else if (businessProfile?.primaryImageUrl) {
                            setBusinessImage(businessProfile.primaryImageUrl);
                        }
                    } catch (bizErr) {
                        console.error("Failed to fetch business/staff details", bizErr);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch booking", error);
                toaster.create({
                    title: "Error",
                    description: "Failed to load appointment details.",
                    type: "error"
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchBookingAndStaff();
    }, [bookingId]);

    const handleConfirmCancellation = async () => {
        if (!hasAgreedToTerms) return;

        setIsSubmitting(true);
        try {
            await bookingService.cancelBooking(bookingId, { reason: "Customer requested cancellation via dedicated page" });

            setIsTermsModalOpen(false);

            if (isBeforeStart) {
                // Immediate cancellation — booking is cancelled right away
                setStep('cancelled');
                toaster.create({
                    title: "Booking Cancelled",
                    description: "Your appointment has been cancelled successfully.",
                    type: "success"
                });
            } else {
                // Post-appointment cancellation request — needs business approval
                setStep('success');
                toaster.create({
                    title: "Cancellation Request Sent",
                    description: "Your request is being processed.",
                    type: "success"
                });
            }
        } catch (error: any) {
            console.error("Cancellation failed", error);
            toaster.create({
                title: "Action Failed",
                description: error?.response?.data?.message || "Could not process cancellation. Please try again.",
                type: "error"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-[#E89D24]" />
            </div>
        );
    }

    if (!booking) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-center px-4">
                <h2 className="text-2xl font-bold text-gray-900 mb-2 font-playfair">Appointment Not Found</h2>
                <p className="text-gray-500 mb-6">We couldn't find the appointment details.</p>
                <Button onClick={() => router.push("/my-bookings")} className="bg-[#E89D24] text-white font-bold h-12 px-6">
                    Return to Bookings
                </Button>
            </div>
        );
    }

    if (booking.status === 'cancelled') {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-center px-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
                    <X className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2 font-playfair">Booking Cancelled</h2>
                <p className="text-gray-500 mb-6">This appointment has already been cancelled.</p>
                <Button onClick={() => router.push("/my-bookings")} className="bg-[#E89D24] text-white font-bold h-12 px-6">
                    Return to Bookings
                </Button>
            </div>
        );
    }

    if (step === 'cancelled') {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 py-12 text-center">
                <div className="w-48 h-48 relative rounded-full overflow-hidden mb-8 bg-gray-50 flex items-center justify-center">
                    <Image
                        src={businessImage || getFallbackImage(booking.businessName)}
                        alt={booking.businessName}
                        fill
                        className="object-cover"
                    />
                </div>

                <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4 -mt-6">
                    <CheckCircle2 className="w-7 h-7 text-emerald-500" />
                </div>

                <h1 className="text-2xl font-bold text-gray-900 font-inter mb-3">Booking Cancelled</h1>
                <p className="text-gray-500 text-sm font-normal max-w-sm mx-auto mb-5 leading-relaxed">
                    Your appointment with <span className="font-bold text-[#E89D24]">{booking.businessName}</span> has been cancelled.
                </p>

                <div className="w-full max-w-sm bg-amber-50 border border-amber-100 rounded-xl p-4 mb-8 text-left">
                    <h3 className="text-sm font-bold text-amber-800 mb-2 uppercase tracking-widest">Refund Info</h3>
                    <ul className="space-y-2 text-sm text-amber-700">
                        <li className="">
                            - A <strong>10% cancellation fee</strong> will be deducted from your total payment.
                        </li>
                        <li className="">
                            - The <strong>remaining amount</strong> will be refunded to your original payment method within 3–5 business days.
                        </li>
                    </ul>
                </div>

                <div className="w-full max-w-sm flex flex-col sm:flex-row items-center gap-2">
                    <Button
                        onClick={() => router.push("/")}
                        className="w-full h-12 bg-[#E89D24] hover:bg-[#D97706] text-white font-medium rounded-md shadow-lg shadow-orange-100"
                    >
                        Back to Home
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => router.push("/my-bookings")}
                        className="w-full h-12 text-gray-500 font-medium hover:bg-gray-50 rounded-md"
                    >
                        View Bookings
                    </Button>
                </div>
            </div>
        );
    }

    if (step === 'success') {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 py-12 text-center">
                <div className="w-48 h-48 relative rounded-full overflow-hidden mb-8 bg-gray-50 flex items-center justify-center">
                    <Image 
                        src={businessImage || getFallbackImage(booking.businessName)} 
                        alt={booking.businessName} 
                        fill
                        className="object-cover" 
                    />
                </div>

                <h1 className="text-2xl font-bold text-gray-900 font-inter mb-4">Cancellation Request Sent</h1>
                <p className="text-gray-500 text-sm font-normal max-w-md mx-auto mb-5 leading-relaxed">
                    We've notified <span className="font-bold text-[#E89D24]">{booking.businessName}</span> of your request. The business must confirm the cancellation before it's finalized.
                </p>

                <div className="text-gray-500 text-sm font-normal max-w-md mx-auto mb-10 leading-relaxed bg-[#F5F4EC] p-4 py-2 rounded-lg">You'll receive a notification and email once they respond.</div>

                <div className="w-full max-w-sm flex flex-col sm:flex-row items-center gap-2">
                    <Button
                        onClick={() => router.push("/")}
                        className="w-full h-12 bg-[#E89D24] hover:bg-[#D97706] text-white font-medium rounded-md shadow-lg shadow-orange-100"
                    >
                        Back to Home
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => router.push("/my-bookings")}
                        className="w-full h-12 text-gray-500 font-medium hover:bg-gray-50 rounded-md"
                    >
                        View Bookings
                    </Button>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                    <div className="mt-12 p-4 border-l-4 border-[#E89D24] bg-white rounded-md w-full max-w-sm text-left">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-4">Next Steps</h3>
                        <ul className="space-y-4">
                            <li className="flex gap-2 items-start">
                                <FileClock className="w-4 w-4 text-[#E89D24]"/>
                                <p className="text-sm text-gray-500">Provider reviews your request within 24 hours.</p>
                            </li>
                            <li className="flex gap-2 items-start">
                                <Verified className="w-5 w-5 text-[#E89D24]"/>
                                <p className="text-sm text-gray-500">Refund processing (if applicable) initiates automatically.</p>
                            </li>
                        </ul>
                    </div>
                    <div className="mt-12 p-4 w-full max-w-sm text-left bg-[#E89D241A] rounded-md">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-4">Need Help?</h3>
                        <p className="text-sm text-gray-500">If you have immediate questions regarding the cancellation policy, you can message the provider directly.</p>

                        <Button variant="ghost" className="p-0 text-[#E89D24] flex items-center gap-1">
                            Contact Support
                            <BiChat className="w-5 h-5 text-[#E89D24]"/>
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FDFCFB] flex flex-col">
            {/* Minimal Header */}
            <header className="bg-white px-4 md:px-8 py-4 flex items-center justify-between border-b border-gray-100 sticky top-0 z-[1000]">
                <div className="flex items-center gap-4">
                    <Link href="/" className="flex items-center gap-2">
                        <Image src="/Logo.svg" alt="iBookam Logo" width={100} height={50} />
                    </Link>
                    {/* <div className="hidden md:flex items-center gap-2 text-gray-400 font-bold text-xs ml-4">
                        <span>Lagos</span>
                        <ChevronLeft className="w-3 h-3 rotate-270" />
                    </div> */}
                </div>
                <button
                    onClick={() => router.back()}
                    className="text-gray-400 hover:text-gray-600 font-bold text-xs md:text-sm uppercase tracking-widest flex items-center gap-1"
                >
                    {/* <X className="w-4 h-4" /> */}
                    <span>Cancel</span>
                </button>
            </header>

            <main className="flex-1 flex flex-col items-center py-12 px-4 md:px-8">
                <div className="w-full max-w-2xl space-y-4">
                    {/* Policy Banner */}
                    {isBeforeStart ? (
                        <div className="bg-blue-50 border border-l-4 border-l-blue-400 rounded-lg p-5 px-4 flex items-start gap-2">
                            <div className="rounded-full flex items-center justify-center flex-shrink-0">
                                <Info className="w-6 h-6 text-blue-500" />
                            </div>
                            <div>
                                <h3 className="text-blue-800 font-semibold mb-1 tracking-wide">Cancellation before appointment</h3>
                                <p className="text-blue-700 text-sm font-medium leading-relaxed">
                                    Since your appointment hasn't started yet, cancelling now will <strong>immediately cancel</strong> the booking. A 10% cancellation fee applies and the remainder will be refunded.
                                </p>
                            </div>
                        </div>
                    ) : canCancel ? (
                        <div className="bg-[#FF383C1A] border border-l-4 border-l-[#CA3A31] rounded-lg p-5 px-2 flex items-start gap-2">
                            <div className="rounded-full flex items-center justify-center flex-shrink-0">
                                <AlertCircle className="w-6 h-6 text-[#CA3A31]" />
                            </div>
                            <div>
                                <h3 className="text-[#862E00] font-semibold mb-1 tracking-wide">Action Required: Limited Window</h3>
                                <p className="text-[#5E6058] text-sm font-medium leading-relaxed">
                                    After <strong>30 minutes</strong> from appointment end. This option will expire in <strong>{timeRemainingMinutes} minute{timeRemainingMinutes !== 1 ? 's' : ''}</strong>.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-gray-100 border border-l-4 border-l-gray-400 rounded-lg p-5 px-2 flex items-start gap-2">
                            <div className="rounded-full flex items-center justify-center flex-shrink-0">
                                <AlertCircle className="w-6 h-6 text-gray-400" />
                            </div>
                            <div>
                                <h3 className="text-gray-700 font-semibold mb-1 tracking-wide">Cancellation Expired</h3>
                                <p className="text-gray-500 text-sm font-medium leading-relaxed">
                                    The 30-minute cancellation window has expired. You can no longer cancel this booking.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Details Card */}
                    <div className="bg-white rounded-3xl p-8 shadow-sm gap-8">
                        <p className="text-lg font-semibold text-[#E89D24] mb-4">Appointment Details</p>
                        <div className="flex items-center gap-4">
                            {/* Staff/Service Image */}
                            <div className="w-14 h-14 relative rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                                <Image
                                    src={staff?.profilePicture || getFallbackImage(staff?.name || booking.staffName || booking.serviceName)}
                                    alt={staff?.name || booking.staffName || booking.serviceName}
                                    fill
                                    className="object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                            </div>

                            <div>
                                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-[0.2em] mb-1">Staff</p>
                                <p className="text-gray-900 font-bold text-base leading-tight mb-1">{staff?.name || booking.staffName || "Team Member"}</p>
                                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-[0.2em]">{booking.businessName}</p>
                            </div>
                        </div>

                        <hr className="border-gray-100 my-6" />

                        {/* Info */}
                        <div className="flex flex-wrap gap-x-12 gap-y-4">
                            <div className="space-y-2">
                                <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-widest">Date</p>
                                <div className="flex items-center gap-1">
                                    <CalendarIcon className="w-4 h-4 text-gray-500" />
                                    <p className="text-gray-500 font-medium text-sm">{formatDateDisplay(booking.bookingDate)}</p>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-widest">Time</p>
                                <div className="flex items-center gap-1">
                                    <Clock className="w-4 h-4 text-gray-500" />
                                    <p className="text-gray-500 font-medium text-sm">{formatTime12h(booking.startTime)} - {formatTime12h(booking.endTime)}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-4 pt-4">
                        <Button
                            onClick={() => setIsTermsModalOpen(true)}
                            disabled={!canCancel || isSubmitting}
                            className={cn(
                                "w-full h-14 bg-[#E89D24] hover:bg-[#D97706] text-white font-medium text-base rounded-md shadow-xl shadow-orange-100 transition-all active:scale-[0.99]",
                                (!canCancel || isSubmitting) && "bg-gray-100 text-gray-400 hover:bg-gray-100 hover:text-gray-400 cursor-not-allowed shadow-none"
                            )}
                        >
                            {isBeforeStart ? "Cancel Appointment" : "Request Cancellation"}
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={() => router.push(`/reschedule/${booking.id}`)}
                            className="w-full h-14 text-[#E89D24] font-medium text-base rounded-md border border-orange-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={true}
                        >
                            I want to reschedule
                        </Button>
                    </div>

                    <div className="flex flex-col items-center pt-4">
                        <div className="flex items-center gap-1">
                            <Info className="h-3 w-3 text-gray-400" />
                            <p className="text-center text-[10px] text-gray-400 uppercase">
                                Confirmation Policy
                            </p>
                        </div>
                        <p className="text-center text-[10px] text-gray-700">Your cancellation is pending business confirmation. We'll notify you once they review it.</p>
                    </div>
                </div>
            </main>

            {/* Terms Modal — desktop, restored verbatim from db9961e^ (this was
                never a `Dialog`, it's a hand-rolled overlay). No refs or local
                state live here, so a CSS dual-tree is safe. */}
            {isTermsModalOpen && (
                <div className="fixed inset-0 z-[2000] hidden md:flex items-center justify-center p-4 md:p-6 lg:p-8 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="p-8 md:p-10">
                            <div className="flex items-center justify-between mb-0">
                                <h2 className="text-2xl font-bold text-[#E89D24] font-inter">Cancellation Terms</h2>
                                <button onClick={() => setIsTermsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                            <div className="w-10 h-1 bg-gray-300 mb-4"></div>

                            <div className="space-y-6">
                                <div className="space-y-4">
                                    <p className="text-gray-600 font-medium leading-relaxed">
                                        {isBeforeStart
                                            ? "Since your appointment hasn't started yet, cancelling will immediately cancel the booking. A 10% cancellation fee applies and the remaining amount will be refunded to your payment method within 3–5 business days."
                                            : "Please note that all cancellation requests are subject to business approval. If your request is accepted, a 10% cancellation fee will be applied to your account."}
                                    </p>
                                </div>

                                <div className="flex items-start gap-4 cursor-pointer" onClick={() => setHasAgreedToTerms(!hasAgreedToTerms)}>
                                    <div className={cn(
                                        "w-6 h-6 rounded-md border-2 flex-shrink-0 flex items-center justify-center transition-all",
                                        hasAgreedToTerms ? "bg-[#E89D24] border-[#E89D24]" : "bg-white border-gray-200"
                                    )}>
                                        {hasAgreedToTerms && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
                                    </div>
                                    <p className="text-sm font-normal text-gray-700 leading-snug">
                                        I understand that a 10% fee applies and I wish to continue with the cancellation.
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mt-10">
                                <Button
                                    variant="outline"
                                    onClick={() => setIsTermsModalOpen(false)}
                                    className="h-12 rounded-md border-gray-200 text-gray-700 font-medium hover:bg-gray-50"
                                >
                                    Go Back
                                </Button>
                                <Button
                                    onClick={handleConfirmCancellation}
                                    disabled={!hasAgreedToTerms || isSubmitting}
                                    className={cn(
                                        "h-12 rounded-md font-medium transition-all shadow-lg",
                                        hasAgreedToTerms
                                            ? "bg-[#E89D24] text-white hover:bg-[#D97706] shadow-orange-100"
                                            : "bg-gray-100 text-gray-400 cursor-not-allowed"
                                    )}
                                >
                                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Agree and Continue"}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Terms Sheet — mobile only */}
            <div className="md:hidden">
                <Sheet
                    open={isTermsModalOpen}
                    onClose={() => setIsTermsModalOpen(false)}
                    title="Cancellation Terms"
                    footer={
                        <div className="grid grid-cols-2 gap-4">
                            <Button
                                variant="outline"
                                onClick={() => setIsTermsModalOpen(false)}
                                className="h-12 rounded-md border-gray-200 text-gray-700 font-medium hover:bg-gray-50"
                            >
                                Go Back
                            </Button>
                            <Button
                                onClick={handleConfirmCancellation}
                                disabled={!hasAgreedToTerms || isSubmitting}
                                className={cn(
                                    "h-12 rounded-md font-medium transition-all shadow-lg",
                                    hasAgreedToTerms
                                        ? "bg-[#E89D24] text-white hover:bg-[#D97706] shadow-orange-100"
                                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                                )}
                            >
                                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Agree and Continue"}
                            </Button>
                        </div>
                    }
                >
                    <div className="p-6 space-y-6">
                        <p className="text-gray-600 font-medium leading-relaxed">
                            {isBeforeStart
                                ? "Since your appointment hasn't started yet, cancelling will immediately cancel the booking. A 10% cancellation fee applies and the remaining amount will be refunded to your payment method within 3–5 business days."
                                : "Please note that all cancellation requests are subject to business approval. If your request is accepted, a 10% cancellation fee will be applied to your account."}
                        </p>

                        <div className="flex items-start gap-4 cursor-pointer" onClick={() => setHasAgreedToTerms(!hasAgreedToTerms)}>
                            <div className={cn(
                                "w-6 h-6 rounded-md border-2 flex-shrink-0 flex items-center justify-center transition-all",
                                hasAgreedToTerms ? "bg-[#E89D24] border-[#E89D24]" : "bg-white border-gray-200"
                            )}>
                                {hasAgreedToTerms && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
                            </div>
                            <p className="text-sm font-normal text-gray-700 leading-snug">
                                I understand that a 10% fee applies and I wish to continue with the cancellation.
                            </p>
                        </div>
                    </div>
                </Sheet>
            </div>
        </div>
    );
}
