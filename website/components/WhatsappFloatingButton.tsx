"use client";

import { useState, useEffect } from "react";
import { MessageCircle } from "lucide-react";
import { API_BASE_URL } from "../config/api";

interface SiteSettings {
  isWhatsappChatButtonEnabled?: boolean;
  isWhatsappEnabled?: boolean;
  whatsappNumber: string;
}

export default function WhatsappFloatingButton() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/settings`)
      .then((res) => res.json())
      .then((data) => {
        if (data) setSettings(data);
      })
      .catch(() => {});
  }, []);

  const isEnabled = settings
    ? settings.isWhatsappChatButtonEnabled !== false &&
      settings.isWhatsappEnabled !== false
    : true;

  if (!settings || !isEnabled) return null;

  const phoneClean = (settings.whatsappNumber || "").replace(/[^0-9]/g, "");
  const messageText = encodeURIComponent(
    "Hi! I have a question about products on your website."
  );
  const whatsappUrl = `https://wa.me/${phoneClean}?text=${messageText}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-6 right-6 z-50 bg-[#25D366] hover:bg-[#20ba5a] text-white h-14 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center px-4 space-x-2 group cursor-pointer border-2 border-white/20"
    >
      <div className="flex-shrink-0 flex items-center justify-center w-7 h-7">
        <MessageCircle className="w-7 h-7 text-white stroke-[2.2]" />
      </div>
      <span className="max-w-0 group-hover:max-w-xs overflow-hidden transition-all duration-300 ease-in-out whitespace-nowrap text-xs font-extrabold tracking-wide">
        Chat with us
      </span>
    </a>
  );
}
