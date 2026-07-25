'use me';
'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Package, Truck, CheckCircle2, Clock, MapPin, User, LogOut, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  image: string;
}

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  shippingAddress: string;
  items: OrderItem[];
  subtotal: number;
  total: number;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  createdAt: string;
  trackingNumber?: string;
}

export default function AccountPage() {
  const { user, token, openAuth, logout } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    fetch('http://localhost:5000/api/orders/my-orders', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setOrders(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [token]);

  if (!user) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white text-center rounded-3xl border border-slate-100 soft-shadow space-y-4">
        <User className="w-12 h-12 text-slate-300 mx-auto" />
        <h3 className="text-xl font-bold text-slate-800">Sign in to view your orders</h3>
        <p className="text-xs text-slate-500">Log in with your Email or Phone number to view your craft kit orders and live delivery tracking.</p>
        <button
          onClick={openAuth}
          className="px-8 py-3 bg-pink-300 hover:bg-pink-400 text-slate-800 font-bold text-xs rounded-full shadow transition"
        >
          Log In / Sign Up
        </button>
      </div>
    );
  }

  const getStatusStep = (status: string) => {
    switch (status) {
      case 'Pending': return 1;
      case 'Processing': return 2;
      case 'Shipped': return 3;
      case 'Delivered': return 4;
      default: return 1;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Account Profile Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 soft-shadow mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 bg-sky-100 text-sky-600 rounded-full flex items-center justify-center font-bold text-xl">
            {user.name ? user.name[0].toUpperCase() : '🎨'}
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-800">{user.name || 'Artist Parent'}</h1>
            <p className="text-xs font-semibold text-slate-500">{user.identifier}</p>
          </div>
        </div>

        <button
          onClick={logout}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-full flex items-center space-x-1.5 transition"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Orders & Live Tracking Section */}
      <div className="space-y-6">
        <h2 className="text-2xl font-extrabold text-slate-800 flex items-center space-x-2">
          <Package className="w-6 h-6 text-pink-500" />
          <span>My Orders & Order Tracking</span>
        </h2>

        {loading ? (
          <div className="p-12 text-center text-slate-500 font-bold">Loading your order history...</div>
        ) : orders.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-3xl border border-slate-100 space-y-3">
            <Package className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="font-bold text-slate-700">You haven't placed any orders yet!</p>
            <p className="text-xs text-slate-400">Ready-to-paint craft kits are waiting for your artistic touch.</p>
            <Link
              href="/shop"
              className="inline-block mt-2 px-6 py-2.5 bg-pink-200 text-slate-800 font-bold text-xs rounded-full"
            >
              Shop Painting Kits
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map(order => {
              const currentStep = getStatusStep(order.status);
              return (
                <div key={order.id} className="bg-white p-6 rounded-3xl border border-slate-100 soft-shadow space-y-6">
                  {/* Header info */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-extrabold text-base text-slate-800">{order.orderNumber}</span>
                        <span className="px-3 py-0.5 bg-sky-100 text-sky-800 font-bold text-xs rounded-full">
                          {order.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>

                    <div className="text-left sm:text-right text-xs">
                      <p className="text-slate-500 font-medium">Tracking Number:</p>
                      <p className="font-bold text-slate-800">{order.trackingNumber || 'TRK-88492019'}</p>
                    </div>
                  </div>

                  {/* Visual Order Tracking Progress Bar */}
                  <div className="py-2">
                    <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-4">Live Order Progress</p>
                    <div className="grid grid-cols-4 gap-2 relative">
                      {/* Line */}
                      <div className="absolute top-4 left-0 right-0 h-1 bg-slate-100 -z-0" />

                      <div className="flex flex-col items-center z-10">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                          currentStep >= 1 ? 'bg-pink-400 text-white' : 'bg-slate-100 text-slate-400'
                        }`}>
                          1
                        </div>
                        <span className="text-[11px] font-bold text-slate-700 mt-1">Order Placed</span>
                      </div>

                      <div className="flex flex-col items-center z-10">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                          currentStep >= 2 ? 'bg-pink-400 text-white' : 'bg-slate-100 text-slate-400'
                        }`}>
                          2
                        </div>
                        <span className="text-[11px] font-bold text-slate-700 mt-1">Crafting/Packing</span>
                      </div>

                      <div className="flex flex-col items-center z-10">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                          currentStep >= 3 ? 'bg-pink-400 text-white' : 'bg-slate-100 text-slate-400'
                        }`}>
                          3
                        </div>
                        <span className="text-[11px] font-bold text-slate-700 mt-1">Out for Delivery</span>
                      </div>

                      <div className="flex flex-col items-center z-10">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                          currentStep >= 4 ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'
                        }`}>
                          4
                        </div>
                        <span className="text-[11px] font-bold text-slate-700 mt-1">Delivered</span>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="pt-4 border-t border-slate-100 space-y-3">
                    <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">Ordered Kits ({order.items?.length || 0})</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {order.items?.map((item, idx) => (
                        <div key={idx} className="flex items-center space-x-3 bg-slate-50 p-2.5 rounded-2xl border border-slate-100 text-xs">
                          <img src={item.image} alt={item.productName} className="w-12 h-12 rounded-xl object-cover" />
                          <div>
                            <p className="font-bold text-slate-800 line-clamp-1">{item.productName}</p>
                            <p className="text-slate-500">{item.quantity} x ${item.price.toFixed(2)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Footer subtotal */}
                  <div className="pt-4 border-t border-slate-100 flex justify-between items-center text-xs font-bold">
                    <div className="flex items-center space-x-1 text-slate-500">
                      <MapPin className="w-4 h-4 text-pink-400" />
                      <span>Address: {order.shippingAddress}</span>
                    </div>
                    <span className="text-sm font-extrabold text-slate-800">Total: ${order.total.toFixed(2)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
