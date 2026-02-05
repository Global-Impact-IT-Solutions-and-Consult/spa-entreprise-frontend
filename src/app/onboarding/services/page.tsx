'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiArrowLeft, FiArrowRight, FiPlus, FiTrash2, FiEdit2, FiClock, FiHome, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toaster } from "@/components/ui/toaster";
import { useOnboardingStore } from '@/store/onboarding.store';
import { businessService, CreateServiceDto } from '@/services/business.service';
import { cn } from '@/lib/utils';

// Refined Service Card Component
const ServiceCard = ({ service, categoryName, onDelete, onEdit }: any) => {
    return (
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm flex flex-col gap-4 relative">
            <div className="flex justify-between items-center">
                <span className="px-3 py-1 bg-gray-100 rounded-full text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                    {categoryName}
                </span>
                <div className="flex gap-2">
                    <button onClick={onEdit} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                        <FiEdit2 size={14} />
                    </button>
                    <button onClick={onDelete} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <FiTrash2 size={14} />
                    </button>
                </div>
            </div>

            <div className="flex flex-col gap-1">
                <div className="h-32 bg-gray-100 rounded-lg mb-3" />
                <h3 className="text-lg font-bold text-gray-900">{service.name}</h3>
                <p className="text-xs text-gray-400 leading-relaxed line-clamp-2">
                    {service.description || "Fully body therapeutic massage with essential oils for relaxation and pain relief."}
                </p>
            </div>

            <div className="grid grid-cols-2 gap-y-4 pt-4 border-t border-gray-50 mt-auto">
                <div className="flex items-center gap-2 text-gray-400">
                    <FiClock className="h-4 w-4" />
                    <span className="text-xs font-bold text-gray-800">{service.duration}min</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400 pl-4 border-l border-gray-50">
                    <span className="text-xs font-medium text-gray-400">Buffer</span>
                    <span className="text-xs font-bold text-gray-800">20min</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                    <FiHome className="h-4 w-4" />
                    <span className="text-xs font-medium text-gray-400">{service.deliveryType === 'home_service' ? 'Home Service' : 'On Site'}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400 pl-4 border-l border-gray-50">
                    {service.deliveryType === 'both' && (
                        <>
                            <FiHome className="h-4 w-4" />
                            <span className="text-xs font-medium text-gray-400">Home Service</span>
                        </>
                    )}
                </div>
                <div className="col-span-1">
                    <p className="text-lg font-bold text-gray-900 leading-none">₦{service.price.toLocaleString()}</p>
                </div>
                <div className="col-span-1 pl-4 border-l border-gray-50">
                    {service.deliveryType === 'both' && <p className="text-lg font-bold text-gray-900 leading-none">₦{service.price.toLocaleString()}</p>}
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
    const [currentPage, setCurrentPage] = useState(1);

    // Form State
    const [serviceName, setServiceName] = useState('');
    const [serviceDescription, setServiceDescription] = useState('');
    const [servicePrice, setServicePrice] = useState('');
    const [serviceDuration, setServiceDuration] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [deliveryType, setDeliveryType] = useState<'in_location_only' | 'home_service' | 'both'>('in_location_only');
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
                deliveryType: deliveryType
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

    const categoryOptions = categories.map(c => ({ label: c.name, value: c.id }));

    return (
        <div className="w-full max-w-[1100px]">
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8 md:p-12 min-h-[600px] flex flex-col">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Services</h1>
                        <p className="text-gray-500 font-medium">Create services you offer at your business</p>
                    </div>
                    <Button
                        onClick={() => setOpen(true)}
                        className="bg-[#E59622] hover:bg-[#d48a1f] text-white font-bold h-12 px-6 rounded-lg flex items-center gap-2"
                    >
                        <FiPlus className="h-5 w-5" />
                        Create Service
                    </Button>
                </div>

                {services.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center py-20 grayscale opacity-40">
                        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <FiPlus className="h-10 w-10 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">No services created yet</h3>
                        <p className="text-gray-500">Click the button above to add your first service</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
                            {services.map((service, index) => (
                                <ServiceCard
                                    key={index}
                                    service={service}
                                    categoryName={categories.find(c => c.id === service.categoryId)?.name || 'Service'}
                                    onDelete={() => removeService(index)}
                                    onEdit={() => toaster.create({ title: "Coming soon", description: "Edit functionality will be available in the dashboard." })}
                                />
                            ))}
                        </div>

                        {/* Pagination */}
                        <div className="mt-12 flex items-center justify-center gap-2 font-medium">
                            <button className="w-10 h-10 border border-gray-100 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-50 transition-colors">
                                <FiChevronLeft className="h-5 w-5" />
                            </button>
                            {[1, 2, 3, 4].map((page) => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={cn(
                                        "w-10 h-10 rounded-lg flex items-center justify-center transition-colors",
                                        currentPage === page ? "bg-[#FEF5E7] text-[#E59622] font-bold border border-[#FBEACF]" : "border border-gray-100 text-gray-500 hover:bg-gray-50"
                                    )}
                                >
                                    {page}
                                </button>
                            ))}
                            <button className="w-10 h-10 border border-gray-100 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-50 transition-colors">
                                <FiChevronRight className="h-5 w-5" />
                            </button>
                        </div>
                    </>
                )}
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
                    onClick={() => router.push('/onboarding/staff')}
                >
                    Continue
                    <FiArrowRight className="h-5 w-5" />
                </Button>
            </div>

            {/* Dialog for adding service */}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className='bg-white sm:max-w-2xl rounded-2xl p-0 overflow-hidden border-none h-[calc(100vh-4rem)]'>
                    <div className="p-8">
                        <DialogHeader className="mb-8">
                            <DialogTitle className="text-3xl font-bold text-gray-900">Add New Service</DialogTitle>
                            <p className="text-sm font-normal text-gray-500">Add new services being offered by your business</p>
                        </DialogHeader>

                        <div className="space-y-6 h-[calc(100vh-20rem)] overflow-y-auto">
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
                                    placeholder="spa, barbershop"
                                    value={serviceName}
                                    onChange={(e) => setServiceName(e.target.value)}
                                    className="h-[56px] rounded-lg border-gray-200 bg-white"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-400">Service Description</Label>
                                <Input
                                    placeholder="Enter service description"
                                    value={serviceDescription}
                                    onChange={(e) => setServiceDescription(e.target.value)}
                                    className="h-[56px] rounded-lg border-gray-200 bg-white"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-400">Duration</Label>
                                    <Select
                                        placeholder="60min"
                                        options={[
                                            { label: '30min', value: '30' },
                                            { label: '60min', value: '60' },
                                            { label: '90min', value: '90' },
                                        ]}
                                        value={serviceDuration}
                                        onChange={(e) => setServiceDuration(e.target.value)}
                                        className="h-[56px] rounded-lg border-gray-200"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-400">Buffer Time</Label>
                                    <Select
                                        placeholder="10min"
                                        options={[
                                            { label: '5min', value: '5' },
                                            { label: '10min', value: '10' },
                                            { label: '20min', value: '20' },
                                        ]}
                                        className="h-[56px] rounded-lg border-gray-200"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-400">Location & Price</Label>
                                <Select
                                    placeholder="On Site & Home Service"
                                    options={[
                                        { label: 'On Site Only', value: 'in_location_only' },
                                        { label: 'Home Service Only', value: 'home_service' },
                                        { label: 'On Site & Home Service', value: 'both' },
                                    ]}
                                    value={deliveryType}
                                    onChange={(e) => setDeliveryType(e.target.value as any)}
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
                                            className="h-[56px] rounded-lg border-gray-200 pl-8 bg-white"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-400">Upload Image</Label>
                                <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center gap-3 bg-white">
                                    <div className="flex items-center gap-2">
                                        <div className="w-10 h-10 border border-gray-200 rounded-lg flex items-center justify-center">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                                        </div>
                                        <span className="text-sm text-gray-400">Drag and Drop Here</span>
                                        <Button variant="secondary" className="h-10 px-6 rounded-full bg-gray-100 text-gray-600 font-medium">Choose file</Button>
                                    </div>
                                </div>
                                <p className="text-[10px] text-gray-400">PDF, JPG, PNG up to 10MB each    File Supported (PNG & JPGE)</p>
                            </div>
                        </div>

                        <div className="flex items-center justify-center gap-4 mt-10">
                            <Button
                                variant="outline"
                                onClick={() => setOpen(false)}
                                className="h-[56px] flex-1 rounded-lg border-gray-200 text-gray-500 font-bold text-lg"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleAddService}
                                disabled={isSubmitting}
                                className="h-[56px] flex-1 rounded-lg bg-[#E59622] hover:bg-[#d48a1f] text-white font-bold text-lg"
                            >
                                {isSubmitting ? "Creating..." : "Save Service"}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
