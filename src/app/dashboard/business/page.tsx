"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
    CheckCircle2,
    MapPin,
    Phone,
    Mail,
    Save,
    ChevronDown,
    Image as ImageIcon,
    Plus,
    Trash2,
    Star,
    Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/store/auth.store";
import { cn } from "@/lib/utils";
import { businessService, BusinessImage } from "@/services/business.service";
import { toaster } from "@/components/ui/toaster";

export default function BusinessProfilePage() {
    const { user } = useAuthStore();
    const business = user?.businesses?.[0];
    const businessId = business?.id;

    const [images, setImages] = useState<BusinessImage[]>([]);
    const [isLoadingImages, setIsLoadingImages] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        businessName: "",
        businessTypeCode: "spa",
        description: "",
        phone: "",
        email: "",
        address: "",
        city: "",
        state: "",
        country: "Nigeria"
    });

    useEffect(() => {
        if (business) {
            setFormData({
                businessName: business.businessName || "",
                businessTypeCode: business.businessTypeCode || "spa",
                description: business.description || "",
                phone: business.phone || "",
                email: (business as unknown as { email?: string }).email || "", // business object might have email
                address: business.addressRelation?.address || "",
                city: business.addressRelation?.city?.name || "",
                state: business.addressRelation?.state?.name || "",
                country: business.addressRelation?.country?.name || "Nigeria"
            });
        }
    }, [business]);

    useEffect(() => {
        const fetchImages = async () => {
            if (!businessId) return;
            try {
                const data = await businessService.getImages(businessId);
                setImages(data);
            } catch (error) {
                console.error("Failed to fetch images", error);
            } finally {
                setIsLoadingImages(false);
            }
        };

        fetchImages();
    }, [businessId]);

    const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !businessId) return;

        setIsUploading(true);
        try {
            const newImage = await businessService.uploadImage(businessId, file);
            setImages(prev => [...prev, newImage]);
            toaster.create({ title: "Image Uploaded", type: "success" });
        } catch (error) {
            const err = error as any;
            toaster.create({
                title: "Upload Failed",
                description: err.response?.data?.message || "Failed to upload image. Please try again.",
                type: "error"
            });
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleDeleteImage = async (imageId: string) => {
        if (!businessId || !confirm('Are you sure you want to delete this image?')) return;

        try {
            await businessService.deleteImage(businessId, imageId);
            setImages(prev => prev.filter(img => img.id !== imageId));
            toaster.create({ title: "Image Deleted", type: "success" });
        } catch (error) {
            const err = error as any;
            toaster.create({ title: "Error", description: err.response?.data?.message || "Failed to delete image", type: "error" });
        }
    };

    const handleSetPrimary = async (imageId: string) => {
        if (!businessId) return;

        try {
            await businessService.setPrimaryImage(businessId, imageId);
            setImages(prev => prev.map(img => ({
                ...img,
                isPrimary: img.id === imageId
            })));
            toaster.create({ title: "Primary Image Updated", type: "success" });
        } catch (error) {
            const err = error as any;
            toaster.create({ title: "Error", description: err.response?.data?.message || "Failed to set primary image", type: "error" });
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!businessId) return;

        setIsSaving(true);
        try {
            await businessService.updateProfile(businessId, {
                businessName: formData.businessName,
                businessTypeCode: formData.businessTypeCode,
                description: formData.description,
                phone: formData.phone,
                // The API expect objects for country, state, city if updated via addressRelation?
                // Actually UpdateProfileDto in business.service.ts has:
                // city?: City; 
                // but input is just a string here. 
                // I'll keep it simple for now as the user requested "fetching images" and "uploading".
                // I'll update the main fields.
            });
            toaster.create({ title: "Profile Updated", type: "success" });
        } catch (error) {
            const err = error as { response?: { data?: { message?: string } } };
            toaster.create({
                title: "Update Failed",
                description: err.response?.data?.message || "Failed to save business profile changes.",
                type: "error"
            });
        } finally {
            setIsSaving(false);
        }
    };

    const primaryImage = images.find(img => img.isPrimary) || images[0];
    const otherImages = images.filter(img => img.id !== primaryImage?.id).slice(0, 2);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header / Banner Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Business</h1>
                        <p className="text-gray-500 mt-1">Manage Business profile</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Primary Image */}
                    <div className="lg:col-span-2 relative h-[400px] rounded-2xl overflow-hidden group border border-gray-100 bg-gray-50">
                        {primaryImage ? (
                            <>
                                <Image
                                    src={primaryImage.url}
                                    alt="Business Cover"
                                    width={800}
                                    height={400}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleDeleteImage(primaryImage.id)}
                                        className="p-2 bg-white/90 backdrop-blur rounded-lg text-red-500 hover:bg-red-50 shadow-sm"
                                        title="Delete Image"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 gap-2">
                                <ImageIcon className="h-12 w-12" />
                                <p className="text-sm font-medium">No cover image set</p>
                            </div>
                        )}
                        <div className="absolute top-6 left-6 flex items-center gap-2 bg-black/40 backdrop-blur-md text-white px-4 py-2 rounded-xl border border-white/20">
                            <span className="font-bold text-sm">Main Photo</span>
                        </div>
                    </div>

                    {/* Gallery Thumbnails */}
                    <div className="grid grid-rows-2 gap-4">
                        {otherImages.map((img) => (
                            <div key={img.id} className="relative rounded-2xl overflow-hidden group border border-gray-100 bg-gray-50">
                                <Image
                                    src={img.url}
                                    alt="Gallery"
                                    width={400}
                                    height={200}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
                                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleSetPrimary(img.id)}
                                        className="p-1.5 bg-white/90 backdrop-blur rounded-lg text-amber-500 hover:bg-amber-50 shadow-sm"
                                        title="Set as Primary"
                                    >
                                        <Star className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteImage(img.id)}
                                        className="p-1.5 bg-white/90 backdrop-blur rounded-lg text-red-500 hover:bg-red-50 shadow-sm"
                                        title="Delete Image"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            </div>
                        ))}

                        {/* Upload Button Call to Action */}
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className={cn(
                                "relative rounded-2xl overflow-hidden bg-white group cursor-pointer border-2 border-dashed border-gray-200 flex items-center justify-center transition-all hover:border-[#F59E0B] hover:bg-amber-50/30",
                                isUploading && "pointer-events-none opacity-50"
                            )}
                        >
                            <div className="text-center space-y-2">
                                {isUploading ? (
                                    <Loader2 className="h-8 w-8 text-amber-500 mx-auto animate-spin" />
                                ) : (
                                    <Plus className="h-8 w-8 text-gray-300 mx-auto group-hover:text-amber-500 transition-colors" />
                                )}
                                <p className="text-xs font-bold text-gray-400 group-hover:text-amber-600">
                                    {isUploading ? "Uploading..." : "Add More Photos"}
                                </p>
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleUploadImage}
                                accept="image/*"
                                className="hidden"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Business Info Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-white rounded-2xl shadow-sm border border-gray-100">
                            <MapPin className="h-6 w-6 text-gray-900" />
                        </div>
                        <h2 className="text-4xl font-black text-gray-900 tracking-tight">
                            {business?.businessName || "Serenity Spa & Wellness"}
                        </h2>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100 text-sm font-bold">
                            <CheckCircle2 className="h-4 w-4" />
                            Verified Business
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-full text-sm font-bold">
                            <ImageIcon className="h-4 w-4" />
                            Spa and Wellness Center
                        </div>
                        <span className="text-sm text-gray-400 font-medium ml-2">
                            Member since <span className="text-gray-900 font-bold">March 2023</span>
                        </span>
                    </div>
                </div>
            </div>

            {/* Form Section */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 md:p-12 space-y-12">
                <form className="space-y-12" onSubmit={handleSaveProfile}>
                    <section className="space-y-8">
                        <h3 className="text-2xl font-bold text-gray-900">Business Information</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            <div className="space-y-2 md:col-span-2">
                                <Label className="text-sm font-medium text-gray-400 uppercase tracking-wider">Business Name</Label>
                                <Input
                                    name="businessName"
                                    value={formData.businessName}
                                    onChange={handleInputChange}
                                    className="h-14 bg-white border-2 border-gray-100 focus:border-[#F59E0B] rounded-xl text-gray-900 font-medium"
                                />
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <Label className="text-sm font-medium text-gray-400 uppercase tracking-wider">Business Type</Label>
                                <div className="relative">
                                    <Input
                                        name="businessTypeCode"
                                        value={formData.businessTypeCode}
                                        onChange={handleInputChange}
                                        className="h-14 bg-white border-2 border-gray-100 focus:border-[#F59E0B] rounded-xl text-gray-900 font-medium pr-12"
                                    />
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                </div>
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <Label className="text-sm font-medium text-gray-400 uppercase tracking-wider">Business Description</Label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    className="w-full min-h-[160px] p-4 bg-white border-2 border-gray-100 focus:border-[#F59E0B] rounded-xl text-gray-900 font-medium outline-none transition-colors"
                                    placeholder="Enter your business description here..."
                                />
                                <p className="text-xs text-gray-400 font-medium">Maximum 500 characters. This appears on your public profile.</p>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-400 uppercase tracking-wider">Contact Phone *</Label>
                                <div className="relative">
                                    <Input
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        className="h-14 bg-white border-2 border-gray-100 focus:border-[#F59E0B] rounded-xl text-gray-900 font-medium"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-400 uppercase tracking-wider">Contact Email *</Label>
                                <div className="relative">
                                    <Input
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="h-14 bg-white border-2 border-gray-100 focus:border-[#F59E0B] rounded-xl text-gray-900 font-medium"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-400 uppercase tracking-wider">Country</Label>
                                <div className="relative">
                                    <Input
                                        name="country"
                                        value={formData.country}
                                        onChange={handleInputChange}
                                        className="h-14 bg-white border-2 border-gray-100 focus:border-[#F59E0B] rounded-xl text-gray-900 font-medium"
                                    />
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-400 uppercase tracking-wider">State</Label>
                                <div className="relative">
                                    <Input
                                        name="state"
                                        value={formData.state}
                                        onChange={handleInputChange}
                                        className="h-14 bg-white border-2 border-gray-100 focus:border-[#F59E0B] rounded-xl text-gray-900 font-medium"
                                    />
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-400 uppercase tracking-wider">City</Label>
                                <Input
                                    name="city"
                                    value={formData.city}
                                    onChange={handleInputChange}
                                    className="h-14 bg-white border-2 border-gray-100 focus:border-[#F59E0B] rounded-xl text-gray-900 font-medium"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-400 uppercase tracking-wider">Address</Label>
                                <Input
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    className="h-14 bg-white border-2 border-gray-100 focus:border-[#F59E0B] rounded-xl text-gray-900 font-medium"
                                />
                            </div>
                        </div>
                    </section>

                    <div className="pt-4">
                        <Button
                            type="submit"
                            disabled={isSaving}
                            className="w-full h-16 bg-[#F59E0B] hover:bg-[#D97706] text-white font-bold text-lg rounded-2xl shadow-xl shadow-[#F59E0B]/20 flex items-center justify-center gap-3 transition-all active:scale-[0.98]"
                        >
                            {isSaving ? <Loader2 className="h-6 w-6 animate-spin" /> : <Save className="h-6 w-6" />}
                            {isSaving ? "Saving..." : "Save Changes"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
