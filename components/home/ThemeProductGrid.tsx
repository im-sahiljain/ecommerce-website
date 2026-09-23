"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import OptimisticAddToCart from "../OptimisticAddToCart";
import type { Product } from "./homeTypes";

function ThemeProductCard({ product }: { product: Product }) {
  return (
    <div className="group relative flex h-full w-full flex-col overflow-hidden rounded-2xl border border-white/60 bg-white text-[#3C2A21] shadow-md">
      <Link href={`/product/${product.id}`} className="block min-w-0">
        <div className="relative aspect-[5/6] w-full overflow-hidden bg-[#F7F1EA] sm:aspect-square">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover object-center transition duration-500 group-hover:scale-105"
          />
          <div className="absolute left-1.5 top-1.5 flex max-w-[70%] flex-wrap gap-1">
            {product.ageGroup && product.ageGroup.trim() !== "" && (
              <span className="whitespace-nowrap rounded-full bg-white/95 px-2 py-0.5 text-xs font-bold text-sky-800">
                {product.ageGroup}
              </span>
            )}
            {product.isSellingFast ||
            Boolean(product.badge?.toLowerCase().includes("selling")) ? (
              <span className="whitespace-nowrap rounded-full bg-rose-600 px-2 py-0.5 text-xs font-bold text-white">
                Selling fast
              </span>
            ) : product.isNewLaunch ||
              Boolean(product.badge?.toLowerCase().includes("new")) ? (
              <span className="whitespace-nowrap rounded-full bg-amber-400 px-2 py-0.5 text-xs font-bold text-slate-900">
                New
              </span>
            ) : null}
          </div>
          {(product.likesCount || 0) > 0 && (
            <div className="absolute right-1.5 top-1.5 flex items-center gap-0.5 rounded-full bg-white/95 px-2 py-0.5 text-xs font-bold text-rose-600">
              <Heart className="h-3.5 w-3.5 fill-rose-500 text-rose-500" />
              <span>{product.likesCount}</span>
            </div>
          )}
        </div>
        <div className="px-2.5 pt-2">
          <h3 className="line-clamp-1 text-left text-base font-extrabold leading-tight text-[#3C2A21]">
            {product.name}
          </h3>
          <div className="mt-0.5 flex items-baseline gap-1.5">
            <span className="text-base font-black text-[#3C2A21]">
              ₹{product.price.toFixed(0)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-[11px] font-semibold text-slate-400 line-through">
                ₹{product.originalPrice.toFixed(0)}
              </span>
            )}
          </div>
        </div>
      </Link>
      <div className="px-2.5 pb-2.5 pt-2">
        <OptimisticAddToCart
          product={product}
          variant="dark"
          className="flex min-h-9 w-full items-center justify-center rounded-full bg-[#3C2A21] px-3 py-1.5 text-sm font-bold text-white"
        />
      </div>
    </div>
  );
}

function themeGridColumns(count: number) {
  if (count <= 4) return Math.max(count, 1);
  let best = 2;
  let bestEmpty = count % 2 === 0 ? 0 : 1;
  for (const cols of [3, 4]) {
    const remainder = count % cols;
    const empty = remainder === 0 ? 0 : cols - remainder;
    if (empty < bestEmpty || (empty === bestEmpty && cols > best)) {
      best = cols;
      bestEmpty = empty;
    }
  }
  return best;
}

const TWO_UP = "w-[calc(50%-0.25rem)] sm:w-[calc(50%-0.5rem)]";
const THREE_UP_FROM_SM = "w-[calc(50%-0.25rem)] sm:w-[calc((100%-2rem)/3)]";
const FOUR_UP_FROM_LG =
  "w-[calc(50%-0.25rem)] sm:w-[calc(50%-0.5rem)] lg:w-[calc((100%-3rem)/4)]";

function cardWidthForCount(count: number) {
  if (count <= 1) return "w-full max-w-sm";
  if (count === 2) return TWO_UP;
  if (count === 3) return "w-full sm:w-[calc((100%-2rem)/3)]";
  const columns = themeGridColumns(count);
  if (columns >= 4) return FOUR_UP_FROM_LG;
  if (columns === 3) return THREE_UP_FROM_SM;
  return TWO_UP;
}

export default function ThemeProductGrid({
  themeProducts,
  loading = false,
}: {
  themeProducts: Product[];
  loading?: boolean;
}) {
  const reduceMotion = useReducedMotion();

  if (loading) return null;

  if (themeProducts.length === 0) {
    return (
      <div className="mt-8 text-center text-sm font-medium text-slate-500">
        No items available in this theme yet.
      </div>
    );
  }

  const columns = themeGridColumns(themeProducts.length);
  const cardWidth = cardWidthForCount(themeProducts.length);

  return (
    <ul className="mt-8 flex flex-wrap justify-center gap-2 sm:mt-10 sm:gap-4">
      {themeProducts.map((product, index) => (
        <motion.li
          key={product.id}
          className={`${cardWidth} shrink-0`}
          initial={reduceMotion ? false : { opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{
            duration: 0.45,
            delay: reduceMotion ? 0 : (index % columns) * 0.07,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <ThemeProductCard product={product} />
        </motion.li>
      ))}
    </ul>
  );
}
