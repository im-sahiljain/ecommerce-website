"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useCart } from "../context/CartContext";
import {
  X,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  MessageCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { API_BASE_URL } from "../config/api";
import WhatsappOrderModal from "./WhatsappOrderModal";

interface SiteSettings {
  isGlobalOrderingEnabled: boolean;
  isWhatsappOrderingEnabled?: boolean;
  isWhatsappChatButtonEnabled?: boolean;
  isWhatsappEnabled?: boolean;
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
    isGlobalOrderingEnabled: false,
    isWhatsappOrderingEnabled: true,
    isWhatsappChatButtonEnabled: true,
    isWhatsappEnabled: true,
    whatsappNumber: "",
  });
  const [isWaModalOpen, setIsWaModalOpen] = useState(false);

  // Eager Initial Fetch on Site Mount + Refresh on Cart Drawer Open
  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data) setSettings(data);
      })
      .catch(() => {});
  }, [isCartOpen]);

  useEffect(() => {
    if (!isCartOpen) return;
    const scrollY = window.scrollY;
    const { body, documentElement } = document;
    const previous = {
      bodyOverflow: body.style.overflow,
      bodyPosition: body.style.position,
      bodyTop: body.style.top,
      bodyWidth: body.style.width,
      htmlOverflow: documentElement.style.overflow,
    };
    documentElement.style.overflow = "hidden";
    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.width = "100%";
    return () => {
      body.style.overflow = previous.bodyOverflow;
      body.style.position = previous.bodyPosition;
      body.style.top = previous.bodyTop;
      body.style.width = previous.bodyWidth;
      documentElement.style.overflow = previous.htmlOverflow;
      window.scrollTo(0, scrollY);
    };
  }, [isCartOpen]);

  const subtotal = Math.round(totalPrice);
  const onlineShipping = 250;
  const onlineTotal = subtotal + onlineShipping;

  return (
    <>
      <AnimatePresence>
        {isCartOpen && (
          <div className="fixed inset-0 z-90 flex justify-end overscroll-none">
            {/* Smooth Backdrop Fade */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              onClick={() => setIsCartOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-xs cursor-pointer"
            />

            {/* Smooth Cart Panel Slide-In & Slide-Out */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="relative z-10 flex h-full w-full max-w-md flex-col justify-between overscroll-contain bg-white shadow-2xl"
            >
              {/* Header */}
              <div className="p-6 border-b border-neutral-100 flex items-center justify-between bg-primary/5">
                <div className="flex items-center space-x-2">
                  <ShoppingBag className="w-5 h-5 text-primary" />
                  <h3 className="font-bold text-lg text-neutral-800">
                    Your Craft Basket
                  </h3>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="p-2 rounded-full text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Cart Items */}
              <div className="flex-1 space-y-4 overflow-y-auto overscroll-contain p-6">
                {cart.length === 0 ? (
                  <div className="text-center py-16">
                    <ShoppingBag className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                    <p className="font-bold text-neutral-600">
                      Your basket is empty!
                    </p>
                    <p className="text-xs text-neutral-400 mt-1">
                      Explore our ready-to-paint craft kits to get started.
                    </p>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center space-x-4 bg-neutral-50 p-3 rounded-2xl border border-neutral-100"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 rounded-xl object-cover"
                      />
                      <div className="flex-1">
                        <h4 className="font-bold text-sm text-neutral-800">
                          {item.name}
                        </h4>
                        <p className="text-xs text-primary font-bold mt-0.5">
                          ₹{item.price.toFixed(2)}
                        </p>
                        <div className="flex items-center space-x-2 mt-2">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="w-6 h-6 bg-white rounded-full border border-neutral-200 flex items-center justify-center text-neutral-600 hover:bg-neutral-100"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-bold w-4 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="w-6 h-6 bg-white rounded-full border border-neutral-200 flex items-center justify-center text-neutral-600 hover:bg-neutral-100"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-neutral-400 hover:text-red-500 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Footer Checkout CTA */}
              {cart.length > 0 && (
                <div className="p-6 border-t border-neutral-100 bg-neutral-50/50 space-y-3">
                  <div className="space-y-1 text-xs text-neutral-600 font-medium">
                    {settings.isGlobalOrderingEnabled ? (
                      <>
                        <div className="flex justify-between">
                          <span>Items Subtotal:</span>
                          <span className="font-bold text-neutral-800">
                            ₹{subtotal}
                          </span>
                        </div>
                        <div className="flex justify-between text-[11px] text-neutral-400">
                          <span>Online Shipping (Flat):</span>
                          <span>₹{onlineShipping}</span>
                        </div>
                        {settings.isWhatsappOrderingEnabled !== false && (
                          <div className="flex justify-between text-[11px] text-success-600 font-bold">
                            <span>WhatsApp Shipping:</span>
                            <span>Will be confirmed on WhatsApp 🚚</span>
                          </div>
                        )}
                        <div className="flex justify-between items-center text-sm font-extrabold text-neutral-800 pt-1 border-t border-neutral-200">
                          <span>Online Order Total:</span>
                          <span className="text-primary text-base">
                            ₹{onlineTotal}
                          </span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex justify-between">
                          <span>Items Subtotal:</span>
                          <span className="font-bold text-neutral-800">
                            ₹{subtotal}
                          </span>
                        </div>
                        <div className="flex justify-between text-[11px] text-warning-600 font-bold">
                          <span>Shipping Fee:</span>
                          <span className="underline">
                            Will be confirmed on WhatsApp
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-sm font-extrabold text-neutral-800 pt-1 border-t border-neutral-200">
                          <span>Total Items Amount:</span>
                          <span className="text-success-600 text-base">
                            ₹{subtotal}
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Standard Website Checkout (if enabled) */}
                  {settings.isGlobalOrderingEnabled && (
                    <Link
                      href="/checkout"
                      onClick={() => setIsCartOpen(false)}
                      className="w-full py-3.5 bg-primary hover:bg-primary/90 text-white font-extrabold rounded-2xl flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transition active:scale-98 text-xs"
                    >
                      <span>Proceed to Website Checkout (₹{onlineTotal})</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  )}

                  {/* WhatsApp Checkout (Always Available by Default) */}
                  {settings.isWhatsappOrderingEnabled !== false && (
                    <button
                      onClick={() => setIsWaModalOpen(true)}
                      className="w-full py-3.5 bg-success-600 hover:bg-success-700 text-white font-extrabold rounded-2xl flex items-center justify-center space-x-2 shadow-lg transition active:scale-98 text-xs"
                    >
                      <MessageCircle className="w-4 h-4 fill-current" />
                      <span>Order via WhatsApp</span>
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* WhatsApp Delivery Address Modal */}
      <WhatsappOrderModal
        isOpen={isWaModalOpen}
        onClose={() => setIsWaModalOpen(false)}
        items={cart}
        subtotal={subtotal}
        shipping={0}
        total={subtotal}
        whatsappNumber={settings.whatsappNumber}
      />
    </>
  );
}
