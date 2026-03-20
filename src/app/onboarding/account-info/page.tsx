'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiArrowLeft, FiArrowRight, FiCheck } from 'react-icons/fi';
import { Loader2, CreditCard } from 'lucide-react';

import { Button } from "@/components/ui/button";
import CustomInput from '@/components/ui/InputGroup';
import { Select } from "@/components/ui/select";
import { toaster } from "@/components/ui/toaster";
import { useOnboardingStore } from '@/store/onboarding.store';
import { businessService } from '@/services/business.service';

const NIGERIAN_BANKS = [
    { label: "Access Bank", value: "Access Bank" },
    { label: "Citibank", value: "Citibank" },
    { label: "Ecobank Nigeria", value: "Ecobank Nigeria" },
    { label: "Fidelity Bank Nigeria", value: "Fidelity Bank Nigeria" },
    { label: "First Bank of Nigeria", value: "First Bank of Nigeria" },
    { label: "First City Monument Bank", value: "First City Monument Bank" },
    { label: "Guaranty Trust Bank", value: "Guaranty Trust Bank" },
    { label: "Heritage Bank plc", value: "Heritage Bank plc" },
    { label: "Keystone Bank Limited", value: "Keystone Bank Limited" },
    { label: "Kuda Bank", value: "Kuda Bank" },
    { label: "Moniepoint MFB", value: "Moniepoint MFB" },
    { label: "OPay", value: "OPay" },
    { label: "Palmpay", value: "Palmpay" },
    { label: "Polaris Bank", value: "Polaris Bank" },
    { label: "Providus Bank PLC", value: "Providus Bank PLC" },
    { label: "Stanbic IBTC Bank Nigeria Limited", value: "Stanbic IBTC Bank Nigeria Limited" },
    { label: "Standard Chartered Bank", value: "Standard Chartered Bank" },
    { label: "Sterling Bank", value: "Sterling Bank" },
    { label: "Suntrust Bank Nigeria Limited", value: "Suntrust Bank Nigeria Limited" },
    { label: "Union Bank of Nigeria", value: "Union Bank of Nigeria" },
    { label: "United Bank for Africa", value: "United Bank for Africa" },
    { label: "Unity Bank plc", value: "Unity Bank plc" },
    { label: "Wema Bank", value: "Wema Bank" },
    { label: "Zenith Bank", value: "Zenith Bank" },
];

export default function AccountInfoPage() {
    const router = useRouter();
    const { businessId } = useOnboardingStore();
    
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        accountName: '',
        accountNumber: '',
        bankName: '',
        sortCode: '',
    });

    useEffect(() => {
        const loadPayoutInfo = async () => {
            if (!businessId) return;
            setIsLoading(true);
            try {
                const res = await businessService.getPayoutInfo(businessId);
                if (res?.payoutInfo) {
                    setFormData({
                        accountName: res.payoutInfo.accountName || '',
                        accountNumber: res.payoutInfo.accountNumber || '',
                        bankName: res.payoutInfo.bankName || '',
                        sortCode: res.payoutInfo.sortCode || '',
                    });
                }
            } catch (error) {
                console.error("Failed to load payout info", error);
            } finally {
                setIsLoading(false);
            }
        };

        loadPayoutInfo();
    }, [businessId]);

    const handleSaveOnly = async () => {
        if (!businessId) return;
        if (!formData.accountName || !formData.accountNumber || !formData.bankName) {
            toaster.create({ title: "Missing fields", description: "All fields are required.", type: "error" });
            return;
        }
        setIsSaving(true);
        try {
            await businessService.createOrUpdatePayoutInfo(businessId, {
                accountName: formData.accountName,
                accountNumber: formData.accountNumber,
                bankName: formData.bankName,
                sortCode: formData.sortCode,
            });
            toaster.create({ title: "Account details saved", type: "success" });
        } catch (error) {
            toaster.create({ title: "Failed to save", type: "error" });
        } finally {
            setIsSaving(false);
        }
    };

    const handleFinish = async () => {
        if (!businessId) return;

        if (!formData.accountName || !formData.accountNumber || !formData.bankName) {
            toaster.create({
                title: "Missing fields",
                description: "Account Name, Number and Bank Name are required.",
                type: "error"
            });
            return;
        }

        setIsSaving(true);
        try {
            await businessService.createOrUpdatePayoutInfo(businessId, {
                accountName: formData.accountName,
                accountNumber: formData.accountNumber,
                bankName: formData.bankName,
                sortCode: formData.sortCode,
            });

            toaster.create({
                title: "Onboarding Complete!",
                description: "Your business profile is set up. Waiting for admin approval.",
                type: "success"
            });
            
            router.push('/dashboard');
        } catch (error) {
            const err = error as { response?: { data?: { message?: string } } };
            toaster.create({
                title: "Failed to save details",
                description: err.response?.data?.message || "Please try again.",
                type: "error"
            });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 text-[#E59622] animate-spin" />
            </div>
        );
    }

    return (
        <div className="w-full max-w-[1100px]">
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8 md:p-12 min-h-[500px] flex flex-col items-center">
                <div className="w-full max-w-[600px]">
                    <div className="mb-10">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Add Account</h1>
                        <p className="text-gray-500 font-medium">Add your business account detal</p>
                    </div>

                    <div className="space-y-6">
                        <Select
                            label="Bank Name"
                            placeholder="Select you bank"
                            options={NIGERIAN_BANKS}
                            value={formData.bankName}
                            onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                            className="h-[56px] rounded-lg border-gray-400"
                        />

                        <CustomInput
                            label="Account Number"
                            placeholder="12345678"
                            value={formData.accountNumber}
                            onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                            className="h-[56px]"
                        />

                        <CustomInput
                            label="Account Name"
                            placeholder="John Doe"
                            value={formData.accountName}
                            onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                            className="h-[56px]"
                        />

                        <div className="pt-4">
                            <Button
                                onClick={handleSaveOnly}
                                disabled={isSaving}
                                className="w-full h-[56px] rounded-lg bg-[#E59622] text-lg font-bold hover:bg-[#d48a1f] transition-colors text-white"
                            >
                                {isSaving ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : "Save"}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-between mt-12">
                <Button
                    variant="outline"
                    className="h-[56px] px-10 border-gray-200 text-gray-500 font-bold rounded-lg flex items-center gap-2 hover:bg-gray-50"
                    onClick={() => router.back()}
                >
                    <FiArrowLeft className="h-5 w-5" />
                    Back
                </Button>
                <Button
                    className="h-[56px] rounded-lg bg-[#E59622] px-10 text-lg font-bold hover:bg-[#d48a1f] transition-colors text-white flex items-center gap-2"
                    onClick={handleFinish}
                    disabled={isSaving}
                >
                    {isSaving ? "Saving..." : "Finish & Submit"}
                    {!isSaving && <FiArrowRight className="h-5 w-5" />}
                </Button>
            </div>
        </div>
    );
}

// I need to import FiArrowRight since I used it in components below but didn't import it above yet.
// Re-writing the import section correctly.
