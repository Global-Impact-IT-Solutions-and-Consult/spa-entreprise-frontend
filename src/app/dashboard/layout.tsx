import { Sidebar } from "@/components/modules/Sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell } from "lucide-react";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <div className="flex flex-1 flex-col">
                {/* Header (Optional - usually persistent, or per-page. Screenshot shows it as part of dashboard content but logical to be here or in page. Let's put layout structure here) */}
                <header className="flex h-16 items-center justify-between border-b bg-white px-8 py-4">
                    {/* Left side header content usually goes here, but for now it's empty or breadcrumbs */}
                    <div className="flex-1"></div>

                    {/* Right side header content: Notification & Profile */}
                    <div className="flex items-center gap-4">
                        <button className="relative text-gray-500 hover:text-gray-700">
                            <Bell className="h-6 w-6" />
                            <span className="absolute right-0 top-0 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
                        </button>
                        <div className="h-8 w-px bg-gray-200" />
                        <Avatar>
                            <AvatarImage src="/assets/avatars/user.jpg" />
                            <AvatarFallback className="bg-gray-200 text-gray-600">D</AvatarFallback>
                        </Avatar>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
