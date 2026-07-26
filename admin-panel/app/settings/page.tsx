'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Save, CheckCircle2, MessageCircle, ShoppingBag, ShieldCheck } from 'lucide-react';
import { adminFetch } from '../../config/auth';

interface SiteSettings {
  isGlobalOrderingEnabled: boolean;
  whatsappNumber: string;
  whatsappMessageTemplate: string;
  isWhatsappEnabled: boolean;
  siteTitle: string;
  defaultMetaDescription: string;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SiteSettings>({
    isGlobalOrderingEnabled: true,
    whatsappNumber: '+919876543210',
    whatsappMessageTemplate: 'Hi! I am interested in {productName} ({productUrl}). Can you help me with details?',
    isWhatsappEnabled: true,
    siteTitle: 'Little Creators Craft & Candle Hub',
    defaultMetaDescription: 'Ready-to-paint craft figurines, scented aesthetic wax candles, and creative art kits.'
  });

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    adminFetch('/api/settings')
      .then(res => res.json())
      .then(data => { if (data) setSettings(data); })
      .catch(() => {});
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);

    try {
      const res = await adminFetch('/api/settings', {
        method: 'PUT',
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      console.warn('Save settings failed:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800">Global Storefront Settings</h1>
        <p className="text-slate-500 text-xs mt-1">Configure global ordering switches, WhatsApp Click-to-Chat integration, and SEO defaults.</p>
      </div>

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>Global store settings updated successfully!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6 max-w-3xl">
        {/* Section 1: Global Ordering Switch */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <ShoppingBag className="w-5 h-5 text-pink-500" />
            <h2 className="text-base font-extrabold text-slate-800">Master Ordering Switch</h2>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div>
              <p className="font-extrabold text-sm text-slate-800">Enable Site-Wide Online Ordering</p>
              <p className="text-xs text-slate-500 mt-0.5">
                When turned OFF, all Add to Cart / Checkout buttons across the store are replaced with WhatsApp inquiry links.
              </p>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.isGlobalOrderingEnabled}
                onChange={e => setSettings({ ...settings, isGlobalOrderingEnabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>
        </div>

        {/* Section 2: WhatsApp Click-to-Chat Integration */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <MessageCircle className="w-5 h-5 text-emerald-500" />
            <h2 className="text-base font-extrabold text-slate-800">WhatsApp Integration</h2>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div>
              <p className="font-extrabold text-sm text-slate-800">Show Floating WhatsApp Button</p>
              <p className="text-xs text-slate-500 mt-0.5">Displays a floating chat widget in the bottom-right corner of storefront pages.</p>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.isWhatsappEnabled}
                onChange={e => setSettings({ ...settings, isWhatsappEnabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Destination WhatsApp Number (with country code)</label>
            <input
              type="text"
              value={settings.whatsappNumber}
              onChange={e => setSettings({ ...settings, whatsappNumber: e.target.value })}
              placeholder="+919876543210"
              required
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-emerald-400"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Pre-filled Message Template</label>
            <textarea
              rows={3}
              value={settings.whatsappMessageTemplate}
              onChange={e => setSettings({ ...settings, whatsappMessageTemplate: e.target.value })}
              placeholder="Hi! I am interested in {productName} ({productUrl})."
              required
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-emerald-400"
            />
            <p className="text-[10px] text-slate-400 mt-1">Use <code className="bg-slate-100 px-1 rounded text-slate-700">{'{productName}'}</code> and <code className="bg-slate-100 px-1 rounded text-slate-700">{'{productUrl}'}</code> as dynamic placeholders.</p>
          </div>
        </div>

        {/* Section 3: SEO Site-wide Defaults */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <ShieldCheck className="w-5 h-5 text-sky-500" />
            <h2 className="text-base font-extrabold text-slate-800">SEO & Metadata Defaults</h2>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Site Title</label>
            <input
              type="text"
              value={settings.siteTitle}
              onChange={e => setSettings({ ...settings, siteTitle: e.target.value })}
              required
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-sky-400"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Default Meta Description</label>
            <textarea
              rows={2}
              value={settings.defaultMetaDescription}
              onChange={e => setSettings({ ...settings, defaultMetaDescription: e.target.value })}
              required
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-sky-400"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-8 py-3 bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center space-x-2"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving Changes...' : 'Save All Settings'}</span>
        </button>
      </form>
    </div>
  );
}
