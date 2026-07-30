"use client";

import React, { useState } from "react";
import { X, Send, MapPin, Phone, User, ShoppingBag } from "lucide-react";
import { API_BASE_URL } from "../config/api";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface WhatsappOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  subtotal: number;
  shipping: number;
  total: number;
  whatsappNumber: string;
}

export default function WhatsappOrderModal({
  isOpen,
  onClose,
  items,
  subtotal,
  shipping,
  total,
  whatsappNumber,
}: WhatsappOrderModalProps) {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [city, setCity] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone || !addressLine || !city) {
      alert("Please fill in your name, phone number, address, and city.");
      return;
    }

    setSubmitting(true);

    const cleanPhone = (whatsappNumber || "").replace(/[^0-9]/g, "");

    // Format item lines
    const itemLines = items
      .map(
        (item, idx) =>
          `${idx + 1}. *${item.name}* (Qty: ${item.quantity}) - ₹${
            item.price * item.quantity
          }`,
      )
      .join("\n");

    const fullAddress = `${addressLine}, ${city} - ${zipCode}`.trim();

    // Structured WhatsApp Message
    const message = `🛍️ *NEW ORDER - Kits and Craft* 🛍️
----------------------------------
📦 *ITEMS ORDERED:*
${itemLines}

💰 *ORDER SUMMARY:*
• Subtotal: ₹${subtotal}
• Shipping Fee: Will be confirmed on WhatsApp 🚚
• *Total Items Amount:* ₹${subtotal}

👤 *CUSTOMER & DELIVERY DETAILS:*
• Name: ${fullName}
• Phone: ${phone}
• Address: ${fullAddress}
----------------------------------
Thank you! Please confirm my order and shipping fee.`;

    // 1. Dual-register order on backend API so it shows up in Admin Panel /orders
    try {
      await fetch('/api/orders', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userIdentifier: phone || fullName,
          customerName: fullName,
          shippingAddress: fullAddress,
          phone,
          items: items.map((i) => ({
            productId: i.id,
            productName: i.name,
            price: i.price,
            quantity: i.quantity,
            image: i.image,
          })),
          subtotal,
          shipping: 0,
          total: subtotal,
          status: "WhatsApp Initiated",
        }),
      });
    } catch (err) {
      console.warn("Backend WhatsApp order registration notice:", err);
    }

    // 2. Open WhatsApp Direct Deep-Link (100% Free)
    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
      message,
    )}`;
    window.open(waUrl, "_blank");

    setSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-emerald-600 text-white p-5 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-white/20 rounded-xl">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-extrabold text-base">
                WhatsApp Delivery Address
              </h2>
              <p className="text-xs text-emerald-100 font-medium">
                Enter your details to confirm your order on WhatsApp
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form
          onSubmit={handleSubmit}
          className="p-6 overflow-y-auto space-y-5 flex-1"
        >
          {/* Order Brief */}
          <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl text-xs space-y-1.5">
            <div className="flex justify-between font-bold text-emerald-900">
              <span>
                Items Subtotal ({items.reduce((s, i) => s + i.quantity, 0)}{" "}
                items)
              </span>
              <span>₹{subtotal}</span>
            </div>
            <p className="text-[11px] text-emerald-700">
              {items.map((i) => `${i.name} (x${i.quantity})`).join(", ")}
            </p>
            <div className="pt-1.5 border-t border-emerald-200/60 flex justify-between text-[11px] font-extrabold text-emerald-800">
              <span>Shipping Fee:</span>
              <span className="bg-emerald-200/60 px-2 py-0.5 rounded-md text-emerald-900">
                Will be confirmed on WhatsApp 🚚
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1 flex items-center space-x-1">
                <User className="w-3.5 h-3.5 text-emerald-600" />
                <span>Full Name</span>
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Roshan Kumar"
                required
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1 flex items-center space-x-1">
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                <span>Mobile Phone Number (WhatsApp Number)</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 9876543210"
                required
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1 flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                <span>Delivery Address (House/Street/Area)</span>
              </label>
              <textarea
                rows={2}
                value={addressLine}
                onChange={(e) => setAddressLine(e.target.value)}
                placeholder="House No., Street Name, Area / Landmark"
                required
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. New Delhi"
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">
                  Pincode
                </label>
                <input
                  type="text"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  placeholder="e.g. 110001"
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-2xl shadow-lg transition flex items-center justify-center space-x-2 active:scale-98"
          >
            <Send className="w-4 h-4" />
            <span>
              {submitting ? "Opening WhatsApp..." : "Send Order on WhatsApp"}
            </span>
          </button>
        </form>
      </div>
    </div>
  );
}
