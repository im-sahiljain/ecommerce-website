import './globals.css';
import React from 'react';
import Link from 'next/link';
import { LayoutDashboard, Package, Tags, Palette, Users, ShoppingCart, ExternalLink, Sparkles, Settings, BarChart2, Layers, Gift, Layout } from 'lucide-react';

export const metadata = {
  title: 'Little Creators Admin Control Panel',
  description: 'Generic Multi-Category Catalog, Product Lines, Bundles, Analytics, Homepage CMS Builder & Settings.',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex text-slate-800 bg-slate-50 antialiased font-sans">
        {/* Sidebar */}
        <aside className="w-64 bg-slate-900 text-white flex flex-col justify-between p-6 fixed top-0 bottom-0 left-0 z-30 shadow-xl overflow-y-auto">
          <div className="space-y-6">
            {/* Logo */}
            <div className="flex items-center space-x-3 border-b border-slate-800 pb-4">
              <div className="w-9 h-9 bg-pink-500 text-white rounded-xl flex items-center justify-center font-bold shadow-md">
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
                href="/product-lines"
                className="flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition"
              >
                <Layers className="w-4 h-4 text-sky-400" />
                <span>Product Lines</span>
              </Link>

              <Link
                href="/products"
                className="flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition"
              >
                <Package className="w-4 h-4 text-emerald-400" />
                <span>Products Catalog</span>
              </Link>

              <Link
                href="/categories"
                className="flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition"
              >
                <Tags className="w-4 h-4 text-yellow-400" />
                <span>Categories & Facets</span>
              </Link>


              <Link
                href="/bundles"
                className="flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition"
              >
                <Gift className="w-4 h-4 text-amber-400" />
                <span>Bundle Rules Engine</span>
              </Link>

              <Link
                href="/orders"
                className="flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition"
              >
                <ShoppingCart className="w-4 h-4 text-rose-400" />
                <span>Orders & Fulfillment</span>
              </Link>

              <Link
                href="/analytics"
                className="flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition"
              >
                <BarChart2 className="w-4 h-4 text-cyan-400" />
                <span>Analytics & Insights</span>
              </Link>

              <Link
                href="/settings"
                className="flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition"
              >
                <Settings className="w-4 h-4 text-slate-400" />
                <span>Settings & WhatsApp</span>
              </Link>
            </nav>
          </div>

          {/* External Link to Storefront */}
          <div className="pt-4 border-t border-slate-800 text-xs mt-6">
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
