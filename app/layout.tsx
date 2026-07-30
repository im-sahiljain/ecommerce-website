import "./globals.css";
import React from "react";
import StoreProvider from "../store/StoreProvider";
import { AuthProvider } from "../context/AuthContext";
import { CartProvider } from "../context/CartContext";
import StorefrontLayout from "../components/StorefrontLayout";

export const metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://craftandkit.vercel.app/",
  ),
  title: {
    default:
      "POP Craft & Candle Store | Plaster Painting Kits for Kids & Aesthetic Soy Candles India",
    template: "%s | POP Craft & Candle Store",
  },
  description:
    "Shop ready-to-paint plaster craft kits, DIY plaster figurines for kids birthday return gifts, and hand-poured non-toxic aesthetic soy wax candles in India.",
  keywords: [
    "Plaster painting kits for kids India",
    "Ready to paint plaster figurines",
    "DIY craft kits for birthday return gifts",
    "Non toxic painting set for toddlers",
    "Kids activity box return gift bulk order",
    "Hand-poured soy wax candles India",
    "Aesthetic pillar candles for home decor",
    "Luxury botanical scented candles",
    "Eco friendly non toxic soy candles online",
  ],
  authors: [{ name: "POP Craft & Candle Store" }],
  creator: "POP Craft & Candle Store",
  publisher: "POP Craft & Candle Store",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://craftandkit.vercel.app/",
    siteName: "POP Craft & Candle Store",
    title:
      "POP Craft & Candle Store | Plaster Painting Kits for Kids & Aesthetic Soy Candles India",
    description:
      "Discover non-toxic plaster painting kits for kids, birthday return gift boxes, and hand-poured aesthetic soy wax candles.",
    images: [
      {
        url: "/images/hero/indian-kids-painting.png",
        width: 1200,
        height: 630,
        alt: "Kids painting plaster craft kits - POP Craft & Candle Store",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "POP Craft & Candle Store | Plaster Painting Kits & Soy Candles",
    description:
      "Shop non-toxic DIY plaster craft kits & aesthetic soy candles.",
    images: ["/images/hero/indian-kids-painting.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col justify-between antialiased">
        <StoreProvider>
          <AuthProvider>
            <CartProvider>
              <StorefrontLayout>{children}</StorefrontLayout>
            </CartProvider>
          </AuthProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
