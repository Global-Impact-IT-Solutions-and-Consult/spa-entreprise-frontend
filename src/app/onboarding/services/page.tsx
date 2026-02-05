'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiArrowLeft, FiArrowRight, FiPlus, FiTrash2 } from 'react-icons/fi';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toaster } from "@/components/ui/toaster";
import { useOnboardingStore } from '@/store/onboarding.store';
import { businessService, CreateServiceDto } from '@/services/business.service';

// Inline Service Component
const OnboardingServiceCard = ({ title, price, duration, categoryName, onDelete }: any) => {
    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-2">
                <div>
                    <h3 className="text-md font-bold text-gray-900 mb-1">{title}</h3>
                    <p className="text-xs text-gray-500">{categoryName}</p>
                </div>
                <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">₦{price.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">{duration} mins</p>
                </div>
            </div>

            <div className="flex justify-end items-center pt-4 border-t border-gray-100 mt-4">
                <div className="flex gap-3">
                    <button onClick={onDelete} className="text-red-500 hover:text-red-700 transition-colors">
                        <FiTrash2 size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default function ServicesPage() {
    const router = useRouter();
    const { businessId, services, addService, removeService } = useOnboardingStore();
    const [open, setOpen] = useState(false);
    const [categories, setCategories] = useState<{ id: string, name: string }[]>([]);

    // Form State
    const [serviceName, setServiceName] = useState('');
    const [serviceDescription, setServiceDescription] = useState('');
    const [servicePrice, setServicePrice] = useState('');
    const [serviceDuration, setServiceDuration] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await businessService.getServiceCategories();
                setCategories(data);
            } catch (error) {
                console.error("Failed to fetch categories", error);
            }
        };
        fetchCategories();
    }, []);

    const handleAddService = async () => {
        if (!businessId) {
            toaster.create({ title: "Session Error", description: "Business ID missing.", type: "error" });
            return;
        }
        if (!serviceName || !servicePrice || !serviceDuration || !selectedCategory) {
            toaster.create({ title: "Validation Error", description: "Please fill all required fields", type: "error" });
            return;
        }

        setIsSubmitting(true);
        try {
            const payload: CreateServiceDto = {
                name: serviceName,
                description: serviceDescription || "No description provided",
                categoryId: selectedCategory,
                price: parseFloat(servicePrice),
                duration: parseInt(serviceDuration),
                deliveryType: 'in_location_only'
            };

            await businessService.createService(businessId, payload);

            addService(payload);

            toaster.create({ title: "Service Added", type: "success" });
            setOpen(false);

            // Reset Form
            setServiceName('');
            setServiceDescription('');
            setServicePrice('');
            setServiceDuration('');
            setSelectedCategory('');

        } catch (error: any) {
            toaster.create({
                title: "Failed to add service",
                description: error.response?.data?.message || "Please try again.",
                type: "error"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCompleteOnboarding = () => {
        toaster.create({ title: "Onboarding Complete!", description: "Welcome to your dashboard.", type: "success" });
        router.push('/dashboard');
    };

    const categoryOptions = categories.map(c => ({ label: c.name, value: c.id }));

    return (
        <div className="mx-auto max-w-4xl px-4 py-10">
            <div className="mb-8">
                <h1 className="mb-2 text-2xl font-bold text-gray-800">Services</h1>
                <p className="text-gray-500">Add relevant Services your business offer</p>
            </div>

            <div className="mb-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
                {services.map((service, index) => (
                    <OnboardingServiceCard
                        key={index}
                        title={service.name}
                        price={service.price}
                        duration={service.duration}
                        categoryName={categories.find(c => c.id === service.categoryId)?.name || 'Service'}
                        onDelete={() => removeService(index)}
                    />
                ))}

                {/* Add Custom Service Card (Trigger) */}
                <div
                    onClick={() => setOpen(true)}
                    className="flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 p-6 text-center transition-colors hover:bg-gray-50 hover:border-teal-500"
                >
                    <div className="flex flex-col items-center gap-2">
                        <div className="rounded-full bg-teal-100 p-3">
                            <FiPlus className="h-6 w-6 text-teal-700" />
                        </div>
                        <p className="font-bold text-gray-800">Add Service</p>
                        <p className="text-xs text-gray-500">Add a new service to your menu</p>
                    </div>
                </div>
            </div>

            {/* Dialog Component */}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className='bg-white'>
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-gray-800 text-center">Add a new service</DialogTitle>
                        <p className="text-center text-sm font-normal text-gray-500">Create tailored Services for your customers</p>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Category</Label>
                            <Select
                                placeholder="Select Category"
                                options={categoryOptions}
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Service Name</Label>
                            <Input
                                placeholder="e.g. Swedish Massage"
                                value={serviceName}
                                onChange={(e) => setServiceName(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Input
                                placeholder="Brief description"
                                value={serviceDescription}
                                onChange={(e) => setServiceDescription(e.target.value)}
                            />
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-1 space-y-2">
                                <Label>Duration (mins)</Label>
                                <Input
                                    type="number"
                                    placeholder="60"
                                    value={serviceDuration}
                                    onChange={(e) => setServiceDuration(e.target.value)}
                                />
                            </div>
                            <div className="flex-1 space-y-2">
                                <Label>Price (₦)</Label>
                                <Input
                                    type="number"
                                    placeholder="5000"
                                    value={servicePrice}
                                    onChange={(e) => setServicePrice(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="mt-6">
                        <Button
                            className="w-full rounded-full bg-[#2D5B5E] hover:bg-[#254E50]"
                            size="lg"
                            onClick={handleAddService}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Creating..." : "Create & Add Service"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <div className="flex justify-between mt-8">
                <Link href="/onboarding/business-hours">
                    <Button variant="outline" className="rounded-full px-8 text-gray-600">
                        <FiArrowLeft className="mr-2" /> Back
                    </Button>
                </Link>

                <Button
                    className="rounded-full bg-[#2D5B5E] px-8 hover:bg-[#254E50]"
                    size="lg"
                    onClick={handleCompleteOnboarding}
                >
                    Complete Onboarding <FiArrowRight className="ml-2" />
                </Button>
            </div>
        </div>
    );
}
