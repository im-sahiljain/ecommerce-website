"use client";

import { useTransition } from "react";
import { useCart } from "../context/CartContext";
import { addToCartAction } from "../app/actions/cartActions";
import { Plus, Minus } from "lucide-react";

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
  variant?: "pink" | "dark";
}

export default function OptimisticAddToCart({
  product,
  className,
  variant = "pink",
}: OptimisticAddToCartProps) {
  const { cart, addToCart, updateQuantity } = useCart();
  const [isPending, startTransition] = useTransition();

  const cartItem = cart.find((item) => item.id === product.id);
  const quantity = cartItem ? cartItem.quantity : 0;

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    addToCart(
      {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
      },
      1,
      false
    );
    startTransition(async () => {
      await addToCartAction(product.id, 1);
    });
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    updateQuantity(product.id, 1);
    startTransition(async () => {
      await addToCartAction(product.id, 1);
    });
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    updateQuantity(product.id, -1);
  };

  if (product.inStock === false) {
    return (
      <button
        disabled
        className="w-full py-2.5 px-4 bg-gray-200 text-gray-500 font-bold text-xs rounded-full cursor-not-allowed text-center"
      >
        Out of Stock
      </button>
    );
  }

  const isPink = variant === "pink";

  if (quantity > 0) {
    return (
      <div
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
        }}
        className={
          isPink
            ? "w-full py-2 px-3 bg-pink-100 text-slate-800 border border-pink-200 font-extrabold text-xs rounded-full flex items-center justify-between shadow-xs"
            : "w-full py-2 px-3 bg-[#3C2A21] text-white font-bold text-xs rounded-full flex items-center justify-between shadow-xs"
        }
      >
        <button
          type="button"
          onClick={handleDecrement}
          className={
            isPink
              ? "p-1 hover:bg-pink-200 rounded-full transition cursor-pointer flex items-center justify-center text-slate-800"
              : "p-1 hover:bg-white/20 rounded-full transition cursor-pointer flex items-center justify-center text-white"
          }
          aria-label="Decrease quantity"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <span className="font-extrabold text-sm px-2">{quantity}</span>
        <button
          type="button"
          onClick={handleIncrement}
          className={
            isPink
              ? "p-1 hover:bg-pink-200 rounded-full transition cursor-pointer flex items-center justify-center text-slate-800"
              : "p-1 hover:bg-white/20 rounded-full transition cursor-pointer flex items-center justify-center text-white"
          }
          aria-label="Increase quantity"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={handleAdd}
      disabled={isPending}
      className={
        className ||
        (isPink
          ? "w-full py-2.5 px-4 bg-pink-100 hover:bg-pink-200 text-slate-800 font-bold rounded-full text-xs transition active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
          : "w-full py-2.5 px-4 bg-[#3C2A21] hover:bg-[#251A14] text-white font-extrabold text-xs rounded-full shadow transition flex items-center justify-center gap-1.5 cursor-pointer")
      }
    >
      <span>Add to Cart</span>
    </button>
  );
}
