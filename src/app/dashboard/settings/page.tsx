'use client';

import { useState, useEffect } from 'react';
import { Bell, CreditCard, User, Mail, Smartphone, MessageSquare, Info, Calendar, ShieldCheck, Loader2, Clock } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { useAuthStore } from "@/store/auth.store";
import CustomInput from '@/components/ui/InputGroup';
import { userService, UpdateUserDto } from '@/services/user.service';
import { toaster } from '@/components/ui/toaster';

type TabType = 'profile' | 'company' | 'notifications' | 'security';

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState<TabType>('profile');
    const { user, updateUser } = useAuthStore();

    const tabs = [
        { id: 'profile', label: 'User Profile', icon: User },
        { id: 'company', label: 'Company Setting', icon: CreditCard },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'security', label: 'Security', icon: ShieldCheck },
    ];

    return (
        <div className="space-y-8 max-w-5xl mx-auto pb-20">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 leading-tight">Settings</h1>
                <p className="text-sm text-gray-500 font-medium">Change settings</p>
            </div>

            {/* Tabs Navigation */}
            <div className="bg-gray-100/50 p-1.5 rounded-2xl inline-flex gap-2">
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as TabType)}
                            className={cn(
                                "flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-200",
                                isActive
                                    ? "bg-[#F59E0B] text-white shadow-lg shadow-amber-200"
                                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-200/50"
                            )}
                        >
                            <tab.icon className="h-4 w-4" />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 min-h-[600px]">
                {activeTab === 'profile' && <UserProfileTab user={user} onUpdate={updateUser} />}
                {activeTab === 'company' && <CompanySettingTab />}
                {activeTab === 'notifications' && <NotificationsTab />}
                {activeTab === 'security' && <SecurityTab />}
            </div>
        </div>
    );
}

function UserProfileTab({ user, onUpdate }: { user: any, onUpdate: (user: any) => void }) {
    const [formData, setFormData] = useState<UpdateUserDto>({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        phone: user?.phone || '',
    });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                phone: user.phone || '',
            });
        }
    }, [user]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const updatedUser = await userService.updateProfile(formData, user?.id);
            onUpdate(updatedUser);
            toaster.create({
                title: "Profile Updated",
                description: "Your profile information has been successfully updated.",
                type: "success"
            });
        } catch (error: any) {
            console.error("Failed to update profile", error);
            const errorMessage = error.response?.data?.message || error.message || "There was an error updating your profile. Please try again.";
            toaster.create({
                title: "Update Failed",
                description: errorMessage,
                type: "error"
            });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-8 max-w-2xl">
            <div className="flex items-center gap-4 mb-4">
                <div className="h-12 w-12 rounded-2xl bg-amber-50 flex items-center justify-center">
                    <User className="h-6 w-6 text-[#F59E0B]" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-gray-900">User Profile</h3>
                    <p className="text-sm text-gray-500 font-medium tracking-tight">Manage your personal information</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
                <CustomInput
                    label="First Name"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    placeholder="First Name"
                    className="h-[56px] rounded-2xl"
                />
                <CustomInput
                    label="Last Name"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    placeholder="Last Name"
                    className="h-[56px] rounded-2xl"
                />
            </div>
            <CustomInput
                label="Email Address"
                value={user?.email || ''}
                placeholder="Email"
                className="h-[56px] rounded-2xl bg-gray-50/50"
                disabled
            />
            <CustomInput
                label="Phone Number"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Phone Number"
                className="h-[56px] rounded-2xl"
            />

            <div className="pt-4">
                <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="h-14 px-10 rounded-2xl bg-[#F59E0B] hover:bg-[#d48a1f] text-white font-bold text-lg transition-all"
                >
                    {isSaving ? (
                        <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Saving...
                        </>
                    ) : 'Save Changes'}
                </Button>
            </div>
        </div>
    );
}

