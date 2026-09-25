"use client";

import { useState } from "react";
import ProductDetailSkeleton from "./ProductDetailSkeleton";
import ProductGallery from "./ProductGallery";
import ProductPurchasePanel from "./ProductPurchasePanel";
import RecommendedProducts from "./RecommendedProducts";
import type { ProductDetail } from "./types";
import { useProductDetail } from "./useProductDetail";

export default function ProductDetailView({
  id,
  initialProduct,
}: {
  id: string;
  initialProduct: ProductDetail | null;
}) {
  const { product, settings, loading, likesCount, isLiked, toggleLike } =
    useProductDetail(id, initialProduct);
  const [focusImageUrl, setFocusImageUrl] = useState<string | null>(
    initialProduct?.includedProducts?.[0]?.image ?? null,
  );

  if (loading) return <ProductDetailSkeleton />;

  if (!product) {
    return (
      <div className="mx-auto my-16 max-w-md rounded-3xl border border-neutral-100 bg-white p-8 text-center shadow-xs">
        <h3 className="text-lg font-bold text-neutral-800">
          Product Not Found
        </h3>
        <p className="mt-2 text-xs text-neutral-500">
          The product set you are looking for does not exist or was moved.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
      <div className="relative grid grid-cols-1 gap-10 sm:[box-shadow:0px_10px_30px_rgba(30,41,59,0.05)] sm:rounded-3xl sm:border sm:border-neutral-100 sm:bg-white sm:p-10 md:grid-cols-2">
        <ProductGallery
          product={product}
          likesCount={likesCount}
          isLiked={isLiked}
          onLike={toggleLike}
          focusImageUrl={focusImageUrl}
          onImageChange={setFocusImageUrl}
        />
        <ProductPurchasePanel
          product={product}
          settings={settings}
          likesCount={likesCount}
          isLiked={isLiked}
          onLike={toggleLike}
          focusImageUrl={focusImageUrl}
          onIncludedFocus={setFocusImageUrl}
        />
      </div>
      <RecommendedProducts product={product} />
    </div>
  );
}
