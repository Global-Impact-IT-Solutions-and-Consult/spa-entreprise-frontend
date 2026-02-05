'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FiUpload, FiBriefcase, FiMapPin, FiPhone, FiArrowLeft, FiArrowRight } from 'react-icons/fi';

import { Button } from "@/components/ui/button";
import CustomInput from '@/components/ui/InputGroup';
import { Select } from '@/components/ui/select';
import { toaster } from "@/components/ui/toaster";
import { Label } from "@/components/ui/label";

import { useOnboardingStore } from '@/store/onboarding.store';
import { businessService } from '@/services/business.service';

const businessTypes = [
    { label: "Spa", value: "spa" },
    { label: "Salon", value: "salon" },
    { label: "Gym", value: "gym" }
];

export default function BusinessInfoPage() {
    const router = useRouter();
    const { businessInfo, setBusinessInfo, setBusinessId } = useOnboardingStore();
    const [isLoading, setIsLoading] = useState(false);

    // File Upload State
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Local state for form inputs
    const [formData, setFormData] = useState({
        businessName: businessInfo.businessName || '',
        phone: businessInfo.phone || '',
        city: businessInfo.city || 'Abuja',
        address: businessInfo.address || '',
        businessTypeCode: businessInfo.businessTypeCode || '',
        description: businessInfo.description || '',
        email: businessInfo.email || ''
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toaster.create({ title: "File too large", description: "Maximum size is 5MB", type: "error" });
                return;
            }
            setSelectedFile(file);
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        }
    };

    const triggerFileSelect = () => {
        fileInputRef.current?.click();
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            // Validate inputs
            if (!formData.businessName || !formData.businessTypeCode) {
                toaster.create({ title: "Validation Error", description: "Business Name and Type are required", type: "error" });
                return;
            }

            // Call API
            const result = await businessService.register(formData as any);

            // Update Store
            setBusinessId(result.id);
            setBusinessInfo(formData);

            // Upload Logo if selected
            if (selectedFile) {
                try {
                    await businessService.uploadImage(result.id, selectedFile, true);
                    toaster.create({ title: "Logo Uploaded", type: "success" });
                } catch (uploadError) {
                    console.error("Logo upload failed", uploadError);
                    toaster.create({ title: "Warning", description: "Business created but logo upload failed.", type: "warning" });
                }
            }

            toaster.create({ title: "Success", description: "Business Info Saved", type: "success" });
            router.push('/onboarding/business-hours');
        } catch (error: any) {
            toaster.create({ title: "Error", description: error.response?.data?.message || "Failed to register business", type: "error" });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="mx-auto max-w-2xl px-4 py-10">
            <div className="mb-8 text-center md:text-left">
                <h1 className="mb-2 text-2xl font-bold text-gray-800">Business Info</h1>
                <p className="text-gray-500">Fill correct business information here</p>
            </div>

            <div className="mb-10 flex flex-col gap-5">
                {/* Business Type */}
                <div className="flex flex-col gap-2">
                    <Label>Business Type *</Label>
                    <Select
                        className="h-10 text-base md:text-sm"
                        placeholder="Select Business Type"
                        options={businessTypes}
                        value={formData.businessTypeCode}
                        onChange={(e) => setFormData({ ...formData, businessTypeCode: e.target.value })}
                    />
                </div>

                {/* Business Name */}
                <CustomInput
                    label="Business Name"
                    placeholder="ZTX Spar LTD"
                    leftIcon={FiBriefcase}
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleInputChange}
                />

                {/* Phone Number */}
                <CustomInput
                    label="Phone Number"
                    placeholder="000 000 00 00"
                    type="tel"
                    leftIcon={FiPhone}
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                />

                {/* Email */}
                <CustomInput
                    label="Business Email"
                    placeholder="contact@business.com"
                    leftIcon={FiBriefcase}
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                />

                {/* Business Location */}
                <CustomInput
                    label="Business Address"
                    placeholder="No. 5 Block Street, Wuse zone 5, Abuja Nigeria"
                    leftIcon={FiMapPin}
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                />

                {/* Upload Logo */}
                <div className="flex flex-col gap-2">
                    <Label>Upload Logo (Optional)</Label>
                    <input
                        type="file"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        accept="image/png, image/jpeg"
                        onChange={handleFileSelect}
                    />
                    <div
                        className="flex w-full cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 p-8 text-center transition-colors hover:bg-gray-50 hover:border-teal-500"
                        onClick={triggerFileSelect}
                    >
                        {previewUrl ? (
                            <div className="flex flex-col items-center gap-4">
                                <div className="relative h-[150px] w-[150px] overflow-hidden rounded-md">
                                    <img
                                        src={previewUrl}
                                        alt="Logo Preview"
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    className="rounded-full px-5"
                                    onClick={(e) => { e.stopPropagation(); triggerFileSelect(); }}
                                >
                                    Change file
                                </Button>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-2">
                                <FiUpload className="h-8 w-8 text-gray-400" />
                                <div>
                                    <p className="text-base font-bold text-gray-600">Drag and Drop Here</p>
                                    <p className="text-xs text-gray-400">File Supported (PNG & JPEG)</p>
                                </div>
                                <Button size="sm" variant="secondary" className="rounded-full px-5 pointer-events-none">
                                    Choose file
                                </Button>
                                <p className="text-xs text-gray-400">Maximum Size 5MB</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex justify-between mt-8">
                <Button variant="outline" className="rounded-full px-8 text-gray-400" disabled>
                    <FiArrowLeft className="mr-2" /> Back
                </Button>

                <Button
                    className="rounded-full bg-[#2D5B5E] px-8 hover:bg-[#254E50]"
                    size="lg"
                    onClick={handleSubmit}
                    disabled={isLoading}
                >
                    {isLoading ? "Saving..." : (
                        <>
                            Continue <FiArrowRight className="ml-2" />
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}