function CompanySettingTab() {
    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4 mb-4">
                <div className="h-12 w-12 rounded-2xl bg-amber-50 flex items-center justify-center">
                    <CreditCard className="h-6 w-6 text-[#F59E0B]" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-gray-900">Payment</h3>
                    <p className="text-sm text-gray-500 font-medium tracking-tight">Manage your payment</p>
                </div>
            </div>

            <div className="p-8 rounded-[2rem] border border-dashed border-gray-200 flex flex-col items-center justify-center text-center space-y-4 py-24 bg-gray-50/30">
                <div className="h-16 w-16 rounded-full bg-white shadow-sm flex items-center justify-center border border-gray-100 text-gray-300">
                    <CreditCard className="h-8 w-8" />
                </div>
                <div className="space-y-1">
                    <h4 className="text-lg font-bold text-gray-900">No payment method added</h4>
                    <p className="text-sm text-gray-500 max-w-xs mx-auto">Add a payout method to receive your business earnings directly in your bank account.</p>
                </div>
                <Button variant="outline" className="h-12 px-8 rounded-xl font-bold mt-4 hover:bg-white hover:border-[#F59E0B] hover:text-[#F59E0B] transition-all">
                    Add Payout Method
                </Button>
            </div>
        </div>
    );
}

function NotificationsTab() {
    const [settings, setSettings] = useState({
        email: true,
        newBooking: true,
        payment: true,
        review: true,
        system: true,
        sms: false,
        bookingReminder: false,
        paymentConfirmation: false,
        push: true,
        realtimeBooking: true,
        urgent: true
    });

    const toggleSetting = (key: keyof typeof settings) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <div className="space-y-12">
            <div className="flex items-center gap-4 mb-4">
                <div className="h-12 w-12 rounded-2xl bg-amber-50 flex items-center justify-center">
                    <Bell className="h-6 w-6 text-[#F59E0B]" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-gray-900">Notifications</h3>
                    <p className="text-sm text-gray-500 font-medium tracking-tight">Configure how and when you receive notifications</p>
                </div>
            </div>

            {/* Email Notifications Section */}
            <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                    <div>
                        <h4 className="text-base font-bold text-gray-900">Email Notifications</h4>
                        <p className="text-xs text-gray-500 font-medium tracking-tight">Receive updates and alerts via email</p>
                    </div>
                    <Switch
                        checked={settings.email}
                        onCheckedChange={() => toggleSetting('email')}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <NotificationCard
                        icon={Calendar}
                        title="New Booking Alerts"
                        description="When a customer books your service"
                        checked={settings.newBooking}
                        onCheckedChange={() => toggleSetting('newBooking')}
                    />
                    <NotificationCard
                        icon={CreditCard}
                        title="Payment Notifications"
                        description="When payments are received or released"
                        checked={settings.payment}
                        onCheckedChange={() => toggleSetting('payment')}
                    />
                    <NotificationCard
                        icon={MessageSquare}
                        title="Review Notifications"
                        description="When customers leave reviews"
                        checked={settings.review}
                        onCheckedChange={() => toggleSetting('review')}
                    />
                    <NotificationCard
                        icon={Info}
                        title="System Alerts"
                        description="Important platform updates and maintenance"
                        checked={settings.system}
                        onCheckedChange={() => toggleSetting('system')}
                    />
                </div>
            </div>

            {/* SMS Notifications Section */}
            <div className="space-y-6 pt-4">
                <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                    <div>
                        <h4 className="text-base font-bold text-gray-900">SMS Notifications</h4>
                        <p className="text-xs text-gray-500 font-medium tracking-tight">Receive urgent alerts via SMS</p>
                    </div>
                    <Switch
                        checked={settings.sms}
                        onCheckedChange={() => toggleSetting('sms')}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <NotificationCard
                        icon={Clock}
                        title="Booking Reminders"
                        description="Reminders before appointments"
                        checked={settings.bookingReminder}
                        onCheckedChange={() => toggleSetting('bookingReminder')}
                    />
                    <NotificationCard
                        icon={ShieldCheck}
                        title="Payment Confirmations"
                        description="When payments are successfully processed"
                        checked={settings.paymentConfirmation}
                        onCheckedChange={() => toggleSetting('paymentConfirmation')}
                    />
                </div>
            </div>

            {/* Push Notifications Section */}
            <div className="space-y-6 pt-4">
                <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                    <div>
                        <h4 className="text-base font-bold text-gray-900">Push Notifications</h4>
                        <p className="text-xs text-gray-500 font-medium tracking-tight">Receive real-time alerts on your devices</p>
                    </div>
                    <Switch
                        checked={settings.push}
                        onCheckedChange={() => toggleSetting('push')}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <NotificationCard
                        icon={Calendar}
                        title="Real-time Bookings"
                        description="Instant alerts for new bookings"
                        checked={settings.realtimeBooking}
                        onCheckedChange={() => toggleSetting('realtimeBooking')}
                    />
                    <NotificationCard
                        icon={Bell}
                        title="Urgent Alerts"
                        description="Booking cancellations and changes"
                        checked={settings.urgent}
                        onCheckedChange={() => toggleSetting('urgent')}
                    />
                </div>
            </div>
        </div>
    );
}

