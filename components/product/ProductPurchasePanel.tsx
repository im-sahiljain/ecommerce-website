"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Award,
  Boxes,
  Heart,
  Minus,
  Plus,
  RotateCcw,
  Share2,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Truck,
} from "lucide-react";
import { useCart } from "../../context/CartContext";
import type { ProductDetail, SiteSettings } from "./types";

export default function ProductPurchasePanel({
  product,
  settings,
  likesCount,
  isLiked,
  onLike,
}: {
  product: ProductDetail;
  settings: SiteSettings | null;
  likesCount: number;
  isLiked: boolean;
  onLike: () => void;
}) {
  const { cart, addToCart, updateQuantity, removeFromCart, setIsCartOpen } =
    useCart();
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [copyToast, setCopyToast] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleShare = async () => {
    const shareData = {
      title: product.name || "Kits & Craft",
      text: `Check out ${product.name || "this craft item"} on Kits & Craft!`,
      url: window.location.href,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // User cancelled share
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopyToast(true);
      window.setTimeout(() => setCopyToast(false), 2500);
    } catch (err) {
      console.warn("Clipboard copy fallback failed", err);
    }
  };

  const isOrderingAllowed =
    (product.isOrderingEnabled ?? true) &&
    ((settings?.isGlobalOrderingEnabled ?? true) ||
      (settings?.isWhatsappOrderingEnabled ?? true));
  const cartItem = cart.find((item) => item.id === product.id);
  const inCartQty = cartItem ? cartItem.quantity : 0;
  const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const descriptionIsLong = (product.description?.length || 0) > 130;

  return (
    <div className="flex h-full flex-col justify-between space-y-6">
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-primary">
            <Sparkles className="h-4 w-4" />
            <span>
              {product.theme} • {product.category}
            </span>
          </div>
          {(product.isNewLaunch ||
            Boolean(product.badge?.toLowerCase().includes("new"))) && (
            <span className="rounded-full bg-warning-400 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-neutral-900 shadow-2xs">
              🎀 New Launch
            </span>
          )}
          {(product.isSellingFast ||
            Boolean(product.badge?.toLowerCase().includes("selling"))) && (
            <span className="rounded-full bg-linear-to-r from-red-500 to-danger-600 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-white shadow-2xs">
              🔥 Selling Fast
            </span>
          )}
        </div>

        <div className="flex items-start justify-between gap-3">
          <h1 className="text-3xl font-extrabold leading-tight text-neutral-800">
            {product.name}
          </h1>
          <div className="mt-1 flex shrink-0 items-center space-x-2">
            <motion.button
              layout
              onClick={onLike}
              title={isLiked ? "Unlike product" : "Like this product"}
              className={`flex h-9 items-center justify-center rounded-full border shadow-2xs transition-all duration-300 active:scale-95 ${
                likesCount > 0 ? "space-x-1.5 px-3" : "w-9 px-0"
              } ${
                isLiked
                  ? "border-danger-200 bg-danger-50 text-danger-600"
                  : "border-neutral-200 bg-neutral-50 text-neutral-700 hover:border-danger-200 hover:text-danger-600"
              }`}
            >
              <Heart
                className={`h-4 w-4 shrink-0 transition-transform ${
                  isLiked
                    ? "scale-110 fill-danger-500 text-danger-500"
                    : "text-danger-500"
                }`}
              />
              <AnimatePresence initial={false}>
                {likesCount > 0 && (
                  <motion.span
                    key="title-like-count"
                    initial={{ opacity: 0, width: 0, scale: 0.8 }}
                    animate={{ opacity: 1, width: "auto", scale: 1 }}
                    exit={{ opacity: 0, width: 0, scale: 0.8 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="inline-block overflow-hidden whitespace-nowrap text-xs font-extrabold"
                  >
                    {likesCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
            <button
              onClick={handleShare}
              title="Share Product"
              className="flex items-center justify-center rounded-full bg-neutral-100 p-2.5 text-neutral-600 shadow-2xs transition hover:bg-primary/15 hover:text-primary active:scale-95"
            >
              <Share2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mt-3 flex items-baseline space-x-3">
          <span className="text-3xl font-extrabold text-neutral-900">
            ₹{product.price.toFixed(2)}
          </span>
          {product.originalPrice && (
            <span className="text-lg font-medium text-neutral-400 line-through">
              ₹{product.originalPrice.toFixed(2)}
            </span>
          )}
        </div>
        {product.gallery?.note && (
          <p className="mt-2 text-xs font-semibold leading-relaxed text-primary">
            {product.gallery.note}
          </p>
        )}

        <div className="mt-4">
          <motion.div
            initial={false}
            animate={{
              height:
                !isDescriptionExpanded && descriptionIsLong
                  ? isMobile
                    ? "7.5rem"
                    : "14.8rem"
                  : "auto",
            }}
            transition={{ duration: 0.35, ease: [0.04, 0.62, 0.23, 0.98] }}
            className="relative overflow-hidden"
          >
            <div className="whitespace-pre-line pb-1 text-sm font-medium leading-relaxed text-neutral-700">
              {product.description}
            </div>
            {!isDescriptionExpanded && descriptionIsLong && (
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-5 bg-linear-to-t from-white/80 to-transparent" />
            )}
          </motion.div>
          {descriptionIsLong && (
            <button
              onClick={() => setIsDescriptionExpanded((open) => !open)}
              className="mt-2 flex items-center space-x-1 text-xs font-extrabold text-primary transition hover:text-primary focus:outline-hidden active:scale-95"
            >
              <span>
                {isDescriptionExpanded ? "Show Less ▲" : "Read More... ▼"}
              </span>
            </button>
          )}
        </div>
      </div>

      <div className="mt-auto space-y-4 pt-2">
        {(product.size || product.material) && (
          <div className="grid grid-cols-1 gap-3 rounded-2xl border border-neutral-100 bg-neutral-50/80 p-4 sm:grid-cols-2">
            {product.size && (
              <div>
                <span className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                  Dimensions / Size (L x W x H)
                </span>
                <span className="text-xs font-extrabold text-neutral-800">
                  {product.size}
                </span>
              </div>
            )}
            {product.material && (
              <div>
                <span className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                  Material Finish
                </span>
                <span className="text-xs font-extrabold text-neutral-800">
                  {product.material}
                </span>
              </div>
            )}
          </div>
        )}

        {product.isPack &&
          product.includedProducts &&
          product.includedProducts.length > 0 && (
            <div className="mt-6 space-y-3 rounded-3xl border border-warning-200/80 bg-warning-50/70 p-5">
              <div className="flex items-center justify-between">
                <h4 className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-warning-900">
                  <Boxes className="h-4 w-4 text-warning-600" />
                  <span>
                    Included Products in this Pack (
                    {product.includedProducts.length})
                  </span>
                </h4>
                <span className="rounded-full bg-warning-100 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-warning-700">
                  Bundled Set
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {product.includedProducts.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center space-x-2.5 rounded-2xl border border-warning-100/80 bg-white p-2.5 shadow-2xs transition hover:shadow-2xs"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-10 w-10 shrink-0 rounded-xl border border-neutral-100 object-cover"
                    />
                    <div className="overflow-hidden">
                      <p className="truncate text-xs font-extrabold leading-tight text-neutral-800">
                        {item.name}
                      </p>
                      <span className="mt-0.5 block truncate text-[10px] font-semibold text-neutral-400">
                        {item.category}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        <div className="my-3 grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
          {inCartQty > 0 ? (
            <div className="flex h-11 w-full items-center justify-between rounded-full bg-primary px-4 text-white shadow-2xs transition hover:bg-primary/90">
              <button
                onClick={() => {
                  if (inCartQty === 1) removeFromCart(product.id);
                  else updateQuantity(product.id, -1);
                }}
                className="rounded-full p-1 transition hover:bg-white/20 active:scale-90"
                title="Decrease Quantity"
              >
                <Minus className="h-4 w-4 text-white" />
              </button>
              <span className="text-sm font-bold tracking-wide text-white">
                {inCartQty}
              </span>
              <button
                onClick={() => addToCart(product, 1, false)}
                className="rounded-full p-1 transition hover:bg-white/20 active:scale-90"
                title="Increase Quantity"
              >
                <Plus className="h-4 w-4 text-white" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => addToCart(product, 1, false)}
              disabled={!isOrderingAllowed}
              className={`flex h-11 w-full items-center justify-center space-x-1.5 rounded-full text-xs font-bold shadow-2xs transition active:scale-98 ${
                isOrderingAllowed
                  ? "bg-primary text-white hover:bg-primary/90"
                  : "cursor-not-allowed bg-neutral-200 text-neutral-400"
              }`}
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              <span>
                {isOrderingAllowed
                  ? `Add to Basket — ₹${product.price.toFixed(2)}`
                  : "Ordering Disabled"}
              </span>
            </button>
          )}
          <button
            onClick={() => setIsCartOpen(true)}
            className="flex h-11 w-full items-center justify-center space-x-1.5 rounded-full bg-warning-400 text-xs font-bold text-neutral-950 shadow-2xs transition hover:bg-warning-500 active:scale-98"
          >
            <ShoppingCart className="h-3.5 w-3.5 text-neutral-900" />
            <span>View Basket ({totalCartItems})</span>
          </button>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-2 border-t border-neutral-100 pt-6 text-center text-[11px] font-bold text-neutral-600">
          <div className="flex flex-col items-center justify-center rounded-2xl bg-neutral-50 p-2">
            <Truck className="mb-1 h-4 w-4 text-info-500" />
            <span>Fast Shipping</span>
          </div>
          <div className="flex flex-col items-center justify-center rounded-2xl bg-neutral-50 p-2">
            <Award className="mb-1 h-4 w-4 text-yellow-500" />
            <span>Safe Materials</span>
          </div>
          <div className="flex flex-col items-center justify-center rounded-2xl bg-neutral-50 p-2">
            <RotateCcw className="mb-1 h-4 w-4 text-success-500" />
            <span>Easy Returns</span>
          </div>
        </div>
      </div>

      {copyToast && (
        <div className="fixed bottom-6 left-1/2 z-100 flex -translate-x-1/2 animate-bounce items-center space-x-2 rounded-full bg-neutral-900/90 px-4 py-2.5 text-xs font-bold text-white shadow-2xl backdrop-blur-md">
          <span>Link copied to clipboard! 📋</span>
        </div>
      )}
    </div>
  );
}
