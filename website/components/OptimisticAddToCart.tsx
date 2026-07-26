"use client";

import { useOptimistic, useTransition } from "react";
import { useCart } from "../context/CartContext";
import { addToCartAction } from "../app/actions/cartActions";

interface ProductItem {
  id: string;
  name: string;
  price: number;
  image: string;
  inStock?: boolean;
}

interface OptimisticAddToCartProps {
  product: ProductItem;
  className?: string;
}

export default function OptimisticAddToCart({
  product,
  className,
}: OptimisticAddToCartProps) {
  const { addToCart } = useCart();
  const [isPending, startTransition] = useTransition();

  const [optimisticState, setOptimisticState] = useOptimistic(
    { isAdding: false, successMessage: false },
    (state, isAdding: boolean) => ({
      ...state,
      isAdding,
      successMessage: isAdding,
    }),
  );

  const handleAddToCart = () => {
    // Immediate client context state update
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
    });

    startTransition(async () => {
      // 1. Instant optimistic UI state update
      setOptimisticState(true);

      // 2. Perform background Server Action with keep-alive socket reuse
      await addToCartAction(product.id, 1);
    });
  };

  return (
    <button
      onClick={handleAddToCart}
      disabled={product.inStock === false || isPending}
      className={
        className ||
        "w-full py-3 px-4 bg-amber-500 hover:bg-amber-600 disabled:bg-gray-300 text-white font-semibold rounded-xl shadow transition flex items-center justify-center gap-2"
      }
    >
      {optimisticState.isAdding ? (
        <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
      ) : null}
      <span>
        {product.inStock === false
          ? "Out of Stock"
          : optimisticState.isAdding
            ? "Added!"
            : "Add to Cart"}
      </span>
    </button>
  );
}
