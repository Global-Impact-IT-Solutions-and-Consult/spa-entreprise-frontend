"use client";

import { Check } from "lucide-react";
import { Sheet } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

interface PaymentSuccessSheetProps {
    open: boolean;
    onClose: () => void;
}

export function PaymentSuccessSheet({ open, onClose }: PaymentSuccessSheetProps) {
    return (
        <Sheet
            open={open}
            onClose={onClose}
            footer={
                <Button
                    onClick={onClose}
                    className="w-full bg-[#E89D24] hover:bg-[#E5A800] text-white py-4 h-14 rounded-2xl font-bold text-lg shadow-lg shadow-yellow-500/20 transition-all active:scale-[0.98]"
                >
                    Back to Bookings
                </Button>
            }
        >
            <div className="p-8 text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Check className="w-10 h-10 text-green-500" strokeWidth={3} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3 font-playfair">Payment Confirmed</h2>
                <p className="text-gray-500 leading-relaxed">
                    Your booking has been successfully secured. Check your email for details.
                </p>
            </div>
        </Sheet>
    );
}
