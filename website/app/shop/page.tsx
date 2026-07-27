"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useCart } from "../../context/CartContext";
import { ShieldCheck, Filter, ArrowUpDown } from "lucide-react";
import { API_BASE_URL } from "../../config/api";

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  theme: string;
  category: string;
  ageGroup: string;
  productLineId?: string;
  isNonToxic: boolean;
  image: string;
  description: string;
  inStock: boolean;
  featured?: boolean;
  attributes?: Record<string, string>;
}

interface ProductLine {
  id: string;
  name: string;
  slug: string;
}

interface CategoryFacet {
  id: string;
  name: string;
  facetGroup: string;
  productLineId?: string;
}

function ShopPageContent() {
  const searchParams = useSearchParams();
  const initialTheme = searchParams.get("theme") || "";
  const initialCategory = searchParams.get("category") || "";
  const initialAge = searchParams.get("ageGroup") || "";
  const initialProductLineId = searchParams.get("productLineId") || "";

  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [productLines, setProductLines] = useState<ProductLine[]>([]);
  const [facets, setFacets] = useState<CategoryFacet[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [selectedProductLineId, setSelectedProductLineId] =
    useState(initialProductLineId);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedTheme, setSelectedTheme] = useState(initialTheme);
  const [selectedAge, setSelectedAge] = useState(initialAge);
  const [selectedScent, setSelectedScent] = useState("");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [maxPrice, setMaxPrice] = useState<number>(2000);
  const [sortOrder, setSortOrder] = useState<
    "default" | "low-to-high" | "high-to-low" | "newest"
  >("default");

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/products`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setProducts(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    fetch(`${API_BASE_URL}/api/product-lines`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setProductLines(data);
      })
      .catch(() => {});

    fetch(`${API_BASE_URL}/api/facets`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setFacets(data);
      })
      .catch(() => {});
  }, []);

  const filteredProducts = useMemo(() => {
    let list = [...products];

    if (selectedProductLineId) {
      list = list.filter((p) => p.productLineId === selectedProductLineId);
    }
    if (selectedTheme) {
      list = list.filter(
        (p) => p.theme.toLowerCase() === selectedTheme.toLowerCase(),
      );
    }
    if (selectedCategory) {
      list = list.filter(
        (p) => p.category.toLowerCase() === selectedCategory.toLowerCase(),
      );
    }
    if (selectedAge) {
      list = list.filter(
        (p) => p.ageGroup.toLowerCase() === selectedAge.toLowerCase(),
      );
    }
    if (selectedScent) {
      list = list.filter((p) =>
        p.attributes?.Scent?.toLowerCase().includes(
          selectedScent.toLowerCase(),
        ),
      );
    }
    if (inStockOnly) {
      list = list.filter((p) => p.inStock);
    }

    list = list.filter((p) => p.price <= maxPrice);

    if (sortOrder === "low-to-high") {
      list.sort((a, b) => a.price - b.price);
    } else if (sortOrder === "high-to-low") {
      list.sort((a, b) => b.price - a.price);
    } else if (sortOrder === "newest") {
      list.reverse();
    }

    return list;
  }, [
    products,
    selectedProductLineId,
    selectedTheme,
    selectedCategory,
    selectedAge,
    selectedScent,
    inStockOnly,
    maxPrice,
    sortOrder,
  ]);

  const activeProductLine = productLines.find(
    (l) => l.id === selectedProductLineId,
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-pink-50 via-yellow-50 to-sky-50 p-8 rounded-3xl border border-slate-100 soft-shadow mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-pink-500">
            {activeProductLine ? activeProductLine.name : "Store Catalog"}
          </span>
          <h1 className="text-3xl font-extrabold text-slate-800 mt-1">
            {activeProductLine
              ? activeProductLine.name
              : "Explore All Craft Kits & Candles"}
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Browse non-toxic ready-to-paint plaster figurines, scented soy wax
            candles, and creative art sets.
          </p>
        </div>

        {/* Product Line Quick Tabs */}
        <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-xs p-1.5 rounded-full border border-slate-200 text-xs font-bold">
          <button
            onClick={() => setSelectedProductLineId("")}
            className={`px-4 py-2 rounded-full transition ${
              selectedProductLineId === ""
                ? "bg-pink-300 text-slate-800"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            All Lines
          </button>
          {productLines.map((line) => (
            <button
              key={line.id}
              onClick={() => setSelectedProductLineId(line.id)}
              className={`px-4 py-2 rounded-full transition ${
                selectedProductLineId === line.id
                  ? "bg-pink-300 text-slate-800"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {line.name}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Filter Sidebar */}
        <aside className="w-full md:w-64 shrink-0 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 soft-shadow space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-sm text-slate-800 flex items-center space-x-2">
                <Filter className="w-4 h-4 text-pink-500" />
                <span>Filter Facets</span>
              </h3>
              <button
                onClick={() => {
                  setSelectedProductLineId("");
                  setSelectedTheme("");
                  setSelectedCategory("");
                  setSelectedAge("");
                  setSelectedScent("");
                  setInStockOnly(false);
                  setMaxPrice(2000);
                }}
                className="text-[11px] font-bold text-pink-600 hover:text-pink-700"
              >
                Reset
              </button>
            </div>

            {/* Price Filter Slider */}
            <div>
              <div className="flex justify-between items-center text-xs font-bold text-slate-700 mb-2">
                <span>Max Price:</span>
                <span className="text-pink-600">₹{maxPrice}</span>
              </div>
              <input
                type="range"
                min="100"
                max="2000"
                step="50"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-pink-500 cursor-pointer"
              />
            </div>

            {/* Stock Availability */}
            <label className="flex items-center space-x-2 text-xs font-bold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="rounded text-pink-500 focus:ring-pink-400"
              />
              <span>In Stock Only</span>
            </label>

            {/* Themes Filter */}
            <div>
              <h4 className="font-extrabold text-xs text-slate-400 uppercase tracking-wider mb-2">
                Themes
              </h4>
              <div className="space-y-1">
                {[
                  "",
                  ...Array.from(
                    new Set(products.map((p) => p.theme).filter(Boolean)),
                  ),
                ].map((t) => (
                  <button
                    key={t || "all-themes"}
                    onClick={() => setSelectedTheme(t)}
                    className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                      selectedTheme === t
                        ? "bg-pink-100 text-slate-800 font-bold"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {t || "All Themes"}
                  </button>
                ))}
              </div>
            </div>

            {/* Scent Filter */}
            {(() => {
              const availableScents = Array.from(
                new Set(
                  products
                    .map((p) => p.attributes?.Scent || "")
                    .filter(Boolean),
                ),
              );
              if (availableScents.length === 0) return null;

              return (
                <div>
                  <h4 className="font-extrabold text-xs text-slate-400 uppercase tracking-wider mb-2">
                    Scent Type
                  </h4>
                  <div className="space-y-1">
                    {["", ...availableScents].map((s) => (
                      <button
                        key={s || "all-scents"}
                        onClick={() => setSelectedScent(s)}
                        className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                          selectedScent === s
                            ? "bg-yellow-100 text-slate-800 font-bold"
                            : "text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {s || "All Scents"}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        </aside>

        {/* Product Grid */}
        <main className="flex-1 space-y-6">
          {/* Toolbar */}
          <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-100 text-xs">
            <span className="text-slate-500 font-medium">
              Showing{" "}
              <strong className="text-slate-800">
                {filteredProducts.length}
              </strong>{" "}
              items
            </span>
            <div className="flex items-center space-x-2">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as any)}
                className="bg-slate-50 border border-slate-200 rounded-full px-3 py-1.5 text-xs font-semibold focus:outline-none"
              >
                <option value="default">Sort by Featured</option>
                <option value="low-to-high">Price: Low to High</option>
                <option value="high-to-low">Price: High to Low</option>
                <option value="newest">Newest Arrivals</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div
                  key={n}
                  className="bg-white rounded-3xl border border-slate-100 p-4 soft-shadow animate-pulse space-y-3"
                >
                  <div className="w-full aspect-square bg-slate-100/90 rounded-2xl" />
                  <div className="h-3 bg-slate-100 rounded-full w-1/3" />
                  <div className="h-4 bg-slate-100 rounded-full w-3/4" />
                  <div className="h-4 bg-slate-100 rounded-full w-1/4" />
                  <div className="h-10 bg-slate-100 rounded-full w-full mt-4" />
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-3xl border border-slate-100 space-y-3">
              <p className="text-slate-600 font-bold">
                No items found matching your active filters.
              </p>
              <button
                onClick={() => {
                  setSelectedProductLineId("");
                  setSelectedTheme("");
                  setSelectedCategory("");
                  setSelectedAge("");
                  setSelectedScent("");
                  setInStockOnly(false);
                  setMaxPrice(2000);
                }}
                className="px-6 py-2.5 bg-pink-100 text-slate-800 font-bold text-xs rounded-full"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-3xl border border-slate-100 p-4 soft-shadow soft-shadow-hover transition flex flex-col justify-between"
                >
                  <div>
                    <Link
                      href={`/product/${product.id}`}
                      className="block group"
                    >
                      <div className="relative rounded-2xl overflow-hidden mb-3 aspect-square bg-slate-50 cursor-pointer">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        />
                        <div className="absolute top-2 left-2 flex flex-col space-y-1 z-10">
                          <span className="px-2.5 py-1 bg-sky-100 text-sky-800 rounded-full text-[10px] font-bold shadow-xs">
                            {product.ageGroup}
                          </span>
                          {/* {product.isNonToxic && (
                            <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-bold shadow-xs flex items-center space-x-1">
                              <ShieldCheck className="w-3 h-3 inline" />
                              <span>Non-Toxic</span>
                            </span>
                          )} */}
                        </div>
                      </div>

                      <span className="text-[10px] font-bold uppercase tracking-wider text-pink-500">
                        {product.theme}
                      </span>
                      <h4 className="font-bold text-sm text-slate-800 line-clamp-1 mt-0.5 group-hover:text-pink-500 transition">
                        {product.name}
                      </h4>
                    </Link>
                    <p className="text-slate-500 font-extrabold text-sm mt-1">
                      ₹{product.price.toFixed(2)}
                    </p>
                  </div>

                  <button
                    onClick={() => addToCart(product)}
                    className="w-full mt-4 py-2.5 bg-pink-100 hover:bg-pink-200 text-slate-800 font-bold rounded-full text-xs transition active:scale-95"
                  >
                    Add to Basket
                  </button>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-500 font-bold">
          Loading Shop Catalog...
        </div>
      }
    >
      <ShopPageContent />
    </Suspense>
  );
}
