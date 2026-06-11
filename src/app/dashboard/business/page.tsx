"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import {
    Share2,
    CheckCircle2,
    Bell,
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
    Info,
    ChevronRight,
    Copy,
    Check,
    QrCode
} from "lucide-react";
import { Country, State, City, ICountry, IState, ICity } from 'country-state-city';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useAuthStore } from "@/store/auth.store";
import { cn } from "@/lib/utils";
import CustomInput from '@/components/ui/InputGroup';
import PhoneNumberInput from '@/components/ui/PhoneNumberInput';
import { businessService, BusinessImage } from "@/services/business.service";
import { authService } from "@/services/auth.service";
import { toaster } from "@/components/ui/toaster";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { ShareBusinessModal } from "@/components/modules/discovery/share-business-modal";
import { FaInfoCircle } from "react-icons/fa";
import { GoNumber } from "react-icons/go";
import { Tooltip } from "@/components/ui/tooltip";

type TabType = "About" | "Gallery" | "QR Code" | "Settings";

const businessTypeLabels: Record<string, string> = {
    spa: "Spa and Wellness Center",
    barbershop: "Barbershop",
    hair_salon: "Hair Salon",
    nail_salon: "Nail Salon",
    beauty_salon: "Beauty Salon",
    wellness_center: "Wellness Center",
    fitness_center: "Wellness Center",
    other: "Business"
};

const businessTypes = [
    { label: "Select business type", value: "" },
    { label: "SPA", value: "spa" },
    { label: "Barbershop", value: "barbershop" },
    { label: "Hair Salon", value: "hair_salon" },
    { label: "Nail Salon", value: "nail_salon" },
    { label: "Beauty Salon", value: "beauty_salon" },
    { label: "Wellness Center", value: "wellness_center" },
    { label: "Fitness Center", value: "fitness_center" },
    { label: "Other", value: "other" }
];

