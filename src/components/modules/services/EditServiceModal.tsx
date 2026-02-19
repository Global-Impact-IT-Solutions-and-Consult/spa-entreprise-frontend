"use client";

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { toaster } from "@/components/ui/toaster";
import { businessService, CreateServiceDto, Service } from '@/services/business.service';

interface EditServiceModalProps {
    businessId: string;
    service: Service | null;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (updatedService: Service) => void;
    categoryOptions: { label: string, value: string }[];
}

export const EditServiceModal = ({ businessId, service, isOpen, onClose, onSuccess, categoryOptions }: EditServiceModalProps) => {
    // Form State
    const [serviceName, setServiceName] = useState('');
    const [serviceDescription, setServiceDescription] = useState('');
    const [servicePrice, setServicePrice] = useState('');
    const [homeServicePrice, setHomeServicePrice] = useState('');
    const [serviceDuration, setServiceDuration] = useState('');
    const [bufferTime, setBufferTime] = useState('10');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [deliveryType, setDeliveryType] = useState<'IN_LOCATION_ONLY' | 'HOME_SERVICE' | 'BOTH'>('IN_LOCATION_ONLY');
    const [serviceRadius, setServiceRadius] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (service && isOpen) {
            setServiceName(service.name);
            setServiceDescription(service.description);
            setServicePrice(service.price.toString());
            setHomeServicePrice(service.homeServicePrice?.toString() || '');
            setServiceDuration(service.duration.toString());
            setBufferTime(service.bufferTime?.toString() || '15');
            setSelectedCategory(service.category?.id || '');

            // Map deliveryType to uppercase for internal state matching the modal's expected values
            const type = service.deliveryType?.toUpperCase();
            if (type === 'IN_LOCATION_ONLY' || type === 'HOME_SERVICE' || type === 'BOTH') {
                setDeliveryType(type);
            } else {
                // Fallback for unexpected or mixed-case values
                setDeliveryType('IN_LOCATION_ONLY');
            }

            setServiceRadius(service.serviceRadius?.toString() || '');
        }
    }, [service, isOpen]);

    const handleUpdateService = async () => {
        if (!businessId || !service?.id) {
            toaster.create({ title: "Session Error", description: "Missing required information.", type: "error" });
            return;
        }
        if (!serviceName || !serviceDescription || !servicePrice || !serviceDuration || !selectedCategory) {
            toaster.create({ title: "Validation Error", description: "Please fill all required fields", type: "error" });
            return;
        }

        const durationNum = parseInt(serviceDuration);
        if (durationNum < 15 || durationNum > 240) {
            toaster.create({ title: "Validation Error", description: "Duration must be between 15 and 240 minutes", type: "error" });
            return;
        }

        setIsSubmitting(true);
        try {
            const payload: Partial<CreateServiceDto> = {
                name: serviceName,
                description: serviceDescription,
                categoryId: selectedCategory,
                price: parseFloat(servicePrice),
                duration: parseInt(serviceDuration),
                deliveryType: deliveryType,
                bufferTime: bufferTime ? parseInt(bufferTime) : 15,
            };

            if (deliveryType === 'HOME_SERVICE' || deliveryType === 'BOTH') {
                payload.homeServicePrice = parseFloat(homeServicePrice);
                payload.maxServiceRadius = parseFloat(serviceRadius);
            }

            const updatedService = await businessService.updateService(businessId, service.id, payload);

            onSuccess(updatedService);
            toaster.create({ title: "Service Updated", type: "success" });
            onClose();
        } catch (error) {
            const err = error as { response?: { data?: { message?: string } } };
            toaster.create({
                title: "Failed to update service",
                description: err.response?.data?.message || "Please try again.",
                type: "error"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(val) => { if (!val) onClose(); }}>
            <DialogContent className='bg-white sm:max-w-2xl rounded-2xl p-0 overflow-hidden border-none h-[calc(100vh-4rem)]'>
                <div className="p-8 pb-32">
                    <DialogHeader className="mb-8">
                        <DialogTitle className="text-3xl font-bold text-gray-900">Edit Service</DialogTitle>
                        <p className="text-sm font-normal text-gray-500">Update the details of your service</p>
                    </DialogHeader>

                    <div className="space-y-6 overflow-y-auto h-[calc(100vh-20rem)]">
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-400">Category</Label>
                            <Select
                                placeholder="Select category"
                                options={categoryOptions}
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="h-[56px] rounded-lg border-gray-200"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-400">Service Name</Label>
                            <Input
                                placeholder="Service name"
                                value={serviceName}
                                onChange={(e) => setServiceName(e.target.value)}
                                className="h-[56px] rounded-lg border-gray-200 bg-white"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-400">Service Description *</Label>
                            <textarea
                                placeholder="Enter service description"
                                value={serviceDescription}
                                onChange={(e) => setServiceDescription(e.target.value)}
                                className="min-h-[120px] w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-base text-gray-900 placeholder:text-gray-300 focus:border-[#E59622] focus:ring-1 focus:ring-[#E59622] transition-all outline-none"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-400">Duration</Label>
                                <Select
                                    placeholder="Select duration"
                                    options={[
                                        { label: '15min', value: '15' },
                                        { label: '30min', value: '30' },
                                        { label: '45min', value: '45' },
                                        { label: '60min', value: '60' },
                                        { label: '90min', value: '90' },
                                        { label: '120min', value: '120' },
                                    ]}
                                    value={serviceDuration}
                                    onChange={(e) => setServiceDuration(e.target.value)}
                                    className="h-[56px] rounded-lg border-gray-200"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-400">Buffer Time</Label>
                                <Select
                                    placeholder="Select buffer time"
                                    options={[
                                        { label: '5min', value: '5' },
                                        { label: '10min', value: '10' },
                                        { label: '15min', value: '15' },
                                    ]}
                                    value={bufferTime}
                                    onChange={(e) => setBufferTime(e.target.value)}
                                    className="h-[56px] rounded-lg border-gray-200"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-400">Location & Price</Label>
                            <Select
                                placeholder="On Site & Home Service"
                                options={[
                                    { label: 'On Site Only', value: 'IN_LOCATION_ONLY' },
                                    { label: 'Home Service Only', value: 'HOME_SERVICE' },
                                    { label: 'On Site & Home Service', value: 'BOTH' },
                                ]}
                                value={deliveryType}
                                onChange={(e) => setDeliveryType(e.target.value as 'IN_LOCATION_ONLY' | 'HOME_SERVICE' | 'BOTH')}
                                className="h-[56px] rounded-lg border-gray-200"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-400">On Site Amount</Label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">₦</span>
                                    <Input
                                        type="number"
                                        placeholder="7,000"
                                        value={servicePrice}
                                        onChange={(e) => setServicePrice(e.target.value)}
                                        className="h-[56px] rounded-lg border-gray-200 pl-8 bg-white"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-400">Home Service Amount</Label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">₦</span>
                                    <Input
                                        type="number"
                                        placeholder="15000"
                                        value={homeServicePrice}
                                        onChange={(e) => setHomeServicePrice(e.target.value)}
                                        disabled={deliveryType === 'IN_LOCATION_ONLY'}
                                        className="h-[56px] rounded-lg border-gray-200 pl-8 bg-white disabled:opacity-50"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-8 bg-white border-t border-gray-100 flex items-center justify-center gap-4">
                        <Button
                            variant="outline"
                            onClick={onClose}
                            className="h-[56px] flex-1 rounded-lg border-gray-200 text-gray-500 font-bold text-lg"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleUpdateService}
                            disabled={isSubmitting}
                            className="h-[56px] flex-1 rounded-lg bg-[#E59622] hover:bg-[#d48a1f] text-white font-bold text-lg"
                        >
                            {isSubmitting ? "Updating..." : "Update Service"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
