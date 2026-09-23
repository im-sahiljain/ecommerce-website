"use client";

import { useEffect, useState } from "react";
import {
  packToProduct,
  type ProductDetail,
  type SiteSettings,
} from "./types";

export function useProductDetail(id: string) {
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [catalog, setCatalog] = useState<ProductDetail[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [likesCount, setLikesCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    let cancelled = false;

    async function load() {
      setLoading(true);
      setProduct(null);
      setLikesCount(0);
      setIsLiked(false);
      try {
        const isPackId = id.startsWith("pack-");
        const [productsRes, mainRes] = await Promise.all([
          fetch("/api/products"),
          fetch(isPackId ? `/api/packs/${id}` : `/api/products/${id}`),
        ]);
        const allProducts = await productsRes.json();
        const catalogItems: ProductDetail[] = Array.isArray(allProducts) ? allProducts : [];
        if (!cancelled) setCatalog(catalogItems);
        const data = await mainRes.json();

        if (!cancelled && isPackId && data?.id) {
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
  }, [id]);

  const toggleLike = async () => {
    try {
      const res = await fetch(`/api/products/${id}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userIdentifier: "guest" }),
      });
      if (!res.ok) return;
      const data = await res.json();
      setLikesCount(data.likes);
      setIsLiked(data.isLiked);
    } catch (err) {
      console.warn("Like toggle failed:", err);
    }
  };

  return { product, catalog, settings, loading, likesCount, isLiked, toggleLike };
}
