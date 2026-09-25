'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Package, ShoppingCart, DollarSign, Clock, ArrowUpRight } from 'lucide-react';
import { adminFetch } from '@/config/adminAuth';

interface Stats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  recentOrders: any[];
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats>({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    recentOrders: [],
  });

  useEffect(() => {
    adminFetch('/api/admin/stats')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.totalProducts !== undefined) setStats(data);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-neutral-200/80 shadow-2xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-neutral-800">
            Admin Dashboard Overview
          </h1>
          <p className="text-neutral-500 text-xs mt-1">
            Manage catalog listings, categories, and customer orders.
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="px-4 py-2.5 bg-primary hover:bg-primary/90 text-white font-bold text-xs rounded-xl shadow-2xs transition shrink-0 inline-flex items-center justify-center"
        >
          + Add New Craft Product
        </Link>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-2xs space-y-2">
          <div className="flex justify-between items-center text-neutral-500">
            <span className="text-xs font-bold uppercase tracking-wider">Total Products</span>
            <div className="p-2 bg-info-50 text-info-500 rounded-xl">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-neutral-800">{stats.totalProducts}</p>
          <p className="text-[11px] text-success-600 font-semibold flex items-center space-x-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Active in store</span>
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-2xs space-y-2">
          <div className="flex justify-between items-center text-neutral-500">
            <span className="text-xs font-bold uppercase tracking-wider">Total Revenue</span>
            <div className="p-2 bg-success-50 text-success-500 rounded-xl">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-neutral-800">₹{stats.totalRevenue.toFixed(2)}</p>
          <p className="text-[11px] text-success-600 font-semibold flex items-center space-x-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Calculated from orders</span>
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-2xs space-y-2">
          <div className="flex justify-between items-center text-neutral-500">
            <span className="text-xs font-bold uppercase tracking-wider">Total Orders</span>
            <div className="p-2 bg-purple-50 text-purple-500 rounded-xl">
              <ShoppingCart className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-neutral-800">{stats.totalOrders}</p>
          <p className="text-[11px] text-neutral-500 font-semibold">Orders placed by users</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-2xs space-y-2">
          <div className="flex justify-between items-center text-neutral-500">
            <span className="text-xs font-bold uppercase tracking-wider">Pending Fulfillment</span>
            <div className="p-2 bg-warning-50 text-warning-500 rounded-xl">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-neutral-800">{stats.pendingOrders}</p>
          <p className="text-[11px] text-warning-600 font-semibold">Requires dispatch update</p>
        </div>
      </div>

      {/* Quick Management Shortcuts */}
      <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-2xs space-y-4">
        <h3 className="font-extrabold text-base text-neutral-800">Quick Catalog Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs font-bold">
          <Link
            href="/admin/products"
            className="p-4 bg-info-50 hover:bg-info-100/80 text-info-900 rounded-xl transition text-center border border-info-100"
          >
            📦 Manage Products CRUD
          </Link>
          <Link
            href="/admin/categories"
            className="p-4 bg-success-50 hover:bg-success-100/80 text-success-900 rounded-xl transition text-center border border-success-100"
          >
            🏷️ Manage Categories
          </Link>
          <Link
            href="/admin/orders"
            className="p-4 bg-warning-50 hover:bg-warning-100/80 text-warning-900 rounded-xl transition text-center border border-warning-100"
          >
            🚚 Orders & Statuses
          </Link>
        </div>
      </div>
    </div>
  );
}
