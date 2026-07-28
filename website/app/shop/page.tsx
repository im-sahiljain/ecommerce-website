"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useCart } from "../../context/CartContext";
import { ShieldCheck, Filter, ArrowUpDown, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { API_BASE_URL } from "../../config/api";
import OptimisticAddToCart from "../../components/OptimisticAddToCart";

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
  badge?: string;
  isNewLaunch?: boolean;
  isSellingFast?: boolean;
  size?: string;
  material?: string;
  isVisible?: boolean;
  attributes?: Record<string, string>;
  isPack?: boolean;
  productIds?: string[];
}

interface ProductLine {
  id: string;
  name: string;
  slug: string;
  isVisible?: boolean;
}

interface CategoryFacet {
  id: string;
  name: string;
  slug: string;
}

function ShopPageContent() {
  const searchParams = useSearchParams();
  const initialTheme = searchParams.get("theme") || "";
  const initialCategory = searchParams.get("category") || "";
  const initialAge = searchParams.get("ageGroup") || "";
  const initialProductLineId = searchParams.get("productLineId") || "";
  const initialPackId = searchParams.get("packId") || "";

  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [packs, setPacks] = useState<any[]>([]);
  const [productLines, setProductLines] = useState<ProductLine[]>([]);
  const [facets, setFacets] = useState<CategoryFacet[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [selectedProductLineId, setSelectedProductLineId] =
    useState(initialProductLineId);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedTheme, setSelectedTheme] = useState(initialTheme);
  const [selectedAge, setSelectedAge] = useState(initialAge);
  const [selectedPackId, setSelectedPackId] = useState(initialPackId);
  const [selectedScent, setSelectedScent] = useState("");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [filterNewLaunch, setFilterNewLaunch] = useState(false);
  const [filterSellingFast, setFilterSellingFast] = useState(false);
  const [maxPrice, setMaxPrice] = useState<number>(500);
  const [sortOrder, setSortOrder] = useState<
    "default" | "low-to-high" | "high-to-low" | "newest"
  >("default");
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/products`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setProducts(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    fetch(`${API_BASE_URL}/api/packs`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setPacks(data);
      })
      .catch(() => {});

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

  // Sync state when URL searchParams change (e.g. clicking Shop All or changing category links)
  useEffect(() => {
    setSelectedProductLineId(searchParams.get("productLineId") || "");
    setSelectedCategory(searchParams.get("category") || "");
    setSelectedTheme(searchParams.get("theme") || "");
    setSelectedAge(searchParams.get("ageGroup") || "");
    setSelectedPackId(searchParams.get("packId") || "");
  }, [searchParams]);

  const filteredProducts = useMemo(() => {
    // Map packs to product-like format
    const packProducts: Product[] = packs.map((pack) => ({
      id: pack.id,
      name: pack.name,
      price: Number(pack.price),
      originalPrice: pack.originalPrice
        ? Number(pack.originalPrice)
        : undefined,
      theme: "General",
      category: pack.category || "Pack Set",
      ageGroup: "All Ages",
      productLineId: pack.productLineId,
      isNonToxic: true,
      image:
        pack.image ||
        products.find((p) => pack.productIds?.includes(p.id))?.image ||
        "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=500",
      description: pack.description || "",
      inStock: pack.inStock !== false,
      featured: pack.featured,
      isPack: true,
      productIds: pack.productIds || [],
    }));

    let list = [
      ...products.filter((p) => p.isVisible !== false),
      ...packProducts,
    ];

    if (selectedPackId) {
      list = list.filter((p) => p.id === selectedPackId);
    }
    if (selectedProductLineId) {
      list = list.filter(
        (p) => p.productLineId === selectedProductLineId || !p.productLineId,
      );
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
    if (filterNewLaunch) {
      list = list.filter(
        (p) => p.isNewLaunch || Boolean(p.badge?.includes("New")),
      );
    }
    if (filterSellingFast) {
      list = list.filter(
        (p) => p.isSellingFast || Boolean(p.badge?.includes("Selling")),
      );
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
    packs,
    selectedProductLineId,
    selectedTheme,
    selectedCategory,
    selectedAge,
    selectedPackId,
    selectedScent,
    inStockOnly,
    filterNewLaunch,
    filterSellingFast,
    maxPrice,
    sortOrder,
  ]);

  const activeProductLine = productLines.find(
    (l) => l.id === selectedProductLineId,
  );

  const activeFilterCount =
    (selectedProductLineId ? 1 : 0) +
    (selectedCategory ? 1 : 0) +
    (selectedTheme ? 1 : 0) +
    (selectedAge ? 1 : 0) +
    (selectedPackId ? 1 : 0) +
    (selectedScent ? 1 : 0) +
    (inStockOnly ? 1 : 0) +
    (filterNewLaunch ? 1 : 0) +
    (filterSellingFast ? 1 : 0) +
    (maxPrice < 500 ? 1 : 0);

  const resetAllFilters = () => {
    setSelectedProductLineId("");
    setSelectedTheme("");
    setSelectedCategory("");
    setSelectedAge("");
    setSelectedPackId("");
    setSelectedScent("");
    setInStockOnly(false);
    setFilterNewLaunch(false);
    setFilterSellingFast(false);
    setMaxPrice(500);
  };

  const renderFilterControls = () => (
    <>
      {/* Product Line Filter */}
      {productLines.length > 0 && (
        <div>
          <h4 className="font-extrabold text-xs text-slate-400 uppercase tracking-wider mb-2">
            Product Line
          </h4>
          <div className="space-y-1">
            {[
              { id: "", name: "All Product Lines" },
              ...productLines.filter((pl) => pl.isVisible !== false),
            ].map((pl) => (
              <button
                key={pl.id || "all-lines"}
                onClick={() => setSelectedProductLineId(pl.id)}
                className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  selectedProductLineId === pl.id
                    ? "bg-purple-100 text-purple-900 font-bold"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                {pl.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Badges / Highlights Filter */}
      <div>
        <h4 className="font-extrabold text-xs text-slate-400 uppercase tracking-wider mb-2">
          Badges & Highlights
        </h4>
        <div className="space-y-2 pt-1 text-xs font-bold text-slate-700">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filterNewLaunch}
              onChange={(e) => setFilterNewLaunch(e.target.checked)}
              className="rounded text-pink-500 focus:ring-pink-400"
            />
            <span>✨ New Launch</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filterSellingFast}
              onChange={(e) => setFilterSellingFast(e.target.checked)}
              className="rounded text-pink-500 focus:ring-pink-400"
            />
            <span>🔥 Selling Fast</span>
          </label>
        </div>
      </div>

      {/* Price Filter Slider */}
      <div>
        <div className="flex justify-between items-center text-xs font-bold text-slate-700 mb-2">
          <span>Max Price:</span>
          <span className="text-pink-600">₹{maxPrice}</span>
        </div>
        <input
          type="range"
          min="0"
          max="500"
          step="10"
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
    </>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-pink-50 via-yellow-50 to-sky-50 p-8 rounded-3xl border border-slate-100 soft-shadow mb-8">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-pink-500">
            {activeProductLine ? activeProductLine.name : "Store Catalog"}
          </span>
          <h1 className="text-3xl font-extrabold text-slate-800 mt-1">
            {activeProductLine
              ? activeProductLine.name
              : "Explore All POP Painting Kits"}
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Browse non-toxic ready-to-paint plaster figurines, activity boxes,
            and creative craft art sets.
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Desktop Filter Sidebar */}
        <aside className="hidden md:block w-64 shrink-0 md:sticky md:top-28 self-start">
          <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-100 soft-shadow flex flex-col max-h-[calc(100vh-9.5rem)] overflow-hidden">
            {/* Card Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-2 px-1 shrink-0">
              <h3 className="font-extrabold text-sm text-slate-800 flex items-center space-x-2">
                <Filter className="w-4 h-4 text-pink-500" />
                <span>Filters</span>
              </h3>
              <button
                onClick={resetAllFilters}
                className="text-[11px] font-bold text-pink-600 hover:text-pink-700 cursor-pointer"
              >
                Reset
              </button>
            </div>

            {/* Inner Scrollable Filter Track */}
            <div className="overflow-y-auto sleek-scrollbar space-y-6 flex-1 pr-3 pl-1 py-1">
              {renderFilterControls()}
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <main className="flex-1 space-y-6">
          {/* Toolbar */}
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-100 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center justify-between w-full sm:w-auto space-x-3">
              {/* Mobile Filter Trigger Button */}
              <button
                onClick={() => setIsMobileFilterOpen(true)}
                className="md:hidden flex items-center space-x-1.5 px-3.5 py-1.5 bg-pink-50 hover:bg-pink-100 border border-pink-200 text-pink-700 font-extrabold text-xs rounded-full transition active:scale-95 cursor-pointer shadow-2xs"
              >
                <Filter className="w-3.5 h-3.5" />
                <span>Filters</span>
                {activeFilterCount > 0 && (
                  <span className="w-4 h-4 bg-pink-600 text-white rounded-full text-[10px] font-black flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              <span className="text-slate-500 font-medium hidden sm:inline-block">
                Showing{" "}
                <strong className="text-slate-800">
                  {filteredProducts.length}
                </strong>{" "}
                items
              </span>

              {/* Mobile Sort Dropdown */}
              <div className="flex items-center space-x-1.5 sm:hidden">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as any)}
                  className="bg-slate-50 border border-slate-200 rounded-full px-3 py-1.5 text-xs font-semibold focus:outline-none cursor-pointer"
                >
                  <option value="default">Sort by Featured</option>
                  <option value="low-to-high">Price: Low to High</option>
                  <option value="high-to-low">Price: High to Low</option>
                  <option value="newest">Newest Arrivals</option>
                </select>
              </div>
            </div>

            {/* Mobile items count line */}
            <div className="sm:hidden text-slate-500 font-medium text-[11px] border-t border-slate-100 pt-2 flex items-center justify-between">
              <span>Catalog Results</span>
              <span>
                Showing <strong className="text-slate-800">{filteredProducts.length}</strong> items
              </span>
            </div>

            {/* Desktop Sort Dropdown */}
            <div className="hidden sm:flex items-center space-x-2">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as any)}
                className="bg-slate-50 border border-slate-200 rounded-full px-3 py-1.5 text-xs font-semibold focus:outline-none cursor-pointer"
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
                onClick={resetAllFilters}
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
                  className="bg-white rounded-3xl border border-slate-100 p-4 soft-shadow hover:soft-shadow-hover transition duration-300 flex flex-col justify-between group"
                >
                  <div>
                    <Link
                      href={`/product/${product.id}`}
                      className="block group"
                    >
                      <div className="relative rounded-2xl overflow-hidden mb-3 aspect-square bg-slate-50 border border-slate-100">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        />
                        <div className="absolute top-2 left-2 flex flex-col space-y-1 z-10">
                          {product.isPack ? (
                            <span className="px-2.5 py-1 bg-amber-500 text-white rounded-full text-[10px] font-black shadow-xs tracking-wider uppercase">
                              🎁 Pack of {product.productIds?.length || 1}
                            </span>
                          ) : product.ageGroup &&
                            product.ageGroup.trim() !== "" ? (
                            <span className="px-2.5 py-1 bg-sky-100 text-sky-800 rounded-full text-[10px] font-bold shadow-xs">
                              {product.ageGroup}
                            </span>
                          ) : null}
                          {(product.isNewLaunch ||
                            Boolean(
                              product.badge?.toLowerCase().includes("new"),
                            )) && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black text-slate-900 bg-amber-400 shadow-xs uppercase tracking-wider">
                              ✨ New Launch
                            </span>
                          )}
                          {(product.isSellingFast ||
                            Boolean(
                              product.badge?.toLowerCase().includes("selling"),
                            )) && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black text-white bg-gradient-to-r from-red-500 to-rose-600 shadow-xs uppercase tracking-wider">
                              🔥 Selling Fast
                            </span>
                          )}
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

                  <div className="mt-4">
                    <OptimisticAddToCart product={product} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Mobile Filters Slide Sheet Drawer */}
      <AnimatePresence>
        {isMobileFilterOpen && (
          <div className="fixed inset-0 z-[100] md:hidden flex justify-end">
            {/* Backdrop Fade */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsMobileFilterOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-xs cursor-pointer"
            />

            {/* Slide Sheet Drawer Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative z-10 bg-white w-full max-w-xs sm:max-w-sm h-full shadow-2xl flex flex-col justify-between"
            >
              {/* Drawer Header */}
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-pink-50/60 shrink-0">
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-pink-500" />
                  <h3 className="font-extrabold text-sm text-slate-800">
                    Filter Products
                  </h3>
                </div>
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Scrollable Body */}
              <div className="p-5 overflow-y-auto sleek-scrollbar flex-1 space-y-6">
                {renderFilterControls()}
              </div>

              {/* Drawer Footer CTA */}
              <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center gap-3 shrink-0">
                <button
                  onClick={resetAllFilters}
                  className="w-1/3 py-3 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-xs rounded-2xl transition cursor-pointer"
                >
                  Reset
                </button>
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="w-2/3 py-3 bg-pink-500 hover:bg-pink-600 text-white font-extrabold text-xs rounded-2xl shadow-md transition active:scale-98 cursor-pointer"
                >
                  Show ({filteredProducts.length}) Results
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
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
