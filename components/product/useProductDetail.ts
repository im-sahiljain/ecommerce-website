"use client";

import { useEffect, useRef, useState } from "react";
import {
  packToProduct,
  type ProductDetail,
  type SiteSettings,
} from "./types";

export function useProductDetail(id: string, initialProduct?: ProductDetail | null) {
  const [product, setProduct] = useState<ProductDetail | null>(initialProduct ?? null);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(!initialProduct);
  const [likesCount, setLikesCount] = useState(initialProduct?.likesCount ?? 0);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    let cancelled = false;
    setIsLiked(isProductLiked(initialProduct?.id || id));

    async function load() {
      if (initialProduct) return;
      setLoading(true);
      setProduct(null);
      setLikesCount(0);
      try {
        const isPackId = id.startsWith("pack-");
        const mainRes = await fetch(isPackId ? `/api/packs/${id}` : `/api/products/${id}`);
        const data = await mainRes.json();

        if (!cancelled && isPackId && data?.id) {
          const catalogItems = await loadCatalog();
          if (cancelled) return;
          const included = catalogItems.filter((item) => data.productIds?.includes(item.id));
          setProduct(packToProduct(data, included));
          return;
        }

        if (!cancelled && data?.id) {
          setProduct(data);
          if (typeof data.likesCount === "number") setLikesCount(data.likesCount);
          return;
        }

        const packRes = await fetch(`/api/packs/${id}`);
        const pack = await packRes.json();
        if (!cancelled && pack?.id) {
          const catalogItems = await loadCatalog();
          if (cancelled) return;
          const included = catalogItems.filter((item) => pack.productIds?.includes(item.id));
          setProduct(packToProduct(pack, included));
        }
      } catch (err) {
        console.error("Error loading product/pack data:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && data) setSettings(data);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [id, initialProduct]);

  const likeLock = useRef(false);

  const toggleLike = async () => {
    if (likeLock.current) return;
    likeLock.current = true;
    const nextLiked = !isLiked;
    try {
      const likeId = product?.id || id;
      const res = await fetch(`/api/products/${likeId}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: nextLiked }),
      });
      if (!res.ok) return;
      const data = await res.json();
      setLikesCount(data.likes);
      setIsLiked(Boolean(data.isLiked));
      setProductLiked(likeId, Boolean(data.isLiked));
    } catch (err) {
      console.warn("Like toggle failed:", err);
    } finally {
      likeLock.current = false;
    }
  };

  return { product, settings, loading, likesCount, isLiked, toggleLike };
}

const LIKED_PRODUCTS_KEY = "kc-liked-products";

function readLikedProducts() {
  try {
    const raw = localStorage.getItem(LIKED_PRODUCTS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string") : [];
  } catch {
    return [];
  }
}

function isProductLiked(productId: string) {
  return readLikedProducts().includes(productId);
}

function setProductLiked(productId: string, liked: boolean) {
  const ids = readLikedProducts().filter((item) => item !== productId);
  if (liked) ids.push(productId);
  localStorage.setItem(LIKED_PRODUCTS_KEY, JSON.stringify(ids));
}

async function loadCatalog() {
  const response = await fetch("/api/products");
  const data = await response.json();
  return Array.isArray(data) ? (data as ProductDetail[]) : [];
}
