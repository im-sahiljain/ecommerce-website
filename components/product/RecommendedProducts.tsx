"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import OptimisticAddToCart from "../OptimisticAddToCart";
import CatalogImage from "../CatalogImage";
import type { ProductDetail } from "./types";
import { productPath } from "@/lib/site";

const PAGE_SIZE = 8;

function RecommendedSkeleton() {
  return (
    <div
      className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4"
      aria-hidden="true"
    >
      {Array.from({ length: PAGE_SIZE }, (_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-xs"
        >
          <div className="aspect-square animate-pulse bg-neutral-100" />
          <div className="space-y-2 p-3">
            <div className="h-3 w-1/3 animate-pulse rounded-full bg-neutral-100" />
            <div className="h-4 w-3/4 animate-pulse rounded-full bg-neutral-100" />
            <div className="h-4 w-1/4 animate-pulse rounded-full bg-neutral-100" />
            <div className="mt-3 h-9 w-full animate-pulse rounded-full bg-neutral-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

function ProductBadges({ item }: { item: ProductDetail }) {
  const sellingFast =
    item.isSellingFast ||
    Boolean(item.badge?.toLowerCase().includes("selling"));
  const isNew =
    item.isNewLaunch || Boolean(item.badge?.toLowerCase().includes("new"));
  const likes = item.likesCount || 0;

  return (
    <>
      <div className="absolute left-1.5 top-1.5 flex max-w-[70%] flex-wrap gap-1">
        {item.isPack ? (
          <span className="whitespace-nowrap rounded-full bg-warning-500 px-2 py-0.5 text-[10px] font-bold text-white">
            {item.category || "Pack"}
          </span>
        ) : item.ageGroup?.trim() ? (
          <span className="whitespace-nowrap rounded-full bg-white/95 px-2 py-0.5 text-[10px] font-bold text-info-800">
            {item.ageGroup}
          </span>
        ) : null}
        {sellingFast ? (
          <span className="whitespace-nowrap rounded-full bg-danger-600 px-2 py-0.5 text-[10px] font-bold text-white">
            🔥 Selling Fast
          </span>
        ) : isNew ? (
          <span className="whitespace-nowrap rounded-full bg-warning-400 px-2 py-0.5 text-[10px] font-bold text-neutral-900">
            🎀 New Launch
          </span>
        ) : null}
      </div>
      {likes > 0 && (
        <div className="absolute right-1.5 top-1.5 flex items-center gap-0.5 rounded-full bg-white/95 px-2 py-0.5 text-[10px] font-bold text-danger-600">
          <Heart className="h-3 w-3 fill-danger-500 text-danger-500" />
          <span>{likes}</span>
        </div>
      )}
    </>
  );
}

export default function RecommendedProducts({
  product,
}: {
  product: ProductDetail;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const moreRef = useRef<HTMLDivElement>(null);
  const [catalog, setCatalog] = useState<ProductDetail[] | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => {
    setCatalog(null);
    setVisibleCount(PAGE_SIZE);
    const node = sectionRef.current;
    if (!node) return;
    let cancelled = false;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        fetch("/api/products")
          .then((response) => response.json())
          .then((data) => {
            if (!cancelled) setCatalog(Array.isArray(data) ? data : []);
          })
          .catch(() => {
            if (!cancelled) setCatalog([]);
          });
      },
      { rootMargin: "480px" },
    );
    observer.observe(node);
    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [product.id]);

  const recommended =
    catalog?.filter(
      (item) => item.id !== product.id && item.isVisible !== false,
    ) ?? [];
  const shown = recommended.slice(0, visibleCount);
  const hasMore = shown.length < recommended.length;

  useEffect(() => {
    const node = moreRef.current;
    if (!node || !hasMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisibleCount((count) => count + PAGE_SIZE);
        }
      },
      { rootMargin: "240px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, shown.length]);

  if (catalog && recommended.length === 0) return null;

  return (
    <section ref={sectionRef} className="mt-10 sm:mt-14">
      <h2 className="text-xl font-extrabold text-neutral-800 sm:text-2xl">
        Recommended products
      </h2>
      {catalog === null ? (
        <RecommendedSkeleton />
      ) : shown.length === 0 ? null : (
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
          {shown.map((item) => (
            <article
              key={item.id}
              className="flex h-full flex-col overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-xs"
            >
              <Link href={productPath(item)} className="group flex flex-col">
                <div className="relative aspect-square overflow-hidden bg-neutral-50">
                  <CatalogImage
                    src={item.image}
                    name={item.name}
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="transition duration-500 group-hover:scale-105"
                  />
                  <ProductBadges item={item} />
                </div>
                <div className="space-y-1 p-3 pb-2">
                  {item.theme && item.theme !== "General" && (
                    <p className="text-[10px] font-bold uppercase tracking-wider text-primary">
                      {item.theme}
                    </p>
                  )}
                  <h3 className="line-clamp-2 text-sm font-bold text-neutral-800 group-hover:text-primary">
                    {item.name}
                  </h3>
                </div>
              </Link>
              <div className="mt-auto space-y-2 px-3 pb-3">
                <p className="text-sm font-extrabold text-neutral-700">
                  ₹{Number(item.price).toFixed(2)}
                </p>
                <OptimisticAddToCart
                  product={{
                    id: item.id,
                    name: item.name,
                    price: Number(item.price),
                    image: item.image,
                    inStock: item.inStock,
                  }}
                />
              </div>
            </article>
          ))}
        </div>
      )}
      {hasMore && <div ref={moreRef} className="h-8" aria-hidden="true" />}
    </section>
  );
}
