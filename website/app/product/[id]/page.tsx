"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useCart } from "../../../context/CartContext";
import {
  ShieldCheck,
  Sparkles,
  Minus,
  Plus,
  ShoppingBag,
  Truck,
  RotateCcw,
  Award,
  MessageCircle,
  Heart,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  Maximize2,
  X,
} from "lucide-react";
import { API_BASE_URL } from "../../../config/api";

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  theme: string;
  category: string;
  ageGroup: string;
  isNonToxic: boolean;
  image: string;
  images?: string[];
  description: string;
  inStock: boolean;
  isOrderingEnabled?: boolean;
  attributes?: Record<string, string>;
}

interface SiteSettings {
  isGlobalOrderingEnabled: boolean;
  whatsappNumber: string;
  whatsappMessageTemplate: string;
}

export default function ProductDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { addToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [likesCount, setLikesCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [selectedImgIndex, setSelectedImgIndex] = useState(0);

  // Hover Zoom Lens State
  const [isHovered, setIsHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  // Fullscreen Modal Lightbox State
  const [isFullscreenModalOpen, setIsFullscreenModalOpen] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/products/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.id) setProduct(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    fetch(`${API_BASE_URL}/api/settings`)
      .then((res) => res.json())
      .then((data) => {
        if (data) setSettings(data);
      })
      .catch(() => {});
  }, [id]);

  const allImages = product
    ? Array.isArray(product.images) && product.images.length > 0
      ? product.images
      : product.image
        ? [product.image]
        : []
    : [];

  // Infinite Loop Prev / Next Image Handlers
  const handlePrevImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (allImages.length === 0) return;
    setSelectedImgIndex(
      (prev) => (prev - 1 + allImages.length) % allImages.length,
    );
  };

  const handleNextImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (allImages.length === 0) return;
    setSelectedImgIndex((prev) => (prev + 1) % allImages.length);
  };

  // Keyboard navigation for Fullscreen Lightbox Modal
  useEffect(() => {
    if (!isFullscreenModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") handlePrevImage();
      if (e.key === "ArrowRight") handleNextImage();
      if (e.key === "Escape") setIsFullscreenModalOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreenModalOpen, allImages.length]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(
      0,
      Math.min(100, ((e.clientX - rect.left) / rect.width) * 100),
    );
    const y = Math.max(
      0,
      Math.min(100, ((e.clientY - rect.top) / rect.height) * 100),
    );
    setMousePos({ x, y });
  };

  const handleLikeToggle = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/products/${id}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userIdentifier: "guest" }),
      });
      if (res.ok) {
        const data = await res.json();
        setLikesCount(data.likes);
        setIsLiked(data.isLiked);
      }
    } catch (err) {
      console.warn("Like toggle failed:", err);
    }
  };

  if (loading) {
    return (
      <div className="p-16 text-center text-slate-500 font-bold">
        Loading product details...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white text-center rounded-3xl border border-slate-100 shadow-sm">
        <h3 className="font-bold text-lg text-slate-800">Product Not Found</h3>
        <p className="text-xs text-slate-500 mt-2">
          The product set you are looking for does not exist or was moved.
        </p>
      </div>
    );
  }

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://craftandkit.vercel.app/";
  const isOrderingAllowed =
    (settings?.isGlobalOrderingEnabled ?? true) &&
    (product.isOrderingEnabled ?? true);
  const phoneClean = (settings?.whatsappNumber || "+919876543210").replace(
    /[^0-9]/g,
    "",
  );
  const productUrl = `${siteUrl}/product/${product.id}`;
  const rawMessage = (
    settings?.whatsappMessageTemplate ||
    "Hi! I am interested in {productName} ({productUrl})."
  )
    .replace("{productName}", product.name)
    .replace("{productUrl}", productUrl);
  const whatsappUrl = `https://wa.me/${phoneClean}?text=${encodeURIComponent(rawMessage)}`;

  // Google JSON-LD Product Schema for SEO Rich Snippets
  const jsonLd = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: product.name,
    image: allImages.length > 0 ? allImages : [product.image],
    description: product.description,
    sku: (product as any).sku || product.id,
    brand: {
      "@type": "Brand",
      name: "POP Craft & Candle Store",
    },
    category: product.category,
    offers: {
      "@type": "Offer",
      url: productUrl,
      priceCurrency: "INR",
      price: product.price,
      itemCondition: "https://schema.org/NewCondition",
      availability: product.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
  };

  const currentImageUrl = allImages[selectedImgIndex] || product.image;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="relative bg-white rounded-3xl p-6 sm:p-10 border border-slate-100 soft-shadow grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Image & Gallery Section */}
          <div className="space-y-4">
            {/* Main Image Container */}
            <div
              className="relative rounded-3xl overflow-hidden aspect-square bg-slate-50 border border-slate-200/80 group shadow-xs cursor-pointer select-none flex items-center justify-center"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              onMouseMove={handleMouseMove}
              onClick={() => setIsFullscreenModalOpen(true)}
            >
              {/* Product Main Display Image with Full Cover Focus */}
              <img
                src={currentImageUrl}
                alt={product.name}
                className="w-full h-full object-cover pointer-events-none select-none transition duration-200"
              />

              {/* Semi-Transparent Lens Indicator Box on Mouse Hover */}
              {isHovered && (
                <div
                  className="hidden md:block absolute w-28 h-28 border-2 border-pink-500 bg-pink-500/20 rounded-2xl shadow-lg pointer-events-none z-30 transition-transform duration-75"
                  style={{
                    left: `calc(${mousePos.x}% - 3.5rem)`,
                    top: `calc(${mousePos.y}% - 3.5rem)`,
                  }}
                />
              )}

              {/* Age & Safety Badges */}
              <div className="absolute top-4 left-4 flex flex-col space-y-2 pointer-events-none z-20">
                <span className="px-3.5 py-1.5 bg-sky-100/90 text-sky-800 rounded-full text-xs font-bold shadow-xs backdrop-blur-md">
                  {product.ageGroup}
                </span>
                {product.isNonToxic && (
                  <span className="px-3.5 py-1.5 bg-emerald-100/90 text-emerald-800 rounded-full text-xs font-bold shadow-xs flex items-center space-x-1 backdrop-blur-md">
                    <ShieldCheck className="w-4 h-4 inline" />
                    <span>100% Non-Toxic</span>
                  </span>
                )}
              </div>

              {/* Top-Right Action Buttons: Wishlist & Expand */}
              <div className="absolute top-4 right-4 flex items-center space-x-2 z-20">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsFullscreenModalOpen(true);
                  }}
                  title="Expand Fullscreen"
                  className="p-2.5 rounded-full bg-white/80 hover:bg-white text-slate-700 shadow-sm backdrop-blur-md transition hover:scale-105"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLikeToggle();
                  }}
                  title="Save to Favorites"
                  className={`p-2.5 rounded-full backdrop-blur-md transition shadow-sm ${
                    isLiked
                      ? "bg-rose-500 text-white"
                      : "bg-white/80 text-slate-600 hover:text-rose-500 hover:bg-white"
                  }`}
                >
                  <Heart className="w-4 h-4 fill-current" />
                </button>
              </div>

              {/* Infinite Loop Left / Right Arrow Swipe Buttons */}
              {allImages.length > 1 && (
                <>
                  <button
                    onClick={handlePrevImage}
                    aria-label="Previous Image"
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-slate-800 shadow-md backdrop-blur-md flex items-center justify-center transition-all opacity-90 sm:opacity-0 group-hover:opacity-100 hover:scale-110 z-20"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>

                  <button
                    onClick={handleNextImage}
                    aria-label="Next Image"
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-slate-800 shadow-md backdrop-blur-md flex items-center justify-center transition-all opacity-90 sm:opacity-0 group-hover:opacity-100 hover:scale-110 z-20"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}

              {/* Hover / Click Helper Badge */}
              <div className="absolute bottom-3 right-3 px-3 py-1.5 bg-black/60 backdrop-blur-md text-white rounded-full text-[11px] font-semibold flex items-center gap-1.5 opacity-70 group-hover:opacity-100 transition pointer-events-none z-20">
                <ZoomIn className="w-3.5 h-3.5" />
                <span>Hover for Side Zoom • Click Fullscreen</span>
              </div>
            </div>

            {/* Gallery Thumbnails Row Below */}
            {allImages.length > 0 && (
              <div className="flex items-center space-x-3 overflow-x-auto p-1">
                {allImages.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImgIndex(idx)}
                    className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 transition shrink-0 bg-white flex items-center justify-center cursor-pointer ${
                      selectedImgIndex === idx
                        ? "border-pink-500 scale-105 shadow-md ring-2 ring-pink-500/30"
                        : "border-slate-200 opacity-70 hover:opacity-100 hover:border-slate-300"
                    }`}
                  >
                    <img
                      src={imgUrl}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Floating Side-Zoom Preview Box (Opens on Mouse Hover) */}
          {isHovered && (
            <div className="hidden lg:block absolute left-[52%] top-6 w-[45%] aspect-square z-40 bg-white rounded-3xl border-2 border-pink-400 shadow-2xl overflow-hidden pointer-events-none animate-fade-in">
              <div
                className="w-full h-full bg-no-repeat"
                style={{
                  backgroundImage: `url(${currentImageUrl})`,
                  backgroundSize: "280% 280%",
                  backgroundPosition: `${mousePos.x}% ${mousePos.y}%`,
                }}
              />
              <div className="absolute bottom-3 right-3 px-3 py-1 bg-slate-900/85 backdrop-blur-md text-white rounded-full text-[10px] font-extrabold uppercase tracking-wider shadow-sm flex items-center gap-1.5">
                <ZoomIn className="w-3.5 h-3.5 text-pink-400" />
                <span>2.8x Zoom View</span>
              </div>
            </div>
          )}

          {/* Product Info Section */}
          <div className="space-y-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-2 text-xs font-bold text-pink-500 uppercase tracking-wider mb-2">
                <Sparkles className="w-4 h-4" />
                <span>
                  {product.theme} • {product.category}
                </span>
              </div>

              <h1 className="text-3xl font-extrabold text-slate-800 leading-tight">
                {product.name}
              </h1>

              <div className="flex items-baseline space-x-3 mt-3">
                <span className="text-3xl font-extrabold text-slate-900">
                  ₹{product.price.toFixed(2)}
                </span>
                {product.originalPrice && (
                  <span className="text-lg font-medium text-slate-400 line-through">
                    ₹{product.originalPrice.toFixed(2)}
                  </span>
                )}
              </div>

              <p className="text-slate-600 text-sm leading-relaxed mt-4 font-medium">
                {product.description}
              </p>

              {/* Product Attributes (Candle Scent / Burn Time) */}
              {product.attributes &&
                Object.keys(product.attributes).length > 0 && (
                  <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5 text-xs">
                    {Object.entries(product.attributes).map(([key, val]) => (
                      <div
                        key={key}
                        className="flex justify-between font-semibold"
                      >
                        <span className="text-slate-500">{key}:</span>
                        <span className="text-slate-800 font-bold">{val}</span>
                      </div>
                    ))}
                  </div>
                )}
            </div>

            <div className="space-y-6 pt-4 border-t border-slate-100">
              {isOrderingAllowed ? (
                <>
                  {/* Quantity Selector */}
                  <div className="flex items-center space-x-4">
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                      Quantity:
                    </span>
                    <div className="flex items-center space-x-3 bg-slate-50 border border-slate-200 rounded-full p-1">
                      <button
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-100 shadow-xs"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="font-bold text-sm w-6 text-center">
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity((q) => q + 1)}
                        className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-100 shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Add to Cart CTA */}
                  <button
                    onClick={() => addToCart(product, quantity)}
                    className="w-full py-4 bg-pink-300 hover:bg-pink-400 text-slate-800 font-extrabold text-base rounded-full flex items-center justify-center space-x-2 shadow-md hover:shadow-lg transition transform active:scale-98"
                  >
                    <ShoppingBag className="w-5 h-5" />
                    <span>
                      Add to Basket — ₹{(product.price * quantity).toFixed(2)}
                    </span>
                  </button>
                </>
              ) : (
                /* WhatsApp Order Link when Online Ordering is Disabled */
                <div className="space-y-3 p-4 bg-amber-50 rounded-2xl border border-amber-200 text-center">
                  <p className="text-xs font-bold text-amber-800">
                    Online checkout paused for this item.
                  </p>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-sm rounded-full flex items-center justify-center space-x-2 shadow transition"
                  >
                    <MessageCircle className="w-5 h-5 fill-current" />
                    <span>Order / Inquire via WhatsApp</span>
                  </a>
                </div>
              )}

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-2 pt-4 text-center border-t border-slate-100 text-[11px] font-bold text-slate-600">
                <div className="p-2 bg-slate-50 rounded-2xl flex flex-col items-center justify-center">
                  <Truck className="w-4 h-4 text-sky-500 mb-1" />
                  <span>Fast Shipping</span>
                </div>
                <div className="p-2 bg-slate-50 rounded-2xl flex flex-col items-center justify-center">
                  <Award className="w-4 h-4 text-yellow-500 mb-1" />
                  <span>Safe Materials</span>
                </div>
                <div className="p-2 bg-slate-50 rounded-2xl flex flex-col items-center justify-center">
                  <RotateCcw className="w-4 h-4 text-emerald-500 mb-1" />
                  <span>Easy Returns</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Popup Lightbox Modal */}
      {isFullscreenModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col justify-between p-4 sm:p-8 animate-fade-in text-white">
          {/* Header */}
          <div className="flex justify-between items-center z-10 max-w-7xl w-full mx-auto">
            <div className="flex items-center space-x-3">
              <span className="px-3.5 py-1.5 bg-white/10 text-white rounded-full text-xs font-bold backdrop-blur-md">
                {selectedImgIndex + 1} / {allImages.length}
              </span>
              <h3 className="font-bold text-sm sm:text-base text-slate-200 truncate max-w-xs sm:max-w-md">
                {product.name}
              </h3>
            </div>
            <button
              onClick={() => setIsFullscreenModalOpen(false)}
              className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition backdrop-blur-md hover:scale-110"
              aria-label="Close Lightbox"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Lightbox Center Image & Infinite Loop Navigation Controls */}
          <div className="relative flex-1 flex items-center justify-center my-4 overflow-hidden max-w-7xl w-full mx-auto">
            {allImages.length > 1 && (
              <button
                onClick={handlePrevImage}
                className="absolute left-2 sm:left-6 p-3 sm:p-4 bg-white/10 hover:bg-white/25 text-white rounded-full transition backdrop-blur-md hover:scale-110 z-20 shadow-lg"
                aria-label="Previous Image"
              >
                <ChevronLeft className="w-8 h-8 sm:w-10 sm:h-10" />
              </button>
            )}

            <img
              src={allImages[selectedImgIndex]}
              alt={product.name}
              className="max-h-[76vh] max-w-[85vw] object-contain rounded-2xl shadow-2xl transition-all duration-300 select-none"
            />

            {allImages.length > 1 && (
              <button
                onClick={handleNextImage}
                className="absolute right-2 sm:right-6 p-3 sm:p-4 bg-white/10 hover:bg-white/25 text-white rounded-full transition backdrop-blur-md hover:scale-110 z-20 shadow-lg"
                aria-label="Next Image"
              >
                <ChevronRight className="w-8 h-8 sm:w-10 sm:h-10" />
              </button>
            )}
          </div>

          {/* Lightbox Thumbnails Bottom Row */}
          {allImages.length > 1 && (
            <div className="flex items-center justify-center space-x-3 overflow-x-auto py-2 z-10 max-w-7xl w-full mx-auto">
              {allImages.map((imgUrl, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImgIndex(idx)}
                  className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden border-2 transition shrink-0 bg-white p-1 cursor-pointer ${
                    selectedImgIndex === idx
                      ? "border-pink-500 scale-110 shadow-lg ring-2 ring-pink-500/50"
                      : "border-white/20 opacity-60 hover:opacity-100"
                  }`}
                >
                  <img
                    src={imgUrl}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
