"use client";

import { useState } from "react";
import { X, Calendar as CalendarIcon, Clock, User, Check } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CreateBookingModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const services = [
    { id: "1", name: "Haircut", price: "₦15,000", duration: "60 mins" },
    { id: "2", name: "Lock & Twist", price: "₦12,000", duration: "45 mins" },
];

const timeSlots = ["9:00AM", "10:30AM", "2:00PM", "3:30PM", "5:00PM", "6:30PM"];

const staffs = [
    { id: "1", name: "Amara Okeke", role: "Senior Therapist", status: "Available" },
    { id: "2", name: "Chinedu Obi", role: "Therapist", status: "Available" },
];

export function CreateBookingModal({ isOpen, onClose }: CreateBookingModalProps) {
    const [selectedService, setSelectedService] = useState<string | null>("1");
    const [selectedTime, setSelectedTime] = useState<string | null>("3:30PM");
    const [selectedStaff, setSelectedStaff] = useState<string | null>("1");

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl bg-white p-0 gap-0 overflow-hidden border-none shadow-2xl rounded-2xl">
                <DialogHeader className="p-6 border-b border-gray-50 flex flex-row items-center justify-between">
                    <DialogTitle className="text-2xl font-bold text-gray-900">Create New Booking</DialogTitle>
                    <DialogClose className="rounded-full p-2 hover:bg-gray-100 transition-colors">
                        <X className="h-5 w-5 text-gray-400" />
                    </DialogClose>
                </DialogHeader>

                <div className="p-8 space-y-8 max-h-[80vh] overflow-y-auto">
                    {/* Select Service */}
                    <section className="space-y-4">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Select Service</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {services.map((service) => (
                                <div
                                    key={service.id}
                                    onClick={() => setSelectedService(service.id)}
                                    className={cn(
                                        "relative flex items-center justify-between p-4 rounded-xl border-2 transition-all cursor-pointer group",
                                        selectedService === service.id
                                            ? "border-[#F59E0B] bg-[#F59E0B]/5 shadow-sm"
                                            : "border-gray-100 hover:border-gray-200"
                                    )}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "p-3 rounded-lg group-hover:scale-110 transition-transform",
                                            selectedService === service.id ? "bg-[#F59E0B]/10" : "bg-gray-50"
                                        )}>
                                            <div className="h-5 w-5 border-2 border-[#F59E0B] rounded-sm flex items-center justify-center rotate-45">
                                                <div className="h-2 w-2 bg-[#F59E0B] rounded-full" />
                                            </div>
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900">{service.name}</p>
                                            <p className="text-sm text-gray-500">{service.price} • {service.duration}</p>
                                        </div>
                                    </div>
                                    {selectedService === service.id && (
                                        <div className="h-5 w-5 bg-emerald-500 rounded flex items-center justify-center">
                                            <Check className="h-3 w-3 text-white" />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Select Date */}
                    <section className="space-y-4">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Select Date</h3>
                        <div className="relative">
                            <input
                                type="text"
                                value="10 / 15 / 2023"
                                readOnly
                                className="w-full h-14 pl-4 pr-12 rounded-xl border-2 border-gray-100 text-gray-900 font-medium focus:outline-none focus:border-[#F59E0B] transition-colors"
                            />
                            <CalendarIcon className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        </div>
                    </section>

                    {/* Select Time */}
                    <section className="space-y-4">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Select Time</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {timeSlots.map((time) => (
                                <button
                                    key={time}
                                    onClick={() => setSelectedTime(time)}
                                    className={cn(
                                        "h-12 rounded-xl text-sm font-bold transition-all border-2",
                                        selectedTime === time
                                            ? "bg-[#F59E0B] border-[#F59E0B] text-white shadow-md shadow-[#F59E0B]/20"
                                            : "bg-gray-50 border-transparent text-gray-600 hover:bg-gray-100"
                                    )}
                                >
                                    {time}
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* Assign Staff */}
                    <section className="space-y-4">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Assign Staff</h3>
                        <div className="space-y-3">
                            {staffs.map((staff) => (
                                <div
                                    key={staff.id}
                                    onClick={() => setSelectedStaff(staff.id)}
                                    className={cn(
                                        "flex items-center justify-between p-4 rounded-xl border-2 transition-all cursor-pointer",
                                        selectedStaff === staff.id
                                            ? "border-[#F59E0B] bg-[#F59E0B]/5"
                                            : "border-gray-50 hover:border-gray-100"
                                    )}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-full bg-gray-200" />
                                        <div>
                                            <p className="font-bold text-gray-900">{staff.name}</p>
                                            <p className="text-sm text-gray-500">{staff.role} • {staff.status}</p>
                                        </div>
                                    </div>
                                    {selectedStaff === staff.id && (
                                        <div className="h-5 w-5 bg-blue-900 rounded flex items-center justify-center">
                                            <Check className="h-3 w-3 text-white" />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                <div className="p-6 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        className="h-12 px-8 text-gray-500 font-bold hover:bg-gray-100 rounded-xl"
                    >
                        Cancel
                    </Button>
                    <Button
                        className="h-12 px-8 bg-[#F59E0B] hover:bg-[#D97706] text-white font-bold rounded-xl shadow-lg shadow-[#F59E0B]/20 transition-all active:scale-95"
                    >
                        Create Booking
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
