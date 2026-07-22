'use client';

import { useAuthStore } from '@/store/auth.store';
import { Sidebar } from '@/components/modules/Sidebar';
import { MobileBottomNav } from '@/components/modules/MobileBottomNav';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bell, Clock, X, Info, CheckCircle2, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { authService, UserNotification } from '@/services/auth.service';
import { businessService } from '@/services/business.service';
import { notificationService } from '@/services/notification.service';
import Link from 'next/link';
import Image from 'next/image';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, updateUser } = useAuthStore();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const business = user?.businesses?.[0];
  const status = business?.status?.toLowerCase();
  const isPending = status === 'pending_approval' || status === 'pending';
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);

  const [activeTab, setActiveTab] = useState('All');
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isFetchingNotifications, setIsFetchingNotifications] = useState(false);

  useEffect(() => {
    const refreshUserData = async () => {
      if (!isAuthenticated || !business?.id) return;
      try {
        const refreshedUser = await authService.getCurrentUser();
        updateUser(refreshedUser);
      } catch (error) {
        console.error("Failed to refresh user data", error);
      }
    };

    refreshUserData();
  }, [business?.id]);

  const fetchNotifications = async () => {
    try {
      setIsFetchingNotifications(true);
      const response = await authService.getNotifications({ limit: 50 });
      setNotifications(response.notifications);
      setUnreadCount(response.unreadCount);
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    } finally {
      setIsFetchingNotifications(false);
    }
  };

  useEffect(() => {
    if (isNotificationsOpen) {
      fetchNotifications();
    }
  }, [isNotificationsOpen]);

  useEffect(() => {
    if (!isAuthenticated || !business?.id) return;

    const fetchCount = async () => {
      try {
        const response = await authService.getNotifications({ limit: 1 });
        setUnreadCount(response.unreadCount);
      } catch (error) {}
    };

    fetchCount();
    const interval = setInterval(fetchCount, 60000); // Poll every minute

    const handleRefresh = () => {
      fetchCount();
      if (isNotificationsOpen) fetchNotifications();
    };
    
    window.addEventListener('notifications:refresh', handleRefresh);
    return () => {
      clearInterval(interval);
      window.removeEventListener('notifications:refresh', handleRefresh);
    };
  }, [isAuthenticated, business?.id, isNotificationsOpen]);

  const [markingAll, setMarkingAll] = useState(false);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
      await notificationService.markAsRead(notificationId);
      window.dispatchEvent(new CustomEvent('notifications:refresh'));
    } catch (error) {
      console.error("Failed to mark notification as read", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (markingAll) return;
    setMarkingAll(true);
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      window.dispatchEvent(new CustomEvent('notifications:refresh'));
    } catch (error) {
      console.error("Failed to mark all notifications as read", error);
    } finally {
      setMarkingAll(false);
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === 'All') return true;
    const type = n.type?.toLowerCase() || '';
    if (activeTab === 'Bookings') return type.includes('booking');
    if (activeTab === 'System')
      return type.includes('system') || type.includes('alert');
    return true;
  });

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex flex-1 flex-col h-full overflow-hidden">
        {/* Header */}
        <header className="flex h-16 lg:h-20 min-h-[4rem] lg:min-h-[5rem] items-center justify-between border-b bg-white px-4 lg:px-8 shrink-0">
          <Link href="/" target="_blank" rel="noopener noreferrer" className="lg:hidden inline-block hover:opacity-80 transition-opacity">
            <Image src="/Logo.svg" alt="iBookam Logo" width={110} height={36} />
          </Link>
          <div className="hidden lg:block">
            <h1 className="text-xl font-bold text-gray-900 leading-tight">
              Dashboard
            </h1>
            <p className="text-xs text-gray-500">
              Welcome Back {user?.firstName}!
            </p>
          </div>

          {/* Right side header content: Notification & Profile */}
          {!isPending && (
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className={cn(
                  'relative h-11 w-11 flex items-center justify-center bg-gray-50 text-[#192131] hover:text-gray-900 rounded-xl transition-all duration-200 cursor-pointer',
                  isNotificationsOpen && 'bg-amber-50 text-amber-600',
                )}
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 h-2 w-2 bg-[#F59E0B] rounded-full ring-2 ring-white" />
                )}
              </button>
              <Avatar className="h-9 w-9 border-2 border-white shadow-sm ring-1 ring-[#192131]">
                <AvatarImage src={business?.profileImage || undefined} className='object-cover'/>
                <AvatarFallback className="bg-[#F59E0B] text-white font-bold">
                  {user?.firstName?.charAt(0) || 'D'}
                </AvatarFallback>
              </Avatar>
            </div>
          )}

          {/* Notification Popover */}
          {isNotificationsOpen && (
            <>
              <div
                className="fixed inset-0 z-40 bg-transparent"
                onClick={() => setIsNotificationsOpen(false)}
              />
              <div className="fixed inset-x-0 bottom-0 lg:absolute lg:inset-x-auto lg:bottom-auto top-auto lg:top-20 right-0 lg:right-8 w-full lg:w-[440px] max-h-[85vh] lg:max-h-[700px] bg-white rounded-t-2xl lg:rounded-md shadow-2xl shadow-black/10 border border-gray-100 z-50 flex flex-col overflow-hidden">
                <div className="p-4 sm:p-6 lg:p-8 pb-4">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl lg:text-2xl font-bold text-gray-900">
                      Notifications
                    </h3>
                    <div className="flex items-center gap-3">
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllAsRead}
                          disabled={markingAll}
                          className="text-xs font-bold text-amber-600 hover:text-amber-700 transition-colors flex items-center gap-1.5 p-2 -m-2"
                        >
                          {markingAll ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                          Mark all as read
                        </button>
                      )}
                      <button
                        onClick={() => setIsNotificationsOpen(false)}
                        className="h-10 w-10 flex items-center justify-center hover:bg-gray-100 rounded-lg text-gray-400 transition-colors"
                      >
                        <X className="h-5 w-5" strokeWidth={2.5} />
                      </button>
                    </div>
                  </div>

                  {/* Tabs */}
                  <div className="flex items-center gap-6">
                    {['All', 'Bookings', 'System'].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={cn(
                          'px-5 py-3 min-h-[44px] text-sm font-bold transition-all',
                          activeTab === tab
                            ? 'text-[#F59E0B] border-b-2 border-[#F59E0B]'
                            : 'text-gray-500 hover:bg-gray-50',
                        )}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="h-[1px] w-full bg-gray-50 mb-4" />

                <div className="flex-1 lg:max-h-[520px] overflow-y-auto px-6 py-2 custom-scrollbar">
                  <div className="space-y-4 pb-6">
                    {isFetchingNotifications ? (
                      <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-100 border-t-[#F59E0B]" />
                        <p className="mt-4 text-xs text-gray-400 font-medium italic">
                          Fetching notifications...
                        </p>
                      </div>
                    ) : filteredNotifications.length > 0 ? (
                      filteredNotifications.map((notif) => {
                        const date = new Date(notif.createdAt);
                        const dayTime = date
                          .toLocaleDateString('en-US', {
                            weekday: 'long',
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true,
                          })
                          .replace(',', '');

                        const now = new Date();
                        const diffMs = now.getTime() - date.getTime();
                        const diffMins = Math.floor(diffMs / 60000);
                        const diffHours = Math.floor(diffMins / 60);
                        const diffDays = Math.floor(diffHours / 24);

                        let timeAgo = `${diffMins} min ago`;
                        if (diffDays > 0)
                          timeAgo = `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
                        else if (diffHours > 0)
                          timeAgo = `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;

                        return (
                          <div
                            key={notif.id}
                            className="bg-white p-5 rounded-md border border-gray-50 shadow-sm hover:shadow-md transition-all group flex flex-col relative"
                          >
                            {!notif.read && (
                              <div className="absolute top-6 right-6 h-2 w-2 rounded-full bg-[#F59E0B]" />
                            )}

                            <div className="pr-6">
                              <h4 className="text-sm font-bold text-gray-500 leading-tight">
                                {notif.title}{' '} <br/>
                                <span className="text-gray-600 text-xs font-medium">
                                  {typeof notif.body === 'string'
                                    ? notif.body
                                    : (notif.body && typeof notif.body === 'object' && 'message' in notif.body && typeof notif.body.message === 'string')
                                      ? notif.body.message
                                      : ''}
                                </span>
                              </h4>
                            </div>

                            <div className="flex items-center justify-between mt-3">
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] font-medium text-gray-400">
                                  {dayTime}
                                </span>
                                <span className="text-[11px] font-medium text-gray-300">•</span>
                                <span className="text-[11px] font-medium text-gray-400">
                                  {timeAgo}
                                </span>
                              </div>
                              {!notif.read && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleMarkAsRead(notif.id);
                                  }}
                                  className="text-[11px] font-bold text-gray-400 hover:text-gray-600 transition-colors z-10 p-2 -m-2"
                                >
                                  Dismiss
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="flex flex-col items-center justify-center py-20 text-center">
                        <Bell className="h-12 w-12 text-gray-100 mb-4" />
                        <p className="text-sm text-gray-400 font-medium">
                          No notifications yet
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="p-4 bg-gray-50/30">
                  <Link href="/dashboard/notifications" onClick={() => setIsNotificationsOpen(false)}>
                    <Button className="w-full bg-white hover:bg-gray-50 text-gray-500 font-bold h-12 rounded-2xl text-sm transition-colors border border-gray-100 shadow-sm">
                      View All Notifications
                    </Button>
                  </Link>
                </div>
              </div>
            </>
          )}
        </header>

        {isPending && (
          <div className="bg-amber-50 border-b border-amber-100 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between px-4 lg:px-8 py-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Clock className="h-4 w-4 text-[#F59E0B] shrink-0" />
              <span className="text-sm font-bold text-amber-700">
                Account Pending Verification
              </span>
              <span className="text-xs text-amber-600/80 font-medium sm:ml-2">
                Some features will be available once your business is verified.
              </span>
            </div>
            <Link
              href="/dashboard/contact-support"
              className="h-8 rounded-lg border border-amber-200 bg-white text-amber-700 hover:bg-amber-50 hover:text-amber-800 font-bold text-xs px-3 flex items-center w-fit"
            >
              Contact Support
            </Link>
          </div>
        )}

        <main className="flex-1 overflow-y-auto p-4 pb-24 lg:p-8 lg:pb-8">{children}</main>
      </div>

      <MobileBottomNav />
    </div>
  );
}
