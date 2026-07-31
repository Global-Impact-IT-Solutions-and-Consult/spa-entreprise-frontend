"use client";

import { useState } from 'react';
import Image from 'next/image';
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { useIsMobile, MOBILE_MAX } from "@/hooks/use-is-mobile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { toaster } from "@/components/ui/toaster";
import { validateImageFile, ACCEPTED_IMAGE_EXTENSIONS } from "@/lib/utils";
import { businessService, CreateServiceDto, Service } from '@/services/business.service';

interface CreateServiceModalProps {
    businessId: string;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (service: Service) => void;
    categoryOptions: { label: string, value: string }[];
    // Max-width below which the mobile Sheet renders instead of the desktop
    // Dialog. Defaults to the app-wide `md` (767); the dashboard splits on
    // `lg`, so dashboard call sites pass 1023.
    breakpoint?: number;
}

export const CreateServiceModal = ({ businessId, isOpen, onClose, onSuccess, categoryOptions, breakpoint = MOBILE_MAX }: CreateServiceModalProps) => {
    const isMobile = useIsMobile(breakpoint);
    // Form State
    const [serviceName, setServiceName] = useState('');
    const [serviceDescription, setServiceDescription] = useState('');
    const [servicePrice, setServicePrice] = useState('');
    const [homeServicePrice, setHomeServicePrice] = useState('');
    const [serviceDuration, setServiceDuration] = useState('');
    const [bufferTime, setBufferTime] = useState('10');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [deliveryType, setDeliveryType] = useState<'in_location_only' | 'home_service' | 'both'>('in_location_only');
    const [serviceRadius, setServiceRadius] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [serviceImage, setServiceImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const resetForm = () => {
        setServiceName('');
        setServiceDescription('');
        setServicePrice('');
        setHomeServicePrice('');
        setServiceDuration('');
        setBufferTime('10');
        setSelectedCategory('');
        setDeliveryType('in_location_only');
        setServiceRadius('');
        setServiceImage(null);
        setImagePreview(null);
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const validationError = validateImageFile(file);
        if (validationError) {
            toaster.create({ title: "Invalid File", description: validationError, type: "error" });
            return;
        }

        setServiceImage(file);
        const reader = new FileReader();
        reader.onloadend = () => setImagePreview(reader.result as string);
        reader.readAsDataURL(file);
    };

    const handleRemoveImage = () => {
        setServiceImage(null);
        setImagePreview(null);
    };

    const handleAddService = async () => {
        if (!businessId) {
            toaster.create({ title: "Session Error", description: "Business ID missing.", type: "error" });
            return;
        }
        if (!serviceName || !serviceDescription || !serviceDuration || !selectedCategory) {
            toaster.create({ title: "Validation Error", description: "Please fill all required fields", type: "error" });
            return;
        }

        if ((deliveryType === 'in_location_only' || deliveryType === 'both') && !servicePrice) {
            toaster.create({ title: "Validation Error", description: "On-site service price is required", type: "error" });
            return;
        }
        if ((deliveryType === 'home_service' || deliveryType === 'both') && !homeServicePrice) {
            toaster.create({ title: "Validation Error", description: "Home service price is required", type: "error" });
            return;
        }
        if ((deliveryType === 'home_service' || deliveryType === 'both') && !serviceRadius) {
            toaster.create({ title: "Validation Error", description: "Service radius is required for home service", type: "error" });
            return;
        }

        const durationNum = parseInt(serviceDuration);
        if (durationNum < 15 || durationNum > 240) {
            toaster.create({ title: "Validation Error", description: "Duration must be between 15 and 240 minutes", type: "error" });
            return;
        }

        setIsSubmitting(true);
        try {
            const payload: CreateServiceDto = {
                name: serviceName,
                description: serviceDescription,
                categoryId: selectedCategory,
                price: parseFloat(servicePrice),
                duration: parseInt(serviceDuration),
                deliveryType: deliveryType,
                bufferTime: bufferTime ? parseInt(bufferTime) : 15,
            };

            if (deliveryType === 'home_service' || deliveryType === 'both') {
                payload.homeServicePrice = parseFloat(homeServicePrice);
                payload.maxServiceRadius = parseFloat(serviceRadius);
            }

            const newService = await businessService.createService(businessId, payload);

            if (serviceImage && newService.id) {
                try {
                    await businessService.uploadImage(businessId, serviceImage, false, `Service: ${serviceName}`, 'services', newService.id);
                } catch (error) {
                    const err = error as { response?: { data?: { message?: string } } };
                    const errorMessage = err.response?.data?.message || "Service was created but image upload failed. You can upload it later.";
                    toaster.create({
                        title: "Service Created",
                        description: errorMessage,
                        type: "warning"
                    });
                }
            }

            onSuccess(newService);
            toaster.create({ title: "Service Added", type: "success" });
            resetForm();
            onClose();
        } catch (error) {
            const err = error as { response?: { data?: { message?: string } } };
            toaster.create({
                title: "Failed to add service",
                description: err.response?.data?.message || "Please try again.",
                type: "error"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const fields = (
        <>
        {/* Category */}
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

        {/* Service Name */}
        <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-400">Service Name</Label>
            <Input
                placeholder="e.g. Full Body Massage"
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
                className="h-[56px] rounded-lg border-gray-200 bg-white"
            />
        </div>

        {/* Description */}
        <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-400">Service Description</Label>
            <textarea
                placeholder="Enter service description"
                value={serviceDescription}
                onChange={(e) => setServiceDescription(e.target.value)}
                className="min-h-[100px] w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-base text-gray-900 placeholder:text-gray-300 focus:border-[#E59622] focus:ring-1 focus:ring-[#E59622] transition-all outline-none resize-none"
            />
        </div>

        {/* Duration + Buffer */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                        { label: '150min', value: '150' },
                        { label: '180min', value: '180' },
                        { label: '210min', value: '210' },
                        { label: '240min', value: '240' },
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
                        { label: '20min', value: '20' },
                        { label: '30min', value: '30' },
                        { label: '45min', value: '45' },
                        { label: '60min', value: '60' },
                    ]}
                    value={bufferTime}
                    onChange={(e) => setBufferTime(e.target.value)}
                    className="h-[56px] rounded-lg border-gray-200"
                />
            </div>
        </div>

        {/* Location & Price type */}
        <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-400">Location & Price</Label>
            <Select
                placeholder="On Site & Home Service"
                options={[
                    { label: 'On Site Only', value: 'in_location_only' },
                    { label: 'On Site & Home Service', value: 'both' },
                ]}
                value={deliveryType}
                onChange={(e) => setDeliveryType(e.target.value as 'in_location_only' | 'home_service' | 'both')}
                className="h-[56px] rounded-lg border-gray-200"
            />
        </div>

        {/* Prices */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-400">On Site Amount</Label>
                <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">₦</span>
                    <Input
                        type="number"
                        placeholder="7,000"
                        value={servicePrice}
                        disabled={deliveryType === 'home_service'}
                        onChange={(e) => setServicePrice(e.target.value)}
                        className="h-[56px] rounded-lg border-gray-200 pl-8 bg-white disabled:opacity-50"
                    />
                </div>
            </div>
            <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-400">Home Service Amount</Label>
                <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">₦</span>
                    <Input
                        type="number"
                        placeholder="15,000"
                        value={homeServicePrice}
                        disabled={deliveryType === 'in_location_only'}
                        onChange={(e) => setHomeServicePrice(e.target.value)}
                        className="h-[56px] rounded-lg border-gray-200 pl-8 bg-white disabled:opacity-50"
                    />
                </div>
            </div>
        </div>

        {/* Service Radius — only shown for home service */}
        {(deliveryType === 'home_service' || deliveryType === 'both') && (
            <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-400">Service Radius (km)</Label>
                <Input
                    type="number"
                    placeholder="10"
                    value={serviceRadius}
                    onChange={(e) => setServiceRadius(e.target.value)}
                    className="h-[56px] rounded-lg border-gray-200 bg-white"
                />
            </div>
        )}

        {/* Image Upload */}
        <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-400">Upload Image (Optional)</Label>
            {imagePreview ? (
                <div className="relative border-2 border-dashed border-gray-200 rounded-xl p-3 bg-white">
                    <Image
                        src={imagePreview}
                        alt="Service preview"
                        width={500}
                        height={300}
                        unoptimized
                        className="w-full h-44 object-cover rounded-lg"
                    />
                    <button
                        onClick={handleRemoveImage}
                        type="button"
                        className="absolute top-5 right-5 p-2.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>
            ) : (
                <label className="border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center gap-3 bg-white cursor-pointer hover:border-[#E59622] transition-colors">
                    <svg className="h-8 w-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm text-gray-400">Click to upload image</span>
                    <input type="file" accept={ACCEPTED_IMAGE_EXTENSIONS} onChange={handleImageChange} className="hidden" />
                </label>
            )}
        </div>
        </>
    );

    const actions = (
        <>
        <Button
            variant="outline"
            onClick={() => { resetForm(); onClose(); }}
            className="h-[52px] w-full sm:flex-1 rounded-lg border-gray-200 text-gray-500 font-bold text-base"
        >
            Cancel
        </Button>
        <Button
            onClick={handleAddService}
            disabled={isSubmitting}
            className="h-[52px] w-full sm:flex-1 rounded-lg bg-[#E59622] hover:bg-[#d48a1f] text-white font-bold text-base"
        >
            {isSubmitting ? "Creating..." : "Save Service"}
        </Button>
        </>
    );

    // Bottom Sheet below `breakpoint`, the original centered Dialog above it.
    // The desktop branch keeps the header/body/footer nested inside the same
    // `p-6` wrapper as before, so its padding, spacing and the footer's
    // negative-margin bleed are unchanged.
    return (
        <ResponsiveModal
            open={isOpen}
            onClose={handleClose}
            breakpoint={breakpoint}
            title="Add New Service"
            footer={isMobile ? <div className="flex flex-col gap-3">{actions}</div> : undefined}
            desktopContentClassName='bg-white sm:max-w-2xl rounded-2xl p-0 overflow-hidden border-none flex flex-col max-h-[calc(100vh-4rem)]'
        >
            {isMobile ? (
                <div className="px-4 pb-4 space-y-5">
                    <p className="text-xs font-normal text-gray-500">Add new services being offered by your business</p>
                    {fields}
                </div>
            ) : (
                <div className="p-6 flex flex-col flex-1 min-h-0">
                    <DialogHeader className="mb-6 shrink-0">
                        <DialogTitle className="text-xl font-bold text-gray-900">Add New Service</DialogTitle>
                        <p className="text-xs font-normal text-gray-500">Add new services being offered by your business</p>
                    </DialogHeader>

                    <div className="space-y-5 flex-1 min-h-0 overflow-y-auto">
                        {fields}
                    </div>

                    {/* Footer buttons */}
                    <div className="shrink-0 -mx-6 -mb-6 mt-6 p-6 bg-white border-t border-gray-100 flex flex-col sm:flex-row items-center gap-4">
                        {actions}
                    </div>
                </div>
            )}
        </ResponsiveModal>
    );
};
