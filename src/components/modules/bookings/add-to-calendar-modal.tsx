"use client";

import { CalendarCheck, Download, Info, X } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogClose,
} from "@/components/ui/dialog";
import Image from "next/image";

interface AddToCalendarModalProps {
    isOpen: boolean;
    onClose: () => void;
    booking: {
        serviceName: string;
        businessName: string;
        date: string;
        time: string;
        location: string;
        id: string;
    };
}

export function AddToCalendarModal({ isOpen, onClose, booking }: AddToCalendarModalProps) {
    const calendarOptions = [
        {
            name: "Google Calendar",
            icon: (
                <Image src="/assets/icons/google.png" alt="Google Calendar" width={28} height={28} className="object-contain" />
            ),
        },
        {
            name: "Outlook Calendar",
            icon: (
                <Image src="/assets/icons/outlook.png" alt="Outlook Calendar" width={28} height={28} className="object-contain" />
            ),
        },
        {
            name: "Yahoo Calendar",
            icon: (
                <Image src="/assets/icons/yahoo.png" alt="Yahoo Calendar" width={28} height={28} className="object-contain" />
            ),
        },
        {
            name: "Download iCal",
            icon: <Download className="w-6 h-6 text-gray-700" />,
        },
    ];

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-white p-0 gap-0 overflow-hidden border-none shadow-2xl rounded-[2rem]">
                <div className="px-8 py-2 text-center relative">
                    <div className="flex flex-col items-center gap-2 mt-4">
                        <div className="flex items-center gap-2">
                            <CalendarCheck className="w-5 h-5 text-gray-900" />
                            <h2 className="text-xl font-semibold text-gray-900">Add to Calendar</h2>
                        </div>
                        <p className="text-gray-500 mx-auto text-sm">
                            Don't forget your appointment! Add it to your calendar to stay organized.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-8">
                        {calendarOptions.map((option) => (
                            <button
                                key={option.name}
                                className="flex items-center justify-center px-6 py-2 gap-3 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors group"
                            >
                                <div className="w-12 h-12 flex items-center justify-center">
                                    {option.icon}
                                </div>
                                <span className="text-[11px] font-bold text-gray-900 leading-tight">
                                    {option.name.split(' ').map((word, i) => (
                                        <div key={i}>{word}</div>
                                    ))}
                                </span>
                            </button>
                        ))}
                    </div>

                    <div className="my-4 p-6 bg-[#E8F1F2] rounded-2xl flex items-start gap-3 text-left">
                        <Info className="w-5 h-5 text-[#2B7A78] mt-0.5 shrink-0" />
                        <p className="text-sm text-[#2B7A78] leading-relaxed">
                            <span className="font-bold">What's included in calendar event:</span> Service name, business name, date & time, location, booking ID, and a 15-minute reminder.
                        </p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
