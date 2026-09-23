"use client";

import { useEffect, useState } from "react";

interface SiteSettings {
  isWhatsappChatButtonEnabled?: boolean;
  isWhatsappEnabled?: boolean;
  whatsappNumber: string;
}

function WhatsappIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.572-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

const DESKTOP_HOVER = "(min-width: 640px) and (hover: hover) and (pointer: fine)";

export default function WhatsappFloatingButton() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [introOpen, setIntroOpen] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [desktopHover, setDesktopHover] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data) setSettings(data);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const media = window.matchMedia(DESKTOP_HOVER);
    const update = () => setDesktopHover(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!settings) return;
    setIntroOpen(true);
    const timer = window.setTimeout(() => setIntroOpen(false), 1800);
    return () => window.clearTimeout(timer);
  }, [settings]);

  const isEnabled = settings
    ? settings.isWhatsappChatButtonEnabled !== false &&
      settings.isWhatsappEnabled !== false
    : true;

  if (!settings || !isEnabled) return null;

  const phoneClean = (settings.whatsappNumber || "").replace(/[^0-9]/g, "");
  const messageText = encodeURIComponent(
    "Hi! I have a question about products on your website.",
  );
  const whatsappUrl = `https://wa.me/${phoneClean}?text=${messageText}`;
  const expanded = introOpen || (desktopHover && hovered);

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      onMouseEnter={() => {
        if (desktopHover) setHovered(true);
      }}
      onMouseLeave={() => setHovered(false)}
      className={`fixed bottom-6 right-6 z-40 flex h-14 w-max min-w-14 items-center justify-center overflow-hidden rounded-full border-2 border-white/30 bg-emerald-600 text-white shadow-2xl transition-all duration-500 ease-in-out ${
        expanded ? "max-w-56 gap-2 px-4" : "max-w-14 gap-0 px-0"
      }`}
    >
      <WhatsappIcon className="h-7 w-7 shrink-0 text-white" />
      <span
        className={`overflow-hidden whitespace-nowrap text-xs font-black tracking-wide transition-all duration-500 ease-in-out ${
          expanded ? "max-w-40 opacity-100" : "max-w-0 min-w-0 opacity-0"
        }`}
      >
        Chat with us
      </span>
    </a>
  );
}
