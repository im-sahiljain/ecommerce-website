"use client";

import { useState, useEffect } from "react";
import { MessageCircle } from "lucide-react";

interface SiteSettings {
  isWhatsappEnabled: boolean;
  whatsappNumber: string;
  whatsappMessageTemplate: string;
}

export default function WhatsappFloatingButton() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    fetch("http://localhost:5000/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data) setSettings(data);
      })
      .catch(() => {});
  }, []);

  if (!settings || !settings.isWhatsappEnabled) return null;

  const phoneClean = settings.whatsappNumber.replace(/[^0-9]/g, "");
  const messageText = encodeURIComponent(
    "Hi! I have a question about products on your website.",
  );
  const whatsappUrl = `https://wa.me/${phoneClean}?text=${messageText}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-6 right-6 z-40 bg-emerald-500 hover:bg-emerald-600 text-white p-3.5 rounded-full shadow-2xl transition transform hover:scale-110 flex items-center justify-center space-x-2 group"
    >
      <MessageCircle className="w-6 h-6 fill-current" />
      <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-in-out whitespace-nowrap text-xs font-extrabold pr-1">
        Need help? Chat with us
      </span>
    </a>
  );
}
