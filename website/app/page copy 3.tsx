"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useCart } from "../context/CartContext";
import {
  Sparkles,
  Brain,
  Smile,
  Plane,
  Rocket,
  Flower2,
  Castle,
  Footprints,
  ShieldCheck,
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  price: number;
  theme: string;
  category: string;
  ageGroup: string;
  isNonToxic: boolean;
  image: string;
  description: string;
}

export default function HomePage() {
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/products")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setProducts(data);
      })
      .catch((err) => console.error("Failed to fetch products:", err));
  }, []);

  const getThemeProducts = (themeName: string) => {
    return products
      .filter((p) => p.theme.toLowerCase().includes(themeName.toLowerCase()))
      .slice(0, 2);
  };

  return (
    <div className="space-y-16 pb-12">
      {/* HERO SECTION matching attached image */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-100 soft-shadow flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl space-y-6">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-800 tracking-tight leading-tight">
              Paint Your World <br />
              <span className="text-pink-500">with Little Creators!</span>
            </h1>
            <p className="text-slate-600 text-base sm:text-lg leading-relaxed font-medium">
              Complete ready-to-paint plaster craft kits designed for curious
              young minds.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                href="/shop"
                className="px-8 py-3.5 bg-pink-200 hover:bg-pink-300 text-slate-800 font-bold rounded-full transition transform active:scale-95 shadow-xs"
              >
                Shop Painting Kits
              </Link>
              <Link
                href="/shop"
                className="px-8 py-3.5 bg-sky-100 hover:bg-sky-200 text-slate-800 font-bold rounded-full transition transform active:scale-95 shadow-xs"
              >
                Explore Themes
              </Link>
            </div>
          </div>

          {/* Hero Banner Image */}
          <div className="w-full md:w-1/2 relative rounded-3xl overflow-hidden shadow-lg border-4 border-white">
            <img
              src="https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&auto=format&fit=crop&q=80"
              alt="Little Creators painting crafts"
              className="w-full h-80 object-cover transform hover:scale-105 transition duration-500"
            />
            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full text-xs font-bold text-slate-800 shadow">
              🎨 100% Non-Toxic Acrylics
            </div>
          </div>
        </div>
      </section>

      {/* WHY LITTLE CREATORS? SECTION matching attached image */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 mb-8">
          Why Little Creators?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 soft-shadow soft-shadow-hover transition text-center space-y-3">
            <div className="w-14 h-14 bg-pink-100 text-pink-500 rounded-2xl flex items-center justify-center mx-auto">
              <Brain className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-lg text-slate-800">
              Cognitive Growth
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Boosts creativity, focus, and fine motor skills through art.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 soft-shadow soft-shadow-hover transition text-center space-y-3">
            <div className="w-14 h-14 bg-sky-100 text-sky-500 rounded-2xl flex items-center justify-center mx-auto">
              <Smile className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-lg text-slate-800">
              Screen-Free Fun
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Engaging, hands-on activity that keeps kids entertained.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 soft-shadow soft-shadow-hover transition text-center space-y-3">
            <div className="w-14 h-14 bg-yellow-100 text-yellow-600 rounded-2xl flex items-center justify-center mx-auto">
              <Plane className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-lg text-slate-800">
              Travel-Friendly Hobby
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Portable kits perfect for vacations or quiet time anywhere.
            </p>
          </div>
        </div>
      </section>

      {/* SPACE ADVENTURES THEME SECTION matching attached image */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-b from-sky-50/70 to-purple-50/50 rounded-3xl p-8 sm:p-12 border border-sky-100 relative overflow-hidden">
          <div className="flex items-center space-x-3 mb-8">
            <Rocket className="w-7 h-7 text-sky-500" />
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800">
              Space Adventures
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {(getThemeProducts("Space").length > 0
              ? getThemeProducts("Space")
              : defaultProducts.space
            ).map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={() => addToCart(product)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* SECRET GARDEN (FLORAL) THEME SECTION matching attached image */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-b from-emerald-50/60 to-pink-50/50 rounded-3xl p-8 sm:p-12 border border-emerald-100 relative overflow-hidden">
          <div className="flex items-center space-x-3 mb-8">
            <Flower2 className="w-7 h-7 text-pink-500" />
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800">
              Secret Garden (Floral)
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {(getThemeProducts("Garden").length > 0
              ? getThemeProducts("Garden")
              : defaultProducts.garden
            ).map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={() => addToCart(product)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* FAIRYTALE MAGIC THEME SECTION matching attached image */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-b from-pink-50/80 to-purple-50/60 rounded-3xl p-8 sm:p-12 border border-pink-100 relative overflow-hidden">
          <div className="flex items-center space-x-3 mb-8">
            <Castle className="w-7 h-7 text-purple-500" />
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800">
              Fairytale Magic
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {(getThemeProducts("Fairytale").length > 0
              ? getThemeProducts("Fairytale")
              : defaultProducts.fairytale
            ).map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={() => addToCart(product)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* WILD KINGDOM THEME SECTION matching attached image */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-b from-amber-50/70 to-orange-50/40 rounded-3xl p-8 sm:p-12 border border-amber-100 relative overflow-hidden">
          <div className="flex items-center space-x-3 mb-8">
            <Footprints className="w-7 h-7 text-amber-600" />
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800">
              Wild Kingdom
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {(getThemeProducts("Wild").length > 0
              ? getThemeProducts("Wild")
              : defaultProducts.wild
            ).map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={() => addToCart(product)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* EXPLORE ALL THEMES CTA matching attached image */}
      <div className="text-center pt-4">
        <Link
          href="/shop"
          className="inline-block px-10 py-4 bg-sky-100 hover:bg-sky-200 text-slate-800 font-extrabold rounded-full text-lg shadow-sm hover:shadow transition transform active:scale-95"
        >
          Explore All Themes
        </Link>
      </div>
    </div>
  );
}

function ProductCard({
  product,
  onAddToCart,
}: {
  product: Product;
  onAddToCart: () => void;
}) {
  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-4 soft-shadow soft-shadow-hover transition flex flex-col justify-between h-full">
      <div>
        <div className="relative rounded-2xl overflow-hidden mb-3 aspect-square bg-slate-50">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2 left-2 flex flex-col space-y-1">
            <span className="px-2.5 py-1 bg-sky-100 text-sky-800 rounded-full text-[10px] font-bold shadow-xs">
              {product.ageGroup || "Ages 4+"}
            </span>
            {product.isNonToxic && (
              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-bold shadow-xs flex items-center space-x-1">
                <ShieldCheck className="w-3 h-3 inline" />
                <span>Non-Toxic</span>
              </span>
            )}
          </div>
        </div>

        <Link
          href={`/product/${product.id}`}
          className="hover:text-pink-500 transition"
        >
          <h4 className="font-bold text-sm text-slate-800 line-clamp-1">
            {product.name}
          </h4>
        </Link>
        <p className="text-slate-500 font-extrabold text-sm mt-1">
          ${product.price.toFixed(2)}
        </p>
      </div>

      <button
        onClick={onAddToCart}
        className="w-full mt-4 py-2.5 bg-pink-100 hover:bg-pink-200 text-slate-800 font-bold rounded-full text-xs transition active:scale-95"
      >
        Add to Cart
      </button>
    </div>
  );
}

const defaultProducts = {
  space: [
    {
      id: "prod-1",
      name: "Galaxy Rocket Kit",
      price: 19.99,
      theme: "Space Adventures",
      category: "Painting Kits",
      ageGroup: "Ages 4+",
      isNonToxic: true,
      image:
        "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=500",
      description: "Plaster rocket set with paints.",
    },
    {
      id: "prod-2",
      name: "Planet Explorer Set",
      price: 24.99,
      theme: "Space Adventures",
      category: "Painting Kits",
      ageGroup: "Ages 4+",
      isNonToxic: true,
      image:
        "https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=500",
      description: "Plaster planet collection.",
    },
  ],
  garden: [
    {
      id: "prod-3",
      name: "Butterfly & Bloom Kit",
      price: 19.99,
      theme: "Secret Garden (Floral)",
      category: "Painting Kits",
      ageGroup: "Ages 4+",
      isNonToxic: true,
      image:
        "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=500",
      description: "Butterfly plaster kit.",
    },
    {
      id: "prod-4",
      name: "Enchanted Floral Set",
      price: 24.99,
      theme: "Secret Garden (Floral)",
      category: "Painting Kits",
      ageGroup: "Ages 4+",
      isNonToxic: true,
      image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=500",
      description: "Flower pot plaster craft.",
    },
  ],
  fairytale: [
    {
      id: "prod-5",
      name: "Unicorn Dreams Kit",
      price: 19.99,
      theme: "Fairytale Magic",
      category: "Painting Kits",
      ageGroup: "Ages 4+",
      isNonToxic: true,
      image:
        "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500",
      description: "Unicorn painting kit.",
    },
    {
      id: "prod-6",
      name: "Royal Castle Set",
      price: 14.99,
      theme: "Fairytale Magic",
      category: "Painting Kits",
      ageGroup: "Ages 4+",
      isNonToxic: true,
      image:
        "https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=500",
      description: "Castle craft kit.",
    },
  ],
  wild: [
    {
      id: "prod-7",
      name: "Safari Lion Kit",
      price: 19.99,
      theme: "Wild Kingdom",
      category: "Painting Kits",
      ageGroup: "Ages 4+",
      isNonToxic: true,
      image:
        "https://images.unsplash.com/photo-1534567153574-2b12153a87f0?w=500",
      description: "Safari lion plaster kit.",
    },
    {
      id: "prod-8",
      name: "Elephant Parade Set",
      price: 24.99,
      theme: "Wild Kingdom",
      category: "Painting Kits",
      ageGroup: "Ages 4+",
      isNonToxic: true,
      image: "https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?w=500",
      description: "Elephant family craft.",
    },
  ],
};
