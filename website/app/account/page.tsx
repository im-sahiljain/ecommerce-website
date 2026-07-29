'use me';
'use client';

import React, { useState, useEffect } from 'react';
import { useAuth, UserAddress } from '../../context/AuthContext';
import { Package, MapPin, User as UserIcon, LogOut, Save, Mail, Phone, Home, Plus, Trash2, CheckCircle2, Check } from 'lucide-react';
import { API_BASE_URL } from '../../config/api';
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
  const { user, token, addresses, openAuth, logout, updateProfile, addAddress, setDefaultAddress, deleteAddress } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'addresses' | 'orders'>('profile');

  // Profile Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Add Address Form State
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newLabel, setNewLabel] = useState('Home');
  const [newFullName, setNewFullName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newAddressLine, setNewAddressLine] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newState, setNewState] = useState('');
  const [newZipCode, setNewZipCode] = useState('');
  const [newIsDefault, setNewIsDefault] = useState(false);
  const [addingAddressLoading, setAddingAddressLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || (user.identifier.includes('@') ? user.identifier : ''));
      setPhone(user.phone || (!user.identifier.includes('@') ? user.identifier : ''));
      setNewFullName(user.name || '');
      setNewPhone(user.phone || '');
    }
  }, [user]);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    fetch(`${API_BASE_URL}/api/orders/my-orders`, {
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

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileSuccess(false);

    await updateProfile({ name, email, phone });

    setSavingProfile(false);
    setProfileSuccess(true);
    setTimeout(() => setProfileSuccess(false), 3000);
  };

  const handleCreateAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingAddressLoading(true);

    await addAddress({
      label: newLabel || 'Home',
      fullName: newFullName || name,
      phone: newPhone || phone,
      addressLine: newAddressLine,
      city: newCity,
      state: newState,
      zipCode: newZipCode,
      isDefault: newIsDefault
    });

    setAddingAddressLoading(false);
    setIsAddingAddress(false);
    setNewAddressLine('');
    setNewCity('');
    setNewState('');
    setNewZipCode('');
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white text-center rounded-3xl border border-slate-100 soft-shadow space-y-4">
        <UserIcon className="w-12 h-12 text-slate-300 mx-auto" />
        <h3 className="text-xl font-bold text-slate-800">Sign in to view your account</h3>
        <p className="text-xs text-slate-500">Log in with your Email or Phone number to manage your profile, delivery addresses, and track active orders.</p>
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
      case 'WhatsApp Initiated': return 1;
      case 'Pending': return 1;
      case 'Processing': return 2;
      case 'Shipped': return 3;
      case 'Delivered': return 4;
      default: return 1;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Account Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 soft-shadow mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-sky-100 text-sky-600 rounded-full flex items-center justify-center font-bold text-2xl">
            {user.name ? user.name[0].toUpperCase() : '🎨'}
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-800">{user.name || 'Artist Parent'}</h1>
            <p className="text-xs font-semibold text-slate-500">{user.email || user.identifier}</p>
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

      {/* Account Navigation Tabs */}
      <div className="flex border-b border-slate-200 mb-8 space-x-8 text-sm font-extrabold overflow-x-auto">
        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 flex items-center space-x-2 border-b-2 transition whitespace-nowrap ${
            activeTab === 'profile'
              ? 'border-pink-500 text-pink-600'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <UserIcon className="w-4 h-4" />
          <span>Personal Info</span>
        </button>

        <button
          onClick={() => setActiveTab('addresses')}
          className={`pb-3 flex items-center space-x-2 border-b-2 transition whitespace-nowrap ${
            activeTab === 'addresses'
              ? 'border-pink-500 text-pink-600'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Saved Addresses ({addresses.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 flex items-center space-x-2 border-b-2 transition whitespace-nowrap ${
            activeTab === 'orders'
              ? 'border-pink-500 text-pink-600'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Order History ({orders.length})</span>
        </button>
      </div>

      {/* TAB 1: Profile Info Form */}
      {activeTab === 'profile' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 soft-shadow max-w-2xl">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-800">Personal Information</h2>
            <p className="text-xs text-slate-500 mt-1">Manage your account profile details.</p>
          </div>

          {profileSuccess && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center space-x-2 text-emerald-800 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Profile details saved successfully!</span>
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Full Name</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Jane Doe"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-pink-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="parent@example.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-pink-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Phone Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-pink-400"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={savingProfile}
              className="mt-4 px-8 py-3 bg-pink-300 hover:bg-pink-400 text-slate-800 font-bold text-xs rounded-full shadow transition flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>{savingProfile ? 'Saving...' : 'Save Profile'}</span>
            </button>
          </form>
        </div>
      )}

      {/* TAB 2: Multi-Address Manager */}
      {activeTab === 'addresses' && (
        <div className="space-y-6 max-w-4xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-800">Saved Shipping Addresses</h2>
              <p className="text-xs text-slate-500 mt-1">Manage multiple saved delivery locations for fast 1-click checkout.</p>
            </div>
            <button
              onClick={() => setIsAddingAddress(!isAddingAddress)}
              className="px-5 py-2.5 bg-pink-300 hover:bg-pink-400 text-slate-800 font-bold text-xs rounded-full shadow transition flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>{isAddingAddress ? 'Cancel' : 'Add New Address'}</span>
            </button>
          </div>

          {/* Add Address Form Modal/Card */}
          {isAddingAddress && (
            <form onSubmit={handleCreateAddress} className="bg-white p-6 rounded-3xl border border-pink-200 soft-shadow space-y-4">
              <h3 className="font-extrabold text-sm text-slate-800 border-b pb-2">Add New Delivery Location</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Address Label</label>
                  <input
                    type="text"
                    value={newLabel}
                    onChange={e => setNewLabel(e.target.value)}
                    placeholder="Home, Office, Parents"
                    required
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Recipient Name</label>
                  <input
                    type="text"
                    value={newFullName}
                    onChange={e => setNewFullName(e.target.value)}
                    placeholder="Sarah Jenkins"
                    required
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={newPhone}
                    onChange={e => setNewPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    required
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Street Address</label>
                <input
                  type="text"
                  value={newAddressLine}
                  onChange={e => setNewAddressLine(e.target.value)}
                  placeholder="742 Evergreen Terrace"
                  required
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    value={newCity}
                    onChange={e => setNewCity(e.target.value)}
                    placeholder="Springfield"
                    required
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">State</label>
                  <input
                    type="text"
                    value={newState}
                    onChange={e => setNewState(e.target.value)}
                    placeholder="Oregon"
                    required
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ZIP Code</label>
                  <input
                    type="text"
                    value={newZipCode}
                    onChange={e => setNewZipCode(e.target.value)}
                    placeholder="97477"
                    required
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center space-x-2 text-xs font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newIsDefault}
                    onChange={e => setNewIsDefault(e.target.checked)}
                    className="rounded text-pink-500"
                  />
                  <span>Set as default shipping address</span>
                </label>

                <button
                  type="submit"
                  disabled={addingAddressLoading}
                  className="px-6 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow transition"
                >
                  {addingAddressLoading ? 'Saving...' : 'Save Address'}
                </button>
              </div>
            </form>
          )}

          {/* List of Saved Addresses */}
          {addresses.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-3xl border border-slate-100 space-y-3">
              <MapPin className="w-12 h-12 text-slate-300 mx-auto" />
              <p className="font-bold text-slate-700">No saved addresses found</p>
              <p className="text-xs text-slate-400">Add shipping locations to enable 1-click checkout.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {addresses.map(addr => (
                <div key={addr.id} className="bg-white p-6 rounded-3xl border border-slate-100 soft-shadow space-y-3 relative">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm text-slate-800">{addr.label || 'Home'}</span>
                    {addr.isDefault ? (
                      <span className="px-3 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-extrabold rounded-full flex items-center space-x-1">
                        <Check className="w-3 h-3" />
                        <span>Default</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => setDefaultAddress(addr.id)}
                        className="text-[11px] font-bold text-sky-600 hover:text-sky-700"
                      >
                        Set as Default
                      </button>
                    )}
                  </div>

                  <p className="text-xs font-bold text-slate-800">{addr.fullName}</p>
                  <p className="text-xs text-slate-600 leading-relaxed">{addr.addressLine}, {addr.city}, {addr.state} {addr.zipCode}</p>
                  <p className="text-xs text-slate-400">{addr.phone}</p>

                  <div className="pt-2 border-t border-slate-100 flex justify-end">
                    <button
                      onClick={() => deleteAddress(addr.id)}
                      className="text-xs text-rose-500 hover:text-rose-600 font-bold flex items-center space-x-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Orders & Live Tracking */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
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

                    <div className="py-2">
                      <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-4">Live Order Progress</p>
                      <div className="grid grid-cols-4 gap-2 relative">
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

                    <div className="pt-4 border-t border-slate-100 space-y-3">
                      <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">Ordered Kits ({order.items?.length || 0})</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {order.items?.map((item, idx) => (
                          <div key={idx} className="flex items-center space-x-3 bg-slate-50 p-2.5 rounded-2xl border border-slate-100 text-xs">
                            <img src={item.image} alt={item.productName} className="w-12 h-12 rounded-xl object-cover" />
                            <div>
                              <p className="font-bold text-slate-800 line-clamp-1">{item.productName}</p>
                              <p className="text-slate-500">{item.quantity} x ₹{item.price.toFixed(2)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex justify-between items-center text-xs font-bold">
                      <div className="flex items-center space-x-1 text-slate-500">
                        <MapPin className="w-4 h-4 text-pink-400" />
                        <span>Address: {order.shippingAddress}</span>
                      </div>
                      <span className="text-sm font-extrabold text-slate-800">Total: ₹{order.total.toFixed(2)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
