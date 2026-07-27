"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useCart } from "../context/CartContext";
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight, MessageCircle } from "lucide-react";
import { API_BASE_URL } from "../config/api";
import WhatsappOrderModal from "./WhatsappOrderModal";

interface SiteSettings {
  isGlobalOrderingEnabled: boolean;
  isWhatsappEnabled: boolean;
  whatsappNumber: string;
}

export default function CartDrawer() {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    totalPrice,
  } = useCart();

  const [settings, setSettings] = useState<SiteSettings>({
    isGlobalOrderingEnabled: true,
    isWhatsappEnabled: true,
    whatsappNumber: "+919876543210",
  });
  const [isWaModalOpen, setIsWaModalOpen] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/settings`)
      .then((res) => res.json())
      .then((data) => {
        if (data) setSettings(data);
      })
      .catch(() => {});
  }, []);

  if (!isCartOpen) return null;

  const subtotal = Math.round(totalPrice);
  const shipping = subtotal > 499 || subtotal === 0 ? 0 : 50;
  const grandTotal = subtotal + shipping;

  return (
    <>
      <div className="fixed inset-0 z-50 flex justify-end bg-black/30 backdrop-blur-xs">
        <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-pink-50/50">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="w-5 h-5 text-pink-500" />
              <h3 className="font-bold text-lg text-slate-800">
                Your Craft Basket
              </h3>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items */}
          <div className="p-6 flex-1 overflow-y-auto space-y-4">
            {cart.length === 0 ? (
              <div className="text-center py-16">
                <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="font-bold text-slate-600">Your basket is empty!</p>
                <p className="text-xs text-slate-400 mt-1">
                  Explore our ready-to-paint craft kits to get started.
                </p>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center space-x-4 bg-slate-50 p-3 rounded-2xl border border-slate-100"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 rounded-xl object-cover"
                  />
                  <div className="flex-1">
                    <h4 className="font-bold text-sm text-slate-800">
                      {item.name}
                    </h4>
                    <p className="text-xs text-pink-500 font-bold mt-0.5">
                      ₹{item.price.toFixed(2)}
                    </p>
                    <div className="flex items-center space-x-2 mt-2">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="w-6 h-6 bg-white rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-bold w-4 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="w-6 h-6 bg-white rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-slate-400 hover:text-red-500 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer Checkout CTA */}
          {cart.length > 0 && (
            <div className="p-6 border-t border-slate-100 bg-slate-50/50 space-y-3">
              <div className="space-y-1 text-xs text-slate-600 font-medium">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>₹{subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping:</span>
                  <span>{shipping === 0 ? "FREE" : `₹${shipping}`}</span>
                </div>
                <div className="flex justify-between items-center text-sm font-extrabold text-slate-800 pt-1 border-t border-slate-200">
                  <span>Total Amount:</span>
                  <span className="text-pink-600 text-base">₹{grandTotal}</span>
                </div>
              </div>

              {/* Standard Website Checkout (if enabled) */}
              {settings.isGlobalOrderingEnabled && (
                <Link
                  href="/checkout"
                  onClick={() => setIsCartOpen(false)}
                  className="w-full py-3.5 bg-pink-500 hover:bg-pink-600 text-white font-extrabold rounded-2xl flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transition active:scale-98 text-xs"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}

              {/* WhatsApp Checkout (if enabled) */}
              {settings.isWhatsappEnabled && (
                <button
                  onClick={() => setIsWaModalOpen(true)}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-2xl flex items-center justify-center space-x-2 shadow-lg transition active:scale-98 text-xs"
                >
                  <MessageCircle className="w-4 h-4 fill-current" />
                  <span>Order via WhatsApp (Free Message)</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* WhatsApp Delivery Address Modal */}
      <WhatsappOrderModal
        isOpen={isWaModalOpen}
        onClose={() => setIsWaModalOpen(false)}
        items={cart}
        subtotal={subtotal}
        shipping={shipping}
        total={grandTotal}
        whatsappNumber={settings.whatsappNumber}
      />
    </>
  );
}
