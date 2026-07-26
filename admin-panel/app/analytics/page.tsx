"use client";

import { useState, useEffect } from "react";
import { Eye, Heart, Package } from "lucide-react";
import { adminFetch } from "../../config/auth";

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  stockQuantity?: number;
  productLineId?: string;
}

interface ProductAnalytics {
  productId: string;
  views: number;
  likes: number;
  wishlistedBy: string[];
  unitsOrdered: number;
  totalRevenue: number;
}

export default function AnalyticsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [analytics, setAnalytics] = useState<Record<string, ProductAnalytics>>(
    {},
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      adminFetch("/api/products").then((res) => res.json()),
      adminFetch("/api/analytics/products").then((res) => res.json()),
    ])
      .then(([productsData, analyticsData]) => {
        if (Array.isArray(productsData)) setProducts(productsData);
        if (analyticsData) setAnalytics(analyticsData);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Compute aggregate insights
  const totalViews = Object.values(analytics).reduce(
    (sum, a) => sum + (a.views || 0),
    0,
  );
  const totalLikes = Object.values(analytics).reduce(
    (sum, a) => sum + (a.likes || 0),
    0,
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800">
          Product Analytics & Insights
        </h1>
        <p className="text-slate-500 text-xs mt-1">
          Track views, wishlist counts, inventory velocity, and revenue
          performance across all items.
        </p>
      </div>

      {/* Aggregate Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">
              Total Product Views
            </span>
            <div className="p-2 bg-sky-50 text-sky-500 rounded-xl">
              <Eye className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-800">{totalViews}</p>
          <p className="text-[11px] text-slate-400 font-semibold">
            Storefront page impressions
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">
              Total Wishlist Likes
            </span>
            <div className="p-2 bg-rose-50 text-rose-500 rounded-xl">
              <Heart className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-800">{totalLikes}</p>
          <p className="text-[11px] text-slate-400 font-semibold">
            User favorite interactions
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">
              Catalog Items
            </span>
            <div className="p-2 bg-purple-50 text-purple-500 rounded-xl">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-800">
            {products.length}
          </p>
          <p className="text-[11px] text-slate-400 font-semibold">
            Active listings
          </p>
        </div>
      </div>

      {/* Per Product Performance Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-extrabold text-base text-slate-800">
            Per-Product Performance Insights
          </h2>
          <span className="text-xs font-bold text-slate-400">
            Real-time metrics
          </span>
        </div>

        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200/80">
            <tr>
              <th className="p-4">Product Name</th>
              <th className="p-4">Price (₹)</th>
              <th className="p-4">Stock Left</th>
              <th className="p-4">Views</th>
              <th className="p-4">Likes</th>
              <th className="p-4">Units Sold</th>
              <th className="p-4 text-right">Est. Revenue</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.map((p) => {
              const stat = analytics[p.id] || {
                views: 0,
                likes: 0,
                unitsOrdered: 0,
                totalRevenue: 0,
              };
              const stock =
                p.stockQuantity !== undefined ? p.stockQuantity : 10;
              return (
                <tr key={p.id} className="hover:bg-slate-50/80 transition">
                  <td className="p-4 flex items-center space-x-3">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-10 h-10 rounded-xl object-cover border"
                    />
                    <span className="font-extrabold text-slate-800 text-sm">
                      {p.name}
                    </span>
                  </td>
                  <td className="p-4 font-extrabold text-slate-800">
                    ₹{p.price.toFixed(2)}
                  </td>
                  <td className="p-4 font-bold">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                        stock <= 5
                          ? "bg-rose-100 text-rose-800"
                          : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      {stock} units
                    </span>
                  </td>
                  <td className="p-4 font-bold text-slate-700">{stat.views}</td>
                  <td className="p-4 font-bold text-rose-600">{stat.likes}</td>
                  <td className="p-4 font-bold text-slate-800">
                    {stat.unitsOrdered}
                  </td>
                  <td className="p-4 text-right font-extrabold text-slate-900">
                    ₹{stat.totalRevenue.toFixed(2)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
