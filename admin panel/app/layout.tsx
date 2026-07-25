import './globals.css';
import React from 'react';
import Link from 'next/link';
import { LayoutDashboard, Package, Tags, Palette, Users, ShoppingCart, ExternalLink, Sparkles } from 'lucide-react';

export const metadata = {
  title: 'Little Creators Admin Management Panel',
  description: 'Catalog, product listing, categories, themes, age groups and order management dashboard.',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex text-slate-800 bg-slate-50 antialiased">
        {/* Sidebar */}
        <aside className="w-64 bg-slate-900 text-white flex flex-col justify-between p-6 fixed top-0 bottom-0 left-0 z-30 shadow-xl">
          <div className="space-y-8">
            {/* Logo */}
            <div className="flex items-center space-x-3 border-b border-slate-800 pb-4">
              <div className="w-9 h-9 bg-pink-500 text-white rounded-xl flex items-center justify-center font-bold">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-extrabold text-base tracking-tight text-white">Little Creators</h1>
                <span className="text-[10px] font-bold text-pink-400 uppercase tracking-widest block">Admin Control</span>
              </div>
            </div>

            {/* Navigation Menu */}
            <nav className="space-y-1 text-xs font-semibold">
              <Link
                href="/"
                className="flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition"
              >
                <LayoutDashboard className="w-4 h-4 text-pink-400" />
                <span>Dashboard Overview</span>
              </Link>

              <Link
                href="/products"
                className="flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition"
              >
                <Package className="w-4 h-4 text-sky-400" />
                <span>Products Management</span>
              </Link>

              <Link
                href="/categories"
                className="flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition"
              >
                <Tags className="w-4 h-4 text-emerald-400" />
                <span>Categories</span>
              </Link>

              <Link
                href="/themes"
                className="flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition"
              >
                <Palette className="w-4 h-4 text-purple-400" />
                <span>Themes</span>
              </Link>

              <Link
                href="/age-groups"
                className="flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition"
              >
                <Users className="w-4 h-4 text-yellow-400" />
                <span>Age Groups</span>
              </Link>

              <Link
                href="/orders"
                className="flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition"
              >
                <ShoppingCart className="w-4 h-4 text-amber-400" />
                <span>Orders & Fulfillment</span>
              </Link>
            </nav>
          </div>

          {/* External Link to Storefront */}
          <div className="pt-4 border-t border-slate-800 text-xs">
            <a
              href="http://localhost:3000"
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
      </body>
    </html>
  );
}
