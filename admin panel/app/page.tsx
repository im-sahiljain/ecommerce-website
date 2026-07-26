'use me';
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Package, ShoppingCart, DollarSign, Clock, ArrowUpRight, Sparkles } from 'lucide-react';

interface Stats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  recentOrders: any[];
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats>({
    totalProducts: 8,
    totalOrders: 1,
    totalRevenue: 39.98,
    pendingOrders: 0,
    recentOrders: []
  });

  useEffect(() => {
    fetch('http://localhost:5000/api/admin/stats')
      .then(res => res.json())
      .then(data => {
        if (data && data.totalProducts !== undefined) setStats(data);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800">Admin Dashboard Overview</h1>
          <p className="text-slate-500 text-xs mt-1">Manage catalog listings, categories, themes, age groups, and customer orders.</p>
        </div>
        <Link
          href="/products"
          className="px-4 py-2.5 bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs rounded-xl shadow-xs transition"
        >
          + Add New Craft Product
        </Link>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Total Products</span>
            <div className="p-2 bg-sky-50 text-sky-500 rounded-xl">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-800">{stats.totalProducts}</p>
          <p className="text-[11px] text-emerald-600 font-semibold flex items-center space-x-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Active in store</span>
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Total Revenue</span>
            <div className="p-2 bg-emerald-50 text-emerald-500 rounded-xl">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-800">₹{stats.totalRevenue.toFixed(2)}</p>
          <p className="text-[11px] text-emerald-600 font-semibold flex items-center space-x-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Calculated from orders</span>
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Total Orders</span>
            <div className="p-2 bg-purple-50 text-purple-500 rounded-xl">
              <ShoppingCart className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-800">{stats.totalOrders}</p>
          <p className="text-[11px] text-slate-500 font-semibold">Orders placed by users</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Pending Fulfillment</span>
            <div className="p-2 bg-amber-50 text-amber-500 rounded-xl">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-800">{stats.pendingOrders}</p>
          <p className="text-[11px] text-amber-600 font-semibold">Requires dispatch update</p>
        </div>
      </div>

      {/* Quick Management Shortcuts */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <h3 className="font-extrabold text-base text-slate-800">Quick Catalog Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-bold">
          <Link href="/products" className="p-4 bg-sky-50 hover:bg-sky-100/80 text-sky-900 rounded-xl transition text-center border border-sky-100">
            📦 Manage Products CRUD
          </Link>
          <Link href="/categories" className="p-4 bg-emerald-50 hover:bg-emerald-100/80 text-emerald-900 rounded-xl transition text-center border border-emerald-100">
            🏷️ Manage Categories
          </Link>
          <Link href="/themes" className="p-4 bg-purple-50 hover:bg-purple-100/80 text-purple-900 rounded-xl transition text-center border border-purple-100">
            🎨 Manage Themes
          </Link>
          <Link href="/orders" className="p-4 bg-amber-50 hover:bg-amber-100/80 text-amber-900 rounded-xl transition text-center border border-amber-100">
            🚚 Orders & Statuses
          </Link>
        </div>
      </div>
    </div>
  );
}
