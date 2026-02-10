"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import {
    CheckCircle2,
    MapPin,
    Save,
    ChevronDown,
    Image as ImageIcon,
    Plus,
    Trash2,
    Star,
    Loader2,
    Upload,
    X,
    ZoomIn,
    Settings,
    Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/store/auth.store";
import { cn } from "@/lib/utils";
import { businessService, BusinessImage } from "@/services/business.service";
import { toaster } from "@/components/ui/toaster";
import { ConfirmModal } from "@/components/ui/confirm-modal";

type TabType = "About" | "Gallery" | "Settings";

export default function BusinessProfilePage() {
    const { user } = useAuthStore();
    const business = user?.businesses?.[0];
    const businessId = business?.id;

    const [activeTab, setActiveTab] = useState<TabType>("About");
    const [allImages, setAllImages] = useState<BusinessImage[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoadingImages, setIsLoadingImages] = useState(false);
    const [lightboxImage, setLightboxImage] = useState<BusinessImage | null>(null);
    const [pendingFiles, setPendingFiles] = useState<File[]>([]);
    const [captionInput, setCaptionInput] = useState("");
    const [showCaptionModal, setShowCaptionModal] = useState(false);
    const [imageToDelete, setImageToDelete] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const galleryFileInputRef = useRef<HTMLInputElement>(null);

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
                email: (business as unknown as { email?: string }).email || "",
                address: business.addressRelation?.address || "",
                city: business.addressRelation?.city?.name || "",
                state: business.addressRelation?.state?.name || "",
                country: business.addressRelation?.country?.name || "Nigeria"
            });
        }
    }, [business]);

    // Single fetch for ALL images — used by both banner and gallery
    const fetchAllImages = useCallback(async (showLoading = true) => {
        if (!businessId) return;
        if (showLoading) setIsLoadingImages(true);
        try {
            const data = await businessService.getGalleryImages(businessId);
            setAllImages(data);
        } catch (error) {
            console.error("Failed to fetch images", error);
        } finally {
            setIsLoadingImages(false);
        }
    }, [businessId]);

    useEffect(() => {
        fetchAllImages();
    }, [fetchAllImages]);

    // Notify the layout avatar whenever primary image changes
    const dispatchAvatarUpdate = useCallback((url: string | null) => {
        window.dispatchEvent(new CustomEvent("primary-image-changed", { detail: { url } }));
    }, []);

    // Stage files and show caption modal
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        setPendingFiles(Array.from(files));
        setCaptionInput("");
        setShowCaptionModal(true);
        if (fileInputRef.current) fileInputRef.current.value = '';
        if (galleryFileInputRef.current) galleryFileInputRef.current.value = '';
    };

    // Upload with optional caption
    const handleConfirmUpload = async (caption?: string) => {
        if (!businessId || pendingFiles.length === 0) return;
        setShowCaptionModal(false);
        setIsUploading(true);
        try {
            for (let i = 0; i < pendingFiles.length; i++) {
                await businessService.uploadImage(businessId, pendingFiles[i], false, caption || undefined, 'gallery');
            }
            toaster.create({ title: `${pendingFiles.length} image(s) uploaded`, type: "success" });
            await fetchAllImages(false);
        } catch (error) {
            const err = error as { response?: { data?: { message?: string } } };
            toaster.create({
                title: "Upload Failed",
                description: err.response?.data?.message || "Failed to upload image. Please try again.",
                type: "error"
            });
        } finally {
            setIsUploading(false);
            setPendingFiles([]);
        }
    };

    const handleDeleteImage = async (imageId: string) => {
        if (!businessId) return;
        setImageToDelete(imageId);
    };

    const confirmDelete = async () => {
        if (!businessId || !imageToDelete) return;

        const deletedImage = allImages.find(img => img.id === imageToDelete);
        try {
            await businessService.deleteImage(businessId, imageToDelete);
            if (lightboxImage?.id === imageToDelete) setLightboxImage(null);
            toaster.create({ title: "Image Deleted", type: "success" });
            await fetchAllImages(false);
            // If deleted image was primary, update avatar
            if (deletedImage?.isPrimary) {
                const remaining = allImages.filter(img => img.id !== imageToDelete);
                dispatchAvatarUpdate(remaining[0]?.url || null);
            }
        } catch (error) {
            const err = error as { response?: { data?: { message?: string } } };
            toaster.create({ title: "Error", description: err.response?.data?.message || "Failed to delete image", type: "error" });
        } finally {
            setImageToDelete(null);
        }
    };

    const handleSetPrimary = async (imageId: string) => {
        if (!businessId) return;

        try {
            await businessService.setPrimaryImage(businessId, imageId);
            const updatedImages = allImages.map(img => ({
                ...img,
                isPrimary: img.id === imageId
            }));
            setAllImages(updatedImages);
            const newPrimary = updatedImages.find(img => img.id === imageId);
            if (newPrimary) dispatchAvatarUpdate(newPrimary.url);
            toaster.create({ title: "Primary Image Updated", type: "success" });
        } catch (error) {
            const err = error as { response?: { data?: { message?: string } } };
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

    // Derived data — banner shows max 3 images (1 primary + 2 others)
    const primaryImage = allImages.find(img => img.isPrimary) || allImages[0];
    const bannerOtherImages = allImages.filter(img => img.id !== primaryImage?.id).slice(0, 2);
    const totalImageCount = allImages.length;
    const hasMoreImages = totalImageCount > 3;

    // Group gallery images by category
    const groupedGallery = allImages.reduce((acc, img) => {
        const cat = img.category || "gallery";
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(img);
        return acc;
    }, {} as Record<string, BusinessImage[]>);

    const tabs: { label: TabType; icon: React.ReactNode }[] = [
        { label: "About", icon: <Info className="h-4 w-4" /> },
        { label: "Gallery", icon: <ImageIcon className="h-4 w-4" /> },
        { label: "Settings", icon: <Settings className="h-4 w-4" /> },
    ];

    const categoryLabels: Record<string, string> = {
        gallery: "Gallery",
        activities: "Activities",
        facilities: "Facilities",
        services: "Services",
    };

    return (
        <div className="animate-in fade-in duration-500">
            {/* Header / Banner Section */}
            <div className="space-y-4 mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Business</h1>
                        <p className="text-gray-500 mt-1">Manage Business profile</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Primary Image */}
                    <div className="lg:col-span-2 relative h-[500px] rounded-md overflow-hidden group border border-gray-100 bg-gray-50">
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

                    {/* Gallery Thumbnails — max 2 + upload button */}
                    <div className="grid grid-rows-2 gap-4">
                        {bannerOtherImages.map((img) => (
                            <div key={img.id} className="relative rounded-md overflow-hidden group border border-gray-100 bg-gray-50 h-[250px]">
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

                        {/* Upload / View More */}
                        <div
                            onClick={() => {
                                if (hasMoreImages) {
                                    setActiveTab("Gallery");
                                } else {
                                    fileInputRef.current?.click();
                                }
                            }}
                            className={cn(
                                "relative rounded-md overflow-hidden bg-white group cursor-pointer border-2 border-dashed border-gray-200 flex items-center justify-center transition-all hover:border-[#F59E0B] hover:bg-amber-50/30",
                                isUploading && "pointer-events-none opacity-50"
                            )}
                        >
                            <div className="text-center space-y-2">
                                {isUploading ? (
                                    <Loader2 className="h-8 w-8 text-amber-500 mx-auto animate-spin" />
                                ) : hasMoreImages ? (
                                    <>
                                        <ImageIcon className="h-8 w-8 text-gray-300 mx-auto group-hover:text-amber-500 transition-colors" />
                                        <p className="text-xs font-bold text-gray-400 group-hover:text-amber-600">
                                            View all {totalImageCount} photos
                                        </p>
                                    </>
                                ) : (
                                    <>
                                        <Plus className="h-8 w-8 text-gray-300 mx-auto group-hover:text-amber-500 transition-colors" />
                                        <p className="text-xs font-bold text-gray-400 group-hover:text-amber-600">
                                            {isUploading ? "Uploading..." : "Add More Photos"}
                                        </p>
                                    </>
                                )}
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileSelect}
                                accept="image/*"
                                multiple
                                className="hidden"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Business Info Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
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
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-8">
                <nav className="flex gap-1">
                    {tabs.map((tab) => (
                        <button
                            key={tab.label}
                            onClick={() => tab.label !== "Settings" && setActiveTab(tab.label)}
                            disabled={tab.label === "Settings"}
                            className={cn(
                                "flex items-center gap-2 px-6 py-3 text-sm font-bold transition-all relative",
                                activeTab === tab.label
                                    ? "text-[#F59E0B] border-b-2 border-[#F59E0B]"
                                    : tab.label === "Settings"
                                        ? "text-gray-300 cursor-not-allowed"
                                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                            )}
                        >
                            {tab.icon}
                            {tab.label}
                            {tab.label === "Gallery" && totalImageCount > 0 && (
                                <span className="text-[10px] bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded-full font-bold">{totalImageCount}</span>
                            )}
                            {tab.label === "Settings" && (
                                <span className="text-[10px] bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded-full font-bold">Soon</span>
                            )}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Tab Content */}
            {activeTab === "About" && (
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 md:p-12 space-y-12 animate-in fade-in duration-300 mb-8">
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
            )}

            {activeTab === "Gallery" && (
                <div className="space-y-8 animate-in fade-in duration-300 mb-8">
                    {/* Gallery Header */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <h3 className="text-2xl font-bold text-gray-900">Photo Gallery</h3>
                            <p className="text-gray-500 mt-1 text-sm">
                                Upload and manage all your business images. Set any image as your primary photo.
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button
                                onClick={() => galleryFileInputRef.current?.click()}
                                disabled={isUploading}
                                className="h-11 bg-[#F59E0B] hover:bg-[#D97706] text-white font-bold rounded-xl px-6 flex items-center gap-2"
                            >
                                {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                                Upload Photos
                            </Button>
                            <input
                                type="file"
                                ref={galleryFileInputRef}
                                onChange={handleFileSelect}
                                accept="image/*"
                                multiple
                                className="hidden"
                            />
                        </div>
                    </div>

                    {isLoadingImages ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-3">
                            <Loader2 className="h-8 w-8 text-[#F59E0B] animate-spin" />
                            <p className="text-sm text-gray-500 font-medium">Loading gallery...</p>
                        </div>
                    ) : allImages.length === 0 ? (
                        <div className="bg-white rounded-3xl border-2 border-dashed border-gray-200 p-16 flex flex-col items-center justify-center gap-4">
                            <div className="p-4 bg-amber-50 rounded-2xl">
                                <ImageIcon className="h-10 w-10 text-[#F59E0B]" />
                            </div>
                            <h4 className="text-lg font-bold text-gray-900">No gallery images yet</h4>
                            <p className="text-gray-500 text-sm text-center max-w-md">
                                Upload photos of your business to showcase your services, facilities, and activities to potential customers.
                            </p>
                            <Button
                                onClick={() => galleryFileInputRef.current?.click()}
                                className="mt-2 bg-[#F59E0B] hover:bg-[#D97706] text-white font-bold rounded-xl px-8 h-12"
                            >
                                <Upload className="h-4 w-4 mr-2" />
                                Upload Your First Photo
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-10">
                            {Object.entries(groupedGallery).map(([category, imgs]) => (
                                <div key={category} className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <h4 className="text-lg font-bold text-gray-900">
                                            {categoryLabels[category] || category}
                                        </h4>
                                        <span className="text-xs bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full font-bold">
                                            {imgs.length} photo{imgs.length !== 1 ? "s" : ""}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                        {imgs.map((img) => (
                                            <div
                                                key={img.id}
                                                className="relative aspect-square rounded-2xl overflow-hidden group border border-gray-100 bg-gray-50 cursor-pointer"
                                                onClick={() => setLightboxImage(img)}
                                            >
                                                <Image
                                                    src={img.url}
                                                    alt={img.caption || "Gallery image"}
                                                    width={300}
                                                    height={300}
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                />
                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
                                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <ZoomIn className="h-8 w-8 text-white drop-shadow-lg" />
                                                </div>
                                                {/* Primary badge */}
                                                {img.isPrimary && (
                                                    <div className="absolute top-2 left-2 flex items-center gap-1 bg-amber-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-sm">
                                                        <Star className="h-3 w-3 fill-current" />
                                                        Primary
                                                    </div>
                                                )}
                                                {/* Action buttons */}
                                                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {!img.isPrimary && (
                                                        <div className="group/btn relative">
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleSetPrimary(img.id);
                                                                }}
                                                                className="p-1.5 bg-white/90 backdrop-blur rounded-lg text-amber-500 hover:bg-amber-50 shadow-sm"
                                                            >
                                                                <Star className="h-3.5 w-3.5" />
                                                            </button>
                                                            <div className="absolute bottom-full right-0 mb-2 w-max px-2 py-1 bg-black/80 text-white text-[10px] font-bold rounded opacity-0 group-hover/btn:opacity-100 transition-opacity pointer-events-none">
                                                                Set as Primary
                                                            </div>
                                                        </div>
                                                    )}
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteImage(img.id);
                                                        }}
                                                        className="p-1.5 bg-white/90 backdrop-blur rounded-lg text-red-500 hover:bg-red-50 shadow-sm"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                                {img.caption && (
                                                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-3 pt-8">
                                                        <p className="text-white text-xs font-medium truncate">{img.caption}</p>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Caption Modal */}
            {showCaptionModal && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
                        <div className="space-y-1">
                            <h3 className="text-lg font-bold text-gray-900">Add Caption</h3>
                            <p className="text-sm text-gray-500">
                                {pendingFiles.length === 1
                                    ? "Add an optional caption for your photo"
                                    : `Add an optional caption for ${pendingFiles.length} photos`}
                            </p>
                        </div>
                        <textarea
                            value={captionInput}
                            onChange={(e) => setCaptionInput(e.target.value)}
                            className="w-full min-h-[100px] p-3 bg-gray-50 border-2 border-gray-100 focus:border-[#F59E0B] rounded-xl text-gray-900 font-medium outline-none transition-colors text-sm"
                            placeholder="e.g. Our relaxation lounge area..."
                            autoFocus
                        />
                        <div className="flex gap-3">
                            <Button
                                type="button"
                                onClick={() => handleConfirmUpload()}
                                className="flex-1 h-11 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl"
                            >
                                Skip
                            </Button>
                            <Button
                                type="button"
                                onClick={() => handleConfirmUpload(captionInput)}
                                className="flex-1 h-11 bg-[#F59E0B] hover:bg-[#D97706] text-white font-bold rounded-xl"
                            >
                                Upload
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={!!imageToDelete}
                title="Delete Image?"
                message="Are you sure you want to delete this image? This action cannot be undone."
                variant="danger"
                confirmLabel="Delete"
                onConfirm={confirmDelete}
                onCancel={() => setImageToDelete(null)}
            />

            {/* Lightbox Modal */}
            {lightboxImage && (
                <div
                    className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
                    onClick={() => setLightboxImage(null)}
                >
                    <div className="relative max-w-4xl h-full w-full">
                        <button
                            onClick={() => setLightboxImage(null)}
                            className="absolute top-0 right-0 p-2 text-white/80 hover:text-white transition-colors"
                        >
                            <X className="h-6 w-6" />
                        </button>
                        <Image
                            src={lightboxImage.url}
                            alt={lightboxImage.caption || "Gallery image"}
                            width={1200}
                            height={800}
                            className="w-full h-full object-contain rounded-2xl"
                            onClick={(e) => e.stopPropagation()}
                        />
                        {lightboxImage.caption && (
                            <div className="absolute bottom-4 inset-x-4 text-center">
                                <p className="text-white text-sm font-medium bg-black/40 backdrop-blur-md rounded-xl px-4 py-2 inline-block">
                                    {lightboxImage.caption}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
