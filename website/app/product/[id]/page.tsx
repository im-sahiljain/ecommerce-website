"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams } from "next/navigation";
import { useCart } from "../../../context/CartContext";
import {
  ShieldCheck,
  Sparkles,
  Minus,
  Plus,
  ShoppingBag,
  ShoppingCart,
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
  Boxes,
  Share2,
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
  badge?: string;
  isNewLaunch?: boolean;
  isSellingFast?: boolean;
  size?: string;
  material?: string;
  attributes?: Record<string, string>;
  isPack?: boolean;
  includedProducts?: any[];
}

interface SiteSettings {
  isGlobalOrderingEnabled: boolean;
  isWhatsappOrderingEnabled?: boolean;
  whatsappNumber: string;
  whatsappMessageTemplate: string;
}

export default function ProductDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { cart, addToCart, updateQuantity, removeFromCart, setIsCartOpen } =
    useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [likesCount, setLikesCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [selectedImgIndex, setSelectedImgIndex] = useState(0);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [copyToast, setCopyToast] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleShare = async () => {
    const siteUrl = typeof window !== "undefined" ? window.location.href : "";
    const shareData = {
      title: product?.name || "POP Craft & Candle Store",
      text: `Check out ${product?.name || "this craft item"} on POP Craft & Candle Store!`,
      url: siteUrl,
    };

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // User cancelled share
      }
    } else if (typeof navigator !== "undefined" && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(siteUrl);
        setCopyToast(true);
        setTimeout(() => setCopyToast(false), 2500);
      } catch (e) {
        console.warn("Clipboard copy fallback failed", e);
      }
    }
  };

  // Hover Zoom Lens State
  const [isHovered, setIsHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  // Fullscreen Modal Lightbox State
  const [isFullscreenModalOpen, setIsFullscreenModalOpen] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    async function loadProductOrPack() {
      setLoading(true);
      try {
        if (id.startsWith("pack-")) {
          // Fetch Pack directly
          const [packRes, prodsRes] = await Promise.all([
            fetch(`/api/packs/${id}`),
            fetch(`/api/products`),
          ]);
          const packData = await packRes.json();
          const allProds = await prodsRes.json();

          if (packData && packData.id) {
            const included = Array.isArray(allProds)
              ? allProds.filter((p: any) => packData.productIds?.includes(p.id))
              : [];

            const comboImages = [
              ...(packData.image ? [packData.image] : []),
              ...included.map((p: any) => p.image).filter(Boolean),
            ];

            setProduct({
              id: packData.id,
              name: packData.name,
              price: Number(packData.price),
              originalPrice: packData.originalPrice
                ? Number(packData.originalPrice)
                : undefined,
              theme: "Curated Pack Set",
              category: `Pack of ${packData.productIds?.length || 1}`,
              ageGroup: "All Ages",
              isNonToxic: true,
              image:
                comboImages[0] ||
                "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=500",
              images: Array.from(new Set(comboImages)),
              description: packData.description || "",
              inStock: packData.inStock !== false,
              isOrderingEnabled: true,
              isPack: true,
              includedProducts: included,
            });
          }
        } else {
          // Fetch Regular Product
          const res = await fetch(`/api/products/${id}`);
          const data = await res.json();

          if (data && data.id) {
            setProduct(data);
            if (typeof data.likesCount === "number") {
              setLikesCount(data.likesCount);
            }
          } else {
            // Fallback: try fetching as Pack
            const packRes = await fetch(`/api/packs/${id}`);
            const packData = await packRes.json();

            if (packData && packData.id) {
              const prodsRes = await fetch(`/api/products`);
              const allProds = await prodsRes.json();
              const included = Array.isArray(allProds)
                ? allProds.filter((p: any) =>
                    packData.productIds?.includes(p.id),
                  )
                : [];

              const comboImages = [
                ...(packData.image ? [packData.image] : []),
                ...included.map((p: any) => p.image).filter(Boolean),
              ];

              setProduct({
                id: packData.id,
                name: packData.name,
                price: Number(packData.price),
                originalPrice: packData.originalPrice
                  ? Number(packData.originalPrice)
                  : undefined,
                theme: "Curated Pack Set",
                category: `Pack of ${packData.productIds?.length || 1}`,
                ageGroup: "All Ages",
                isNonToxic: true,
                image: comboImages[0] || "",
                images: Array.from(new Set(comboImages)),
                description: packData.description || "",
                inStock: packData.inStock !== false,
                isOrderingEnabled: true,
                isPack: true,
                includedProducts: included,
              });
            }
          }
        }
      } catch (err) {
        console.error("Error loading product/pack data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadProductOrPack();

    fetch(`/api/settings`)
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
      const res = await fetch(`/api/products/${id}/like`, {
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-pulse">
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-4">
            <div className="aspect-square w-full bg-slate-200 rounded-3xl" />
            <div className="flex space-x-3">
              <div className="w-16 h-16 bg-slate-200 rounded-2xl" />
              <div className="w-16 h-16 bg-slate-200 rounded-2xl" />
              <div className="w-16 h-16 bg-slate-200 rounded-2xl" />
            </div>
          </div>
          <div className="space-y-6">
            <div className="h-4 w-32 bg-slate-200 rounded-full" />
            <div className="h-8 w-3/4 bg-slate-200 rounded-xl" />
            <div className="h-10 w-40 bg-slate-200 rounded-xl" />
            <div className="space-y-2 pt-4">
              <div className="h-4 w-full bg-slate-200 rounded-lg" />
              <div className="h-4 w-5/6 bg-slate-200 rounded-lg" />
              <div className="h-4 w-4/6 bg-slate-200 rounded-lg" />
            </div>
            <div className="h-12 w-full bg-slate-200 rounded-2xl mt-6" />
          </div>
        </div>
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
    (product.isOrderingEnabled ?? true) &&
    ((settings?.isGlobalOrderingEnabled ?? true) ||
      (settings?.isWhatsappOrderingEnabled ?? true));
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
                {/* {product.isNonToxic && (
                  <span className="px-3.5 py-1.5 bg-emerald-100/90 text-emerald-800 rounded-full text-xs font-bold shadow-xs flex items-center space-x-1 backdrop-blur-md">
                    <ShieldCheck className="w-4 h-4 inline" />
                    <span>100% Non-Toxic</span>
                  </span>
                )} */}
              </div>

              {/* Top-Right Action Buttons: Share, Wishlist & Expand */}
              <div className="absolute top-4 right-4 flex items-center space-x-2 z-20">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleShare();
                  }}
                  title="Share Product"
                  className="p-2.5 rounded-full bg-white/80 hover:bg-white text-slate-700 shadow-sm backdrop-blur-md transition hover:scale-105 active:scale-95"
                >
                  <Share2 className="w-4 h-4" />
                </button>

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

                <motion.button
                  layout
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLikeToggle();
                  }}
                  title={isLiked ? "Unlike Product" : "Like Product"}
                  className={`h-9 rounded-full backdrop-blur-md transition-all duration-300 shadow-sm flex items-center justify-center active:scale-95 ${
                    likesCount > 0 ? "px-3 space-x-1.5" : "w-9 px-0"
                  } ${
                    isLiked
                      ? "bg-rose-500 text-white"
                      : "bg-white/80 text-slate-700 hover:text-rose-500 hover:bg-white"
                  }`}
                >
                  <Heart className={`w-4 h-4 shrink-0 transition-transform ${isLiked ? "fill-current scale-110" : ""}`} />
                  <AnimatePresence initial={false}>
                    {likesCount > 0 && (
                      <motion.span
                        key="img-like-count"
                        initial={{ opacity: 0, width: 0, scale: 0.8 }}
                        animate={{ opacity: 1, width: "auto", scale: 1 }}
                        exit={{ opacity: 0, width: 0, scale: 0.8 }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                        className="text-xs font-extrabold whitespace-nowrap overflow-hidden inline-block"
                      >
                        {likesCount}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
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
              <div className="flex items-center space-x-3 overflow-x-auto p-1 no-scrollbar">
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
          <div className="flex flex-col justify-between h-full space-y-6">
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <div className="flex items-center space-x-2 text-xs font-bold text-pink-500 uppercase tracking-wider">
                  <Sparkles className="w-4 h-4" />
                  <span>
                    {product.theme} • {product.category}
                  </span>
                </div>
                {(product.isNewLaunch ||
                  Boolean(product.badge?.toLowerCase().includes("new"))) && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black text-slate-900 bg-amber-400 uppercase tracking-wider shadow-xs">
                    ✨ New Launch
                  </span>
                )}
                {(product.isSellingFast ||
                  Boolean(
                    product.badge?.toLowerCase().includes("selling"),
                  )) && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black text-white bg-gradient-to-r from-red-500 to-rose-600 uppercase tracking-wider shadow-xs">
                    🔥 Selling Fast
                  </span>
                )}
              </div>

              <div className="flex items-start justify-between gap-3">
                <h1 className="text-3xl font-extrabold text-slate-800 leading-tight">
                  {product.name}
                </h1>
                <div className="flex items-center space-x-2 shrink-0 mt-1">
                  {/* Public Like Score Pill Button */}
                  <motion.button
                    layout
                    onClick={handleLikeToggle}
                    title={isLiked ? "Unlike product" : "Like this product"}
                    className={`h-9 rounded-full flex items-center justify-center transition-all duration-300 shadow-xs active:scale-95 border ${
                      likesCount > 0 ? "px-3 space-x-1.5" : "w-9 px-0"
                    } ${
                      isLiked
                        ? "bg-rose-50 border-rose-200 text-rose-600"
                        : "bg-slate-50 border-slate-200 text-slate-700 hover:border-rose-200 hover:text-rose-600"
                    }`}
                  >
                    <Heart className={`w-4 h-4 shrink-0 transition-transform ${isLiked ? "fill-rose-500 text-rose-500 scale-110" : "text-rose-500"}`} />
                    <AnimatePresence initial={false}>
                      {likesCount > 0 && (
                        <motion.span
                          key="title-like-count"
                          initial={{ opacity: 0, width: 0, scale: 0.8 }}
                          animate={{ opacity: 1, width: "auto", scale: 1 }}
                          exit={{ opacity: 0, width: 0, scale: 0.8 }}
                          transition={{ duration: 0.25, ease: "easeOut" }}
                          className="text-xs font-extrabold whitespace-nowrap overflow-hidden inline-block"
                        >
                          {likesCount}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.button>

                  {/* Share Button */}
                  <button
                    onClick={handleShare}
                    title="Share Product"
                    className="p-2.5 bg-slate-100 hover:bg-pink-100 hover:text-pink-600 text-slate-600 rounded-full transition active:scale-95 flex items-center justify-center shadow-xs"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

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

              <div className="mt-4">
                <motion.div
                  initial={false}
                  animate={{
                    height:
                      !isDescriptionExpanded && (product.description?.length || 0) > 130
                        ? isMobile
                          ? "7.5rem"
                          : "14.8rem"
                        : "auto",
                  }}
                  transition={{ duration: 0.35, ease: [0.04, 0.62, 0.23, 0.98] }}
                  className="relative overflow-hidden"
                >
                  <div className="text-slate-700 text-sm leading-relaxed font-medium whitespace-pre-line pb-1">
                    {product.description}
                  </div>

                  {/* Soft Fade Overlay when collapsed */}
                  {!isDescriptionExpanded && (product.description?.length || 0) > 130 && (
                    <div className="absolute bottom-0 inset-x-0 h-5 bg-gradient-to-t from-white/80 to-transparent pointer-events-none" />
                  )}
                </motion.div>

                {(product.description?.length || 0) > 130 && (
                  <button
                    onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                    className="mt-2 text-xs font-extrabold text-pink-600 hover:text-pink-700 flex items-center space-x-1 focus:outline-none transition active:scale-95"
                  >
                    <span>{isDescriptionExpanded ? "Show Less ▲" : "Read More... ▼"}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Pinned Bottom Controls Section */}
            <div className="mt-auto space-y-4 pt-2">
              {/* Conditional Specifications (Size & Material) */}
              {(product.size || product.material) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-slate-50/80 border border-slate-100 rounded-2xl">
                  {product.size && (
                    <div>
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                        Dimensions / Size (L x W x H)
                      </span>
                      <span className="text-xs font-extrabold text-slate-800">
                        {product.size}
                      </span>
                    </div>
                  )}
                  {product.material && (
                    <div>
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                        Material Finish
                      </span>
                      <span className="text-xs font-extrabold text-slate-800">
                        {product.material}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Included Items Showcase for Packs */}
              {product.isPack &&
                product.includedProducts &&
                product.includedProducts.length > 0 && (
                  <div className="mt-6 p-5 bg-amber-50/70 border border-amber-200/80 rounded-3xl space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-extrabold text-xs text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                        <Boxes className="w-4 h-4 text-amber-600" />
                        <span>
                          Included Products in this Pack (
                          {product.includedProducts.length})
                        </span>
                      </h4>
                      <span className="text-[10px] font-extrabold text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        Bundled Set
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {product.includedProducts.map((incItem: any) => (
                        <div
                          key={incItem.id}
                          className="bg-white p-2.5 rounded-2xl border border-amber-100/80 flex items-center space-x-2.5 shadow-2xs hover:shadow-xs transition"
                        >
                          <img
                            src={incItem.image}
                            alt={incItem.name}
                            className="w-10 h-10 rounded-xl object-cover border border-slate-100 shrink-0"
                          />
                          <div className="overflow-hidden">
                            <p className="text-xs font-extrabold text-slate-800 leading-tight truncate">
                              {incItem.name}
                            </p>
                            <span className="text-[10px] font-semibold text-slate-400 truncate block mt-0.5">
                              {incItem.category}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              <div className="my-3">
                {(() => {
                  const cartItem = cart.find((i) => i.id === product.id);
                  const inCartQty = cartItem ? cartItem.quantity : 0;
                  const totalCartItems = cart.reduce(
                    (sum, item) => sum + item.quantity,
                    0,
                  );

                  return (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                      {/* Left Action: Quick Stepper Pill Control if in cart, else Add to Basket Button */}
                      {inCartQty > 0 ? (
                        <div className="w-full h-11 bg-pink-500 hover:bg-pink-600 text-white rounded-full flex items-center justify-between px-4 shadow-xs transition">
                          <button
                            onClick={() => {
                              if (inCartQty === 1) {
                                removeFromCart(product.id);
                              } else {
                                updateQuantity(product.id, -1);
                              }
                            }}
                            className="p-1 hover:bg-white/20 rounded-full transition active:scale-90"
                            title="Decrease Quantity"
                          >
                            <Minus className="w-4 h-4 text-white" />
                          </button>
                          <span className="font-bold text-sm tracking-wide text-white">
                            {inCartQty}
                          </span>
                          <button
                            onClick={() => addToCart(product, 1, false)}
                            className="p-1 hover:bg-white/20 rounded-full transition active:scale-90"
                            title="Increase Quantity"
                          >
                            <Plus className="w-4 h-4 text-white" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => addToCart(product, 1, false)}
                          disabled={!isOrderingAllowed}
                          className={`w-full h-11 font-bold text-xs rounded-full flex items-center justify-center space-x-1.5 shadow-xs transition active:scale-98 ${
                            isOrderingAllowed
                              ? "bg-pink-500 hover:bg-pink-600 text-white"
                              : "bg-slate-200 text-slate-400 cursor-not-allowed"
                          }`}
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>
                            {isOrderingAllowed
                              ? `Add to Basket — ₹${product.price.toFixed(2)}`
                              : "Ordering Disabled"}
                          </span>
                        </button>
                      )}

                      {/* Right Action: Always Visible Yellow View Cart Button */}
                      <button
                        onClick={() => setIsCartOpen(true)}
                        className="w-full h-11 bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-full flex items-center justify-center space-x-1.5 shadow-xs transition active:scale-98"
                      >
                        <ShoppingCart className="w-3.5 h-3.5 text-slate-900" />
                        <span>View Basket ({totalCartItems})</span>
                      </button>
                    </div>
                  );
                })()}
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-2 mt-6 pt-6 text-center border-t border-slate-100 text-[11px] font-bold text-slate-600">
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
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col justify-between p-4 sm:p-8 animate-fade-in text-white">
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
            <div className="flex items-center justify-center space-x-3 overflow-x-auto py-2 z-10 max-w-7xl w-full mx-auto no-scrollbar">
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

      {/* Copy Link Toast Notification */}
      {copyToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] px-4 py-2.5 bg-slate-900/90 text-white font-bold text-xs rounded-full shadow-2xl backdrop-blur-md flex items-center space-x-2 animate-bounce">
          <span>Link copied to clipboard! 📋</span>
        </div>
      )}
    </>
  );
}
