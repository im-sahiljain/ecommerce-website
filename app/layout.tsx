import "./globals.css";
import React from "react";
import StoreProvider from "../store/StoreProvider";
import { AuthProvider } from "../context/AuthContext";
import { CartProvider } from "../context/CartContext";
import StorefrontLayout from "../components/StorefrontLayout";

const SEO_IMAGE_URL =
  process.env.NEXT_PUBLIC_SEO_IMAGE_URL ||
  "https://res.cloudinary.com/dagkrnoap/image/upload/v1785172624/Ecommerce/Products/General/onduwnvvkdslu17y5y9z.png";

export const metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://craftandkit.vercel.app/",
  ),
  title: {
    default:
      "Kits & Craft | Plaster Painting Kits for Kids & Home Décor India",
    template: "%s | Kits & Craft",
  },
  description:
    "Shop ready-to-paint plaster craft kits, DIY plaster figurines for kids birthday return gifts, and aesthetic home décor craft kits in India.",
  keywords: [
    "Kits & Craft India",
    "Plaster painting kits for kids India",
    "Ready to paint plaster figurines",
    "DIY craft kits for birthday return gifts",
    "Non toxic painting set for toddlers",
    "Kids activity box return gift bulk order",
    "Aesthetic plaster figurines for home decor",
  ],
  authors: [{ name: "Kits & Craft" }],
  creator: "Kits & Craft",
  publisher: "Kits & Craft",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://craftandkit.vercel.app/",
    siteName: "Kits & Craft",
    title:
      "Kits & Craft | Plaster Painting Kits for Kids & Home Décor India",
    description:
      "Discover non-toxic plaster painting kits for kids, birthday return gift boxes, and aesthetic home décor craft figurines.",
    images: [
      {
        url: SEO_IMAGE_URL,
        width: 1200,
        height: 630,
        alt: "Kits & Craft - Plaster Painting Kits & Home Décor",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kits & Craft | Plaster Painting Kits & Home Décor",
    description:
      "Shop non-toxic DIY plaster craft kits & aesthetic home décor figurines.",
    images: [SEO_IMAGE_URL],
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
