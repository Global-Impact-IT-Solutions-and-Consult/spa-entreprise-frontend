"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { paymentService } from "@/services/payment.service";
import { Loader2 } from "lucide-react";

function TipCallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [status, setStatus] = useState("Verifying your tip...");

    useEffect(() => {
        const verifyTipPayment = async () => {
            const tx_ref = searchParams.get("tx_ref");
            const transaction_id = searchParams.get("transaction_id");
            const paymentStatus = searchParams.get("status");

            if (!tx_ref && !transaction_id) {
                setStatus("Invalid tip redirect. Returning to history...");
                setTimeout(() => router.push("/history"), 2000);
                return;
            }

            if (paymentStatus === "cancelled") {
                setStatus("Tip payment was cancelled. Returning to history...");
                setTimeout(() => router.push("/history"), 2000);
                return;
            }

            if (transaction_id && tx_ref) {
                try {
                    await paymentService.verifyPayment(transaction_id, tx_ref);
                    // Redirect to history allowing toaster to potentially handle success state
                    setStatus("Tip successfully processed. Taking you back...");
                    setTimeout(() => router.push("/history?tip_success=true"), 1500);
                } catch (error) {
                    console.error("Tip verification failed:", error);
                    setStatus("Tip verification failed. Please check your bank statement.");
                    setTimeout(() => router.push("/history?tip_failed=true"), 3000);
                }
            } else {
                setStatus("Missing transaction details. Returning to history...");
                setTimeout(() => router.push("/history"), 2000);
            }
        };

        verifyTipPayment();
    }, [searchParams, router]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
            <Loader2 className="w-12 h-12 text-[#E89D24] animate-spin mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2 font-playfair text-center">{status}</h1>
            <p className="text-gray-500 font-medium text-center max-w-md">
                Please do not close this window. We are securely verifying your tip transaction.
            </p>
        </div>
    );
}

export default function TipCallbackPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-10 h-10 animate-spin text-[#E89D24]" />
            </div>
        }>
            <TipCallbackContent />
        </Suspense>
    );
}
