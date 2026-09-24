"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import { Bell, LogOut, Menu, X, GraduationCap, LayoutDashboard, FileText, Users, BookOpen } from "lucide-react";
import useSWR from "swr";

interface User {
  id: number;
  fullName: string;
  email: string;
  role: string;
  matricNo?: string;
  staffId?: string;
}

const fetcher = (url: string) => fetch(url).then(r => r.json());

const roleIcons: Record<string, React.ReactNode> = {
  Dashboard: <LayoutDashboard size={16} />,
  Users: <Users size={16} />,
  Courses: <BookOpen size={16} />,
  Reports: <FileText size={16} />,
  Notifications: <Bell size={16} />,
};

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: userData } = useSWR("/api/auth/me", fetcher);
  const { data: notifData } = useSWR("/api/notifications", fetcher, { refreshInterval: 30000 });

  const user: User | undefined = userData?.user;
  const unreadCount = notifData?.notifications?.filter((n: { isRead: boolean }) => !n.isRead).length || 0;

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  const navItems = user?.role === "student"
    ? [{ href: "/student/dashboard", label: "Dashboard" }, { href: "/notifications", label: "Notifications" }]
    : user?.role === "lecturer"
    ? [{ href: "/lecturer/dashboard", label: "Dashboard" }, { href: "/lecturer/reports", label: "Reports" }, { href: "/notifications", label: "Notifications" }]
    : [{ href: "/admin/dashboard", label: "Dashboard" }, { href: "/admin/users", label: "Users" }, { href: "/admin/courses", label: "Courses" }];

  return (
    <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-lg border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2.5">
            <img src="/school.jpeg" alt="MAPOLY" className="w-8 h-8 object-contain rounded-md" />
            <span className="text-base font-bold gradient-text">MAPOLY</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                  pathname.startsWith(item.href)
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}>
                {roleIcons[item.label]}
                {item.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-2">
            <img src="/dept.jpeg" alt="CS Dept" className="w-8 h-8 object-contain rounded-md" />
            <button onClick={() => router.push("/notifications")} className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-all">
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold w-4.5 h-4.5 flex items-center justify-center rounded-full ring-2 ring-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
            <div className="h-6 w-px bg-gray-200 mx-1" />
            <div className="flex items-center gap-2 px-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                {user?.fullName?.charAt(0) || "?"}
              </div>
              <span className="text-sm text-gray-700 font-medium max-w-[120px] truncate">{user?.fullName}</span>
            </div>
            <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Logout">
              <LogOut size={18} />
            </button>
          </div>

          <button className="md:hidden p-2 text-gray-600 hover:bg-gray-50 rounded-lg" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden pb-4 space-y-1 fade-in">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm ${
                  pathname.startsWith(item.href) ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-600 hover:bg-gray-50"
                }`} onClick={() => setMobileOpen(false)}>
                {roleIcons[item.label]}
                {item.label}
              </Link>
            ))}
            <div className="border-t border-gray-100 my-2" />
            <div className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-[10px] font-bold">
                {user?.fullName?.charAt(0) || "?"}
              </div>
              {user?.fullName}
            </div>
            <button onClick={handleLogout} className="flex items-center gap-2 w-full text-left px-3 py-2.5 rounded-lg text-sm text-red-600 hover:bg-red-50">
              <LogOut size={16} /> Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
