'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, CreditCard, User, Loader2, Camera, X, Calendar, CheckCircle, CheckCircle2, Clock, Star } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useAuthStore } from "@/store/auth.store";
import CustomInput from '@/components/ui/InputGroup';
import { userService, UpdateProfileDto } from '@/services/user.service';
import { businessService } from '@/services/business.service';
import { toaster } from '@/components/ui/toaster';
import Image from 'next/image';
import { BiInfoCircle } from 'react-icons/bi';

type TabType = 'profile' | 'company' | 'notifications';

// ─── Timezone options ──────────────────────────────────────────────────────────
const TIMEZONES = [
    { value: 'Africa/Lagos', label: 'West Africa Time (WAT, UTC+1)' },
    { value: 'Africa/Nairobi', label: 'East Africa Time (EAT, UTC+3)' },
    { value: 'Africa/Johannesburg', label: 'South Africa Time (SAST, UTC+2)' },
    { value: 'Africa/Accra', label: 'Greenwich Mean Time (GMT, UTC+0)' },
    { value: 'Europe/London', label: 'British Time (BST/GMT)' },
    { value: 'America/New_York', label: 'Eastern Time (ET, UTC-5)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT, UTC-8)' },
    { value: 'Asia/Dubai', label: 'Gulf Standard Time (GST, UTC+4)' },
];

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState<TabType>('profile');
    const { user, updateUser } = useAuthStore();

    const tabs = [
        { id: 'profile', label: 'User Profile' },
        { id: 'company', label: 'Company Setting' },
        { id: 'notifications', label: 'Notifications' },
    ];

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-20 animate-in fade-in duration-300">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 leading-tight">Settings</h1>
                <p className="text-sm text-gray-500 font-medium">Change settings</p>
            </div>

            {/* Tabs Navigation & Save Button — Sticky Container */}
            <div className="sticky top-[-2rem] z-30 bg-gray-50/95 backdrop-blur-md py-4 transition-all -mx-8 px-8 border-b border-gray-200/50">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <div className="bg-gray-100/70 p-1.5 rounded-xl inline-flex gap-1 shadow-sm border border-gray-200/20">
                        {tabs.map((tab) => {
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as TabType)}
                                    className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${isActive
                                        ? 'bg-[#F59E0B] text-white shadow-md'
                                        : 'text-gray-500 hover:text-gray-800 hover:bg-white/50'
                                        }`}
                                >
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* Save Changes pinned to top-right of tab bar — only for profile */}
                    {activeTab === 'profile' && <SaveProfileButton user={user} onUpdate={updateUser} />}
                </div>
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-[2rem] p-10 shadow-xl shadow-black/5 border border-gray-100 min-h-[600px] animate-in slide-in-from-bottom-4 duration-500">
                {activeTab === 'profile' && <UserProfileTab user={user} onUpdate={updateUser} />}
                {activeTab === 'company' && <CompanySettingTab />}
                {activeTab === 'notifications' && <NotificationsTab />}
            </div>
        </div>
    );
}

// ─── Shared save button hoisted to tab bar ─────────────────────────────────────
function SaveProfileButton({ user, onUpdate }: { user: any; onUpdate: (u: any) => void }) {
    const [isSaving, setIsSaving] = useState(false);
    const businessId = user?.businesses?.[0]?.id;

    useEffect(() => {
        const handler = async (e: any) => {
            const { profileData, timezone, businessProfile } = e.detail as { profileData: UpdateProfileDto; timezone: string; businessProfile: any };
            setIsSaving(true);
            try {
                // 1. Save user profile (name, phone)
                const updated = await userService.updateProfile(profileData);
                onUpdate(updated);

                // 2. Save business profile (merge with existing to satisfy validation)
                if (businessId && businessProfile) {
                    const updateData = {
                        ...businessProfile,
                        timezone: timezone || businessProfile.timezone,
                    };

                    // Extract address fields from addressDetails or addressRelation if top-level fields are missing
                    const ad = updateData.addressDetails || updateData.addressRelation;

                    // Ensure we only send fields UpdateProfileDto expects (omit id, timestamps etc)
                    const cleanData: any = {
                        businessTypeCode: updateData.businessTypeCode,
                        businessName: updateData.businessName,
                        phone: updateData.phone,
                        description: updateData.description,
                        country: updateData.country || ad?.country,
                        state: updateData.state || ad?.state,
                        city: updateData.city || ad?.city,
                        address: updateData.address || ad?.address,
                        timezone: updateData.timezone,
                        cacNumber: updateData.cacNumber,
                        addressNote: updateData.addressNote || ad?.note,
                        amenities: updateData.amenities,
                        operatingHours: updateData.operatingHours,
                        coverImage: updateData.coverImage
                    };
                    await businessService.updateProfile(businessId, cleanData);
                }
                toaster.create({ title: 'Profile Updated', type: 'success' });
            } catch (err: any) {
                const message = err.response?.data?.message || 'Please try again.';
                toaster.create({ title: 'Update Failed', description: message, type: 'error' });
                console.error('Update Profile Error:', err.response?.data);
            } finally {
                setIsSaving(false);
            }
        };
        window.addEventListener('settings:save-profile', handler);
        return () => window.removeEventListener('settings:save-profile', handler);
    }, [onUpdate, businessId]);

    return (
        <button
            disabled={isSaving}
            onClick={() => window.dispatchEvent(new CustomEvent('settings:trigger-save'))}
            className="flex items-center gap-2 px-5 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all disabled:opacity-50"
        >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Save Changes
        </button>
    );
}

// ─── User Profile Tab ──────────────────────────────────────────────────────────
function UserProfileTab({ user, onUpdate }: { user: any; onUpdate: (user: any) => void }) {
    const businessId = user?.businesses?.[0]?.id;
    const [formData, setFormData] = useState<UpdateProfileDto>({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        phone: user?.phone || '',
    });
    const [timezone, setTimezone] = useState('Africa/Lagos');
    const [businessProfile, setBusinessProfile] = useState<any>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.profilePicture || null);
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const avatarInputRef = useRef<HTMLInputElement>(null);

    // Load user data and business timezone
    useEffect(() => {
        if (user) {
            setFormData({ firstName: user.firstName || '', lastName: user.lastName || '', phone: user.phone || '' });
            setAvatarPreview(user.profilePicture || null);
        }
        if (businessId) {
            businessService.getBusinessProfile(businessId)
                .then((profile: any) => {
                    setBusinessProfile(profile);
                    if (profile?.timezone) setTimezone(profile.timezone);
                })
                .catch(() => { /* use default timezone */ });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id, businessId]);

    // Listen for save trigger — pass profileData + timezone + full businessProfile
    useEffect(() => {
        const handler = () => {
            window.dispatchEvent(new CustomEvent('settings:save-profile', {
                detail: { profileData: formData, timezone, businessProfile },
            }));
        };
        window.addEventListener('settings:trigger-save', handler);
        return () => window.removeEventListener('settings:trigger-save', handler);
    }, [formData, timezone]);

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
            toaster.create({ title: 'File too large', description: 'Max 5MB', type: 'error' });
            return;
        }
        // Preview immediately
        const reader = new FileReader();
        reader.onload = (ev) => setAvatarPreview(ev.target?.result as string);
        reader.readAsDataURL(file);

        setIsUploadingAvatar(true);
        try {
            const res = await userService.uploadProfilePicture(file);
            setAvatarPreview(res.profilePicture);
            onUpdate({ ...user, profilePicture: res.profilePicture });
            toaster.create({ title: 'Profile photo updated', type: 'success' });
        } catch (err: any) {
            toaster.create({ title: 'Upload failed', description: err.response?.data?.message || 'Please try again.', type: 'error' });
        } finally {
            setIsUploadingAvatar(false);
            if (avatarInputRef.current) avatarInputRef.current.value = '';
        }
    };

    const initials = `${formData.firstName?.[0] || ''}${formData.lastName?.[0] || ''}`.toUpperCase() || 'U';

    return (
        <div className="space-y-8 max-w-3xl">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-xl bg-amber-50 flex items-center justify-center">
                    <User className="h-5 w-5 text-[#F59E0B]" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-gray-900">User Profile</h3>
                    <p className="text-sm text-gray-500">Manage your personal account information</p>
                </div>
            </div>

            {/* Profile Photo */}
            <div className="flex items-center gap-6">
                <div className="relative">
                    <div className="h-20 w-20 rounded-full overflow-hidden bg-gray-800 flex items-center justify-center ring-2 ring-gray-100">
                        {avatarPreview ? (
                            <Image src={avatarPreview} alt="Profile" fill className="object-cover" />
                        ) : (
                            <span className="text-white text-2xl font-bold">{initials}</span>
                        )}
                    </div>
                    {/* Camera icon overlay */}
                    <button
                        onClick={() => avatarInputRef.current?.click()}
                        className="absolute bottom-0 right-0 h-6 w-6 rounded-full bg-amber-500 flex items-center justify-center text-white shadow-sm"
                    >
                        <Camera className="h-3 w-3" />
                    </button>
                    {isUploadingAvatar && (
                        <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
                            <Loader2 className="h-5 w-5 text-white animate-spin" />
                        </div>
                    )}
                </div>
                <div>
                    <p className="text-sm font-semibold text-gray-900">Profile Photo</p>
                    <p className="text-xs text-gray-400 mb-3">JPG, PNG or GIF, max 5MB</p>
                    <button
                        onClick={() => avatarInputRef.current?.click()}
                        className="px-4 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        Upload Image
                    </button>
                </div>
                <input ref={avatarInputRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp" className="hidden" onChange={handleAvatarChange} />
            </div>

            {/* Personal Information */}
            <div className="space-y-5">
                <h4 className="text-sm font-bold text-gray-900">Personal Information</h4>

                <div className="grid grid-cols-2 gap-5">
                    <CustomInput
                        label="First Name"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        placeholder="First Name"
                        className="h-[50px] rounded-xl"
                    />
                    <CustomInput
                        label="Last Name"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        placeholder="Last Name"
                        className="h-[50px] rounded-xl"
                    />
                </div>

                <div className="grid grid-cols-2 gap-5">
                    <CustomInput
                        label="Email Address"
                        value={user?.email || ''}
                        placeholder="Email"
                        className="h-[50px] rounded-xl bg-gray-50"
                        disabled
                    />
                    <CustomInput
                        label="Phone Number"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+234 800 123 4567"
                        className="h-[50px] rounded-xl"
                    />
                </div>

                <div className="grid grid-cols-2 gap-5">
                    {/* Job Title — hardcoded for business owners */}
                    <CustomInput
                        label="Job Title"
                        value="Business Owner"
                        placeholder="Job Title"
                        className="h-[50px] rounded-xl bg-gray-50"
                        disabled
                    />
                    {/* Time Zone — UI-only */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Time Zone</label>
                        <select
                            value={timezone}
                            onChange={(e) => setTimezone(e.target.value)}
                            className="w-full h-[50px] px-3 rounded-xl border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-300 bg-white"
                        >
                            {TIMEZONES.map((tz) => (
                                <option key={tz.value} value={tz.value}>{tz.label}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Password & Security */}
            <div className="border-t border-gray-100 pt-6">
                <div className="flex items-start justify-between">
                    <div>
                        <h4 className="text-sm font-bold text-gray-900">Password &amp; Security</h4>
                        <p className="text-xs text-gray-400 mt-0.5">Update your password to keep your account secure</p>
                    </div>
                    <Button
                        onClick={() => setShowPasswordForm(v => !v)}
                        className="h-9 px-5 bg-[#F59E0B] hover:bg-[#D97706] text-white text-sm font-semibold rounded-xl"
                    >
                        {showPasswordForm ? 'Cancel' : 'Change Password'}
                    </Button>
                </div>

                {showPasswordForm && (
                    <PasswordForm onClose={() => setShowPasswordForm(false)} />
                )}
            </div>
        </div>
    );
}

// ─── Inline Password Form ──────────────────────────────────────────────────────
function PasswordForm({ onClose }: { onClose: () => void }) {
    const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [error, setError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        if (passwords.newPassword !== passwords.confirmPassword) { setError('Passwords do not match'); return; }
        if (passwords.newPassword.length < 8) { setError('Password must be at least 8 characters'); return; }
        setError(null);
        setIsSaving(true);
        try {
            await userService.changePassword({ currentPassword: passwords.currentPassword, newPassword: passwords.newPassword });
            toaster.create({ title: 'Password Changed', type: 'success' });
            onClose();
        } catch (err: any) {
            toaster.create({ title: 'Change Failed', description: err.response?.data?.message || 'Please try again.', type: 'error' });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="mt-5 space-y-4 p-5 rounded-xl bg-gray-50 border border-gray-100">
            <CustomInput
                type="password"
                label="Current Password"
                value={passwords.currentPassword}
                onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                placeholder="Enter current password"
                className="h-[50px] rounded-xl bg-white"
            />
            <div className="grid grid-cols-2 gap-4">
                <CustomInput
                    type="password"
                    label="New Password"
                    value={passwords.newPassword}
                    onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                    placeholder="Enter new password"
                    className="h-[50px] rounded-xl bg-white"
                />
                <CustomInput
                    type="password"
                    label="Confirm New Password"
                    value={passwords.confirmPassword}
                    onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                    placeholder="Confirm new password"
                    className="h-[50px] rounded-xl bg-white"
                    error={error && passwords.newPassword !== passwords.confirmPassword ? error : ''}
                />
            </div>
            {error && passwords.newPassword === passwords.confirmPassword && (
                <p className="text-xs text-red-500">{error}</p>
            )}
            <div className="flex justify-end gap-3 pt-1">
                <button onClick={onClose} className="px-5 py-2 text-sm font-semibold text-gray-500 rounded-xl border border-gray-200 hover:bg-gray-100">
                    Cancel
                </button>
                <Button
                    onClick={handleSave}
                    disabled={isSaving || !passwords.currentPassword || !passwords.newPassword || !passwords.confirmPassword}
                    className="h-9 px-5 bg-[#F59E0B] hover:bg-[#D97706] text-white text-sm font-semibold rounded-xl"
                >
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Update Password'}
                </Button>
            </div>
        </div>
    );
}

// ─── Company Setting Tab ───────────────────────────────────────────────────────
function CompanySettingTab() {
    const { user } = useAuthStore();
    const businessId = user?.businesses?.[0]?.id;

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [paymentData, setPaymentData] = useState({
        accountName: '', accountNumber: '', bankName: '', sortCode: '',
    });
    const [originalData, setOriginalData] = useState(paymentData);

    const hasData = !!(paymentData.accountName || paymentData.accountNumber || paymentData.bankName);

    useEffect(() => {
        if (!businessId) { setIsLoading(false); return; }
        businessService.getPayoutInfo(businessId)
            .then(({ payoutInfo }) => {
                if (payoutInfo) {
                    const filled = {
                        accountName: payoutInfo.accountName || '',
                        accountNumber: payoutInfo.accountNumber || '',
                        bankName: payoutInfo.bankName || '',
                        sortCode: payoutInfo.sortCode || '',
                    };
                    setPaymentData(filled);
                    setOriginalData(filled);
                }
            })
            .catch(() => { /* use empty state */ })
            .finally(() => setIsLoading(false));
    }, [businessId]);

    const handleSave = async () => {
        if (!businessId) return;
        if (!paymentData.accountName || !paymentData.accountNumber || !paymentData.bankName) {
            toaster.create({ title: 'Missing fields', description: 'Account Name, Number and Bank Name are required.', type: 'error' });
            return;
        }
        setIsSaving(true);
        try {
            await businessService.createOrUpdatePayoutInfo(businessId, {
                accountName: paymentData.accountName,
                accountNumber: paymentData.accountNumber,
                bankName: paymentData.bankName,
                ...(paymentData.sortCode ? { sortCode: paymentData.sortCode } : {}),
            });
            setOriginalData(paymentData);
            setIsEditing(false);
            setShowForm(false);
            toaster.create({ title: 'Payout info saved', type: 'success' });
        } catch (err: any) {
            toaster.create({ title: 'Save failed', description: err.response?.data?.message || 'Please try again.', type: 'error' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setPaymentData(originalData);
        setIsEditing(false);
        if (!hasData) setShowForm(false);
    };

    // ── Loading ──────────────────────────────────────────────────────────────────
    if (isLoading) return (
        <div className="flex items-center justify-center h-40">
            <Loader2 className="h-8 w-8 text-amber-400 animate-spin" />
        </div>
    );

    // ── Section header ────────────────────────────────────────────────────────────
    const header = (
        <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-amber-50 flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-[#F59E0B]" />
            </div>
            <div>
                <h3 className="text-lg font-bold text-gray-900">Payment</h3>
                <p className="text-sm text-gray-500">Manage your payout details</p>
            </div>
        </div>
    );

    // ── Empty state ───────────────────────────────────────────────────────────────
    if (!showForm && !hasData) {
        return (
            <div className="space-y-6">
                {header}
                <div className="p-12 rounded-2xl border border-dashed border-gray-200 flex flex-col items-center text-center space-y-4 bg-gray-50/30">
                    <div className="h-16 w-16 rounded-full bg-white shadow-sm flex items-center justify-center border border-gray-100 text-gray-300">
                        <CreditCard className="h-8 w-8" />
                    </div>
                    <div className="space-y-1">
                        <h4 className="text-base font-bold text-gray-900">No payment method added</h4>
                        <p className="text-sm text-gray-400 max-w-xs">Add a payout method to receive your business earnings directly in your bank account.</p>
                    </div>
                    <Button
                        onClick={() => { setIsEditing(true); setShowForm(true); }}
                        variant="outline"
                        className="h-10 px-8 rounded-xl font-semibold text-sm hover:border-amber-400 hover:text-amber-600 transition-all"
                    >
                        Add Payout Method
                    </Button>
                </div>
            </div>
        );
    }

    // ── Form ──────────────────────────────────────────────────────────────────────
    const disabled = !isEditing && hasData;

    return (
        <div className="space-y-6 max-w-3xl">
            {header}

            <div className="space-y-5">
                <div className="grid grid-cols-2 gap-5">
                    <CustomInput
                        label="Account Name"
                        value={paymentData.accountName}
                        onChange={(e) => setPaymentData({ ...paymentData, accountName: e.target.value })}
                        placeholder="Enter account holder name"
                        className="h-[50px] rounded"
                        disabled={disabled}
                    />
                    <CustomInput
                        label="Account Number"
                        value={paymentData.accountNumber}
                        onChange={(e) => setPaymentData({ ...paymentData, accountNumber: e.target.value })}
                        placeholder="0123456789"
                        className="h-[50px] rounded"
                        disabled={disabled}
                    />
                </div>
                <div className="grid grid-cols-2 gap-5">
                    <CustomInput
                        label="Bank Name"
                        value={paymentData.bankName}
                        onChange={(e) => setPaymentData({ ...paymentData, bankName: e.target.value })}
                        placeholder="e.g. GTBank"
                        className="h-[50px] rounded"
                        disabled={disabled}
                    />
                    <CustomInput
                        label="Sort Code (optional)"
                        value={paymentData.sortCode}
                        onChange={(e) => setPaymentData({ ...paymentData, sortCode: e.target.value })}
                        placeholder="e.g. 058"
                        className="h-[50px] rounded"
                        disabled={disabled}
                    />
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
                {hasData && !isEditing ? (
                    <Button
                        onClick={() => setIsEditing(true)}
                        className="h-10 px-6 bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold rounded-xl"
                    >
                        Edit Details
                    </Button>
                ) : (
                    <>
                        <button
                            onClick={handleCancel}
                            className="h-10 px-5 text-sm font-semibold text-gray-500 rounded-xl border border-gray-200 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <Button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="h-10 px-6 bg-[#F59E0B] hover:bg-[#D97706] text-white text-sm font-semibold rounded-xl"
                        >
                            {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            Save Details
                        </Button>
                    </>
                )}
            </div>
        </div>
    );
}

// ─── Notifications Tab ─────────────────────────────────────────────────────────
interface NotifState {
    emailNewBookingAlerts: boolean;
    emailPaymentNotifications: boolean;
    emailReviewNotifications: boolean;
    emailSystemAlerts: boolean;
    smsBookingReminders: boolean;
    smsPaymentConfirmations: boolean;
    pushRealTimeBookings: boolean;
    pushUrgentAlerts: boolean;
}

function NotificationsTab() {
    const { user } = useAuthStore();
    const businessId = user?.businesses?.[0]?.id;

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [prefs, setPrefs] = useState<NotifState>({
        emailNewBookingAlerts: true,
        emailPaymentNotifications: true,
        emailReviewNotifications: true,
        emailSystemAlerts: true,
        smsBookingReminders: false,
        smsPaymentConfirmations: false,
        pushRealTimeBookings: true,
        pushUrgentAlerts: true,
    });

    // Derived section-level toggles (all on = section on)
    const emailAll = prefs.emailNewBookingAlerts && prefs.emailPaymentNotifications && prefs.emailReviewNotifications && prefs.emailSystemAlerts;
    const smsAll = prefs.smsBookingReminders && prefs.smsPaymentConfirmations;
    const pushAll = prefs.pushRealTimeBookings && prefs.pushUrgentAlerts;

    useEffect(() => {
        if (!businessId) { setIsLoading(false); return; }
        businessService.getNotificationPreferences(businessId)
            .then((data: any) => {
                const {
                    emailNewBookingAlerts, emailPaymentNotifications,
                    emailReviewNotifications, emailSystemAlerts,
                    smsBookingReminders, smsPaymentConfirmations,
                    pushRealTimeBookings, pushUrgentAlerts,
                } = data;
                setPrefs(p => ({
                    ...p,
                    ...(emailNewBookingAlerts !== undefined && { emailNewBookingAlerts }),
                    ...(emailPaymentNotifications !== undefined && { emailPaymentNotifications }),
                    ...(emailReviewNotifications !== undefined && { emailReviewNotifications }),
                    ...(emailSystemAlerts !== undefined && { emailSystemAlerts }),
                    ...(smsBookingReminders !== undefined && { smsBookingReminders }),
                    ...(smsPaymentConfirmations !== undefined && { smsPaymentConfirmations }),
                    ...(pushRealTimeBookings !== undefined && { pushRealTimeBookings }),
                    ...(pushUrgentAlerts !== undefined && { pushUrgentAlerts }),
                }));
            })
            .catch(() => {/* use defaults */ })
            .finally(() => setIsLoading(false));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [businessId]);

    const toggle = (key: keyof NotifState) => setPrefs(p => ({ ...p, [key]: !p[key] }));

    const toggleSection = (keys: (keyof NotifState)[], value: boolean) => {
        setPrefs(p => {
            const next = { ...p };
            keys.forEach(k => { next[k] = value; });
            return next;
        });
    };

    const handleSave = async () => {
        if (!businessId) return;
        setIsSaving(true);
        try {
            await businessService.updateNotificationPreferences(businessId, prefs);
            toaster.create({ title: 'Notifications Updated', type: 'success' });
        } catch (err: any) {
            toaster.create({ title: 'Save Failed', description: err.response?.data?.message || 'Please try again.', type: 'error' });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <div className="flex items-center justify-center h-40"><Loader2 className="h-8 w-8 text-amber-400 animate-spin" /></div>;

    return (
        <div className="space-y-8 max-w-3xl">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-xl bg-amber-50 flex items-center justify-center">
                    <Bell className="h-5 w-5 text-[#F59E0B]" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-gray-900">Notifications</h3>
                    <p className="text-sm text-gray-500">Configure how and when you receive notifications</p>
                </div>
            </div>

            {/* Email Notifications */}
            <div className="space-y-1">
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <div>
                        <p className="text-sm font-bold text-gray-900">Email Notifications</p>
                        <p className="text-xs text-gray-400">Receive updates and alerts via email</p>
                    </div>
                    <Switch
                        checked={emailAll}
                        onCheckedChange={(v) => toggleSection(['emailNewBookingAlerts', 'emailPaymentNotifications', 'emailReviewNotifications', 'emailSystemAlerts'], v)}
                        className="data-[state=checked]:bg-emerald-500"
                    />
                </div>
                <NotifRow icon={<Calendar />} title="New Booking Alerts" description="When a customer books your service" checked={prefs.emailNewBookingAlerts} onToggle={() => toggle('emailNewBookingAlerts')} />
                <NotifRow icon={<CreditCard />} title="Payment Notifications" description="When payments are received or released" checked={prefs.emailPaymentNotifications} onToggle={() => toggle('emailPaymentNotifications')} />
                <NotifRow icon={<Star />} title="Review Notifications" description="When customers leave reviews" checked={prefs.emailReviewNotifications} onToggle={() => toggle('emailReviewNotifications')} />
                <NotifRow icon={<BiInfoCircle />} title="System Alerts" description="Important platform updates and maintenance" checked={prefs.emailSystemAlerts} onToggle={() => toggle('emailSystemAlerts')} />
            </div>

            {/* SMS Notifications */}
            <div className="space-y-1">
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <div>
                        <p className="text-sm font-bold text-gray-900">SMS Notifications</p>
                        <p className="text-xs text-gray-400">Receive urgent alerts via SMS</p>
                    </div>
                    <Switch
                        checked={smsAll}
                        onCheckedChange={(v) => toggleSection(['smsBookingReminders', 'smsPaymentConfirmations'], v)}
                        className="data-[state=checked]:bg-emerald-500"
                    />
                </div>
                <NotifRow icon={<Clock />} title="Booking Reminders" description="Reminders before appointments" checked={prefs.smsBookingReminders} onToggle={() => toggle('smsBookingReminders')} />
                <NotifRow icon={<CheckCircle2 />} title="Payment Confirmations" description="When payments are successfully processed" checked={prefs.smsPaymentConfirmations} onToggle={() => toggle('smsPaymentConfirmations')} />
            </div>

            {/* Push Notifications */}
            <div className="space-y-1">
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <div>
                        <p className="text-sm font-bold text-gray-900">Push Notifications</p>
                        <p className="text-xs text-gray-400">Receive real-time alerts on your devices</p>
                    </div>
                    <Switch
                        checked={pushAll}
                        onCheckedChange={(v) => toggleSection(['pushRealTimeBookings', 'pushUrgentAlerts'], v)}
                        className="data-[state=checked]:bg-emerald-500"
                    />
                </div>
                <NotifRow icon={<Calendar />} title="Real-time Bookings" description="Instant alerts for new bookings" checked={prefs.pushRealTimeBookings} onToggle={() => toggle('pushRealTimeBookings')} />
                <NotifRow icon={<Bell />} title="Urgent Alerts" description="Booking cancellations and changes" checked={prefs.pushUrgentAlerts} onToggle={() => toggle('pushUrgentAlerts')} />
            </div>

            <div className="flex justify-end pt-2">
                <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="h-10 px-8 bg-[#F59E0B] hover:bg-[#D97706] text-white text-sm font-bold rounded-xl"
                >
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Save Preferences
                </Button>
            </div>
        </div>
    );
}

// ─── Notification Row ──────────────────────────────────────────────────────────
function NotifRow({ icon, title, description, checked, onToggle }: {
    icon: React.ReactNode; title: string; description: string; checked: boolean; onToggle: () => void;
}) {

    return (
        <div className="flex items-center gap-4 py-3.5 border-b border-gray-50 last:border-0">
            <div className="h-4 w-4 shrink-0 rounded-xl bg-gray-50 flex items-center justify-center text-base text-gray-500">{icon}</div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">{title}</p>
                <p className="text-xs text-gray-400">{description}</p>
            </div>
            <Switch
                checked={checked}
                onCheckedChange={onToggle}
                className="data-[state=checked]:bg-emerald-500"
            />
        </div>
    );
}