interface NotificationCardProps {
    icon: any;
    title: string;
    description: string;
    checked: boolean;
    onCheckedChange: () => void;
}

function NotificationCard({ icon: Icon, title, description, checked, onCheckedChange }: NotificationCardProps) {
    return (
        <div
            onClick={onCheckedChange}
            className="flex items-center gap-4 p-4 rounded-2xl border border-gray-100 bg-white hover:border-amber-100 hover:shadow-sm transition-all group cursor-pointer"
        >
            <div className="h-12 w-12 shrink-0 rounded-2xl bg-gray-50 flex items-center justify-center group-hover:bg-amber-50 transition-colors">
                <Icon className="h-5 w-5 text-gray-400 group-hover:text-[#F59E0B] transition-colors" />
            </div>
            <div className="flex-1 min-w-0">
                <h5 className="text-sm font-bold text-gray-900 truncate tracking-tight">{title}</h5>
                <p className="text-[11px] text-gray-500 font-medium truncate leading-relaxed">{description}</p>
            </div>
            <Switch
                checked={checked}
                onCheckedChange={onCheckedChange}
                onClick={(e) => e.stopPropagation()}
            />
        </div>
    );
}

function SecurityTab() {
    const [passwords, setPasswords] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handlePasswordChange = async () => {
        if (passwords.newPassword !== passwords.confirmPassword) {
            setError("Passwords do not match");
            return;
        }
        if (passwords.newPassword.length < 8) {
            setError("Password must be at least 8 characters long");
            return;
        }

        setError(null);
        setIsSaving(true);
        try {
            await userService.changePassword({
                currentPassword: passwords.oldPassword,
                newPassword: passwords.newPassword
            });
            toaster.create({
                title: "Password Changed",
                description: "Your password has been successfully updated.",
                type: "success"
            });
            setPasswords({
                oldPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
        } catch (error: any) {
            console.error("Failed to change password", error);
            toaster.create({
                title: "Change Failed",
                description: error.response?.data?.message || "There was an error updating your password. Please try again.",
                type: "error"
            });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-8 max-w-2xl">
            <div className="flex items-center gap-4 mb-4">
                <div className="h-12 w-12 rounded-2xl bg-amber-50 flex items-center justify-center">
                    <ShieldCheck className="h-6 w-6 text-[#F59E0B]" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-gray-900">Change Password</h3>
                    <p className="text-sm text-gray-500 font-medium tracking-tight">Update your account password for better security</p>
                </div>
            </div>

            <div className="space-y-6">
                <CustomInput
                    type="password"
                    label="Current Password"
                    value={passwords.oldPassword}
                    onChange={(e) => setPasswords({ ...passwords, oldPassword: e.target.value })}
                    placeholder="Enter current password"
                    className="h-[56px] rounded-2xl"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <CustomInput
                        type="password"
                        label="New Password"
                        value={passwords.newPassword}
                        onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                        placeholder="Enter new password"
                        className="h-[56px] rounded-2xl"
                        error={error && passwords.newPassword !== passwords.confirmPassword ? "" : error || ""}
                    />
                    <CustomInput
                        type="password"
                        label="Confirm New Password"
                        value={passwords.confirmPassword}
                        onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                        placeholder="Confirm new password"
                        className="h-[56px] rounded-2xl"
                        error={error && passwords.newPassword !== passwords.confirmPassword ? error : ""}
                    />
                </div>
            </div>

            <div className="pt-4">
                <Button
                    onClick={handlePasswordChange}
                    disabled={isSaving || !passwords.oldPassword || !passwords.newPassword || !passwords.confirmPassword}
                    className="h-14 px-10 rounded-2xl bg-[#F59E0B] hover:bg-[#d48a1f] text-white font-bold text-lg transition-all"
                >
                    {isSaving ? (
                        <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Updating...
                        </>
                    ) : 'Update Password'}
                </Button>
            </div>
        </div>
    );
}
