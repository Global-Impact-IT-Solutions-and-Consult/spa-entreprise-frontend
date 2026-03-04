"use client";

import { AlertCircle, Trash2, X } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface CancelBookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    isLoading?: boolean;
}

export function CancelBookingModal({ isOpen, onClose, onConfirm, isLoading }: CancelBookingModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-white p-0 gap-0 overflow-hidden border-none shadow-2xl rounded-2xl">
                <DialogHeader className="p-8 pb-4 relative">
                    <DialogTitle className="text-2xl font-bold text-gray-900">Cancel Booking</DialogTitle>
                </DialogHeader>

                <div className="px-8 pb-8 space-y-6">
                    {/* Warning Box */}
                    <div className="bg-[#FFF5F5] border-l-4 border-[#E74C3C] p-6 flex items-center gap-4">
                        <div className="flex-shrink-0">
                            <AlertCircle className="w-6 h-6 text-[#E74C3C]" />
                        </div>
                        <p className="text-[#E74C3C] font-medium">
                            Are you sure you want to Cancel this booking?
                        </p>
                    </div>

                    <p className="text-gray-400 text-sm">
                        This action will cancel the booking and it cannot be undone
                    </p>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button
                            variant="outline"
                            onClick={onClose}
                            className="px-8 h-12 rounded bg-gray-50 border-none text-gray-600 font-bold hover:bg-gray-100"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={onConfirm}
                            disabled={isLoading}
                            className="px-8 h-12 bg-[#E74C3C] hover:bg-[#C0392B] text-white font-bold rounded flex items-center gap-2"
                        >
                            <Trash2 className="w-4 h-4" />
                            {isLoading ? "Canceling..." : "Cancel Booking"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
