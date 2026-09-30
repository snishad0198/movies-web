"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Film,
  Tv,
  Layers,
  MessageSquare,
  BarChart3,
  Settings,
  Image as ImageIcon,
  FileText,
  LogOut,
  ExternalLink,
  Menu,
  X,
  PlayCircle,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Movies", href: "/admin/movies", icon: Film },
  { label: "Web Series", href: "/admin/series", icon: Tv },
  { label: "Genres", href: "/admin/genres", icon: Layers },
  { label: "Comments", href: "/admin/comments", icon: MessageSquare },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { label: "Media Manager", href: "/admin/media", icon: ImageIcon },
  { label: "Reports & Logs", href: "/admin/reports", icon: FileText },
  { label: "Site Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [adminName, setAdminName] = useState("Admin");
  const [checkingAuth, setCheckingAuth] = useState(pathname !== "/admin/login");

  useEffect(() => {
    if (pathname === "/admin/login") return;

    let mounted = true;
    fetch("/api/admin/me")
      .then((res) => res.json())
      .then((data) => {
        if (!mounted) return;
        if (!data.success) {
          router.replace("/admin/login");
        } else {
          setAdminName(data.data?.name || "Admin");
          setCheckingAuth(false);
        }
      })
      .catch(() => {
        if (mounted) router.replace("/admin/login");
      });

    return () => {
      mounted = false;
    };
  }, [pathname, router]);

  // Skip layout for login page
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#07070e] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-red-600 border-t-transparent animate-spin" />
      </div>
    );
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      router.push("/admin/login");
    } catch {
      router.push("/admin/login");
    }
  };

  return (
    <div className="min-h-screen bg-[#07070e] text-white flex">
      {/* Mobile Top Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-[#0f101c] border-b border-white/10 flex items-center justify-between px-4 z-50">
        <div className="flex items-center gap-2.5 font-bold text-lg">
          <img
            src="/logo.jpg"
            alt="Logo"
            className="w-7 h-7 rounded-lg object-cover ring-1 ring-white/20"
          />
          <span>Movies.<span className="text-[#e50914]">Admin</span></span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg bg-white/5 border border-white/10"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed top-0 bottom-0 left-0 w-64 bg-[#090a12] border-r border-white/10 p-5 flex flex-col z-40 transition-transform duration-300 lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center gap-3 px-2 py-4 mb-6 border-b border-white/10">
          <img
            src="/logo.jpg"
            alt="Logo"
            className="w-9 h-9 rounded-xl object-cover ring-1 ring-white/20 shadow-md shadow-black/50"
          />
          <div>
            <div className="font-extrabold text-lg tracking-tight text-white">
              Movies.<span className="text-[#e50914]">snishad</span>
            </div>
            <div className="text-xs text-neutral-400 font-medium">Control Center</div>
          </div>
        </div>

        <nav className="space-y-1.5 flex-1 overflow-y-auto pr-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-[#e50914] text-white shadow-lg shadow-[#e50914]/25"
                    : "text-neutral-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="pt-4 border-t border-white/10 space-y-1">
          <a
            href="http://localhost:3001"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-sky-400 hover:bg-sky-500/10 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            <span>View Public Site</span>
          </a>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Secure Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 lg:ml-64 p-5 lg:p-8 pt-20 lg:pt-8 min-h-screen">
        {children}
      </main>
    </div>
  );
}
