"use client";

import { useState, useRef, useEffect } from "react";
import { User, Camera, Lock, Shield, AlertTriangle, Trash2, ChevronRight, Loader2 } from "lucide-react";
import Image from "next/image";
import { CustomerHeader } from "@/components/modules/customer/customer-header";
import { CustomerFooter } from "@/components/modules/customer/customer-footer";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useAuthStore } from "@/store/auth.store";
import { userService, UpdateProfileDto } from "@/services/user.service";
import { toaster } from "@/components/ui/toaster";

export default function SettingsPage() {
    const { user, updateUser } = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState<UpdateProfileDto>({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
    });

    useEffect(() => {
        if (user) {
            setFormData({
                firstName: user.firstName || "",
                lastName: user.lastName || "",
                email: user.email || "",
                phone: user.phone || "",
            });
            setAvatarPreview(user.profilePicture || null);
        }
    }, [user]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSaveProfile = async () => {
        setIsLoading(true);
        try {
            const updatedUser = await userService.updateProfile({
                firstName: formData.firstName,
                lastName: formData.lastName,
                phone: formData.phone,
            });
            updateUser(updatedUser);
            toaster.create({ title: "Profile updated successfully", type: "success" });
        } catch (error) {
            toaster.create({
                title: "Failed to update profile",
                description: "Something went wrong. Please try again.",
                type: "error",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setAvatarPreview(reader.result as string);
        };
        reader.readAsDataURL(file);

        // Upload
        setIsUploading(true);
        try {
            const res = await userService.uploadProfilePicture(file);
            updateUser({ ...user!, profilePicture: res.profilePicture });
            toaster.create({ title: "Profile picture updated", type: "success" });
        } catch (error) {
            toaster.create({
                title: "Upload failed",
                description: "Could not upload profile picture.",
                type: "error",
            });
        } finally {
            setIsUploading(false);
        }
    };

    const userInitials = user
        ? `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase() || "JD"
        : "JD";

    return (
        <div className="min-h-screen bg-gray-50/50 flex flex-col">
            <CustomerHeader />

            <main className="flex-1 py-12 max-w-7xl px-4 sm:px-6 lg:px-8 mx-auto w-full">
                <div className="space-y-8">
                    {/* Page Title */}
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 font-serif">Settings</h1>
                        <p className="text-gray-500 mt-1">Manage your personal preferences</p>
                    </div>

                    {/* Profile Information Section */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-8 space-y-8">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-amber-50 rounded-lg">
                                    <User className="w-5 h-5 text-amber-600" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900 font-serif">Profile Information</h2>
                            </div>

                            <div className="flex flex-col md:flex-row gap-8 items-start">
                                {/* Avatar */}
                                <div className="flex flex-col items-center gap-3">
                                    <div className="relative group">
                                        <div className="w-32 h-32 rounded-full overflow-hidden bg-[#4A6CF7] flex items-center justify-center text-white text-4xl font-bold border-4 border-white shadow-md">
                                            {avatarPreview ? (
                                                <Image
                                                    src={avatarPreview}
                                                    alt="Profile"
                                                    fill
                                                    className="object-cover rounded-full"
                                                />
                                            ) : (
                                                <span>{userInitials}</span>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            className="absolute bottom-1 right-1 p-2 bg-white rounded-full shadow-lg border border-gray-100 text-amber-600 hover:bg-gray-50 transition-colors"
                                            disabled={isUploading}
                                        >
                                            {isUploading ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Camera className="w-4 h-4" />
                                            )}
                                        </button>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                        />
                                    </div>
                                    <p className="text-xs text-gray-400">JPG, PNG max 5MB</p>
                                </div>

                                {/* Form Fields */}
                                <div className="flex-1 w-full space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-medium text-gray-400 ml-1">First Name</label>
                                            <input
                                                type="text"
                                                name="firstName"
                                                value={formData.firstName}
                                                onChange={handleInputChange}
                                                placeholder="John"
                                                className="w-full h-12 px-4 rounded-md border border-gray-200 focus:outline-none focus:ring-1 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-gray-900 font-medium"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-medium text-gray-400 ml-1">Last Name</label>
                                            <input
                                                type="text"
                                                name="lastName"
                                                value={formData.lastName}
                                                onChange={handleInputChange}
                                                placeholder="Doe"
                                                className="w-full h-12 px-4 rounded-md border border-gray-200 focus:outline-none focus:ring-1 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-gray-900 font-medium"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-gray-400 ml-1">Email</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            disabled
                                            placeholder="johndoe@example.com"
                                            className="w-full h-12 px-4 rounded-md border border-gray-200 bg-gray-50 text-gray-500 font-medium cursor-not-allowed"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-gray-400 ml-1">Phone Number</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            placeholder="+234 800 123 4567"
                                            className="w-full h-12 px-4 rounded-md border border-gray-200 focus:outline-none focus:ring-1 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-gray-900 font-medium"
                                        />
                                    </div>

                                    <div className="flex justify-end pt-4">
                                        <Button
                                            onClick={handleSaveProfile}
                                            disabled={isLoading}
                                            className="bg-[#E89D24] hover:bg-[#D58C1B] text-white px-8 h-11 rounded-lg font-bold shadow-sm"
                                        >
                                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Security Section */}
                    <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-8 space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-50 rounded-lg">
                                    <Shield className="w-5 h-5 text-green-600" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900 font-serif">Security</h2>
                            </div>

                            <div className="space-y-4">
                                {/* Password */}
                                <div className="flex items-center justify-between p-6 bg-gray-50/50 rounded-xl border border-gray-100">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-gray-100">
                                            <Lock className="w-4 h-4 text-gray-400" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900">Password</p>
                                            <p className="text-sm text-gray-400">Last changed 3 months ago</p>
                                        </div>
                                    </div>
                                    <Button variant="outline" className="rounded-lg h-10 px-6 font-bold border-gray-200 hover:bg-white hover:border-amber-500 hover:text-amber-600 transition-all">
                                        Change
                                    </Button>
                                </div>

                                {/* Two-Factor Auth */}
                                <div className="flex items-center justify-between p-6 bg-gray-50/50 rounded-xl border border-gray-100">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-gray-100">
                                            <Shield className="w-4 h-4 text-gray-400" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900">Two-Factor Authentication</p>
                                            <p className="text-sm text-gray-400">Add extra security to your account</p>
                                        </div>
                                    </div>
                                    <Switch />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Danger Zone Section */}
                    <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-8 space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-red-50 rounded-lg">
                                    <AlertTriangle className="w-5 h-5 text-red-600" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900 font-serif">Danger Zone</h2>
                            </div>

                            <div className="p-6 bg-red-50/50 rounded-xl border border-red-100 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-red-100">
                                        <Trash2 className="w-4 h-4 text-red-400" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-red-600">Delete Account</p>
                                        <p className="text-sm text-red-400">Permanently remove your account and all data</p>
                                    </div>
                                </div>
                                <Button className="bg-[#E74C3C] hover:bg-[#C0392B] text-white px-8 h-10 rounded-lg font-bold">
                                    Delete
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <CustomerFooter />
        </div>
    );
}
