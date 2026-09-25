"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Save,
  CheckCircle2,
  MessageCircle,
  ShoppingBag,
  ShieldCheck,
} from "lucide-react";
import { adminFetch } from "@/config/adminAuth";

interface SiteSettings {
  isGlobalOrderingEnabled: boolean;
  isWhatsappOrderingEnabled: boolean;
  isWhatsappChatButtonEnabled: boolean;
  whatsappNumber: string;
  siteTitle: string;
  defaultMetaDescription: string;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SiteSettings>({
    isGlobalOrderingEnabled: true,
    isWhatsappOrderingEnabled: true,
    isWhatsappChatButtonEnabled: true,
    whatsappNumber: "",
    siteTitle: "Kits and Craft Craft & Candle Hub",
    defaultMetaDescription:
      "Ready-to-paint craft figurines, scented aesthetic wax candles, and creative art kits.",
  });

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const chatButtonTouched = useRef(false);

  useEffect(() => {
    let cancelled = false;
    adminFetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (cancelled || !data || data.error) return;
        setSettings((prev) => ({
          isGlobalOrderingEnabled: data.isGlobalOrderingEnabled !== false,
          isWhatsappOrderingEnabled: data.isWhatsappOrderingEnabled !== false,
          isWhatsappChatButtonEnabled: chatButtonTouched.current
            ? prev.isWhatsappChatButtonEnabled
            : data.isWhatsappChatButtonEnabled === true,
          whatsappNumber: data.whatsappNumber || "",
          siteTitle: data.siteTitle || "Kits and Craft",
          defaultMetaDescription: data.defaultMetaDescription || "",
        }));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const saveChatButton = async (enabled: boolean) => {
    chatButtonTouched.current = true;
    setSettings((prev) => ({ ...prev, isWhatsappChatButtonEnabled: enabled }));
    setError("");
    try {
      const res = await adminFetch("/api/settings", {
        method: "PUT",
        body: JSON.stringify({ isWhatsappChatButtonEnabled: enabled }),
      });
      const data = await res.json().catch(() => null);
      if (
        !res.ok ||
        !data ||
        data.error ||
        data.isWhatsappChatButtonEnabled !== enabled
      ) {
        setError(data?.error || "Could not save the WhatsApp chat button setting.");
        setSettings((prev) => ({
          ...prev,
          isWhatsappChatButtonEnabled: !enabled,
        }));
      }
    } catch (err) {
      console.warn("Save chat button failed:", err);
      setError("Could not save the WhatsApp chat button setting.");
      setSettings((prev) => ({
        ...prev,
        isWhatsappChatButtonEnabled: !enabled,
      }));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    setError("");

    try {
      const res = await adminFetch("/api/settings", {
        method: "PUT",
        body: JSON.stringify(settings),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data || data.error) {
        setError(data?.error || "Could not save settings. Try again.");
        return;
      }
      setSettings({
        isGlobalOrderingEnabled: data.isGlobalOrderingEnabled !== false,
        isWhatsappOrderingEnabled: data.isWhatsappOrderingEnabled !== false,
        isWhatsappChatButtonEnabled: data.isWhatsappChatButtonEnabled === true,
        whatsappNumber: data.whatsappNumber || "",
        siteTitle: data.siteTitle || "Kits and Craft",
        defaultMetaDescription: data.defaultMetaDescription || "",
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.warn("Save settings failed:", err);
      setError("Could not save settings. Try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-neutral-800">
          Global Storefront Settings
        </h1>
        <p className="text-neutral-500 text-xs mt-1">
          Configure independent ordering controls, WhatsApp integration
          switches, and SEO defaults.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-danger-50 border border-danger-200 text-danger-800 text-xs font-bold rounded-2xl">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-success-50 border border-success-200 text-success-800 text-xs font-bold rounded-2xl flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-success-500" />
          <span>Global store settings updated successfully!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6 max-w-3xl">
        {/* Switch 1: Website Ordering Switch */}
        <div className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-2xs space-y-4">
          <div className="flex items-center space-x-2 border-b border-neutral-100 pb-3">
            <ShoppingBag className="w-5 h-5 text-primary" />
            <h2 className="text-base font-extrabold text-neutral-800">
              1. Master Website Online Ordering Switch
            </h2>
          </div>

          <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
            <div>
              <p className="font-extrabold text-sm text-neutral-800">
                Enable Website Online Cart & Checkout
              </p>
              <p className="text-xs text-neutral-500 mt-0.5">
                When turned OFF, standard website cart checkout is disabled
                across the store.
              </p>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.isGlobalOrderingEnabled}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    isGlobalOrderingEnabled: e.target.checked,
                  })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-neutral-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>

        {/* Switch 2: WhatsApp Ordering Switch */}
        <div className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-2xs space-y-4">
          <div className="flex items-center space-x-2 border-b border-neutral-100 pb-3">
            <MessageCircle className="w-5 h-5 text-success-600" />
            <h2 className="text-base font-extrabold text-neutral-800">
              2. Master WhatsApp Ordering Switch
            </h2>
          </div>

          <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
            <div>
              <p className="font-extrabold text-sm text-neutral-800">
                Enable "Order via WhatsApp" in Cart Drawer
              </p>
              <p className="text-xs text-neutral-500 mt-0.5">
                When turned ON, customers can click "Order via WhatsApp" in
                their cart, fill out their delivery address, and send the order
                receipt to your WhatsApp.
              </p>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.isWhatsappOrderingEnabled}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    isWhatsappOrderingEnabled: e.target.checked,
                  })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-neutral-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-success-500"></div>
            </label>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              Destination WhatsApp Number (with country code)
            </label>
            <input
              type="text"
              value={settings.whatsappNumber}
              onChange={(e) =>
                setSettings({ ...settings, whatsappNumber: e.target.value })
              }
              placeholder="+919876543210"
              required
              className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:border-success-500"
            />
            <p className="text-[10px] text-neutral-400 mt-1">
              All WhatsApp order receipts will be routed directly to this phone
              number.
            </p>
          </div>
        </div>

        {/* Switch 3: Floating WhatsApp Chat Button Switch */}
        <div className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-2xs space-y-4">
          <div className="flex items-center space-x-2 border-b border-neutral-100 pb-3">
            <MessageCircle className="w-5 h-5 text-success-500" />
            <h2 className="text-base font-extrabold text-neutral-800">
              3. Floating WhatsApp Chat Widget Switch
            </h2>
          </div>

          <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
            <div>
              <p className="font-extrabold text-sm text-neutral-800">
                Show Floating WhatsApp Chat Button
              </p>
              <p className="text-xs text-neutral-500 mt-0.5">
                Displays a floating chat widget in the bottom-right corner of
                storefront pages for general inquiries. This switch saves as
                soon as you change it.
              </p>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.isWhatsappChatButtonEnabled}
                onChange={(e) => saveChatButton(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-neutral-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-success-500"></div>
            </label>
          </div>
        </div>

        {/* Section 3: SEO Site-wide Defaults */}
        <div className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-2xs space-y-4">
          <div className="flex items-center space-x-2 border-b border-neutral-100 pb-3">
            <ShieldCheck className="w-5 h-5 text-info-500" />
            <h2 className="text-base font-extrabold text-neutral-800">
              SEO & Metadata Defaults
            </h2>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              Site Title
            </label>
            <input
              type="text"
              value={settings.siteTitle}
              onChange={(e) =>
                setSettings({ ...settings, siteTitle: e.target.value })
              }
              required
              className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:border-info-400"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              Default Meta Description
            </label>
            <textarea
              rows={2}
              value={settings.defaultMetaDescription}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  defaultMetaDescription: e.target.value,
                })
              }
              required
              className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:border-info-400"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-8 py-3 bg-primary hover:bg-primary/90 text-white font-bold text-xs rounded-xl shadow-2xs transition flex items-center space-x-2"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? "Saving Changes..." : "Save All Settings"}</span>
        </button>
      </form>
    </div>
  );
}
