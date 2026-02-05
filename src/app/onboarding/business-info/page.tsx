'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiArrowRight } from 'react-icons/fi';

import { Button } from "@/components/ui/button";
import CustomInput from '@/components/ui/InputGroup';
import { Select } from '@/components/ui/select';
import { toaster } from "@/components/ui/toaster";
import { Label } from "@/components/ui/label";

import { useOnboardingStore } from '@/store/onboarding.store';
import { businessService } from '@/services/business.service';

const businessTypes = [
    { label: "Select business type", value: "" },
    { label: "Spa", value: "spa" },
    { label: "Salon", value: "salon" },
    { label: "Gym", value: "gym" },
    { label: "Wellness Center", value: "wellness_center" }
];

const countries = [
    { label: "Nigeria", value: "nigeria" },
];

const states = [
    { label: "Lagos", value: "lagos" },
    { label: "Abuja", value: "abuja" },
    { label: "Port Harcourt", value: "port_harcourt" }
];

export default function BusinessInfoPage() {
    const router = useRouter();
    const { businessInfo, setBusinessInfo, setBusinessId } = useOnboardingStore();
    const [isLoading, setIsLoading] = useState(false);

    // Local state for form inputs
    const [formData, setFormData] = useState({
        businessName: businessInfo.businessName || '',
        phone: businessInfo.phone || '',
        city: businessInfo.city || '',
        address: businessInfo.address || '',
        businessTypeCode: businessInfo.businessTypeCode || '',
        description: businessInfo.description || '',
        email: businessInfo.email || '',
        cacRegNo: (businessInfo as any).cacRegNo || '',
        country: (businessInfo as any).country || 'nigeria',
        state: (businessInfo as any).state || 'lagos',
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            // Validate inputs
            if (!formData.businessName || !formData.businessTypeCode || !formData.phone || !formData.address) {
                toaster.create({ title: "Validation Error", description: "Please fill all required fields", type: "error" });
                return;
            }

            // Call API
            const result = await businessService.register(formData as any);

            // Update Store
            setBusinessId(result.id);
            setBusinessInfo(formData);

            toaster.create({ title: "Success", description: "Business Information Saved", type: "success" });
            router.push('/onboarding/business-hours');
        } catch (error: any) {
            toaster.create({ title: "Error", description: error.response?.data?.message || "Failed to register business", type: "error" });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-[900px]">
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8 md:p-12">
                <div className="mb-10">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Add Business Information</h1>
                    <p className="text-gray-500 font-medium">Please fill in the correct information of your business</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    {/* Business Type */}
                    <div className="flex flex-col gap-1.5">
                        <Label className="text-sm font-medium text-gray-400">Business Type *</Label>
                        <Select
                            className="h-[56px] rounded-lg border-gray-200 focus:border-[#E59622] transition-colors"
                            options={businessTypes}
                            value={formData.businessTypeCode}
                            onChange={(e) => setFormData({ ...formData, businessTypeCode: e.target.value })}
                        />
                    </div>

                    {/* Business Name */}
                    <CustomInput
                        label="Business Name *"
                        placeholder="wellnesspro"
                        name="businessName"
                        value={formData.businessName}
                        onChange={handleInputChange}
                    />

                    {/* Phone Number */}
                    <CustomInput
                        label="Phone Number *"
                        placeholder="000 000 000"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                    />

                    {/* CAC Reg No */}
                    <CustomInput
                        label="CAC Reg No *"
                        placeholder="RC1254323"
                        name="cacRegNo"
                        value={formData.cacRegNo}
                        onChange={handleInputChange}
                    />

                    {/* Business Description */}
                    <div className="md:col-span-2 flex flex-col gap-1.5">
                        <Label className="text-sm font-medium text-gray-400">Business Description*</Label>
                        <textarea
                            name="description"
                            className="min-h-[120px] w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-base text-gray-900 placeholder:text-gray-300 focus:border-[#E59622] focus:ring-1 focus:ring-[#E59622] transition-all outline-none"
                            placeholder="A premium wellness center offering therapeutic massages, facial treatments, and holistic body therapies. Located in the heart of Lagos with certified therapists and relaxing ambiance."
                            value={formData.description}
                            onChange={handleInputChange}
                        />
                    </div>

                    {/* Country */}
                    <div className="flex flex-col gap-1.5">
                        <Label className="text-sm font-medium text-gray-400">Country*</Label>
                        <Select
                            className="h-[56px] rounded-lg border-gray-200 focus:border-[#E59622]"
                            options={countries}
                            value={formData.country}
                            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                        />
                    </div>

                    {/* State */}
                    <div className="flex flex-col gap-1.5">
                        <Label className="text-sm font-medium text-gray-400">State*</Label>
                        <Select
                            className="h-[56px] rounded-lg border-gray-200 focus:border-[#E59622]"
                            options={states}
                            value={formData.state}
                            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        />
                    </div>

                    {/* City */}
                    <CustomInput
                        label="City"
                        placeholder="IKEJA"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                    />

                    {/* Address */}
                    <CustomInput
                        label="Address"
                        placeholder="No. 82 Yaya Abatan Rd, College Rd, Ogba"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                    />
                </div>
            </div>

            <div className="flex justify-end mt-12">
                <Button
                    className="h-[60px] rounded-lg bg-[#E59622] px-10 text-lg font-bold hover:bg-[#d48a1f] transition-colors text-white flex items-center gap-2"
                    onClick={handleSubmit}
                    disabled={isLoading}
                >
                    {isLoading ? "Saving..." : "Continue"}
                    {!isLoading && <FiArrowRight className="h-5 w-5" />}
                </Button>
            </div>
        </div>
    );
}
