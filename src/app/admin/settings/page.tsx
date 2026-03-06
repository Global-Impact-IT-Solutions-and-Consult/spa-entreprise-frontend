'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  adminService,
  type NotificationPreferences,
} from '@/services/admin.service';
import { userService } from '@/services/user.service';
import { Camera, CheckCircle, Monitor, Smartphone } from 'lucide-react';
import { toaster } from '@/components/ui/toaster';

export default function AdminSettingsPage() {
  const { user, updateUser } = useAuthStore();
  const [notifications, setNotifications] = useState<NotificationPreferences>({
    newUserRegistration: true,
    businessApprovalRequests: true,
    newBookings: true,
    paymentDisputes: false,
    systemUpdates: true,
  });
  const [sessions, setSessions] = useState<
    {
      id: string;
      device: string;
      location: string;
      lastActive: string;
      current: boolean;
      canRevoke: boolean;
    }[]
  >([]);
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    bio: '',
  });
  const [password, setPassword] = useState({
    current: '',
    new: '',
    confirm: '',
  });
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [loadingNotif, setLoadingNotif] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setProfile({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        bio: (user as any).bio || '',
      });
      setMfaEnabled(!!(user as any).mfaEnabled);
    }
  }, [user]);

  useEffect(() => {
    adminService
      .getNotificationPreferences()
      .then(setNotifications)
      .catch(() => {});
    adminService
      .getSessions()
      .then(setSessions)
      .catch(() => setSessions([]));
  }, []);

  const handleSaveNotifications = async () => {
    setLoadingNotif(true);
    try {
      const updated =
        await adminService.updateNotificationPreferences(notifications);
      setNotifications(updated);
      toaster.create({ title: 'Preferences saved', type: 'success' });
    } catch {
      toaster.create({
        title: 'Error',
        description: 'Failed to save notification preferences.',
        type: 'error',
      });
    } finally {
      setLoadingNotif(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingProfile(true);
    try {
      const updated = await userService.updateProfile({
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: profile.phone,
        bio: profile.bio,
      });
      updateUser(updated);
      toaster.create({ title: 'Profile updated', type: 'success' });
    } catch {
      toaster.create({
        title: 'Error',
        description: 'Failed to update profile.',
        type: 'error',
      });
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    try {
      await adminService.revokeSession(sessionId);
      toaster.create({ title: 'Session revoked', type: 'success' });
      const updated = await adminService.getSessions();
      setSessions(updated);
    } catch (e: any) {
      toaster.create({
        title: 'Error',
        description: e.response?.data?.message || 'Failed to revoke session.',
        type: 'error',
      });
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.new !== password.confirm) {
      toaster.create({
        title: 'Error',
        description: 'New passwords do not match.',
        type: 'error',
      });
      return;
    }
    setLoadingPassword(true);
    try {
      await userService.changePassword({
        currentPassword: password.current,
        newPassword: password.new,
      });
      setPassword({ current: '', new: '', confirm: '' });
      toaster.create({ title: 'Password updated', type: 'success' });
    } catch (e: any) {
      const raw = e.response?.data?.message;
      const msg = Array.isArray(raw)
        ? raw[0]
        : raw || 'Failed to update password.';
      toaster.create({ title: 'Error', description: msg, type: 'error' });
    } finally {
      setLoadingPassword(false);
    }
  };

  const initials =
    [profile.firstName, profile.lastName]
      .map((s) => (s || '').charAt(0))
      .join('')
      .toUpperCase() || 'AW';

  return (
    <div className="p-6 md:p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Settings
        </h1>
        <p className="text-gray-600 mt-1">
          Manage your admin account and preferences.
        </p>
      </div>

      <Card className="mb-6">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Profile Information
          </h2>
          <div className="flex items-start gap-6 mb-6">
            <div className="relative">
              <Avatar className="h-20 w-20 rounded-full bg-[#9333EA] text-white text-2xl">
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <button
                type="button"
                className="absolute bottom-0 right-0 rounded-full bg-gray-200 p-1.5 hover:bg-gray-300"
              >
                <Camera className="h-4 w-4 text-gray-600" />
              </button>
            </div>
            <form
              onSubmit={handleSaveProfile}
              className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              <div>
                <Label>First Name</Label>
                <Input
                  value={profile.firstName}
                  onChange={(e) =>
                    setProfile((p) => ({ ...p, firstName: e.target.value }))
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Last Name</Label>
                <Input
                  value={profile.lastName}
                  onChange={(e) =>
                    setProfile((p) => ({ ...p, lastName: e.target.value }))
                  }
                  className="mt-1"
                />
              </div>
              <div className="sm:col-span-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={profile.email}
                  disabled
                  className="mt-1 bg-gray-50"
                />
              </div>
              <div className="sm:col-span-2">
                <Label>Phone</Label>
                <Input
                  value={profile.phone}
                  onChange={(e) =>
                    setProfile((p) => ({ ...p, phone: e.target.value }))
                  }
                  className="mt-1"
                />
              </div>
              <div className="sm:col-span-2">
                <Label>Bio</Label>
                <Textarea
                  value={profile.bio}
                  onChange={(e) =>
                    setProfile((p) => ({ ...p, bio: e.target.value }))
                  }
                  className="mt-1"
                  placeholder="Super administrator with full access."
                />
              </div>
              <div className="sm:col-span-2 flex justify-end">
                <Button
                  type="submit"
                  className="bg-[#9333EA] hover:bg-[#7e22ce]"
                  disabled={loadingProfile}
                >
                  {loadingProfile ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Security</h2>
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-900 mb-3">
              Change Password
            </h3>
            <form
              onSubmit={handleUpdatePassword}
              className="space-y-3 max-w-sm"
            >
              <div>
                <Label>Current Password</Label>
                <Input
                  type="password"
                  value={password.current}
                  onChange={(e) =>
                    setPassword((p) => ({ ...p, current: e.target.value }))
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label>New password</Label>
                <Input
                  type="password"
                  value={password.new}
                  onChange={(e) =>
                    setPassword((p) => ({ ...p, new: e.target.value }))
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Confirm New Password</Label>
                <Input
                  type="password"
                  value={password.confirm}
                  onChange={(e) =>
                    setPassword((p) => ({ ...p, confirm: e.target.value }))
                  }
                  className="mt-1"
                />
              </div>
              <Button
                type="submit"
                className="bg-[#9333EA] hover:bg-[#7e22ce]"
                disabled={loadingPassword}
              >
                {loadingPassword ? 'Updating...' : 'Update Password'}
              </Button>
            </form>
          </div>
          <div className="flex items-center justify-between py-3 border-t">
            <div>
              <p className="font-medium text-gray-900">
                Two-Factor Authentication
              </p>
              <p className="text-sm text-gray-500">
                Add an extra layer of security to your account.
              </p>
            </div>
            <Switch checked={mfaEnabled} onCheckedChange={setMfaEnabled} />
          </div>
          {mfaEnabled && (
            <p className="text-sm text-green-600 flex items-center gap-1 mt-2">
              <CheckCircle className="h-4 w-4" /> Two-factor authentication is
              enabled. Use an authenticator app to generate codes.
            </p>
          )}
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-900 mb-3">
              Active Sessions
            </h3>
            <div className="space-y-3">
              {sessions.length === 0 ? (
                <p className="text-sm text-gray-500">No sessions data.</p>
              ) : (
                sessions.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-center gap-3">
                      {s.current ? (
                        <Monitor className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Smartphone className="h-5 w-5 text-gray-400" />
                      )}
                      <div>
                        <p className="font-medium text-gray-900">{s.device}</p>
                        <p className="text-sm text-gray-500">{s.location}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      {s.current ? (
                        <span className="text-sm text-green-600 font-medium">
                          Active Now
                        </span>
                      ) : s.canRevoke ? (
                        <button
                          type="button"
                          onClick={() => handleRevokeSession(s.id)}
                          className="text-sm text-red-600 hover:underline"
                        >
                          Revoke
                        </button>
                      ) : (
                        <span className="text-sm text-gray-500">
                          Last active {s.lastActive}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Notification Preferences
          </h2>
          <div className="space-y-4">
            {[
              {
                key: 'newUserRegistration' as const,
                label: 'New User Registration',
                desc: 'Receive an email when a new user signs up.',
              },
              {
                key: 'businessApprovalRequests' as const,
                label: 'Business Approval Requests',
                desc: 'Get notified when a business submits for approval.',
              },
              {
                key: 'newBookings' as const,
                label: 'New Bookings',
                desc: 'Notify me when a booking is made.',
              },
              {
                key: 'paymentDisputes' as const,
                label: 'Payment Disputes',
                desc: 'Alerts for disputed transactions.',
              },
              {
                key: 'systemUpdates' as const,
                label: 'System Updates',
                desc: 'Information about platform maintenance.',
              },
            ].map(({ key, label, desc }) => (
              <div
                key={key}
                className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
              >
                <div>
                  <p className="font-medium text-gray-900">{label}</p>
                  <p className="text-sm text-gray-500">{desc}</p>
                </div>
                <Switch
                  checked={!!notifications[key]}
                  onCheckedChange={(c) =>
                    setNotifications((n) => ({ ...n, [key]: c }))
                  }
                />
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-end">
            <Button
              onClick={handleSaveNotifications}
              className="bg-[#9333EA] hover:bg-[#7e22ce]"
              disabled={loadingNotif}
            >
              {loadingNotif ? 'Saving...' : 'Save Preferences'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
