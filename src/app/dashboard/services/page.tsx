"use client";

import { useState, useEffect } from "react";
import { Plus, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth.store";
import { businessService, Service } from "@/services/business.service";
import { toaster } from "@/components/ui/toaster";
import { ServiceCard } from "@/components/modules/services/ServiceCard";
import { CreateServiceModal } from "@/components/modules/services/CreateServiceModal";
import { ConfirmModal } from "@/components/ui/confirm-modal";

export default function ManageServicesPage() {
    const { user } = useAuthStore();
    const businessId = user?.businesses?.[0]?.id;

    const [services, setServices] = useState<Service[]>([]);
    const [categories, setCategories] = useState<{ id: string, name: string }[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("All");
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [serviceToDelete, setServiceToDelete] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!businessId) return;

            try {
                const [categoriesData, servicesData] = await Promise.all([
                    businessService.getServiceCategories(),
                    businessService.getServices(businessId)
                ]);
                setCategories(categoriesData);
                setServices(servicesData);
            } catch (error) {
                const err = error as { response?: { data?: { message?: string } } };
                console.error("Failed to fetch services", err);
                toaster.create({
                    title: "Error",
                    description: "Failed to load services",
                    type: "error"
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [businessId]);

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
                title: "Error",
                description: err.response?.data?.message || "Failed to delete service",
                type: "error"
            });
        } finally {
            setServiceToDelete(null);
        }
    };

    const categoryOptions = categories.map(c => ({ label: c.name, value: c.id }));
    const tabs = ["All", ...categories.map(c => c.name)];

    const filteredServices = activeTab === "All"
        ? services
        : services.filter(s => categories.find(c => c.id === s.categoryId)?.name === activeTab);

    return (
        <div className="">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Manage Business Services</h1>
                    <p className="text-gray-500 mt-1">Create new service, edit exiting service or delete services</p>
                </div>
                <Button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-[#F59E0B] hover:bg-[#D97706] text-white gap-2 h-11 px-6 font-bold"
                >
                    <Plus className="h-5 w-5" />
                    Create Service
                </Button>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-8 border-b border-gray-200 overflow-x-auto no-scrollbar [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] mt-8">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={cn(
                            "pb-4 text-sm font-semibold transition-colors relative whitespace-nowrap",
                            activeTab === tab
                                ? "text-[#F59E0B]"
                                : "text-gray-400 hover:text-gray-600"
                        )}
                    >
                        {tab}
                        {activeTab === tab && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#F59E0B]" />
                        )}
                    </button>
                ))}
            </div>

            {/* Content Buffer Section */}
            <div className="space-y-6 mt-8">
                {/* Search & Filter */}
                <div className="flex gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                            placeholder="Search services..."
                            className="pl-12 h-12 bg-white border-gray-100 shadow-sm rounded-xl focus-visible:ring-[#F59E0B]"
                        />
                    </div>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-64 bg-gray-100 rounded-xl" />
                        ))}
                    </div>
                ) : filteredServices.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-gray-200 text-center">
                        <div className="p-4 bg-gray-50 rounded-full mb-4">
                            <Plus className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">No services found</h3>
                        <p className="text-gray-500">Add your first service to get started</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredServices.map((service) => (
                            <ServiceCard
                                key={service.id}
                                service={service}
                                categoryName={categories.find(c => c.id === service.categoryId)?.name || 'Service'}
                                onDelete={() => handleDeleteService(service.id)}
                                onEdit={() => toaster.create({ title: "Coming soon", description: "Edit functionality will be available shortly." })}
                            />
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {!isLoading && filteredServices.length > 0 && (
                    <div className="flex items-center justify-center gap-2 py-8">
                        <button className="p-2 rounded-lg border border-gray-100 text-gray-400 hover:bg-gray-50">
                            <ChevronLeft className="h-5 w-5" />
                        </button>
                        {[1, 2, 3, 4].map((page) => (
                            <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={cn(
                                    "h-10 w-10 rounded-lg border text-sm font-semibold transition-colors",
                                    page === currentPage
                                        ? "bg-amber-50 border-amber-200 text-amber-600"
                                        : "border-gray-100 text-gray-400 hover:bg-gray-50"
                                )}
                            >
                                {page}
                            </button>
                        ))}
                        <button className="p-2 rounded-lg border border-gray-100 text-gray-400 hover:bg-gray-50">
                            <ChevronRight className="h-5 w-5" />
                        </button>
                    </div>
                )}
            </div>

            {businessId && (
                <CreateServiceModal
                    businessId={businessId}
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                    onSuccess={(newService) => setServices([...services, newService])}
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