export default function BusinessProfilePage() {
    const { user, updateUser } = useAuthStore();
    const business = user?.businesses?.[0];
    const businessId = business?.id;

    const [activeTab, setActiveTab] = useState<TabType>("About");
    const [allImages, setAllImages] = useState<BusinessImage[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [isUploadingProfile, setIsUploadingProfile] = useState(false);
    const [isUploadingCover, setIsUploadingCover] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoadingImages, setIsLoadingImages] = useState(false);
    const [lightboxImage, setLightboxImage] = useState<BusinessImage | null>(null);
    const [pendingFiles, setPendingFiles] = useState<File[]>([]);
    const [businessUrl, setBusinessUrl] = useState('');
    const [captionInput, setCaptionInput] = useState("");
    const [showCaptionModal, setShowCaptionModal] = useState(false);
    const [imageToDelete, setImageToDelete] = useState<string | null>(null);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    // Dedicated profile & cover image state
    const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
    const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);
    const [isLoadingProfileImage, setIsLoadingProfileImage] = useState(true);
    const [isLoadingCoverImage, setIsLoadingCoverImage] = useState(true);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const galleryFileInputRef = useRef<HTMLInputElement>(null);
    const profileImageInputRef = useRef<HTMLInputElement>(null);
    const coverImageInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        businessName: "",
        businessTypeCode: "spa",
        description: "",
        phone: "",
        email: "",
        address: "",
        addressNote: "",
        facebookUrl: "",
        instagramUrl: "",
        twitterUrl: "",
    });

    // Address selection state
    const [selectedCountryCode, setSelectedCountryCode] = useState<string>('');
    const [selectedStateCode, setSelectedStateCode] = useState<string>('');
    const [selectedCityName, setSelectedCityName] = useState<string>('');
    const [selectedCountry, setSelectedCountry] = useState<ICountry | null>(null);
    const [selectedState, setSelectedState] = useState<IState | null>(null);
    const [selectedCity, setSelectedCity] = useState<ICity | null>(null);

    // Get all countries
    const allCountries = Country.getAllCountries();
    const countryOptions = allCountries.map(c => ({ label: c.name, value: c.isoCode }));

    // Get states and cities based on selection
    const states = selectedCountryCode ? State.getStatesOfCountry(selectedCountryCode) : [];
    const stateOptions = states.map(s => ({ label: s.name, value: s.isoCode }));

    const cities = (selectedCountryCode && selectedStateCode) ? City.getCitiesOfState(selectedCountryCode, selectedStateCode) : [];
    const cityOptions = cities.map(c => ({ label: c.name, value: c.name }));

    // Set the business URL client-side only to avoid SSR window access
    useEffect(() => {
        if (businessId) {
            setBusinessUrl(`${window.location.origin}/businesses/${business?.slug}`);
        }
    }, [businessId, business?.slug]);

    useEffect(() => {
        if (business) {
            const addressData = business.addressRelation;
            setFormData({
                businessName: business.businessName || "",
                businessTypeCode: business.businessTypeCode || "spa",
                description: business.description || "",
                phone: business.phone || "",
                email: (business as any).email || "",
                address: addressData?.address || "",
                addressNote: addressData?.note || "",
                facebookUrl: business.facebookUrl || "",
                instagramUrl: business.instagramUrl || "",
                twitterUrl: business.twitterUrl || "",
            });

            // Set address selections from database
            if (addressData?.country?.isoCode) {
                setSelectedCountryCode(addressData.country.isoCode);
                setSelectedCountry(addressData.country as unknown as ICountry);
            }
            if (addressData?.state?.isoCode) {
                setSelectedStateCode(addressData.state.isoCode);
                setSelectedState(addressData.state as unknown as IState);
            }
            if (addressData?.city?.name) {
                setSelectedCityName(addressData.city.name);
                setSelectedCity(addressData.city as unknown as ICity);
            }
        }
    }, [business]);

    // Handle country selection
    const handleCountryChange = (isoCode: string) => {
        setSelectedCountryCode(isoCode);
        const country = allCountries.find(c => c.isoCode === isoCode);
        setSelectedCountry(country || null);
        // Reset state and city when country changes
        setSelectedStateCode('');
        setSelectedState(null);
        setSelectedCityName('');
        setSelectedCity(null);
    };

    // Handle state selection
    const handleStateChange = (isoCode: string) => {
        setSelectedStateCode(isoCode);
        const state = states.find(s => s.isoCode === isoCode);
        setSelectedState(state || null);
        // Reset city when state changes
        setSelectedCityName('');
        setSelectedCity(null);
    };

    // Handle city selection
    const handleCityChange = (cityName: string) => {
        setSelectedCityName(cityName);
        const city = cities.find(c => c.name === cityName);
        setSelectedCity(city || null);
    };

    const handleOpenLive = () => {
        const businessLink = `${window.location.origin}/businesses/${business?.slug}`;
        window.open(businessLink, '_blank');
    };

    // Fetch profile & cover images from dedicated endpoints
    useEffect(() => {
        if (!businessId) return;
        businessService.getProfileImage(businessId)
            .then(res => setProfileImageUrl(res.profileImage))
            .catch(() => { })
            .finally(() => setIsLoadingProfileImage(false));
        businessService.getCoverImage(businessId)
            .then(res => setCoverImageUrl(res.coverImage))
            .catch(() => { })
            .finally(() => setIsLoadingCoverImage(false));
    }, [businessId, business?.slug]);

    // Single fetch for ALL gallery images
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

    // Upload profile image (small overlapping avatar)
    const handleProfileImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !businessId) return;
        setIsUploadingProfile(true);
        try {
            const res = await businessService.uploadProfileImage(businessId, file);
            setProfileImageUrl(res.profileImage);
            updateUser({ ...(user as any), businesses: [{ ...(user?.businesses || []), profileImage: res.profileImage }] as any });
            toaster.create({ title: 'Profile image updated', type: 'success' });
        } catch (error) {
            const err = error as { response?: { data?: { message?: string } } };
            toaster.create({ title: 'Upload failed', description: err.response?.data?.message || 'Could not upload profile image', type: 'error' });
        } finally {
            setIsUploadingProfile(false);
            if (profileImageInputRef.current) profileImageInputRef.current.value = '';
        }
    };

    // Upload cover image (big banner) — uses the dedicated POST /spas/{id}/cover-image endpoint
    const handleCoverImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !businessId) return;
        setIsUploadingCover(true);
        try {
            const res = await businessService.uploadCoverImage(businessId, file);
            setCoverImageUrl(res.coverImage);
            toaster.create({ title: 'Cover image updated', type: 'success' });
        } catch (error) {
            const err = error as { response?: { data?: { message?: string } } };
            toaster.create({ title: 'Upload failed', description: err.response?.data?.message || 'Could not upload cover image', type: 'error' });
        } finally {
            setIsUploadingCover(false);
            if (coverImageInputRef.current) coverImageInputRef.current.value = '';
        }
    };

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

        // Validate required fields
        if (!formData.businessName || !formData.businessTypeCode || !formData.phone || !formData.description || !formData.address) {
            toaster.create({ title: "Validation Error", description: "Please fill all required fields", type: "error" });
            return;
        }

        // Validate address fields
        if (!selectedCountry || !selectedState || !selectedCity) {
            toaster.create({ title: "Validation Error", description: "Please select country, state, and city", type: "error" });
            return;
        }

        setIsSaving(true);

        // Prepare address objects (same structure as onboarding)
        const countryObject = JSON.parse(JSON.stringify({
            name: selectedCountry.name,
            isoCode: selectedCountry.isoCode,
            flag: selectedCountry.flag,
            phonecode: selectedCountry.phonecode,
            currency: selectedCountry.currency,
            latitude: selectedCountry.latitude,
            longitude: selectedCountry.longitude,
            timezones: (selectedCountry as any).timezones || [],
        }));

        const stateObject = JSON.parse(JSON.stringify({
            name: selectedState.name,
            isoCode: selectedState.isoCode,
            countryCode: selectedState.countryCode,
            latitude: selectedState.latitude,
            longitude: selectedState.longitude,
        }));

        const cityObject = JSON.parse(JSON.stringify({
            name: selectedCity.name,
            countryCode: selectedCity.countryCode,
            stateCode: selectedCity.stateCode,
            latitude: selectedCity.latitude,
            longitude: selectedCity.longitude,
        }));

        try {
            await businessService.updateProfile(businessId, {
                businessName: formData.businessName,
                businessTypeCode: formData.businessTypeCode.toLowerCase(),
                description: formData.description,
                phone: formData.phone,
                country: countryObject,
                state: stateObject,
                city: cityObject,
                address: formData.address,
                addressNote: formData.addressNote,
                facebookUrl: formData.facebookUrl,
                instagramUrl: formData.instagramUrl,
                twitterUrl: formData.twitterUrl
            });

            // Refresh user data in store after profile update
            try {
                const refreshedUser = await authService.getCurrentUser();
                updateUser(refreshedUser);
            } catch (refreshError) {
                console.error("Failed to refresh user data after profile update", refreshError);
            }

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

    // Derived data — gallery images only (profile & cover are managed separately)
    const galleryImages = allImages;

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
        { label: "QR Code", icon: <QrCode className="h-4 w-4" /> },
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
            {/* Banner Section — Cover image with overlapping profile image */}
            <div className="relative mb-8">
                {/* Cover Image — clickable to upload */}
                <div
                    className="relative w-full h-[360px] rounded-2xl overflow-hidden bg-gray-100 cursor-pointer group"
                    onClick={() => coverImageInputRef.current?.click()}
                >
                    {isLoadingCoverImage ? (
                        /* Skeleton shimmer while fetching cover URL */
                        <div className="w-full h-full animate-pulse bg-gray-200" />
                    ) : coverImageUrl ? (
                        <Image
                            src={coverImageUrl}
                            alt="Business Cover"
                            fill
                            className="object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 gap-2">
                            <ImageIcon className="h-12 w-12" />
                            <p className="text-sm font-medium">Click to upload cover image</p>
                        </div>
                    )}

                    {/* Upload overlay — always visible while uploading, hover-only when idle */}
                    {!isLoadingCoverImage && (
                        <div className={`absolute inset-0 bg-black/30 transition-opacity flex items-center justify-center ${isUploadingCover ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                            {isUploadingCover ? (
                                <Loader2 className="h-8 w-8 text-white animate-spin" />
                            ) : (
                                <div className="flex flex-col items-center gap-1 text-white">
                                    <Upload className="h-7 w-7" />
                                    <span className="text-sm font-semibold">Change cover</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Overlay badges at bottom of cover */}
                    <div className="absolute bottom-4 left-[240px] md:left-[260px] flex items-center gap-3" onClick={e => e.stopPropagation()}>
                        {business?.status?.toLowerCase() == 'pending_approval' ? <div className="flex items-center gap-2 bg-[#F59E0B] text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg">
                            <FaInfoCircle className="h-4 w-4" />
                            Pending Approval
                        </div> : <div className="flex items-center gap-2 bg-[#3B82F6] text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg">
                            <CheckCircle2 className="h-4 w-4" />
                            Verified Business
                        </div>}
                        <div className="flex items-center gap-2 bg-white/90 backdrop-blur text-gray-700 px-4 py-2 rounded-lg text-sm font-medium shadow-lg">
                            <MapPin className="h-4 w-4 text-gray-500" />
                            {business?.addressRelation?.city?.name}, {business?.addressRelation?.state?.name}
                        </div>
                    </div>
                </div>

                {/* Profile Image — absolutely positioned, overlapping bottom-left, clickable to upload */}
                <div
                    className="absolute bottom-0 left-6 translate-y-1/2 w-[200px] h-[200px] rounded-2xl overflow-hidden border-4 border-white shadow-xl bg-gray-100 z-10 cursor-pointer group"
                    onClick={() => profileImageInputRef.current?.click()}
                >
                    {isLoadingProfileImage ? (
                        /* Skeleton shimmer while fetching profile URL */
                        <div className="w-full h-full animate-pulse bg-gray-200" />
                    ) : profileImageUrl ? (
                        <Image
                            src={profileImageUrl}
                            alt="Business Profile"
                            fill
                            className="object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <ImageIcon className="h-10 w-10" />
                        </div>
                    )}
                    {/* Upload overlay — always visible while uploading, hover-only when idle */}
                    {!isLoadingProfileImage && (
                        <div className={`absolute inset-0 bg-black/30 transition-opacity flex items-center justify-center ${isUploadingProfile ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                            {isUploadingProfile ? (
                                <Loader2 className="h-6 w-6 text-white animate-spin" />
                            ) : (
                                <Upload className="h-6 w-6 text-white" />
                            )}
                        </div>
                    )}
                </div>

                {/* Hidden file inputs */}
                <input type="file" ref={profileImageInputRef} onChange={handleProfileImageUpload} accept="image/*" className="hidden" />
                <input type="file" ref={coverImageInputRef} onChange={handleCoverImageUpload} accept="image/*" className="hidden" />
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept="image/*"
                    multiple
                    className="hidden"
                />
            </div>

            {/* Business Info — sits below cover, padded left to clear overlapping primary image */}
            <div className="flex items-end justify-between gap-6 mb-8 pl-[240px] pt-4">
                <div className="space-y-2">
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">
                        {business?.businessName}
                    </h2>

                    <div className="flex flex-wrap items-center gap-4 text-sm font-medium">
                        <div className="flex items-center gap-1.5">
                            <div className="flex items-center gap-0.5">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <Star
                                        key={i}
                                        className={`h-4 w-4 ${i <= Math.floor(Number(business?.averageRating) || 0)
                                            ? "fill-[#F59E0B] text-[#F59E0B]"
                                            : "text-gray-200"
                                            }`}
                                    />
                                ))}
                            </div>
                            <span className="text-gray-900 font-bold ml-1">{business?.rating?.average || "0.0"}</span>
                            <span className="text-gray-400 font-medium">({business?.rating?.totalReviews || 0} reviews)</span>
                        </div>

                        <div className="h-1 w-1 rounded-full bg-gray-300" />

                        <div className="flex items-center gap-2 text-gray-500">
                            <ImageIcon className="h-4 w-4" />
                            <span>{businessTypeLabels[business?.businessTypeCode || "spa"] || "Barbershop"}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                    <Tooltip content={business?.status?.toLocaleUpperCase() === 'PENDING_APPROVAL' ? "Available after verification is complete" : "View Public Profile"}>
                        <Button
                            variant="outline"
                            onClick={handleOpenLive}
                            disabled={business?.status?.toLocaleUpperCase() === 'PENDING_APPROVAL'}
                            className="h-11 px-6 rounded-md font-bold flex items-center gap-2 border-gray-200 hover:bg-gray-50 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <div className={cn(
                                "w-2 h-2 rounded-full",
                                business?.status?.toLocaleUpperCase() === 'PENDING_APPROVAL'
                                    ? "bg-gray-400"
                                    : "bg-green-500 animate-pulse"
                            )} />
                            Live
                        </Button>
                    </Tooltip>

                    <Tooltip content={business?.status?.toLocaleUpperCase() === 'PENDING_APPROVAL' ? "Available after verification is complete" : "Share Business Profile"}>
                        <Button
                            variant="outline"
                            disabled={business?.status?.toLocaleUpperCase() === 'PENDING_APPROVAL'}
                            onClick={() => setIsShareModalOpen(true)}
                            className="h-11 px-6 rounded-md font-bold flex items-center gap-2 border-gray-200 hover:bg-gray-50 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Share2 className="h-4 w-4" />
                            Share
                        </Button>
                    </Tooltip>
                </div>
            </div>

            {/* Tabs Navigation */}
            <div className="border-b border-gray-100 mb-8">
                <nav className="flex gap-8">
                    {tabs.filter(t => t.label !== "Settings").map((tab) => {
                        const isActive = activeTab === tab.label;
                        return (
                            <button
                                key={tab.label}
                                onClick={() => setActiveTab(tab.label)}
                                className={cn(
                                    "flex items-center gap-2 px-2 py-4 text-sm font-bold transition-all relative",
                                    isActive
                                        ? "text-[#F59E0B]"
                                        : "text-gray-400 hover:text-gray-600"
                                )}
                            >
                                {tab.icon}
                                {tab.label}
                                {isActive && (
                                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#F59E0B] rounded-t-full shadow-sm shadow-amber-200" />
                                )}
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* Tab Content */}
            {activeTab === "About" && (
                <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-10 space-y-10 animate-in fade-in duration-300 mb-8">
                    <form className="space-y-10" onSubmit={handleSaveProfile}>
                        <section className="space-y-8">
                            <h3 className="text-2xl font-bold text-gray-900">Business Information</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                <div className="md:col-span-2">
                                    <CustomInput
                                        label="Business Name"
                                        name="businessName"
                                        value={formData.businessName}
                                        onChange={handleInputChange}
                                        placeholder="Business Name"
                                        labelClassName="uppercase tracking-widest text-[11px] font-bold"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <div className="space-y-1.5 w-full">
                                        <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Business Type</Label>
                                        <Select
                                            className="h-[56px] bg-white border border-gray-200 focus:border-[#F59E0B] rounded-lg text-gray-900 font-medium"
                                            options={businessTypes}
                                            value={formData.businessTypeCode}
                                            onChange={(e) => setFormData({ ...formData, businessTypeCode: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="md:col-span-2">
                                    <div className="space-y-1.5 w-full">
                                        <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Business Description</Label>
                                        <textarea
                                            name="description"
                                            value={formData.description}
                                            onChange={handleInputChange}
                                            className="w-full min-h-[160px] p-4 bg-white border border-gray-200 focus:border-[#F59E0B] rounded-lg text-gray-900 font-medium outline-none transition-all focus:ring-1 focus:ring-[#F59E0B]"
                                            placeholder="Enter your business description here..."
                                        />
                                        <p className="text-[11px] text-gray-400 font-medium">Maximum 500 characters. This appears on your public profile.</p>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <PhoneNumberInput
                                        label="Contact Phone"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        required
                                        labelClassName="uppercase tracking-widest text-[11px] text-gray-400 font-bold"
                                    />
                                </div>

                                <CustomInput
                                    label="Contact Email *"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder="contact@business.com"
                                    labelClassName="uppercase tracking-widest text-[11px] font-bold"
                                />

                                <div className="space-y-1.5">
                                    <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Country *</Label>
                                    <Select
                                        className="h-[56px] bg-white border border-gray-200 focus:border-[#F59E0B] rounded-lg text-gray-900 font-medium"
                                        options={countryOptions}
                                        value={selectedCountryCode}
                                        onChange={(e) => handleCountryChange(e.target.value)}
                                        placeholder="Select a country"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">State *</Label>
                                    <Select
                                        className="h-[56px] bg-white border border-gray-200 focus:border-[#F59E0B] rounded-lg text-gray-900 font-medium"
                                        options={stateOptions}
                                        value={selectedStateCode}
                                        onChange={(e) => handleStateChange(e.target.value)}
                                        disabled={!selectedCountryCode}
                                        placeholder={selectedCountryCode ? "Select a state" : "Select country first"}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">City *</Label>
                                    <Select
                                        className="h-[56px] bg-white border border-gray-200 focus:border-[#F59E0B] rounded-lg text-gray-900 font-medium"
                                        options={cityOptions}
                                        value={selectedCityName}
                                        onChange={(e) => handleCityChange(e.target.value)}
                                        disabled={!selectedStateCode}
                                        placeholder={selectedStateCode ? "Select a city" : "Select state first"}
                                    />
                                </div>

                                <CustomInput
                                    label="Address *"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    placeholder="Street Address"
                                    labelClassName="uppercase tracking-widest text-[11px] font-bold"
                                />

                                <div className="md:col-span-2">
                                    <CustomInput
                                        label="Address Note (Optional)"
                                        name="addressNote"
                                        value={formData.addressNote}
                                        onChange={handleInputChange}
                                        placeholder="Address notes"
                                        labelClassName="uppercase tracking-widest text-[11px] font-bold"
                                    />
                                </div>
                            </div>
                        </section>

                        <section className="space-y-6">
                            <h3 className="text-xl font-bold text-gray-900">Business Socials</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <CustomInput
                                    label="Facebook URL"
                                    name="facebookUrl"
                                    value={formData.facebookUrl}
                                    onChange={handleInputChange}
                                    placeholder="https://facebook.com/..."
                                    labelClassName="uppercase tracking-widest text-[11px] font-bold"
                                />
                                <CustomInput
                                    label="Instagram URL"
                                    name="instagramUrl"
                                    value={formData.instagramUrl}
                                    onChange={handleInputChange}
                                    placeholder="https://instagram.com/..."
                                    labelClassName="uppercase tracking-widest text-[11px] font-bold"
                                />
                                <CustomInput
                                    label="X(Twitter) URL"
                                    name="twitterUrl"
                                    value={formData.twitterUrl}
                                    onChange={handleInputChange}
                                    placeholder="https://x.com/..."
                                    labelClassName="uppercase tracking-widest text-[11px] font-bold"
                                />
                            </div>
                        </section>

                        <div className="pt-4">
                            <Button
                                type="submit"
                                disabled={isSaving}
                                className="w-full h-14 bg-[#E8951E] hover:bg-[#D48616] text-white font-bold text-base rounded-lg flex items-center justify-center gap-3 transition-all active:scale-[0.99] shadow-md shadow-amber-100"
                            >
                                {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                                {isSaving ? "Saving..." : "Save Changes"}
                            </Button>
                        </div>
                    </form>
                </div>
            )}

            {activeTab === "Gallery" && (
                <div className="space-y-8 animate-in fade-in duration-300 mb-8">
                    {/* Gallery Header */}
                    <div className="flex items-center justify-between pb-4 border-b border-gray-50">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">Gallery</h3>
                        </div>
                        <Button
                            onClick={() => galleryFileInputRef.current?.click()}
                            disabled={isUploading}
                            className="h-11 bg-[#E8951E] hover:bg-[#D48616] text-white font-bold rounded-lg px-6 flex items-center gap-2 shadow-sm"
                        >
                            <Upload className="h-4 w-4" />
                            Upload image
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

                    {isLoadingImages ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-3">
                            <Loader2 className="h-8 w-8 text-[#F59E0B] animate-spin" />
                            <p className="text-sm text-gray-500 font-medium">Loading gallery...</p>
                        </div>
                    ) : allImages.length === 0 ? (
                        <div className="bg-white rounded-[2rem] border-2 border-dashed border-gray-100 p-16 flex flex-col items-center justify-center gap-4">
                            <div className="p-4 bg-amber-50 rounded-2xl">
                                <ImageIcon className="h-10 w-10 text-[#F59E0B]" />
                            </div>
                            <h4 className="text-lg font-bold text-gray-900">No gallery images yet</h4>
                            <p className="text-gray-500 text-sm text-center max-w-md">
                                Upload photos of your business to showcase your services, facilities, and activities.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {allImages.map((img) => (
                                <div
                                    key={img.id}
                                    className="relative aspect-square rounded-2xl overflow-hidden group border border-gray-100 bg-gray-50 cursor-pointer"
                                    onClick={() => setLightboxImage(img)}
                                >
                                    <Image
                                        src={img.url}
                                        alt={img.caption || "Gallery image"}
                                        fill
                                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />

                                    {/* Action buttons */}
                                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {!img.isPrimary && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleSetPrimary(img.id);
                                                }}
                                                className="p-1.5 bg-white/90 backdrop-blur rounded-lg text-amber-500 hover:bg-amber-50 shadow-sm"
                                                title="Set as Primary"
                                            >
                                                <Star className="h-3.5 w-3.5" />
                                            </button>
                                        )}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteImage(img.id);
                                            }}
                                            className="p-1.5 bg-white/90 backdrop-blur rounded-lg text-red-500 hover:bg-red-50 shadow-sm"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                    </div>

                                    {/* Primary badge */}
                                    {img.isPrimary && (
                                        <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-amber-500 text-white px-2 py-1 rounded-lg text-xs font-bold shadow-sm">
                                            <Star className="h-3 w-3 fill-white" />
                                            Primary
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {activeTab === "QR Code" && (
                <QrCodeDesignTab
                    business={business}
                    onUpdate={(updatedBusiness) => {
                        if (user && business) {
                            const updatedBusinesses = user.businesses
                                ? user.businesses.map(b => b.id === business.id ? { ...b, ...updatedBusiness } : b)
                                : [updatedBusiness];
                            updateUser({
                                business: user.business?.id === business.id ? { ...user.business, ...updatedBusiness } : user.business,
                                businesses: updatedBusinesses
                            });
                        }
                    }}
                />
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
                            className="absolute top-0 right-0 p-2 text-white/80 hover:text-white transition-colors z-10"
                        >
                            <X className="h-6 w-6" />
                        </button>
                        <Image
                            src={lightboxImage.url}
                            alt={lightboxImage.caption || "Gallery image"}
                            fill
                            className="object-contain rounded-2xl"
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

            {/* Share Modal */}
            <ShareBusinessModal
                isOpen={isShareModalOpen}
                onClose={setIsShareModalOpen}
                businessUrl={businessUrl}
                businessName={formData.businessName || "this business"}
                description="Share your business profile with customers and partners."
                qrCode={business?.qrCode}
            />
        </div>
    );
}

interface PresetPalette {
    name: string;
    bg: string;
    text: string;
}

const presets: PresetPalette[] = [
    { name: "Warm Orange", bg: "#ff6b00", text: "#ffffff" },
    { name: "Midnight Blue", bg: "#0f172a", text: "#ffffff" },
    { name: "Emerald Forest", bg: "#064e3b", text: "#ffffff" },
    { name: "Light Mint", bg: "#d1fae5", text: "#064e3b" },
    { name: "Elegant Gold", bg: "#1a1a1a", text: "#fbbf24" }
];

function QrCodeDesignTab({ business, onUpdate }: { business: any; onUpdate: (updated: any) => void }) {
    const [bgColor, setBgColor] = useState(business?.qrCodeBackgroundColor || "#ff6b00");
    const [textColor, setTextColor] = useState(business?.qrCodeTextColor || "#ffffff");
    const [isSaving, setIsSaving] = useState(false);

    // Sync state if business prop updates
    useEffect(() => {
        if (business?.qrCodeBackgroundColor) setBgColor(business.qrCodeBackgroundColor);
        if (business?.qrCodeTextColor) setTextColor(business.qrCodeTextColor);
    }, [business?.qrCodeBackgroundColor, business?.qrCodeTextColor]);

    const getPreviewUrl = useCallback((base64Svg: string | null | undefined, bg: string, text: string) => {
        if (!base64Svg) return "";
        try {
            const parts = base64Svg.split(',');
            if (parts.length < 2) return base64Svg;
            let svgXml = atob(parts[1]);

            const currentBg = business?.qrCodeBackgroundColor || "#ff6b00";
            const currentText = business?.qrCodeTextColor || "#ffffff";

            const cleanBg = bg.startsWith('#') ? bg : `#${bg}`;
            const cleanText = text.startsWith('#') ? text : `#${text}`;

            svgXml = svgXml.replaceAll(currentBg, cleanBg);
            svgXml = svgXml.replaceAll(currentBg.toUpperCase(), cleanBg);
            svgXml = svgXml.replaceAll(currentBg.toLowerCase(), cleanBg);
            
            svgXml = svgXml.replaceAll(currentText, cleanText);
            svgXml = svgXml.replaceAll(currentText.toUpperCase(), cleanText);
            svgXml = svgXml.replaceAll(currentText.toLowerCase(), cleanText);

            return `data:image/svg+xml;utf8,${encodeURIComponent(svgXml)}`;
        } catch (e) {
            console.error("Error generating live preview:", e);
            return base64Svg;
        }
    }, [business?.qrCodeBackgroundColor, business?.qrCodeTextColor]);

    const previewUrl = getPreviewUrl(business?.qrCode, bgColor, textColor);

    const getCustomSvgXml = () => {
        if (!business?.qrCode) return "";
        try {
            const parts = business.qrCode.split(',');
            if (parts.length < 2) return "";
            let svgXml = atob(parts[1]);

            const currentBg = business?.qrCodeBackgroundColor || "#ff6b00";
            const currentText = business?.qrCodeTextColor || "#ffffff";

            const cleanBg = bgColor.startsWith('#') ? bgColor : `#${bgColor}`;
            const cleanText = textColor.startsWith('#') ? textColor : `#${textColor}`;

            svgXml = svgXml.replaceAll(currentBg, cleanBg);
            svgXml = svgXml.replaceAll(currentBg.toUpperCase(), cleanBg);
            svgXml = svgXml.replaceAll(currentBg.toLowerCase(), cleanBg);
            
            svgXml = svgXml.replaceAll(currentText, cleanText);
            svgXml = svgXml.replaceAll(currentText.toUpperCase(), cleanText);
            svgXml = svgXml.replaceAll(currentText.toLowerCase(), cleanText);

            return svgXml;
        } catch (e) {
            console.error(e);
            return "";
        }
    };

    const handleSaveDesign = async () => {
        if (!business?.id) return;
        setIsSaving(true);
        try {
            const updated = await businessService.updateQrCodeDesign(business.id, {
                backgroundColor: bgColor,
                textColor: textColor
            });
            onUpdate(updated);
            toaster.create({ title: "Design saved successfully!", type: "success" });
        } catch (e) {
            console.error(e);
            toaster.create({ title: "Failed to save QR Code design", type: "error" });
        } finally {
            setIsSaving(false);
        }
    };

    const handleDownloadSvg = () => {
        const svgXml = getCustomSvgXml();
        if (!svgXml) return;
        const element = document.createElement("a");
        const file = new Blob([svgXml], { type: 'image/svg+xml;charset=utf-8' });
        element.href = URL.createObjectURL(file);
        element.download = `${business.slug || 'business'}-qr-code.svg`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
        toaster.create({ title: "SVG Downloaded", type: "success" });
    };

    const handleDownloadPng = () => {
        const svgXml = getCustomSvgXml();
        if (!svgXml) return;
        
        const img = new window.Image();
        const svgBlob = new Blob([svgXml], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);
        
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = 1600;
            canvas.height = 500;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(img, 0, 0, 1600, 500);
                const pngUrl = canvas.toDataURL('image/png');
                const element = document.createElement("a");
                element.href = pngUrl;
                element.download = `${business.slug || 'business'}-qr-code.png`;
                document.body.appendChild(element);
                element.click();
                document.body.removeChild(element);
                toaster.create({ title: "PNG Downloaded", type: "success" });
            }
            URL.revokeObjectURL(url);
        };
        img.src = url;
    };

    const handleDownloadPdf = async () => {
        const svgXml = getCustomSvgXml();
        if (!svgXml) return;

        const img = new window.Image();
        const svgBlob = new Blob([svgXml], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);
        
        img.onload = async () => {
            const canvas = document.createElement('canvas');
            canvas.width = 1600;
            canvas.height = 500;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(img, 0, 0, 1600, 500);
                const pngData = canvas.toDataURL('image/png');
                
                const { jsPDF } = await import('jspdf');
                const doc = new jsPDF({
                    orientation: 'landscape',
                    unit: 'px',
                    format: [1600, 500]
                });
                doc.addImage(pngData, 'PNG', 0, 0, 1600, 500);
                doc.save(`${business.slug || 'business'}-qr-code.pdf`);
                toaster.create({ title: "PDF Downloaded", type: "success" });
            }
            URL.revokeObjectURL(url);
        };
        img.src = url;
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-300 mb-8">
            {/* Left Column - Customizer Controls */}
            <div className="lg:col-span-5 bg-white rounded-[1rem] border border-gray-100 shadow-sm p-8 space-y-8">
                <div className="space-y-2">
                    <h3 className="text-xl font-bold text-gray-900">Customize Banner</h3>
                    <p className="text-sm text-gray-500 font-medium">
                        Change the colors of your QR code banner to match your business brand.
                    </p>
                </div>

                {/* Presets */}
                <div className="space-y-4">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Harmonious Presets</label>
                    <div className="flex flex-wrap gap-3">
                        {presets.map((preset) => (
                            <button
                                key={preset.name}
                                onClick={() => {
                                    setBgColor(preset.bg);
                                    setTextColor(preset.text);
                                }}
                                className="group relative flex items-center justify-center p-1 rounded-xl border border-gray-100 hover:border-amber-500 transition-all duration-200"
                                title={preset.name}
                            >
                                <div className="flex h-10 w-16 rounded-lg overflow-hidden shadow-sm">
                                    <div className="w-1/2" style={{ backgroundColor: preset.bg }} />
                                    <div className="w-1/2 flex items-center justify-center font-bold text-xs" style={{ backgroundColor: preset.bg, color: preset.text }}>
                                        Abc
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Custom Pickers */}
                <div className="space-y-6">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Custom Colors</label>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Background</label>
                            <div className="flex gap-2">
                                <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-gray-200 cursor-pointer shrink-0">
                                    <input
                                        type="color"
                                        value={bgColor}
                                        onChange={(e) => setBgColor(e.target.value)}
                                        className="absolute inset-0 w-full h-full p-0 border-0 cursor-pointer scale-150"
                                    />
                                </div>
                                <input
                                    type="text"
                                    value={bgColor}
                                    onChange={(e) => setBgColor(e.target.value)}
                                    placeholder="#FFFFFF"
                                    className="w-full h-10 px-3 bg-gray-50 border border-gray-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl text-sm font-semibold uppercase outline-none transition-colors"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Text & Logo</label>
                            <div className="flex gap-2">
                                <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-gray-200 cursor-pointer shrink-0">
                                    <input
                                        type="color"
                                        value={textColor}
                                        onChange={(e) => setTextColor(e.target.value)}
                                        className="absolute inset-0 w-full h-full p-0 border-0 cursor-pointer scale-150"
                                    />
                                </div>
                                <input
                                    type="text"
                                    value={textColor}
                                    onChange={(e) => setTextColor(e.target.value)}
                                    placeholder="#000000"
                                    className="w-full h-10 px-3 bg-gray-50 border border-gray-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl text-sm font-semibold uppercase outline-none transition-colors"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-4 border-t border-gray-50">
                    <Button
                        onClick={handleSaveDesign}
                        disabled={isSaving || (bgColor.toLowerCase() === (business?.qrCodeBackgroundColor || "#ff6b00").toLowerCase() && textColor.toLowerCase() === (business?.qrCodeTextColor || "#ffffff").toLowerCase())}
                        className="w-full h-11 bg-amber-500 hover:bg-amber-600 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all"
                    >
                        {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                        Save Design
                    </Button>
                </div>
            </div>

            {/* Right Column - Live Preview */}
            <div className="lg:col-span-7 flex flex-col justify-between bg-white rounded-[1rem] border border-gray-100 shadow-sm p-8 gap-8">
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-gray-900">Live Preview</h3>
                        <span className="px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-xs font-bold flex items-center gap-1.5 border border-amber-100">
                            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                            Real-time
                        </span>
                    </div>

                    <div className="relative aspect-[16/5] bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 flex items-center justify-center">
                        {previewUrl ? (
                            <img
                                src={previewUrl}
                                alt="QR Code Customizer Live Preview"
                                className="w-full h-full object-cover transition-opacity duration-300"
                            />
                        ) : (
                            <div className="text-center p-6 text-gray-400 space-y-2">
                                <QrCode className="h-12 w-12 mx-auto animate-pulse" />
                                <p className="text-sm font-semibold">Generating QR code banner...</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Download Actions */}
                <div className="space-y-4">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Download Formats</label>
                    <div className="grid grid-cols-3 gap-3">
                        <Button
                            variant="outline"
                            onClick={handleDownloadPng}
                            disabled={!business?.qrCode}
                            className="h-11 bg-gray-50 border-gray-200 hover:bg-gray-100 hover:text-gray-900 font-bold rounded-xl text-xs flex items-center justify-center gap-2"
                        >
                            PNG Image
                        </Button>
                        <Button
                            variant="outline"
                            onClick={handleDownloadSvg}
                            disabled={!business?.qrCode}
                            className="h-11 bg-gray-50 border-gray-200 hover:bg-gray-100 hover:text-gray-900 font-bold rounded-xl text-xs flex items-center justify-center gap-2"
                        >
                            Vector SVG
                        </Button>
                        <Button
                            variant="outline"
                            onClick={handleDownloadPdf}
                            disabled={!business?.qrCode}
                            className="h-11 bg-gray-50 border-gray-200 hover:bg-gray-100 hover:text-gray-900 font-bold rounded-xl text-xs flex items-center justify-center gap-2"
                        >
                            Print PDF
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
