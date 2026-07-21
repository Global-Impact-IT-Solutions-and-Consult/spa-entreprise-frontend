'use client';

import { useAuthStore } from '@/store/auth.store';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
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
  ShieldCheck,
  Newspaper,
  Menu,
  X,
} from 'lucide-react';
import {
  AdminHeaderProvider,
  useAdminHeader,
} from '@/contexts/AdminHeaderContext';
import { Input } from '@/components/ui/input';
import Image from 'next/image';

const adminSidebarItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
  { icon: Users, label: 'User Management', href: '/admin/users' },
  {
    icon: ShieldCheck,
    label: 'Admin Management',
    href: '/admin/admins',
    superAdminOnly: true,
  },
  { icon: Building2, label: 'Business Management', href: '/admin/businesses' },
  { icon: CheckSquare, label: 'Approval', href: '/admin/approval' },
  {
    icon: ClipboardList,
    label: 'Service Categories',
    href: '/admin/categories',
  },
  { icon: Newspaper, label: 'Blog Management', href: '/admin/blogs' },
  { icon: Calendar, label: 'Bookings Management', href: '/admin/bookings' },
  { icon: CreditCard, label: 'Payment Management', href: '/admin/payments' },
  { icon: Settings, label: 'Settings', href: '/admin/settings' },
  { icon: FileText, label: 'Activity Logs', href: '/admin/logs' },
];

function AdminSidebarNav({
  pathname,
  isSuperAdmin,
  onNavigate,
  onLogout,
}: {
  pathname: string;
  isSuperAdmin?: boolean;
  onNavigate?: () => void;
  onLogout: () => void;
}) {
  return (
    <>
      <div className="px-6 py-6">
        <Image
          src="/Logo_White.svg"
          alt="iBookam Logo"
          width={150}
          height={50}
        />
      </div>

      <div className="px-6 pb-2">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          {isSuperAdmin ? 'SUPER ADMIN' : 'ADMIN'}
        </p>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
        {adminSidebarItems
          .filter((item) => !item.superAdminOnly || isSuperAdmin)
          .map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/admin' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-[#9333EA] text-white'
                    : 'text-gray-400 hover:bg-[#1F2937] hover:text-white',
                )}
              >
                <item.icon
                  className={cn(
                    'h-5 w-5 shrink-0',
                    isActive ? 'text-white' : 'text-gray-400',
                  )}
                />
                {item.label}
              </Link>
            );
          })}
      </nav>

      <div className="p-4 border-t border-gray-700">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-gray-400 hover:bg-[#1F2937] hover:text-white transition-all duration-200"
        >
          <LogOut className="h-5 w-5" />
          Log Out
        </button>
      </div>
    </>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout: logoutStore } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Redirect if not admin
    if (user && user.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [user, router]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [mobileMenuOpen]);

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
        {/* Desktop Sidebar — unchanged on md+ */}
        <div className="hidden md:flex w-[280px] bg-[#111827] flex-col shrink-0">
          <AdminSidebarNav
            pathname={pathname}
            isSuperAdmin={user.isSuperAdmin}
            onLogout={handleLogout}
          />
        </div>

        {/* Mobile Sidebar Drawer */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
        )}
        <div
          className={cn(
            'fixed inset-y-0 left-0 z-50 flex w-[min(280px,85vw)] bg-[#111827] flex-col transition-transform duration-200 ease-out md:hidden',
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full',
          )}
          role="dialog"
          aria-modal="true"
          aria-label="Admin navigation"
        >
          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            className="absolute right-3 top-4 p-2 rounded-lg text-gray-400 hover:bg-[#1F2937] hover:text-white"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
          <AdminSidebarNav
            pathname={pathname}
            isSuperAdmin={user.isSuperAdmin}
            onNavigate={() => setMobileMenuOpen(false)}
            onLogout={handleLogout}
          />
        </div>

        {/* Main Content */}
        <div className="flex flex-1 flex-col h-full overflow-hidden min-w-0">
          <AdminHeaderBar onOpenMobileMenu={() => setMobileMenuOpen(true)} />
          <main className="flex-1 overflow-y-auto overflow-x-hidden">
            {children}
          </main>
        </div>
      </div>
    </AdminHeaderProvider>
  );
}

function AdminHeaderBar({
  onOpenMobileMenu,
}: {
  onOpenMobileMenu: () => void;
}) {
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
    <header className="border-b bg-white shrink-0">
      <div className="flex items-center justify-between gap-2 md:gap-4 px-4 md:px-6 py-3 md:py-4">
        <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0 max-w-2xl">
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="md:hidden p-2 -ml-1 rounded-lg text-gray-600 hover:bg-gray-100 shrink-0"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="search"
              placeholder="Search users, businesses, bookings."
              className="pl-9 h-10 bg-gray-50 border-gray-200 rounded-lg text-sm"
            />
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-3 shrink-0">
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
          {/* Desktop header actions — unchanged placement */}
          {headerActions ? (
            <div className="hidden md:flex items-center gap-3 shrink-0">
              {headerActions}
            </div>
          ) : null}
        </div>
      </div>
      {/* Mobile header actions row */}
      {headerActions ? (
        <div className="flex md:hidden items-center gap-2 px-4 pb-3 overflow-x-auto [&>*]:shrink-0">
          {headerActions}
        </div>
      ) : null}
    </header>
  );
}
