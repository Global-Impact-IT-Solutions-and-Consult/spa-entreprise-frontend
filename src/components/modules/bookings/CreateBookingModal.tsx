"use client";

import { useEffect, useState } from "react";
import { X, User, Check, Loader2, Phone } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth.store";
import { businessService, Service, Staff } from "@/services/business.service";
import { bookingService } from "@/services/booking.service";
import { toaster } from "@/components/ui/toaster";

interface CreateBookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export function CreateBookingModal({ isOpen, onClose, onSuccess }: CreateBookingModalProps) {
    const { user } = useAuthStore();
    const businessId = user?.businesses?.[0]?.id;

    const [services, setServices] = useState<Service[]>([]);
    const [staffs, setStaffs] = useState<Staff[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [selectedService, setSelectedService] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [selectedTime, setSelectedTime] = useState<string>("09:00");
    const [selectedStaff, setSelectedStaff] = useState<string | null>(null);
    const [customerName, setCustomerName] = useState("");
    const [customerPhone, setCustomerPhone] = useState("");

    const timeSlots = [
        "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
        "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
        "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"
    ];

    useEffect(() => {
        if (isOpen && businessId) {
            const fetchData = async () => {
                setIsLoading(true);
                try {
                    const [servicesData, staffData] = await Promise.all([
                        businessService.getServices(businessId),
                        businessService.getAllStaff(businessId)
                    ]);
                    setServices(servicesData);
                    setStaffs(staffData);
                    if (servicesData.length > 0) setSelectedService(servicesData[0].id);
                } catch (error) {
                    const err = error as { response?: { data?: { message?: string } } };
                    console.error("Error fetching modal data:", err);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchData();
        }
    }, [isOpen, businessId]);

    const handleCreate = async () => {
        if (!selectedService || !customerName || !customerPhone) {
            toaster.create({
                title: "Missing Required Fields",
                description: "Please fill in all required fields",
                type: "error"
            });
            return;
        }

        setIsSubmitting(true);
        try {
            const service = services.find(s => s.id === selectedService);
            if (!service) return;

            // Simple duration calculation for now (60 mins)
            const startTime = selectedTime;
            const [hours, minutes] = selectedTime.split(':').map(Number);
            const endDate = new Date(2000, 0, 1, hours, minutes + 60);
            const endTime = `${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}`;

            await bookingService.createBooking({
                businessId: businessId!,
                serviceId: selectedService,
                staffId: selectedStaff || undefined,
                bookingDate: selectedDate,
                startTime,
                endTime,
                customerName,
                customerPhone,
                totalPrice: service.price
            });

            onSuccess?.();
            onClose();
        } catch (error) {
            const err = error as { response?: { data?: { message?: string } } };
            console.error("Error creating booking:", err);
            toaster.create({
                title: "Booking Failed",
                description: err.response?.data?.message || "Failed to create booking. Please try again.",
                type: "error"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

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
                    {isLoading ? (
                        <div className="flex h-64 items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-[#F59E0B]" />
                        </div>
                    ) : (
                        <>
                            {/* Customer Info */}
                            <section className="space-y-4">
                                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Customer Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400">Full Name</label>
                                        <div className="relative">
                                            <Input
                                                placeholder="e.g. Adeola Johnson"
                                                value={customerName}
                                                onChange={(e) => setCustomerName(e.target.value)}
                                                className="h-12 pl-10 rounded-xl"
                                            />
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400">Phone Number</label>
                                        <div className="relative">
                                            <Input
                                                placeholder="e.g. 08012345678"
                                                value={customerPhone}
                                                onChange={(e) => setCustomerPhone(e.target.value)}
                                                className="h-12 pl-10 rounded-xl"
                                            />
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        </div>
                                    </div>
                                </div>
                            </section>

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
                                                <div>
                                                    <p className="font-bold text-gray-900">{service.name}</p>
                                                    <p className="text-sm text-gray-500">₦{service.price.toLocaleString()}</p>
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

                            {/* Select Date & Time */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <section className="space-y-4">
                                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Select Date</h3>
                                    <div className="relative">
                                        <Input
                                            type="date"
                                            value={selectedDate}
                                            onChange={(e) => setSelectedDate(e.target.value)}
                                            className="h-14 pl-4 pr-4 rounded-xl border-2"
                                        />
                                    </div>
                                </section>

                                <section className="space-y-4">
                                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Select Time</h3>
                                    <select
                                        value={selectedTime}
                                        onChange={(e) => setSelectedTime(e.target.value)}
                                        className="w-full h-14 px-4 rounded-xl border-2 border-gray-100 focus:border-[#F59E0B] outline-none"
                                    >
                                        {timeSlots.map(time => (
                                            <option key={time} value={time}>{time}</option>
                                        ))}
                                    </select>
                                </section>
                            </div>

                            {/* Assign Staff */}
                            <section className="space-y-4">
                                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Assign Staff (Optional)</h3>
                                <div className="space-y-3">
                                    {staffs.length === 0 ? (
                                        <p className="text-sm text-gray-400">No staff members found.</p>
                                    ) : (
                                        staffs.map((staff) => (
                                            <div
                                                key={staff.id}
                                                onClick={() => setSelectedStaff(selectedStaff === staff.id ? null : staff.id)}
                                                className={cn(
                                                    "flex items-center justify-between p-4 rounded-xl border-2 transition-all cursor-pointer",
                                                    selectedStaff === staff.id
                                                        ? "border-[#F59E0B] bg-[#F59E0B]/5"
                                                        : "border-gray-50 hover:border-gray-100"
                                                )}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                                                        <User className="h-5 w-5 text-gray-400" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900">{staff.name}</p>
                                                        <p className="text-sm text-gray-500">{staff.role}</p>
                                                    </div>
                                                </div>
                                                {selectedStaff === staff.id && (
                                                    <div className="h-5 w-5 bg-blue-900 rounded flex items-center justify-center">
                                                        <Check className="h-3 w-3 text-white" />
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </section>
                        </>
                    )}
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
                        onClick={handleCreate}
                        disabled={isSubmitting || isLoading}
                        className="h-12 px-8 bg-[#F59E0B] hover:bg-[#D97706] text-white font-bold rounded-xl shadow-lg transition-all active:scale-95"
                    >
                        {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Create Booking"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
