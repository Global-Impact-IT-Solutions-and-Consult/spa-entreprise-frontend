"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { paymentService } from "@/services/payment.service";
import { Loader2 } from "lucide-react";

function PaymentCallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [status, setStatus] = useState("Verifying your payment...");

    useEffect(() => {
        const verifyPayment = async () => {
            const tx_ref = searchParams.get("tx_ref");
            const transaction_id = searchParams.get("transaction_id");
            const paymentStatus = searchParams.get("status");

            if (!tx_ref && !transaction_id) {
                setStatus("Invalid payment redirect. Returning to bookings...");
                setTimeout(() => router.push("/my-bookings"), 2000);
                return;
            }

            if (paymentStatus === "cancelled") {
                setStatus("Payment was cancelled. Returning to bookings...");
                setTimeout(() => router.push("/my-bookings"), 2000);
                return;
            }

            if (transaction_id && tx_ref) {
                try {
                    await paymentService.verifyPayment(transaction_id, tx_ref);
                    // Redirect to my-bookings with success flag to trigger modal
                    router.push("/my-bookings?payment_success=true");
                } catch (error) {
                    console.error("Payment verification failed:", error);
                    setStatus("Payment verification failed. Returning to bookings...");
                    setTimeout(() => router.push("/my-bookings?payment_failed=true"), 3000);
                }
            } else {
                setStatus("Missing transaction details. Returning to bookings...");
                setTimeout(() => router.push("/my-bookings"), 2000);
            }
        };

        verifyPayment();
    }, [searchParams, router]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
            <Loader2 className="w-12 h-12 text-[#E89D24] animate-spin mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2 font-playfair">{status}</h1>
            <p className="text-gray-500 font-medium text-center max-w-md">
                Please do not close this window. We are securely verifying your transaction.
            </p>
        </div>
    );
}

export default function PaymentCallbackPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-10 h-10 animate-spin text-[#E89D24]" />
            </div>
        }>
            <PaymentCallbackContent />
        </Suspense>
    );
}
