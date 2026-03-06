'use client';

import { useAuthStore } from '@/store/auth.store';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { authService } from '@/services/auth.service';
import { toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Building2,
  ClipboardList,
  Calendar,
  CreditCard,
  Settings,
  FileText,
  LogOut,
  CheckSquare,
  Bell,
  Search,
} from 'lucide-react';
import {
  AdminHeaderProvider,
  useAdminHeader,
} from '@/contexts/AdminHeaderContext';
import { Input } from '@/components/ui/input';

const adminSidebarItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
  { icon: Users, label: 'User Management', href: '/admin/users' },
  { icon: Building2, label: 'Business Management', href: '/admin/businesses' },
  { icon: CheckSquare, label: 'Approval', href: '/admin/approval' },
  {
    icon: ClipboardList,
    label: 'Service Categories',
    href: '/admin/categories',
  },
  { icon: Calendar, label: 'Bookings Management', href: '/admin/bookings' },
  { icon: CreditCard, label: 'Payment Management', href: '/admin/payments' },
  { icon: Settings, label: 'Settings', href: '/admin/settings' },
  { icon: FileText, label: 'Activity Logs', href: '/admin/logs' },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout: logoutStore } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Redirect if not admin
    if (user && user.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [user, router]);

  const handleLogout = async () => {
    try {
      await authService.logout();
      logoutStore();
      toaster.create({
        title: 'Logged out',
        description: 'You have been successfully logged out.',
        type: 'success',
      });
      router.push('/auth/login');
    } catch (error) {
      console.error('Logout error:', error);
      logoutStore();
      router.push('/auth/login');
    }
  };

  if (!user || user.role !== 'admin') {
    return null; // Or a loading state
  }

  return (
    <AdminHeaderProvider>
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        {/* Left Sidebar */}
        <div className="hidden md:flex w-[280px] bg-[#111827] flex-col shrink-0">
          {/* Logo Section */}
          <div className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#9333EA] text-white font-bold text-xl">
                WP
              </div>
              <div>
                <h1 className="text-sm font-bold text-white">WellnessPro</h1>
              </div>
            </div>
          </div>

          {/* SUPER ADMIN Label */}
          <div className="px-6 pb-2">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              SUPER ADMIN
            </p>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            {adminSidebarItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== '/admin' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-[#9333EA] text-white'
                      : 'text-gray-400 hover:bg-[#1F2937] hover:text-white',
                  )}
                >
                  <item.icon
                    className={cn(
                      'h-5 w-5',
                      isActive ? 'text-white' : 'text-gray-400',
                    )}
                  />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Logout Button */}
          <div className="p-4 border-t border-gray-700">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-gray-400 hover:bg-[#1F2937] hover:text-white transition-all duration-200"
            >
              <LogOut className="h-5 w-5" />
              Log Out
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-1 flex-col h-full overflow-hidden">
          <AdminHeaderBar />
          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>
    </AdminHeaderProvider>
  );
}

function AdminHeaderBar() {
  const { headerActions } = useAdminHeader();
  const dateTime = new Date().toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  return (
    <header className="flex items-center justify-between gap-4 border-b bg-white px-6 py-4 shrink-0">
      <div className="flex items-center gap-4 flex-1 max-w-2xl">
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#9333EA] text-white font-bold text-xl">
            WP
          </div>
          <span className="text-sm font-bold text-gray-900 hidden sm:inline">
            WellnessPro
          </span>
        </div>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="search"
            placeholder="Search users, businesses, bookings."
            className="pl-9 h-10 bg-gray-50 border-gray-200 rounded-lg"
          />
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <span className="text-sm text-gray-500 hidden lg:inline">
          {dateTime}
        </span>
        <button
          type="button"
          className="p-2.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
        </button>
        {headerActions}
      </div>
    </header>
  );
}
