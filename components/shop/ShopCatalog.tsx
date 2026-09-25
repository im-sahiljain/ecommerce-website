"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useCart } from "../../context/CartContext";
import { ShieldCheck, Filter, ArrowUpDown, X, Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { API_BASE_URL } from "../../config/api";
import OptimisticAddToCart from "../../components/OptimisticAddToCart";
import CatalogImage from "../../components/CatalogImage";
import PackCardSlides from "../PackCardSlides";
import { slidesForPack } from "@/lib/packSlides";
import { productPath } from "@/lib/site";
import { publicSlug } from "@/lib/slug";

interface Product {
  id: string;
  slug?: string;
  name: string;
  price: number;
  originalPrice?: number;
  theme: string;
  category: string;
  ageGroup: string;
  productLineId?: string;
  isNonToxic: boolean;
  image: string;
  images?: string[];
  description: string;
  inStock: boolean;
  likesCount?: number;
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

function productLineIdFromParam(raw: string, lines: ProductLine[]) {
  if (!raw) return "";
  const match = lines.find(
    (line) => line.id === raw || line.slug === raw || publicSlug(line) === raw,
  );
  if (match) return match.id;
  return raw.startsWith("line-") ? raw : "";
}

function ShopPageContent({ categoryName }: { categoryName?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialSearch =
    searchParams.get("search") || searchParams.get("q") || "";
  const initialTheme = searchParams.get("theme") || "";
  const initialCategory = searchParams.get("category") || categoryName || "";
  const initialAge = searchParams.get("ageGroup") || "";
  const initialProductLineId = productLineIdFromParam(
    searchParams.get("productLine") || searchParams.get("productLineId") || "",
    [],
  );
  const initialPackId = searchParams.get("packId") || "";

  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [packs, setPacks] = useState<any[]>([]);
  const [productLines, setProductLines] = useState<ProductLine[]>([]);
  const [facets, setFacets] = useState<CategoryFacet[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [searchQuery, setSearchQuery] = useState(initialSearch);
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
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setProducts(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    fetch("/api/packs")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setPacks(data);
      })
      .catch(() => {});

    fetch("/api/product-lines")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setProductLines(data);
      })
      .catch(() => {});

    fetch("/api/facets")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setFacets(data);
      })
      .catch(() => {});
  }, []);

  // Sync state when URL searchParams change (e.g. clicking Shop All or changing category links)
  useEffect(() => {
    const raw =
      searchParams.get("productLine") ||
      searchParams.get("productLineId") ||
      "";
    const match = productLines.find(
      (line) =>
        line.id === raw || line.slug === raw || publicSlug(line) === raw,
    );
    setSelectedProductLineId(match?.id || (raw.startsWith("line-") ? raw : ""));
    if (match) {
      const slug = publicSlug(match);
      if (
        searchParams.get("productLine") !== slug ||
        searchParams.has("productLineId")
      ) {
        const params = new URLSearchParams(searchParams.toString());
        params.delete("productLineId");
        params.set("productLine", slug);
        router.replace(`/shop?${params.toString()}`, { scroll: false });
      }
    }
    setSelectedCategory(searchParams.get("category") || categoryName || "");
    setSelectedTheme(searchParams.get("theme") || "");
    setSelectedAge(searchParams.get("ageGroup") || "");
    setSelectedPackId(searchParams.get("packId") || "");
  }, [searchParams, categoryName, productLines, router]);

  const filteredProducts = useMemo(() => {
    // Map packs to product-like format
    const packProducts: Product[] = packs.map((pack) => ({
      id: pack.id,
      slug: pack.slug,
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

    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.theme && p.theme.toLowerCase().includes(q)) ||
          (p.category && p.category.toLowerCase().includes(q)) ||
          (p.description && p.description.toLowerCase().includes(q)),
      );
    }

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
    searchQuery,
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
          <h4 className="font-extrabold text-xs text-secondary uppercase tracking-wider mb-2">
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
                className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition ${
                  selectedProductLineId === pl.id
                    ? "bg-purple-100 text-purple-900 font-bold"
                    : "text-neutral-600 hover:bg-neutral-50"
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
        <h4 className="font-extrabold text-xs text-secondary uppercase tracking-wider mb-2">
          Tag
        </h4>
        <div className="space-y-2 pt-1 text-xs font-bold text-neutral-700">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filterNewLaunch}
              onChange={(e) => setFilterNewLaunch(e.target.checked)}
              className="accent-primary"
            />
            <span>🎀 New Launch</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filterSellingFast}
              onChange={(e) => setFilterSellingFast(e.target.checked)}
              className="accent-primary"
            />
            <span>🔥 Selling Fast</span>
          </label>
          {/* Stock Availability */}
          <label className="flex items-center space-x-2 text-xs font-bold text-neutral-700 cursor-pointer">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              className="accent-primary"
            />
            <span>📦 In Stock</span>
          </label>
        </div>
      </div>

      {/* Price Filter Slider */}
      <div>
        <div className="flex justify-between items-center text-xs font-bold text-neutral-700 mb-2">
          <span>Max Price:</span>
          <span className="text-primary">₹{maxPrice}</span>
        </div>
        <input
          type="range"
          min="0"
          max="500"
          step="10"
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="w-full accent-primary cursor-pointer"
        />
      </div>
      {/* Themes Filter */}
      <div>
        <h4 className="font-extrabold text-xs text-secondary uppercase tracking-wider mb-2">
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
              className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition ${
                selectedTheme === t
                  ? "bg-primary/15 text-neutral-800 font-bold"
                  : "text-neutral-600 hover:bg-neutral-50"
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
            products.map((p) => p.attributes?.Scent || "").filter(Boolean),
          ),
        );
        if (availableScents.length === 0) return null;

        return (
          <div>
            <h4 className="font-extrabold text-xs text-neutral-400 uppercase tracking-wider mb-2">
              Scent Type
            </h4>
            <div className="space-y-1">
              {["", ...availableScents].map((s) => (
                <button
                  key={s || "all-scents"}
                  onClick={() => setSelectedScent(s)}
                  className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                    selectedScent === s
                      ? "bg-yellow-100 text-neutral-800 font-bold"
                      : "text-neutral-600 hover:bg-neutral-50"
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
      <div className="bg-linear-to-r from-blush via-yellow-50 to-info-50 p-8 rounded-3xl border border-neutral-100 soft-shadow mb-8">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-primary">
            {activeProductLine ? activeProductLine.name : "Store Catalog"}
          </span>
          <h1 className="text-3xl font-extrabold text-neutral-800 mt-1">
            {activeProductLine
              ? activeProductLine.name
              : "Explore All POP Painting Kits"}
          </h1>
          <p className="text-xs text-neutral-500 mt-1 max-w-xl">
            Browse non-toxic ready-to-paint plaster figurines, activity boxes,
            and creative craft art sets.
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Desktop Filter Sidebar */}
        <aside className="hidden md:block w-64 shrink-0 md:sticky md:top-28 self-start">
          <div className="bg-white p-4 sm:p-5 rounded-3xl border border-neutral-100 soft-shadow flex flex-col max-h-[calc(100vh-9.5rem)] overflow-hidden">
            {/* Card Header */}
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3 mb-2 px-1 shrink-0">
              <h3 className="font-extrabold text-sm text-neutral-800 flex items-center space-x-2">
                <Filter className="w-4 h-4 text-primary" />
                <span>Filters</span>
              </h3>
              <button
                onClick={resetAllFilters}
                className="text-[11px] font-bold text-primary hover:text-primary cursor-pointer"
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
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-neutral-100 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center justify-between w-full sm:w-auto space-x-3">
              {/* Mobile Filter Trigger Button */}
              <button
                onClick={() => setIsMobileFilterOpen(true)}
                className="md:hidden flex items-center space-x-1.5 px-3.5 py-1.5 bg-primary/10 hover:bg-primary/15 border border-primary/25 text-primary font-extrabold text-xs rounded-full transition active:scale-95 cursor-pointer shadow-2xs"
              >
                <Filter className="w-3.5 h-3.5" />
                <span>Filters</span>
                {activeFilterCount > 0 && (
                  <span className="w-4 h-4 bg-primary text-white rounded-full text-[10px] font-black flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              <span className="text-neutral-500 font-medium hidden sm:inline-block">
                Showing{" "}
                <strong className="text-neutral-800">
                  {filteredProducts.length}
                </strong>{" "}
                items
              </span>

              {/* Mobile Sort Dropdown */}
              <div className="flex items-center space-x-1.5 sm:hidden">
                <ArrowUpDown className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as any)}
                  className="bg-neutral-50 border border-neutral-200 rounded-full px-3 py-1.5 text-xs font-semibold focus:outline-hidden cursor-pointer"
                >
                  <option value="default">Sort by Featured</option>
                  <option value="low-to-high">Price: Low to High</option>
                  <option value="high-to-low">Price: High to Low</option>
                  <option value="newest">Newest Arrivals</option>
                </select>
              </div>
            </div>

            {/* Mobile items count line */}
            <div className="sm:hidden text-neutral-500 font-medium text-[11px] border-t border-neutral-100 pt-2 flex items-center justify-between">
              <span>Catalog Results</span>
              <span>
                Showing{" "}
                <strong className="text-neutral-800">
                  {filteredProducts.length}
                </strong>{" "}
                items
              </span>
            </div>

            {/* Desktop Sort Dropdown */}
            <div className="hidden sm:flex items-center space-x-2">
              <ArrowUpDown className="w-3.5 h-3.5 text-neutral-400" />
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as any)}
                className="bg-neutral-50 border border-neutral-200 rounded-full px-3 py-1.5 text-xs font-semibold focus:outline-hidden cursor-pointer"
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
                  className="bg-white rounded-3xl border border-neutral-100 p-4 soft-shadow animate-pulse space-y-3"
                >
                  <div className="w-full aspect-square bg-neutral-100/90 rounded-2xl" />
                  <div className="h-3 bg-neutral-100 rounded-full w-1/3" />
                  <div className="h-4 bg-neutral-100 rounded-full w-3/4" />
                  <div className="h-4 bg-neutral-100 rounded-full w-1/4" />
                  <div className="h-10 bg-neutral-100 rounded-full w-full mt-4" />
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-3xl border border-neutral-100 space-y-3">
              <p className="text-neutral-600 font-bold">
                No items found matching your active filters.
              </p>
              <button
                onClick={resetAllFilters}
                className="px-6 py-2.5 bg-primary/15 text-neutral-800 font-bold text-xs rounded-full"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => {
                const packSlides = product.isPack
                  ? slidesForPack(product.productIds, products)
                  : [];
                return (
                  <div
                    key={product.id}
                    className="bg-white rounded-3xl border border-neutral-100 p-4 soft-shadow hover:soft-shadow-hover transition duration-300 flex flex-col justify-between group"
                  >
                    <div>
                      <Link href={productPath(product)} className="block group">
                        {/* Badges Header Bar above Image */}
                        <div className="flex flex-wrap items-center justify-between gap-1.5 mb-2.5 min-h-[22px]">
                          {product.isPack ? (
                            <span className="px-2.5 py-0.5 bg-warning-500 text-white rounded-full text-[10px] font-black shadow-2xs tracking-wider uppercase">
                              🎁 Pack of {product.productIds?.length || 1}
                            </span>
                          ) : product.ageGroup &&
                            product.ageGroup.trim() !== "" ? (
                            <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-info-100 text-info-800 border border-info-200/60 shadow-2xs">
                              {product.ageGroup}
                            </span>
                          ) : (
                            <span />
                          )}

                          {(product.isNewLaunch ||
                            Boolean(
                              product.badge?.toLowerCase().includes("new"),
                            )) && (
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-warning-400 text-neutral-900 shadow-2xs uppercase tracking-wider">
                              🎀 New Launch
                            </span>
                          )}
                        </div>

                        {packSlides.length > 1 ? (
                          <PackCardSlides
                            slides={packSlides}
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            className="mb-3 rounded-2xl border border-neutral-100"
                            caption={({ names, currentName }) => (
                              <>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                                  {product.theme}
                                </span>
                                <h4 className="font-bold text-sm text-neutral-800 line-clamp-1 mt-0.5 group-hover:text-primary transition">
                                  {product.name}
                                </h4>
                                <p className="mt-1 flex flex-wrap gap-x-2 gap-y-0.5 text-[11px] font-bold leading-snug">
                                  {names.map((name) => (
                                    <span
                                      key={name}
                                      className={
                                        name === currentName
                                          ? "text-primary"
                                          : "text-neutral-400"
                                      }
                                    >
                                      {name}
                                    </span>
                                  ))}
                                </p>
                              </>
                            )}
                          >
                            {(product.isSellingFast ||
                              Boolean(
                                product.badge
                                  ?.toLowerCase()
                                  .includes("selling"),
                              )) && (
                              <span className="absolute top-2.5 left-2.5 z-10 text-[10px] font-black px-2.5 py-0.5 rounded-full bg-linear-to-r from-red-500 to-danger-600 text-white shadow-2xs uppercase tracking-wider">
                                🔥 Selling Fast
                              </span>
                            )}
                            {(product.likesCount || 0) > 0 && (
                              <div className="absolute bottom-2.5 right-2.5 z-10 px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-md border border-danger-100 text-danger-600 font-extrabold text-[10px] sm:text-xs flex items-center space-x-1 shadow-2xs">
                                <Heart className="w-3 h-3 fill-danger-500 text-danger-500" />
                                <span>{product.likesCount}</span>
                              </div>
                            )}
                          </PackCardSlides>
                        ) : (
                          <div className="relative rounded-2xl overflow-hidden mb-3 aspect-square bg-neutral-50 border border-neutral-100">
                            <CatalogImage
                              src={product.image}
                              name={product.name}
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                              className="group-hover:scale-105 transition duration-500"
                            />
                            {(product.isSellingFast ||
                              Boolean(
                                product.badge
                                  ?.toLowerCase()
                                  .includes("selling"),
                              )) && (
                              <span className="absolute top-2.5 left-2.5 z-10 text-[10px] font-black px-2.5 py-0.5 rounded-full bg-linear-to-r from-red-500 to-danger-600 text-white shadow-2xs uppercase tracking-wider">
                                🔥 Selling Fast
                              </span>
                            )}
                            {(product.likesCount || 0) > 0 && (
                              <div className="absolute bottom-2.5 right-2.5 z-10 px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-md border border-danger-100 text-danger-600 font-extrabold text-[10px] sm:text-xs flex items-center space-x-1 shadow-2xs">
                                <Heart className="w-3 h-3 fill-danger-500 text-danger-500" />
                                <span>{product.likesCount}</span>
                              </div>
                            )}
                          </div>
                        )}

                        {packSlides.length <= 1 && (
                          <>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                              {product.theme}
                            </span>
                            <h4 className="font-bold text-sm text-neutral-800 line-clamp-1 mt-0.5 group-hover:text-primary transition">
                              {product.name}
                            </h4>
                          </>
                        )}
                      </Link>
                      <p className="mt-1 flex items-baseline gap-1.5">
                        <span className="text-secondary font-extrabold text-sm">
                          ₹{product.price.toFixed(2)}
                        </span>
                        {product.originalPrice &&
                          product.originalPrice > product.price && (
                            <span className="text-xs font-semibold text-neutral-400 line-through">
                              ₹{product.originalPrice.toFixed(2)}
                            </span>
                          )}
                      </p>
                    </div>

                    <div className="mt-4">
                      <OptimisticAddToCart product={product} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* Mobile Filters Slide Sheet Drawer */}
      <AnimatePresence>
        {isMobileFilterOpen && (
          <div className="fixed inset-0 z-100 md:hidden flex justify-end">
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
              <div className="p-4 border-b border-neutral-100 flex items-center justify-between bg-primary/5 shrink-0">
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-primary" />
                  <h3 className="font-extrabold text-sm text-neutral-800">
                    Filter Products
                  </h3>
                </div>
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="p-1.5 rounded-full text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Scrollable Body */}
              <div className="p-5 overflow-y-auto sleek-scrollbar flex-1 space-y-6">
                {renderFilterControls()}
              </div>

              {/* Drawer Footer CTA */}
              <div className="p-4 border-t border-neutral-100 bg-neutral-50 flex items-center gap-3 shrink-0">
                <button
                  onClick={resetAllFilters}
                  className="w-1/3 py-3 bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-100 font-bold text-xs rounded-2xl transition cursor-pointer"
                >
                  Reset
                </button>
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="w-2/3 py-3 bg-primary hover:bg-primary/90 text-white font-extrabold text-xs rounded-2xl shadow-md transition active:scale-98 cursor-pointer"
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

export default function ShopCatalog({
  categoryName,
}: {
  categoryName?: string;
}) {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-16 text-center text-neutral-500 font-bold">
          Loading Shop Catalog...
        </div>
      }
    >
      <ShopPageContent categoryName={categoryName} />
    </Suspense>
  );
}
