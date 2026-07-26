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
} from "lucide-react";
import { API_BASE_URL } from "../config/api";

export default function AdminAuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [adminUser, setAdminUser] = useState<{ username: string } | null>(null);

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
    <div className="min-h-screen flex text-slate-800 bg-slate-50 antialiased font-sans w-full">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col justify-between p-6 fixed top-0 bottom-0 left-0 z-30 shadow-xl overflow-y-auto">
        <div className="space-y-6">
          {/* Logo */}
          <div className="flex items-center space-x-3 border-b border-slate-800 pb-4">
            <div className="w-9 h-9 bg-pink-500 text-white rounded-xl flex items-center justify-center font-bold shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-extrabold text-base tracking-tight text-white">
                Little Creators
              </h1>
              <span className="text-[10px] font-bold text-pink-400 uppercase tracking-widest block">
                Admin Control
              </span>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="space-y-1 text-xs font-semibold">
            <Link
              href="/"
              className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl transition ${
                pathname === "/"
                  ? "bg-pink-600 text-white font-bold"
                  : "hover:bg-slate-800 text-slate-300 hover:text-white"
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-pink-400" />
              <span>Dashboard Overview</span>
            </Link>

            <Link
              href="/product-lines"
              className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl transition ${
                pathname === "/product-lines"
                  ? "bg-pink-600 text-white font-bold"
                  : "hover:bg-slate-800 text-slate-300 hover:text-white"
              }`}
            >
              <Layers className="w-4 h-4 text-sky-400" />
              <span>Product Lines</span>
            </Link>

            <Link
              href="/categories"
              className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl transition ${
                pathname === "/categories"
                  ? "bg-pink-600 text-white font-bold"
                  : "hover:bg-slate-800 text-slate-300 hover:text-white"
              }`}
            >
              <Tags className="w-4 h-4 text-yellow-400" />
              <span>Categories & Facets</span>
            </Link>

            <Link
              href="/products"
              className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl transition ${
                pathname === "/products"
                  ? "bg-pink-600 text-white font-bold"
                  : "hover:bg-slate-800 text-slate-300 hover:text-white"
              }`}
            >
              <Package className="w-4 h-4 text-emerald-400" />
              <span>Products Catalog</span>
            </Link>

            <Link
              href="/bundles"
              className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl transition ${
                pathname === "/bundles"
                  ? "bg-pink-600 text-white font-bold"
                  : "hover:bg-slate-800 text-slate-300 hover:text-white"
              }`}
            >
              <Gift className="w-4 h-4 text-amber-400" />
              <span>Bundle Rules Engine</span>
            </Link>

            <Link
              href="/orders"
              className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl transition ${
                pathname === "/orders"
                  ? "bg-pink-600 text-white font-bold"
                  : "hover:bg-slate-800 text-slate-300 hover:text-white"
              }`}
            >
              <ShoppingCart className="w-4 h-4 text-rose-400" />
              <span>Orders & Fulfillment</span>
            </Link>

            <Link
              href="/analytics"
              className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl transition ${
                pathname === "/analytics"
                  ? "bg-pink-600 text-white font-bold"
                  : "hover:bg-slate-800 text-slate-300 hover:text-white"
              }`}
            >
              <BarChart2 className="w-4 h-4 text-cyan-400" />
              <span>Analytics & Insights</span>
            </Link>

            <Link
              href="/settings"
              className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl transition ${
                pathname === "/settings"
                  ? "bg-pink-600 text-white font-bold"
                  : "hover:bg-slate-800 text-slate-300 hover:text-white"
              }`}
            >
              <Settings className="w-4 h-4 text-slate-400" />
              <span>Settings & WhatsApp</span>
            </Link>
          </nav>
        </div>

        {/* Bottom Section: Admin User & Logout */}
        <div className="pt-4 border-t border-slate-800 text-xs space-y-2 mt-6">
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
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="pl-64 flex-1 min-h-screen">
        <div className="p-8 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
