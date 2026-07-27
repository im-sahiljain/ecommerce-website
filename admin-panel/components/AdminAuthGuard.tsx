"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  Tags,
  Layers,
  Gift,
  ShoppingCart,
  BarChart2,
  Settings,
  ExternalLink,
  Sparkles,
  LogOut,
  ShieldCheck,
  Palette,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";
import { API_BASE_URL } from "../config/api";

const navItems = [
  {
    href: "/",
    label: "Dashboard Overview",
    icon: LayoutDashboard,
    color: "text-pink-400",
  },
  {
    href: "/product-lines",
    label: "Product Lines",
    icon: Layers,
    color: "text-sky-400",
  },
  {
    href: "/categories",
    label: "Categories & Facets",
    icon: Tags,
    color: "text-yellow-400",
  },
  {
    href: "/themes",
    label: "Themes Manager",
    icon: Palette,
    color: "text-purple-400",
  },
  {
    href: "/products",
    label: "Products Catalog",
    icon: Package,
    color: "text-emerald-400",
  },
  {
    href: "/homepage-builder",
    label: "Homepage CMS Builder",
    icon: Sparkles,
    color: "text-pink-400",
  },
  {
    href: "/bundles",
    label: "Bundle Rules Engine",
    icon: Gift,
    color: "text-amber-400",
  },
  {
    href: "/orders",
    label: "Orders & Fulfillment",
    icon: ShoppingCart,
    color: "text-rose-400",
  },
  {
    href: "/analytics",
    label: "Analytics & Insights",
    icon: BarChart2,
    color: "text-cyan-400",
  },
  {
    href: "/settings",
    label: "Settings & WhatsApp",
    icon: Settings,
    color: "text-slate-400",
  },
];

export default function AdminAuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [adminUser, setAdminUser] = useState<{ username: string } | null>(null);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);

  useEffect(() => {
    if (pathname === "/login") {
      setIsAuthenticated(true);
      return;
    }

    const token = localStorage.getItem("admin_token");
    if (!token) {
      setIsAuthenticated(false);
      router.push("/login");
      return;
    }

    // Verify token with backend
    fetch(`${API_BASE_URL}/api/admin/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then((data) => {
        setAdminUser(data.admin || { username: "Admin" });
        setIsAuthenticated(true);
      })
      .catch(() => {
        localStorage.removeItem("admin_token");
        localStorage.removeItem("admin_user");
        setIsAuthenticated(false);
        router.push("/login");
      });
  }, [pathname, router]);

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    if (confirm("Are you sure you want to log out of the Admin Panel?")) {
      localStorage.removeItem("admin_token");
      localStorage.removeItem("admin_user");
      router.push("/login");
      router.refresh();
    }
  };

  if (pathname === "/login") {
    return <>{children}</>;
  }

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-800">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-pink-500/30 border-t-pink-500 rounded-full animate-spin" />
          <span className="text-xs font-bold tracking-wider uppercase text-slate-500">
            Verifying Admin Session...
          </span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row text-slate-800 bg-slate-50 antialiased font-sans w-full overflow-x-hidden">
      {/* Top Mobile Bar (Visible on mobile/tablet < lg) */}
      <header className="lg:hidden bg-slate-900 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-40 shadow-md">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            aria-label="Toggle navigation menu"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
          >
            {isMobileOpen ? (
              <X className="w-5 h-5 text-pink-400" />
            ) : (
              <Menu className="w-5 h-5 text-pink-400" />
            )}
          </button>
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 bg-pink-500 text-white rounded-lg flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-sm text-white tracking-tight">
              Craft and Kit
            </span>
          </div>
        </div>

        <a
          href="https://ecommerce-website-pink-eight.vercel.app"
          target="_blank"
          rel="noreferrer"
          className="p-2 bg-slate-800 hover:bg-slate-700 text-pink-400 rounded-xl transition flex items-center space-x-1 text-xs font-bold"
        >
          <span>Store</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </header>

      {/* Backdrop overlay for mobile menu */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Desktop & Mobile Slide-out Sidebar */}
      <aside
        className={`bg-slate-900 text-white flex flex-col justify-between p-4 lg:p-5 fixed top-0 bottom-0 left-0 z-50 shadow-2xl transition-all duration-300 ease-in-out ${
          isMobileOpen
            ? "translate-x-0 w-64"
            : "-translate-x-full lg:translate-x-0"
        } ${isCollapsed ? "lg:w-20" : "lg:w-64"}`}
      >
        <div className="space-y-6">
          {/* Logo & Desktop Collapse Toggle Button */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center space-x-3 overflow-hidden">
              <div className="w-9 h-9 bg-pink-500 text-white rounded-xl flex items-center justify-center font-bold shadow-md shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              {!isCollapsed && (
                <div className="truncate transition-opacity duration-200">
                  <h1 className="font-extrabold text-base tracking-tight text-white truncate">
                    Craft and Kit
                  </h1>
                  <span className="text-[10px] font-bold text-pink-400 uppercase tracking-widest block">
                    Admin Control
                  </span>
                </div>
              )}
            </div>

            {/* Desktop Collapse / Expand Button */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
              className="hidden lg:flex p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition shrink-0"
            >
              {isCollapsed ? (
                <ChevronRight className="w-4 h-4 text-pink-400" />
              ) : (
                <ChevronLeft className="w-4 h-4 text-pink-400" />
              )}
            </button>
          </div>

          {/* Navigation Menu */}
          <nav className="space-y-1.5 text-xs font-semibold overflow-y-auto max-h-[calc(100vh-220px)]">
            {navItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={isCollapsed ? item.label : undefined}
                  className={`flex items-center space-x-3 px-3 py-3 rounded-xl transition group relative ${
                    isActive
                      ? "bg-pink-600 text-white font-bold shadow-md"
                      : "hover:bg-slate-800 text-slate-300 hover:text-white"
                  } ${isCollapsed ? "justify-center px-0" : ""}`}
                >
                  <IconComponent className={`w-5 h-5 shrink-0 ${item.color}`} />
                  {!isCollapsed && (
                    <span className="truncate transition-opacity duration-200">
                      {item.label}
                    </span>
                  )}

                  {/* Tooltip on Collapsed Mode */}
                  {isCollapsed && (
                    <span className="absolute left-full ml-3 px-2.5 py-1 bg-slate-900 text-white text-[11px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition pointer-events-none shadow-xl whitespace-nowrap z-50 border border-slate-700">
                      {item.label}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section: Admin User & Logout */}
        <div className="pt-4 border-t border-slate-800 text-xs space-y-2 mt-auto">
          {!isCollapsed ? (
            <>
              <div className="px-3 py-2 bg-slate-800/80 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2 truncate">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="font-bold text-slate-200 truncate">
                    {adminUser?.username || "Admin User"}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  title="Logout of Admin Panel"
                  className="p-1.5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded-lg transition shrink-0"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>

              <a
                href="https://ecommerce-website-pink-eight.vercel.app"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold transition"
              >
                <span>View Storefront</span>
                <ExternalLink className="w-3.5 h-3.5 text-pink-400" />
              </a>
            </>
          ) : (
            <div className="flex flex-col items-center space-y-2">
              <button
                onClick={handleLogout}
                title="Logout of Admin Panel"
                className="p-2.5 bg-slate-800 hover:bg-rose-500/20 text-slate-300 hover:text-rose-400 rounded-xl transition"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area (Dynamically offset based on sidebar width) */}
      <main
        className={`flex-1 min-h-screen transition-all duration-300 ease-in-out w-full ${
          isCollapsed ? "lg:pl-20" : "lg:pl-64"
        }`}
      >
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
