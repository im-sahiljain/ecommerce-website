'use me';
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, Truck, CreditCard, Lock, CheckCircle2, UserCheck } from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, totalPrice, clearCart } = useCart();
  const { user, token, openAuth } = useAuth();

  const [customerName, setCustomerName] = useState(user?.name || '');
  const [shippingAddress, setShippingAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [orderSuccess, setOrderSuccess] = useState<any>(null);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !token) {
      setError('You must log in to place an order.');
      openAuth();
      return;
    }

    if (!customerName || !shippingAddress) {
      setError('Please fill in your name and shipping address.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    const orderPayload = {
      customerName,
      shippingAddress,
      phone,
      items: cart.map(item => ({
        productId: item.id,
        productName: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image
      })),
      subtotal: totalPrice,
      shipping: 0,
      total: totalPrice
    };

    try {
      const res = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderPayload)
      });

      const data = await res.json();
      if (res.ok && data.id) {
        setOrderSuccess(data);
        clearCart();
      } else {
        setError(data.error || 'Failed to submit order. Please try again.');
      }
    } catch (err) {
      setError('Order service unavailable. Please ensure backend is running.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="max-w-2xl mx-auto my-16 p-8 bg-white rounded-3xl border border-slate-100 soft-shadow text-center space-y-6">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-800">Order Placed Successfully!</h2>
        <p className="text-slate-600 text-sm">
          Thank you <strong className="text-slate-800">{orderSuccess.customerName}</strong>! Your order number is{' '}
          <span className="px-3 py-1 bg-pink-100 text-pink-700 font-bold rounded-full">{orderSuccess.orderNumber}</span>.
        </p>

        <div className="p-4 bg-slate-50 rounded-2xl text-xs space-y-2 text-slate-600 border border-slate-100 max-w-md mx-auto text-left">
          <p><strong>Tracking Number:</strong> {orderSuccess.trackingNumber}</p>
          <p><strong>Status:</strong> <span className="font-bold text-sky-600">{orderSuccess.status}</span></p>
          <p><strong>Shipping To:</strong> {orderSuccess.shippingAddress}</p>
          <p><strong>Total Paid:</strong> ${orderSuccess.total.toFixed(2)}</p>
        </div>

        <button
          onClick={() => router.push('/account')}
          className="px-8 py-3 bg-pink-200 hover:bg-pink-300 text-slate-800 font-bold text-sm rounded-full transition"
        >
          Track Order in My Account
        </button>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl border border-slate-100 text-center space-y-4">
        <h3 className="text-xl font-bold text-slate-800">Your Basket is Empty</h3>
        <p className="text-xs text-slate-500">Add craft kits to your basket before checking out.</p>
        <button
          onClick={() => router.push('/shop')}
          className="px-6 py-2.5 bg-pink-200 text-slate-800 font-bold text-xs rounded-full"
        >
          Explore Craft Kits
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-extrabold text-slate-800 mb-8">Checkout & Place Order</h1>

      {/* Auth Banner if not logged in */}
      {!user && (
        <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between">
          <div className="flex items-center space-x-3 text-xs font-semibold text-amber-800">
            <Lock className="w-5 h-5 text-amber-600" />
            <span>Customer authentication is required to place and track orders.</span>
          </div>
          <button
            onClick={openAuth}
            className="px-4 py-2 bg-amber-200 hover:bg-amber-300 text-amber-900 font-bold text-xs rounded-full"
          >
            Log In / Sign Up
          </button>
        </div>
      )}

      {user && (
        <div className="mb-8 p-3 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center space-x-2 text-xs font-bold text-emerald-800">
          <UserCheck className="w-4 h-4 text-emerald-600" />
          <span>Logged in as {user.name || user.identifier}</span>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-bold border border-red-100">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Shipping Form */}
        <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 soft-shadow space-y-6">
          <h3 className="font-bold text-lg text-slate-800 flex items-center space-x-2">
            <Truck className="w-5 h-5 text-pink-500" />
            <span>Shipping Information</span>
          </h3>

          <form onSubmit={handlePlaceOrder} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Customer / Parent Name</label>
              <input
                type="text"
                placeholder="Full Name"
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Shipping Address</label>
              <textarea
                placeholder="Street address, City, State, Zip Code"
                value={shippingAddress}
                onChange={e => setShippingAddress(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 h-24"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Phone Number (For delivery updates)</label>
              <input
                type="text"
                placeholder="Phone Number"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
              />
            </div>

            <div className="pt-4 border-t border-slate-100">
              <h4 className="font-bold text-sm text-slate-800 mb-3 flex items-center space-x-2">
                <CreditCard className="w-4 h-4 text-sky-500" />
                <span>Payment Method</span>
              </h4>
              <div className="p-4 bg-sky-50 rounded-2xl border border-sky-100 text-xs text-slate-700 font-semibold flex items-center justify-between">
                <span>Simulated Express Checkout (Free Shipping applied)</span>
                <ShieldCheck className="w-5 h-5 text-sky-500" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-pink-300 hover:bg-pink-400 text-slate-800 font-extrabold text-base rounded-full shadow-md hover:shadow-lg transition transform active:scale-98 mt-4 disabled:opacity-50"
            >
              {isSubmitting ? 'Placing Order...' : `Complete Order — $${totalPrice.toFixed(2)}`}
            </button>
          </form>
        </div>

        {/* Order Summary */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 soft-shadow h-fit space-y-4">
          <h3 className="font-bold text-base text-slate-800 border-b border-slate-100 pb-3">Order Summary</h3>

          <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
            {cart.map(item => (
              <div key={item.id} className="flex items-center space-x-3 text-xs">
                <img src={item.image} alt={item.name} className="w-12 h-12 rounded-xl object-cover" />
                <div className="flex-1">
                  <p className="font-bold text-slate-800 line-clamp-1">{item.name}</p>
                  <p className="text-slate-500">{item.quantity} x ${item.price.toFixed(2)}</p>
                </div>
                <span className="font-bold text-slate-800">${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-100 pt-3 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span className="font-bold">${totalPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Shipping:</span>
              <span className="font-bold text-emerald-600">FREE</span>
            </div>
            <div className="flex justify-between text-sm font-extrabold text-slate-800 pt-2 border-t border-slate-100">
              <span>Total:</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
