"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  Award,
  Boxes,
  ChevronDown,
  ExternalLink,
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
import {
  cartLineId,
  emptyKitSelection,
  kitExtraPerPiece,
  selectionToCustomization,
  type KitSelection,
} from "@/lib/kit";
import KitCustomizer from "./KitCustomizer";
import type { ProductDetail, SiteSettings } from "./types";
import { productPath } from "@/lib/site";

export default function ProductPurchasePanel({
  product,
  settings,
  likesCount,
  isLiked,
  onLike,
  onIncludedFocus,
  focusImageUrl,
}: {
  product: ProductDetail;
  settings: SiteSettings | null;
  likesCount: number;
  isLiked: boolean;
  onLike: () => void;
  onIncludedFocus?: (image: string) => void;
  focusImageUrl?: string | null;
}) {
  const { cart, addToCart, updateQuantity, removeFromCart, setIsCartOpen } =
    useCart();
  const [kitSelection, setKitSelection] =
    useState<KitSelection>(emptyKitSelection());
  const kitExtra = kitExtraPerPiece(product.kitOffer, kitSelection);
  const unitPrice = product.price + kitExtra;
  const lineId = cartLineId(product.id, kitSelection);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [openIncludedId, setOpenIncludedId] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [copyToast, setCopyToast] = useState(false);

  useEffect(() => {
    setKitSelection(emptyKitSelection());
    setOpenIncludedId(null);
    setIsDescriptionExpanded(false);
  }, [product.id]);

  useEffect(() => {
    const pieces = product.includedProducts;
    if (!product.isPack || !pieces?.length || !focusImageUrl) return;
    const match = pieces.find((piece) => piece.image === focusImageUrl);
    if (match) setOpenIncludedId(match.id);
  }, [product.isPack, product.includedProducts, focusImageUrl]);

  useEffect(() => {
    const pieces = product.includedProducts;
    if (!product.isPack || !pieces?.length) return;
    const open = pieces.find((piece) => piece.id === openIncludedId);
    if (open?.image) onIncludedFocus?.(open.image);
  }, [
    product.id,
    product.isPack,
    product.includedProducts,
    openIncludedId,
    onIncludedFocus,
  ]);

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
  const cartItem = cart.find((item) => (item.lineId || item.id) === lineId);

  const addConfigured = (quantity: number) => {
    const customization = selectionToCustomization(
      product.kitOffer,
      kitSelection,
    );
    addToCart(
      {
        id: product.id,
        name: product.name,
        price: unitPrice,
        image: product.image,
        lineId,
        basePrice: product.price,
        customization,
      },
      quantity,
      false,
    );
  };
  const inCartQty = cartItem ? cartItem.quantity : 0;
  const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const descriptionIsLong = (product.description?.length || 0) > 130;

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex flex-col">
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
              className={`cursor-pointer flex h-9 items-center justify-center rounded-full border shadow-2xs transition-all duration-300 active:scale-95 ${
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
              className="cursor-pointer flex items-center justify-center rounded-full bg-neutral-100 p-2.5 text-neutral-600 shadow-2xs transition hover:bg-primary/15 hover:text-primary active:scale-95"
            >
              <Share2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mt-3 flex items-baseline space-x-3">
          <span className="text-3xl font-extrabold text-neutral-900">
            From <span className="text-primary">₹{unitPrice.toFixed(2)}</span>
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
              className="mt-2 flex items-center space-x-1 text-xs font-extrabold text-primary transition  focus:outline-hidden active:scale-95 cursor-pointer border border-primary/20 rounded-full px-2 py-1 hover:bg-primary hover:text-white"
            >
              <span>
                {isDescriptionExpanded ? "Show Less ▲" : "Read More ▼"}
              </span>
            </button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {product.isPack &&
          product.includedProducts &&
          product.includedProducts.length > 0 && (
            <div className="space-y-3 rounded-3xl border border-warning-200/80 bg-warning-50/70 p-3 sm:p-5">
              <h4 className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-warning-900">
                <Boxes className="h-4 w-4 shrink-0 text-warning-600" />
                <span>
                  Included Products in this Kit (
                  {product.includedProducts.length})
                </span>
              </h4>
              <div className="space-y-2">
                {product.includedProducts.map((item) => {
                  const pieces = product.includedProducts ?? [];
                  const openId =
                    openIncludedId === ""
                      ? undefined
                      : pieces.some((piece) => piece.id === openIncludedId)
                        ? openIncludedId
                        : pieces[0]?.id;
                  const isOpen = item.id === openId;
                  return (
                    <div
                      key={item.id}
                      className="relative rounded-2xl border border-warning-100/80 bg-white shadow-2xs"
                    >
                      <button
                        type="button"
                        aria-expanded={isOpen}
                        aria-label={`${isOpen ? "Hide" : "Show"} ${item.name} details`}
                        onClick={() => setOpenIncludedId(isOpen ? "" : item.id)}
                        className="absolute inset-0 rounded-2xl"
                      />
                      <div className="pointer-events-none relative flex items-center gap-2.5 p-3">
                        <img
                          src={item.image}
                          alt=""
                          className="h-10 w-10 shrink-0 rounded-xl border border-neutral-100 object-cover"
                        />
                        <Link
                          href={productPath(item)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="pointer-events-auto inline-flex max-w-[calc(100%-4.5rem)] items-center gap-1.5 text-sm font-extrabold leading-tight text-neutral-800 transition-colors hover:text-primary"
                        >
                          <span className="truncate">{item.name}</span>
                          <ExternalLink
                            className="h-3.5 w-3.5 shrink-0 text-primary sm:hidden"
                            aria-hidden="true"
                          />
                          <span className="sr-only">Opens in a new tab</span>
                        </Link>
                        <ChevronDown
                          className={`ml-auto h-4 w-4 shrink-0 text-neutral-400 transition-transform duration-300 ease-out ${
                            isOpen ? "rotate-180" : ""
                          }`}
                        />
                      </div>
                      {(item.size || item.material) && (
                        <motion.div
                          initial={false}
                          animate={{
                            height: isOpen ? "auto" : 0,
                            opacity: isOpen ? 1 : 0,
                          }}
                          transition={{
                            duration: 0.32,
                            ease: [0.22, 1, 0.36, 1],
                          }}
                          className="pointer-events-none overflow-hidden"
                        >
                          <div className="space-y-2 border-t border-neutral-100 px-3 pb-3 pt-2">
                            {item.size && (
                              <div>
                                <span className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                                  Dimensions / Size (L x W x H)
                                </span>
                                <span className="text-xs font-extrabold leading-snug text-neutral-800">
                                  {item.size}
                                </span>
                              </div>
                            )}
                            {item.material && (
                              <div>
                                <span className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                                  Material Finish
                                </span>
                                <span className="text-xs font-extrabold leading-snug text-neutral-800">
                                  {item.material}
                                </span>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}{" "}
        {product.kitOffer && (
          <KitCustomizer
            offer={product.kitOffer}
            selection={kitSelection}
            onChange={setKitSelection}
          />
        )}
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
        <div className="my-3 grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
          {inCartQty > 0 ? (
            <div className="flex h-11 w-full items-center justify-between rounded-full bg-primary px-4 text-white shadow-2xs transition hover:bg-primary/90">
              <button
                onClick={() => {
                  if (inCartQty === 1) removeFromCart(lineId);
                  else updateQuantity(lineId, -1);
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
                onClick={() => addConfigured(1)}
                className="rounded-full p-1 transition hover:bg-white/20 active:scale-90"
                title="Increase Quantity"
              >
                <Plus className="h-4 w-4 text-white" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => addConfigured(1)}
              disabled={!isOrderingAllowed}
              className={`flex h-11 w-full items-center justify-center space-x-1.5 rounded-full text-xs font-bold shadow-2xs transition active:scale-98 cursor-pointer ${
                isOrderingAllowed
                  ? "bg-primary text-white hover:bg-primary/90"
                  : "cursor-not-allowed bg-neutral-200 text-neutral-400"
              }`}
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              <span>
                {isOrderingAllowed
                  ? `Add to Basket — ₹${unitPrice.toFixed(2)}`
                  : "Ordering Disabled"}
              </span>
            </button>
          )}
          <button
            onClick={() => setIsCartOpen(true)}
            className="flex h-11 w-full items-center justify-center space-x-1.5 rounded-full bg-warning-400 text-xs font-bold text-neutral-950 shadow-2xs transition hover:bg-warning-500 active:scale-98 cursor-pointer"
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
