"use client";

import { API_BASE_URL } from "../../config/api";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "../../context/CartContext";
import { useAuth, UserAddress } from "../../context/AuthContext";
import {
  CreditCard,
  Lock,
  CheckCircle2,
  MapPin,
  Plus,
  Check,
} from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, totalPrice, clearCart } = useCart();
  const { user, token, addresses, openAuth, addAddress } = useAuth();

  const [selectedAddressId, setSelectedAddressId] = useState<string>("custom");
  const [customerName, setCustomerName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [addressLine, setAddressLine] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [addressLabel, setAddressLabel] = useState("Home");
  const [saveAddressToAccount, setSaveAddressToAccount] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [orderSuccess, setOrderSuccess] = useState<any>(null);

  // Auto select default address or pre-fill
  useEffect(() => {
    if (addresses.length > 0) {
      const defaultAddr = addresses.find((a) => a.isDefault) || addresses[0];
      applyAddress(defaultAddr);
    } else if (user) {
      if (user.name) setCustomerName(user.name);
      if (user.phone) setPhone(user.phone);
      if (user.address) setAddressLine(user.address);
      if (user.city) setCity(user.city);
      if (user.state) setState(user.state);
      if (user.zipCode) setZipCode(user.zipCode);
    }
  }, [addresses, user]);

  const applyAddress = (addr: UserAddress) => {
    setSelectedAddressId(addr.id);
    setCustomerName(addr.fullName || user?.name || "");
    setPhone(addr.phone || user?.phone || "");
    setAddressLine(addr.addressLine);
    setCity(addr.city);
    setState(addr.state);
    setZipCode(addr.zipCode);
  };

  const handleSelectNewAddressMode = () => {
    setSelectedAddressId("custom");
    setAddressLine("");
    setCity("");
    setState("");
    setZipCode("");
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !token) {
      setError("You must log in to place an order.");
      openAuth();
      return;
    }

    if (!customerName || !addressLine || !city || !state || !zipCode) {
      setError(
        "Please fill in your name and complete delivery address details.",
      );
      return;
    }

    setIsSubmitting(true);
    setError("");

    // If custom new address entered and user checked "Save to account", save address first
    if (selectedAddressId === "custom" && saveAddressToAccount) {
      await addAddress({
        label: addressLabel || "Delivery Address",
        fullName: customerName,
        phone: phone || "",
        addressLine,
        city,
        state,
        zipCode,
        isDefault: addresses.length === 0,
      });
    }

    const fullShippingAddress =
      `${addressLine}, ${city}, ${state} ${zipCode}`.trim();

    const orderPayload = {
      customerName,
      shippingAddress: fullShippingAddress,
      phone,
      city,
      state,
      zipCode,
      items: cart.map((item) => ({
        productId: item.id,
        productName: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
      })),
      subtotal: totalPrice,
      shipping: 0,
      total: totalPrice,
    };

    try {
      const res = await fetch(`${API_BASE_URL}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();
      if (res.ok && data.id) {
        setOrderSuccess(data);
        clearCart();
      } else {
        setError(data.error || "Failed to submit order. Please try again.");
      }
    } catch (err) {
      setError("Order service unavailable. Please ensure backend is running.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="max-w-2xl mx-auto my-16 p-8 bg-white rounded-3xl border border-slate-100 soft-shadow text-center space-y-6">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800">
            Order Confirmed!
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Thank you for ordering with Little Creators Craft Hub!
          </p>
        </div>

        <div className="bg-slate-50 p-6 rounded-2xl text-left border border-slate-100 space-y-3 text-xs">
          <div className="flex justify-between border-b border-slate-200 pb-2 font-bold text-slate-700">
            <span>Order Number: {orderSuccess.orderNumber}</span>
            <span>Status: {orderSuccess.status}</span>
          </div>
          <p>
            <span className="font-bold text-slate-600">Customer:</span>{" "}
            {orderSuccess.customerName}
          </p>
          <p>
            <span className="font-bold text-slate-600">Shipping Address:</span>{" "}
            {orderSuccess.shippingAddress}
          </p>
          <p>
            <span className="font-bold text-slate-600">Tracking Code:</span>{" "}
            {orderSuccess.trackingNumber || "TRK-88492019"}
          </p>
        </div>

        <div className="pt-4 flex justify-center space-x-4">
          <button
            onClick={() => router.push("/account")}
            className="px-6 py-2.5 bg-pink-300 hover:bg-pink-400 text-slate-800 font-bold text-xs rounded-full shadow transition"
          >
            Track Order Status
          </button>
          <button
            onClick={() => router.push("/shop")}
            className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-full transition"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-800">
          Checkout & Order Placement
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Select a saved shipping address or enter delivery details to place
          your craft order.
        </p>
      </div>

      {!user ? (
        <div className="bg-white p-8 rounded-3xl border border-slate-100 soft-shadow text-center space-y-4 max-w-lg mx-auto">
          <Lock className="w-12 h-12 text-pink-400 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800">
            Account Authentication Required
          </h3>
          <p className="text-xs text-slate-500">
            Please log in to use your saved addresses and secure 1-click
            checkout.
          </p>
          <button
            onClick={openAuth}
            className="px-8 py-3 bg-pink-300 hover:bg-pink-400 text-slate-800 font-bold text-xs rounded-full shadow transition"
          >
            Log In / Sign Up to Continue
          </button>
        </div>
      ) : (
        <form
          onSubmit={handlePlaceOrder}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          <div className="lg:col-span-2 space-y-6">
            {/* SAVED ADDRESSES SELECTOR */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 soft-shadow space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-extrabold text-slate-800 flex items-center space-x-2">
                  <MapPin className="w-5 h-5 text-pink-500" />
                  <span>Select Delivery Address</span>
                </h2>
                <button
                  type="button"
                  onClick={handleSelectNewAddressMode}
                  className="text-xs font-bold text-pink-600 hover:text-pink-700 flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add New Address</span>
                </button>
              </div>

              {addresses.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {addresses.map((addr) => {
                    const isSelected = selectedAddressId === addr.id;
                    return (
                      <div
                        key={addr.id}
                        onClick={() => applyAddress(addr)}
                        className={`p-4 rounded-2xl border cursor-pointer transition relative ${
                          isSelected
                            ? "border-pink-400 bg-pink-50/50 shadow-sm"
                            : "border-slate-200 hover:border-slate-300 bg-white"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-extrabold text-xs text-slate-800">
                            {addr.label || "Home"}
                          </span>
                          {addr.isDefault && (
                            <span className="px-2 py-0.5 bg-sky-100 text-sky-700 text-[10px] font-extrabold rounded-md">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-bold text-slate-700 truncate">
                          {addr.fullName}
                        </p>
                        <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                          {addr.addressLine}, {addr.city}, {addr.state}{" "}
                          {addr.zipCode}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-1">
                          {addr.phone}
                        </p>
                        {isSelected && (
                          <div className="absolute top-3 right-3 w-4 h-4 bg-pink-500 text-white rounded-full flex items-center justify-center">
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* ADDRESS FORM INPUTS */}
              <div className="pt-4 border-t border-slate-100 space-y-4">
                <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                  {selectedAddressId === "custom"
                    ? "Enter Delivery Details"
                    : "Selected Address Info"}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Recipient Full Name
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Sarah Jenkins"
                      required
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-pink-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      required
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-pink-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Street Address
                  </label>
                  <input
                    type="text"
                    value={addressLine}
                    onChange={(e) => setAddressLine(e.target.value)}
                    placeholder="742 Evergreen Terrace"
                    required
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-pink-400"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Springfield"
                      required
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-pink-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      State
                    </label>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="Oregon"
                      required
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-pink-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      ZIP Code
                    </label>
                    <input
                      type="text"
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                      placeholder="97477"
                      required
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-pink-400"
                    />
                  </div>
                </div>

                {selectedAddressId === "custom" && (
                  <div className="flex items-center space-x-4 pt-2">
                    <div className="flex-1">
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Address Label
                      </label>
                      <input
                        type="text"
                        value={addressLabel}
                        onChange={(e) => setAddressLabel(e.target.value)}
                        placeholder="Home, Work, Vacation"
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
                      />
                    </div>
                    <label className="flex items-center space-x-2 pt-5 text-xs font-bold text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={saveAddressToAccount}
                        onChange={(e) =>
                          setSaveAddressToAccount(e.target.checked)
                        }
                        className="rounded text-pink-500 focus:ring-pink-400"
                      />
                      <span>Save to my account addresses</span>
                    </label>
                  </div>
                )}
              </div>
            </div>

            {error && (
              <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-2xl">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || cart.length === 0}
              className="w-full py-4 bg-pink-300 hover:bg-pink-400 text-slate-800 font-extrabold text-sm rounded-2xl shadow transition flex items-center justify-center space-x-2"
            >
              <CreditCard className="w-5 h-5" />
              <span>
                {isSubmitting
                  ? "Processing Order..."
                  : `Confirm & Place Order (₹${totalPrice.toFixed(2)})`}
              </span>
            </button>
          </div>

          {/* ORDER SUMMARY SIDEBAR */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 soft-shadow h-fit space-y-4">
            <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3">
              Order Summary ({cart.length} Kits)
            </h2>
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between text-xs pb-2 border-b border-slate-50"
                >
                  <div className="flex items-center space-x-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                    <div>
                      <p className="font-bold text-slate-800 line-clamp-1">
                        {item.name}
                      </p>
                      <p className="text-slate-400">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <span className="font-bold text-slate-800">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-2 text-xs border-t border-slate-100 pt-3">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal</span>
                <span>₹{totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Express Shipping</span>
                <span className="text-emerald-600 font-bold">FREE</span>
              </div>
              <div className="flex justify-between text-sm font-extrabold text-slate-800 pt-2 border-t border-slate-100">
                <span>Total Amount</span>
                <span>₹{totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
