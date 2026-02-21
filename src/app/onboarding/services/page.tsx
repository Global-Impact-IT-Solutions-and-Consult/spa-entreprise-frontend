'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiArrowLeft, FiArrowRight, FiPlus, FiTrash2, FiEdit2, FiClock, FiHome, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import Image from 'next/image';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toaster } from "@/components/ui/toaster";
import { useOnboardingStore } from '@/store/onboarding.store';
import { businessService, CreateServiceDto, Service } from '@/services/business.service';
import { EditServiceModal } from '@/components/modules/services/EditServiceModal';
import { cn } from '@/lib/utils';
import { ConfirmModal } from "@/components/ui/confirm-modal";

interface ServiceCardProps {
    service: Service;
    categoryName: string;
    onDelete: () => void;
    onEdit: () => void;
}

const ServiceCard = ({ service, categoryName, onDelete, onEdit }: ServiceCardProps) => {
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
                <div className="h-32 bg-gray-100 rounded-lg mb-3 overflow-hidden flex items-center justify-center">
                    {service.imageUrl ? (
                        <img
                            src={service.imageUrl}
                            alt={service.name}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-gray-100" />
                    )}
                </div>
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
                    <span className="text-xs font-bold text-gray-800">{service.bufferTime || 10}min</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                    <FiHome className="h-4 w-4" />
                    <span className="text-xs font-medium text-gray-400">{service.deliveryType === 'HOME_SERVICE' ? 'Home Service' : service.deliveryType === 'BOTH' ? 'Both' : 'On Site'}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400 pl-4 border-l border-gray-50">
                    {service.deliveryType === 'BOTH' && (
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
                    {(service.deliveryType === 'BOTH' || service.deliveryType === 'HOME_SERVICE') && service.homeServicePrice && (
                        <p className="text-lg font-bold text-gray-900 leading-none">₦{service.homeServicePrice.toLocaleString()}</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default function ServicesPage() {
    const router = useRouter();
    const { businessId, businessInfo } = useOnboardingStore();
    const [open, setOpen] = useState(false);
    const [categories, setCategories] = useState<{ id: string, name: string }[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefetching, setIsRefetching] = useState(false);
    const [serviceToDelete, setServiceToDelete] = useState<string | null>(null);
    const [serviceToEdit, setServiceToEdit] = useState<Service | null>(null);

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
    const [serviceImage, setServiceImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    // Fetch services and categories
    useEffect(() => {
        const fetchData = async () => {
            if (!businessId) {
                toaster.create({ title: "Error", description: "Business ID not found", type: "error" });
                setIsLoading(false);
                return;
            }

            try {
                const [categoriesData, servicesData] = await Promise.all([
                    businessService.getServiceCategories(),
                    businessService.getServices(businessId)
                ]);

                // Filter categories based on the business type code from store
                const businessTypeCode = businessInfo.businessTypeCode?.toLowerCase();
                const filteredCategories = businessTypeCode
                    ? categoriesData.filter(cat =>
                        Array.isArray(cat.businessTypeCodes) && cat.businessTypeCodes.includes(businessTypeCode)
                    )
                    : categoriesData;

                // Fall back to all categories if filter produced nothing (e.g. mismatched codes)
                setCategories(filteredCategories.length > 0 ? filteredCategories : categoriesData);
                setServices(servicesData);
            } catch (error) {
                const err = error as { response?: { data?: { message?: string } } };
                console.error("Failed to fetch data", err);
                toaster.create({
                    title: "Error",
                    description: err.response?.data?.message || "Failed to load services",
                    type: "error"
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [businessId]);

    const refetchServices = async () => {
        if (!businessId) return;
        setIsRefetching(true);
        try {
            const servicesData = await businessService.getServices(businessId);
            setServices(servicesData);
        } catch {
            // Silently fail — services already visible
        } finally {
            setIsRefetching(false);
        }
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

        // Validate onsite service price if delivery type includes home service
        if ((deliveryType === 'IN_LOCATION_ONLY' || deliveryType === 'BOTH') && !servicePrice) {
            toaster.create({ title: "Validation Error", description: "Onsite service price is required", type: "error" });
            return;
        }

        // Validate home service price if delivery type includes home service
        if ((deliveryType === 'HOME_SERVICE' || deliveryType === 'BOTH') && !homeServicePrice) {
            toaster.create({ title: "Validation Error", description: "Home service price is required", type: "error" });
            return;
        }

        // Validate service radius if delivery type includes home service
        if ((deliveryType === 'HOME_SERVICE' || deliveryType === 'BOTH') && !serviceRadius) {
            toaster.create({ title: "Validation Error", description: "Service radius is required for home service", type: "error" });
            return;
        }

        // Validate duration range (15-240 minutes)
        const durationNum = parseInt(serviceDuration);
        if (durationNum < 15 || durationNum > 240) {
            toaster.create({ title: "Validation Error", description: "Duration must be between 15 and 240 minutes", type: "error" });
            return;
        }

        // Validate bufferTime max (60 minutes)
        const bufferTimeNum = bufferTime ? parseInt(bufferTime) : 15;
        if (bufferTimeNum > 60) {
            toaster.create({ title: "Validation Error", description: "Buffer time cannot exceed 60 minutes", type: "error" });
            return;
        }

        setIsSubmitting(true);
        // Build payload according to backend requirements (declare outside try for error logging)
        let payload: CreateServiceDto | null = null;
        try {
            payload = {
                name: serviceName,
                description: serviceDescription,
                categoryId: selectedCategory,
                price: parseFloat(servicePrice),
                duration: parseInt(serviceDuration),
                deliveryType: deliveryType,
            };

            // Add optional bufferTime (defaults to 15 on backend if not provided)
            if (bufferTime) {
                payload.bufferTime = parseInt(bufferTime);
            }

            // Add home service fields if delivery type includes home service
            if (deliveryType === 'HOME_SERVICE' || deliveryType === 'BOTH') {
                payload.homeServicePrice = parseFloat(homeServicePrice);
                payload.maxServiceRadius = parseFloat(serviceRadius);
            }

            // Log the payload being sent
            console.log('=== SERVICE CREATION REQUEST ===');
            console.log('Endpoint:', `/spas/${businessId}/services`);
            console.log('Payload:', JSON.stringify(payload, null, 2));
            console.log('Payload (raw):', payload);

            const newService = await businessService.createService(businessId, payload);

            // Log the response from backend
            console.log('=== SERVICE CREATION RESPONSE ===');
            console.log('Response:', JSON.stringify(newService, null, 2));
            console.log('Response (raw):', newService);

            if (serviceImage && newService.id) {
                try {
                    await businessService.uploadImage(
                        businessId,
                        serviceImage,
                        false, // isPrimary = false for service images
                        `Service: ${serviceName}`,
                        'services',
                        newService.id // Associate image with this specific service
                    );
                    console.log('Service image uploaded successfully');
                } catch (imageError) {
                    const imgErr = imageError as { response?: { data?: { message?: string } } };
                    console.error('Failed to upload service image:', imgErr);
                    // Don't fail the entire service creation if image upload fails
                    toaster.create({
                        title: "Service Created",
                        description: "Service was created but image upload failed. You can upload it later.",
                        type: "warning"
                    });
                }
            }

            setServices([...services, newService]);

            toaster.create({ title: "Service Added", type: "success" });
            setOpen(false);
            refetchServices();

            // Reset Form
            setServiceName('');
            setServiceDescription('');
            setServicePrice('');
            setHomeServicePrice('');
            setServiceDuration('');
            setBufferTime('10');
            setSelectedCategory('');
            setDeliveryType('IN_LOCATION_ONLY');
            setServiceRadius('');
            setServiceRadius('');
            setServiceImage(null);
            setImagePreview(null);

        } catch (error) {
            const err = error as { response?: { data?: { message?: string, errors?: { field: string; messages?: string[]; message?: string }[] }, status?: number } };
            // Log the error response with detailed information
            console.error('=== SERVICE CREATION ERROR ===');
            console.error('Error:', err);
            console.error('Error Response:', err.response?.data);
            console.error('Error Status:', err.response?.status);
            console.error('Error Message:', err.response?.data?.message);
            console.error('Validation Errors:', JSON.stringify(err.response?.data?.errors, null, 2));
            console.error('Payload that was sent:', payload ? JSON.stringify(payload, null, 2) : 'No payload');

            // Build detailed error message from validation errors
            let errorDescription = err.response?.data?.message || "Please try again.";
            if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
                const errorDetails = err.response.data.errors
                    .map((e: { field: string; messages?: string[]; message?: string }) => {
                        const field = e.field || 'unknown';
                        const messages = Array.isArray(e.messages)
                            ? e.messages.join(', ')
                            : e.message || 'Invalid value';
                        return `${field}: ${messages}`;
                    })
                    .join('; ');

                if (errorDetails) {
                    errorDescription = `${errorDescription} - ${errorDetails}`;
                }
            }

            toaster.create({
                description: errorDescription,
                type: "error"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteService = (serviceId: string) => {
        if (!businessId) return;
        setServiceToDelete(serviceId);
    };

    const confirmDelete = async () => {
        if (!businessId || !serviceToDelete) return;

        try {
            await businessService.deleteService(businessId, serviceToDelete);
            setServices(services.filter(s => s.id !== serviceToDelete));
            toaster.create({ title: "Service Deleted", type: "success" });
        } catch (error) {
            const err = error as { response?: { data?: { message?: string } } };
            toaster.create({
                title: "Failed to delete service",
                description: err.response?.data?.message || "Please try again.",
                type: "error"
            });
        } finally {
            setServiceToDelete(null);
        }
    };


    const categoryOptions = categories.map(c => ({ label: c.name, value: c.id }));

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                toaster.create({ title: "Invalid File", description: "Please select an image file (PNG, JPG, JPEG)", type: "error" });
                return;
            }
            // Validate file size (10MB)
            if (file.size > 10 * 1024 * 1024) {
                toaster.create({ title: "File Too Large", description: "Image must be less than 10MB", type: "error" });
                return;
            }
            setServiceImage(file);
            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = () => {
        setServiceImage(null);
        setImagePreview(null);
    };

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

                {isLoading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-gray-500">Loading services...</div>
                    </div>
                ) : services.length === 0 && !isRefetching ? (
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
                            {services.map((service) => (
                                <ServiceCard
                                    key={service.id}
                                    service={service}
                                    categoryName={categories.find(c => c.id === service.categoryId)?.name || service.category?.name || 'Service'}
                                    onDelete={() => handleDeleteService(service.id)}
                                    onEdit={() => setServiceToEdit(service)}
                                />
                            ))}
                            {isRefetching && (
                                <div className="h-64 bg-gray-100 rounded-xl animate-pulse" />
                            )}
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
            <Dialog open={open} onOpenChange={(isOpen) => {
                setOpen(isOpen);
                if (!isOpen) {
                    // Reset form when dialog closes
                    setServiceName('');
                    setServiceDescription('');
                    setServicePrice('');
                    setHomeServicePrice('');
                    setServiceDuration('');
                    setBufferTime('10');
                    setSelectedCategory('');
                    setDeliveryType('IN_LOCATION_ONLY');
                    setServiceRadius('');
                    setServiceImage(null);
                    setImagePreview(null);
                }
            }}>
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

                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-400">Location & Price</Label>
                                <Select
                                    placeholder="On Site & Home Service"
                                    options={[
                                        { label: 'On Site Only', value: 'IN_LOCATION_ONLY' },
                                        // { label: 'Home Service Only', value: 'HOME_SERVICE' },
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
                                            disabled={deliveryType === 'HOME_SERVICE'}
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

                            {(deliveryType === 'HOME_SERVICE' || deliveryType === 'BOTH') && (
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

                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-400">Upload Image (Optional)</Label>
                                {imagePreview ? (
                                    <div className="relative border-2 border-dashed border-gray-200 rounded-xl p-4 bg-white">
                                        <Image
                                            src={imagePreview}
                                            alt="Service preview"
                                            width={500}
                                            height={300}
                                            unoptimized
                                            className="w-full h-48 object-cover rounded-lg"
                                        />
                                        <button
                                            onClick={handleRemoveImage}
                                            className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                                            type="button"
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                                <line x1="6" y1="6" x2="18" y2="18"></line>
                                            </svg>
                                        </button>
                                    </div>
                                ) : (
                                    <label className="border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center gap-3 bg-white cursor-pointer hover:border-[#E59622] transition-colors">
                                        <div className="flex items-center gap-2">
                                            <div className="w-10 h-10 border border-gray-200 rounded-lg flex items-center justify-center">
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                                    <polyline points="17 8 12 3 7 8"></polyline>
                                                    <line x1="12" y1="3" x2="12" y2="15"></line>
                                                </svg>
                                            </div>
                                            <span className="text-sm text-gray-400">Drag and Drop Here</span>
                                            <span className="h-10 px-6 rounded-full bg-gray-100 text-gray-600 font-medium text-sm flex items-center">Choose file</span>
                                        </div>
                                        <input
                                            type="file"
                                            accept="image/png,image/jpeg,image/jpg"
                                            onChange={handleImageChange}
                                            className="hidden"
                                        />
                                    </label>
                                )}
                                <p className="text-[10px] text-gray-400">JPG, PNG up to 10MB each. File Supported (PNG & JPEG)</p>
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

            {/* Edit Service Modal */}
            {businessId && (
                <EditServiceModal
                    businessId={businessId}
                    service={serviceToEdit}
                    isOpen={!!serviceToEdit}
                    onClose={() => setServiceToEdit(null)}
                    onSuccess={(updatedService) => {
                        setServices(services.map(s => s.id === updatedService.id ? updatedService : s));
                    }}
                    categoryOptions={categoryOptions}
                />
            )}

            <ConfirmModal
                isOpen={!!serviceToDelete}
                title="Delete Service?"
                message="Are you sure you want to delete this service? This action cannot be undone."
                variant="danger"
                confirmLabel="Delete"
                onConfirm={confirmDelete}
                onCancel={() => setServiceToDelete(null)}
            />
        </div>
    );
}
