"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import {
  Search,
  User as UserIcon,
  ShoppingBag,
  ChevronDown,
  LogOut,
  Package,
  Sparkles,
  Menu,
  X,
  ArrowRight,
  Loader2,
} from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface ProductLine {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  description?: string;
  isVisible?: boolean;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  productLineId?: string;
  isVisible?: boolean;
}

export default function Navbar() {
  const router = useRouter();
  const { totalCount, setIsCartOpen } = useCart();
  const { user, openAuth, logout } = useAuth();

  const [productLines, setProductLines] = useState<ProductLine[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [packs, setPacks] = useState<any[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProductsOpen, setIsProductsOpen] = useState(false);

  // Search Feature State
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<{
    products: Array<{
      id: string;
      name: string;
      slug?: string;
      price: number;
      originalPrice?: number;
      image: string;
      theme?: string;
      category?: string;
      inStock?: boolean;
    }>;
    themes: Array<{ id: string; name: string; slug: string; icon?: string }>;
    categories: Array<{ id: string; name: string; slug: string }>;
    packs: Array<{ id: string; name: string; price: number; image?: string }>;
  }>({ products: [], themes: [], categories: [], packs: [] });

  const searchContainerRef = useRef<HTMLDivElement | null>(null);
  const desktopSearchInputRef = useRef<HTMLInputElement | null>(null);
  const mobileSearchInputRef = useRef<HTMLInputElement | null>(null);

  // Enhanced Debounced Search Query Fetch with AbortController & Min Length
  useEffect(() => {
    const trimmedQ = searchQuery.trim();

    // Only fetch search results if query is at least 2 characters long
    if (!trimmedQ || trimmedQ.length < 2) {
      setSearchResults({ products: [], themes: [], categories: [], packs: [] });
      setIsSearchLoading(false);
      return;
    }

    setIsSearchLoading(true);
    const controller = new AbortController();

    const timer = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(trimmedQ)}`, {
        signal: controller.signal,
      })
        .then((res) => res.json())
        .then((data) => {
          setSearchResults({
            products: data.products || [],
            themes: data.themes || [],
            categories: data.categories || [],
            packs: data.packs || [],
          });
          setIsSearchLoading(false);
        })
        .catch((err) => {
          if (err.name !== "AbortError") {
            setIsSearchLoading(false);
          }
        });
    }, 300); // 300ms debounce delay

    return () => {
      clearTimeout(timer);
      controller.abort(); // Instantly aborts any pending HTTP request if user keeps typing
    };
  }, [searchQuery]);

  // Close search dropdown and collapse search bar on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsSearchOpen(false);
        if (!searchQuery.trim()) {
          setIsSearchExpanded(false);
        }
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [searchQuery]);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchOpen(false);
      setIsMobileSearchOpen(false);
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setIsProductsOpen(true);
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setIsProductsOpen(false);
    }, 250); // 250ms grace delay
  };

  useEffect(() => {
    fetch("/api/product-lines")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data))
          setProductLines(data.filter((l) => l.isVisible !== false));
      })
      .catch(() => {});

    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data))
          setCategories(data.filter((c) => c.isVisible !== false));
      })
      .catch(() => {});

    fetch("/api/packs")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setPacks(data);
      })
      .catch(() => {});
  }, []);

  const [isBannerVisible, setIsBannerVisible] = useState(true);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm font-quicksand">
      {isBannerVisible && (
        <div className="bg-gradient-to-r from-yellow-100 via-pink-100 to-sky-100 py-2 px-4 text-center text-xs font-bold text-[#3C2A21] relative flex items-center justify-center">
          <span>
            🎉 Launching{" "}
            <span className="font-extrabold text-pink-600">Kits & Craft</span>
          </span>
          <button
            onClick={() => setIsBannerVisible(false)}
            aria-label="Close announcement banner"
            className="absolute right-3 p-1 rounded-full text-slate-500 hover:text-slate-800 hover:bg-black/5 transition cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Header Container */}
      <div className="container mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between relative">
        <div className="flex items-center space-x-3">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 md:hidden text-gray-700 hover:bg-gray-100 rounded-full"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            {/* <span className="font-extrabold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-pink-600 via-rose-500 to-[#3C2A21] bg-clip-text text-transparent group-hover:opacity-90 transition">
              Kits & Craft
            </span> */}
            <Image
              src="/images/logo.png"
              alt="Logo"
              width={100}
              height={50}
              className="cursor-pointer"
            />
          </Link>
        </div>

        {/* Desktop Navigation with Dynamic Mega-Menu (Mathematically Centered) */}
        <nav className="hidden md:flex items-center space-x-8 font-extrabold text-sm text-[#3C2A21] absolute left-1/2 -translate-x-1/2">
          {/* DYNAMIC PRODUCTS MEGA-MENU */}
          <div
            className="relative"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <Link
              href="/shop"
              className="flex items-center gap-1.5 hover:text-pink-500 py-2 transition"
            >
              <Package className="w-4 h-4 text-pink-500" />
              <span>Products</span>
              <ChevronDown
                className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                  isProductsOpen ? "rotate-180 text-pink-500" : ""
                }`}
              />
            </Link>

            {/* Mega-Menu Dropdown Panel with hover bridge & smooth transition */}
            <div
              className={`absolute top-full -left-4 pt-2 transition-all duration-200 z-50 ${
                productLines.length <= 1 ? "w-[360px]" : "w-[640px]"
              } max-w-[90vw] ${
                isProductsOpen
                  ? "opacity-100 translate-y-0 pointer-events-auto block"
                  : "opacity-0 translate-y-2 pointer-events-none hidden"
              }`}
            >
              <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 p-6">
                <div
                  className={`grid ${
                    productLines.length <= 1
                      ? "grid-cols-1 gap-4"
                      : "grid-cols-2 gap-6"
                  }`}
                >
                  {productLines.map((line) => {
                    const subCats = categories.filter(
                      (c) => c.productLineId === line.id,
                    );
                    return (
                      <div key={line.id} className="space-y-3">
                        <Link
                          href={`/shop?productLineId=${line.id}`}
                          onClick={() => setIsProductsOpen(false)}
                          className="flex items-start space-x-3 pb-3 border-b border-slate-100 group/title"
                        >
                          <span className="text-2xl p-1.5 bg-pink-50 rounded-xl flex-shrink-0">
                            {line.icon || "📦"}
                          </span>
                          <div>
                            <h4 className="font-extrabold text-sm text-slate-800 group-hover/title:text-pink-500 transition">
                              {line.name}
                            </h4>
                            {line.description && (
                              <p className="text-xs font-medium text-slate-400 mt-0.5 leading-snug">
                                {line.description}
                              </p>
                            )}
                          </div>
                        </Link>

                        <div className="space-y-1.5 pl-2">
                          <Link
                            href={`/shop?productLineId=${line.id}`}
                            onClick={() => setIsProductsOpen(false)}
                            className="inline-flex items-center space-x-1 text-xs font-extrabold text-pink-600 hover:text-pink-700 py-1 transition"
                          >
                            <span>View All {line.name}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                          {subCats.map((cat) => (
                            <Link
                              key={cat.id}
                              href={`/shop?category=${encodeURIComponent(cat.name)}`}
                              onClick={() => setIsProductsOpen(false)}
                              className="block text-xs font-semibold text-slate-600 hover:text-pink-600 py-1 transition"
                            >
                              {cat.name}
                            </Link>
                          ))}
                          {packs
                            .filter(
                              (p) =>
                                !p.productLineId || p.productLineId === line.id,
                            )
                            .map((pack) => (
                              <Link
                                key={pack.id}
                                href={`/product/${pack.id}`}
                                onClick={() => setIsProductsOpen(false)}
                                className="block text-xs font-extrabold text-amber-600 hover:text-amber-700 py-1 transition"
                              >
                                🎁 {pack.name}
                              </Link>
                            ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs font-bold text-slate-500 bg-pink-50/60 -mx-6 -mb-6 p-4 px-6 rounded-b-3xl">
                  <span>Mix & Match any items for bulk savings</span>
                  <Link
                    href="/bundles"
                    onClick={() => setIsProductsOpen(false)}
                    className="text-pink-600 hover:text-pink-700 flex items-center space-x-1 font-extrabold shrink-0"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Build Package (10% Off)</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <Link
            href="/shop"
            onMouseEnter={() => {
              if (hoverTimeoutRef.current)
                clearTimeout(hoverTimeoutRef.current);
              setIsProductsOpen(false);
            }}
            className="hover:text-pink-500 transition"
          >
            Shop All
          </Link>
          <Link
            href="/bundles"
            onMouseEnter={() => {
              if (hoverTimeoutRef.current)
                clearTimeout(hoverTimeoutRef.current);
              setIsProductsOpen(false);
            }}
            className="hover:text-pink-500 transition text-pink-600 flex items-center space-x-1"
          >
            <Sparkles className="w-4 h-4" />
            <span>Build Package</span>
          </Link>
        </nav>

        {/* Utility Icons */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Interactive Expanding Search Bar & Dropdown */}
          <div ref={searchContainerRef} className="relative flex items-center">
            {/* Desktop Smooth Expanding Search Bar */}
            <div className="hidden md:flex items-center">
              <AnimatePresence initial={false} mode="wait">
                {!isSearchExpanded && !searchQuery ? (
                  <motion.button
                    key="search-icon-btn"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.15 }}
                    onClick={() => {
                      setIsSearchExpanded(true);
                      setIsSearchOpen(true);
                      setTimeout(
                        () => desktopSearchInputRef.current?.focus(),
                        50,
                      );
                    }}
                    aria-label="Search"
                    className="p-2 hover:bg-slate-100 rounded-full text-slate-700 transition flex items-center justify-center cursor-pointer"
                  >
                    <Search className="w-5 h-5 text-slate-700" />
                  </motion.button>
                ) : (
                  <motion.form
                    key="search-input-form"
                    initial={{ width: 40, opacity: 0 }}
                    animate={{ width: 240, opacity: 1 }}
                    exit={{ width: 40, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 350, damping: 26 }}
                    onSubmit={handleSearchSubmit}
                    className="flex items-center bg-slate-100/90 border border-slate-200/80 rounded-full px-3 py-1.5 focus-within:bg-white focus-within:border-pink-500 focus-within:ring-4 focus-within:ring-pink-500/10 shadow-2xs group"
                  >
                    <Search className="w-4 h-4 text-slate-400 shrink-0 mr-2 group-focus-within:text-pink-500 transition" />
                    <input
                      ref={desktopSearchInputRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setIsSearchOpen(true);
                      }}
                      onFocus={() => setIsSearchOpen(true)}
                      onKeyDown={(e) => {
                        if (e.key === "Escape") {
                          setIsSearchOpen(false);
                          if (!searchQuery) setIsSearchExpanded(false);
                        }
                      }}
                      placeholder="Search products, themes..."
                      className="bg-transparent text-xs font-bold text-slate-800 placeholder-slate-400 outline-none w-full"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (searchQuery) {
                          setSearchQuery("");
                        } else {
                          setIsSearchExpanded(false);
                          setIsSearchOpen(false);
                        }
                      }}
                      className="p-0.5 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-600 transition shrink-0 ml-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile Search Toggle Icon */}
            <button
              onClick={() => {
                setIsMobileSearchOpen(!isMobileSearchOpen);
                setIsSearchOpen(true);
                setTimeout(() => mobileSearchInputRef.current?.focus(), 100);
              }}
              aria-label="Toggle Search"
              className="md:hidden p-2 hover:bg-gray-100 rounded-full text-gray-700 transition"
            >
              <Search className="w-5 h-5 text-slate-700" />
            </button>

            {/* Desktop Live Search Suggestions Dropdown Overlay */}
            <div className="hidden md:block">
              <AnimatePresence>
                {isSearchOpen && searchQuery.trim().length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 5, scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full right-0 mt-2 w-[340px] bg-white rounded-3xl shadow-2xl border border-slate-100/90 p-3.5 z-[100] overflow-hidden text-left"
                  >
                    {isSearchLoading ? (
                      <div className="flex items-center justify-center py-6 space-x-2 text-slate-400">
                        <Loader2 className="w-5 h-5 animate-spin text-pink-500" />
                        <span className="text-xs font-bold">
                          Searching catalog...
                        </span>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1 no-scrollbar">
                        {/* Matching Products Section */}
                        {searchResults.products.length > 0 && (
                          <div>
                            <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-2 mb-1.5 flex items-center justify-between">
                              <span>Products</span>
                              <span>{searchResults.products.length} found</span>
                            </div>
                            <div className="space-y-1">
                              {searchResults.products.map((item) => (
                                <Link
                                  key={item.id}
                                  href={`/product/${item.id}`}
                                  onClick={() => {
                                    setIsSearchOpen(false);
                                    setIsMobileSearchOpen(false);
                                    setSearchQuery("");
                                  }}
                                  className="flex items-center space-x-3 p-2 rounded-2xl hover:bg-pink-50/70 transition group cursor-pointer"
                                >
                                  <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-11 h-11 rounded-xl object-cover border border-slate-100 shrink-0 bg-slate-50"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                      <h4 className="text-xs font-extrabold text-slate-800 group-hover:text-pink-600 truncate transition">
                                        {item.name}
                                      </h4>
                                      {item.theme && (
                                        <span className="px-1.5 py-0.2 bg-slate-100 text-slate-500 rounded text-[9px] font-bold shrink-0 ml-1">
                                          {item.theme}
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex items-center space-x-2 mt-0.5">
                                      <span className="text-xs font-black text-slate-900">
                                        ₹{item.price.toFixed(2)}
                                      </span>
                                      {item.originalPrice &&
                                        item.originalPrice > item.price && (
                                          <span className="text-[10px] text-slate-400 line-through">
                                            ₹{item.originalPrice.toFixed(2)}
                                          </span>
                                        )}
                                    </div>
                                  </div>
                                </Link>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Matching Themes & Categories Section */}
                        {(searchResults.themes.length > 0 ||
                          searchResults.categories.length > 0) && (
                          <div className="pt-2 border-t border-slate-100">
                            <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-2 mb-1.5">
                              Themes & Categories
                            </div>
                            <div className="flex flex-wrap gap-1.5 px-1">
                              {searchResults.themes.map((t) => (
                                <Link
                                  key={t.id}
                                  href={`/shop?theme=${encodeURIComponent(t.name)}`}
                                  onClick={() => {
                                    setIsSearchOpen(false);
                                    setIsMobileSearchOpen(false);
                                    setSearchQuery("");
                                  }}
                                  className="px-2.5 py-1 rounded-full bg-pink-50 text-pink-700 hover:bg-pink-100 border border-pink-100 text-[11px] font-extrabold transition flex items-center space-x-1"
                                >
                                  <span>{t.icon || "🎨"}</span>
                                  <span>{t.name}</span>
                                </Link>
                              ))}
                              {searchResults.categories.map((c) => (
                                <Link
                                  key={c.id}
                                  href={`/shop?category=${encodeURIComponent(c.name)}`}
                                  onClick={() => {
                                    setIsSearchOpen(false);
                                    setIsMobileSearchOpen(false);
                                    setSearchQuery("");
                                  }}
                                  className="px-2.5 py-1 rounded-full bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-100 text-[11px] font-extrabold transition"
                                >
                                  <span>{c.name}</span>
                                </Link>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Empty State */}
                        {searchResults.products.length === 0 &&
                          searchResults.themes.length === 0 &&
                          searchResults.categories.length === 0 && (
                            <div className="py-6 text-center text-slate-500">
                              <p className="text-xs font-bold">
                                No products found for "{searchQuery}"
                              </p>
                              <p className="text-[10px] text-slate-400 mt-1">
                                Try searching for figurines, candles, or themes
                              </p>
                            </div>
                          )}

                        {/* View All Results Button */}
                        <button
                          type="button"
                          onClick={() => handleSearchSubmit()}
                          className="w-full mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-extrabold text-pink-600 hover:text-pink-700 hover:bg-pink-50/50 p-2 rounded-xl transition text-left"
                        >
                          <span>View all results for "{searchQuery}"</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/*  {user ? (
            <div className="relative group">
              <button
                aria-label="User Account"
                className="p-2.5 bg-pink-100 hover:bg-pink-200 rounded-full text-pink-700 transition flex items-center space-x-1 shadow-2xs"
              >
                <UserIcon className="w-5 h-5 text-pink-600" />
                <ChevronDown className="w-3 h-3 text-pink-600 group-hover:rotate-180 transition-transform duration-200" />
              </button>

              {/* User Dropdown Menu 
              <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all duration-200 z-50">
                <div className="px-3 py-2 border-b border-slate-100 mb-1 bg-pink-50/50 rounded-xl">
                  <p className="text-[10px] font-extrabold text-pink-500 uppercase tracking-wider">
                    Signed in as
                  </p>
                  <p className="text-xs font-bold text-slate-800 truncate">
                    {user.name || user.identifier}
                  </p>
                </div>

                <Link
                  href="/account"
                  className="flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-pink-50 hover:text-pink-600 transition"
                >
                  <UserIcon className="w-4 h-4 text-pink-500" />
                  <span>View Account</span>
                </Link>
                <button
                  onClick={logout}
                  className="w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition text-left"
                >
                  <LogOut className="w-4 h-4 text-rose-500" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={openAuth}
              aria-label="Profile"
              className="p-2 hover:bg-gray-100 rounded-full text-gray-700"
            >
              <UserIcon className="w-5 h-5" />
            </button>
          )} */}

          {/* Cart Icon */}
          <div
            onClick={() => setIsCartOpen(true)}
            aria-label="Cart"
            className="relative p-2 hover:bg-gray-100 rounded-full cursor-pointer text-gray-700"
          >
            <ShoppingBag className="w-5 h-5" />
            <span className="absolute top-0 right-0 bg-pink-500 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-extrabold">
              {totalCount}
            </span>
          </div>
        </div>
      </div>

      {/* Mobile Expandable Search Bar Overlay */}
      <AnimatePresence>
        {isMobileSearchOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-b border-slate-100 bg-white/95 backdrop-blur-md px-4 py-2.5 z-40 relative"
          >
            <form
              onSubmit={handleSearchSubmit}
              className="flex items-center space-x-2"
            >
              <div className="flex-1 flex items-center bg-slate-100 rounded-full px-3.5 py-2 border border-slate-200/80 focus-within:bg-white focus-within:border-pink-500 focus-within:ring-2 focus-within:ring-pink-500/20">
                <Search className="w-4 h-4 text-slate-400 shrink-0 mr-2" />
                <input
                  ref={mobileSearchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setIsSearchOpen(true);
                  }}
                  placeholder="Search products, themes..."
                  className="bg-transparent text-xs font-bold text-slate-800 placeholder-slate-400 outline-none w-full"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="p-0.5 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsMobileSearchOpen(false);
                  setIsSearchOpen(false);
                }}
                className="text-xs font-extrabold text-slate-500 hover:text-slate-800 px-2 py-1"
              >
                Cancel
              </button>
            </form>

            {/* Mobile Live Search Suggestions Dropdown Overlay (Glued to Mobile Search Box) */}
            <AnimatePresence>
              {isSearchOpen && searchQuery.trim().length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full left-3 right-3 mt-2 bg-white rounded-3xl shadow-2xl border border-slate-100/90 p-3.5 z-[100] overflow-hidden text-left"
                >
                  {isSearchLoading ? (
                    <div className="flex items-center justify-center py-6 space-x-2 text-slate-400">
                      <Loader2 className="w-5 h-5 animate-spin text-pink-500" />
                      <span className="text-xs font-bold">
                        Searching catalog...
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1 no-scrollbar">
                      {/* Matching Products Section */}
                      {searchResults.products.length > 0 && (
                        <div>
                          <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-2 mb-1.5 flex items-center justify-between">
                            <span>Products</span>
                            <span>{searchResults.products.length} found</span>
                          </div>
                          <div className="space-y-1">
                            {searchResults.products.map((item) => (
                              <Link
                                key={item.id}
                                href={`/product/${item.id}`}
                                onClick={() => {
                                  setIsSearchOpen(false);
                                  setIsMobileSearchOpen(false);
                                  setSearchQuery("");
                                }}
                                className="flex items-center space-x-3 p-2 rounded-2xl hover:bg-pink-50/70 transition group cursor-pointer"
                              >
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-11 h-11 rounded-xl object-cover border border-slate-100 shrink-0 bg-slate-50"
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between">
                                    <h4 className="text-xs font-extrabold text-slate-800 group-hover:text-pink-600 truncate transition">
                                      {item.name}
                                    </h4>
                                    {item.theme && (
                                      <span className="px-1.5 py-0.2 bg-slate-100 text-slate-500 rounded text-[9px] font-bold shrink-0 ml-1">
                                        {item.theme}
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center space-x-2 mt-0.5">
                                    <span className="text-xs font-black text-slate-900">
                                      ₹{item.price.toFixed(2)}
                                    </span>
                                    {item.originalPrice &&
                                      item.originalPrice > item.price && (
                                        <span className="text-[10px] text-slate-400 line-through">
                                          ₹{item.originalPrice.toFixed(2)}
                                        </span>
                                      )}
                                  </div>
                                </div>
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Matching Themes & Categories Section */}
                      {(searchResults.themes.length > 0 ||
                        searchResults.categories.length > 0) && (
                        <div className="pt-2 border-t border-slate-100">
                          <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-2 mb-1.5">
                            Themes & Categories
                          </div>
                          <div className="flex flex-wrap gap-1.5 px-1">
                            {searchResults.themes.map((t) => (
                              <Link
                                key={t.id}
                                href={`/shop?theme=${encodeURIComponent(t.name)}`}
                                onClick={() => {
                                  setIsSearchOpen(false);
                                  setIsMobileSearchOpen(false);
                                  setSearchQuery("");
                                }}
                                className="px-2.5 py-1 rounded-full bg-pink-50 text-pink-700 hover:bg-pink-100 border border-pink-100 text-[11px] font-extrabold transition flex items-center space-x-1"
                              >
                                <span>{t.icon || "🎨"}</span>
                                <span>{t.name}</span>
                              </Link>
                            ))}
                            {searchResults.categories.map((c) => (
                              <Link
                                key={c.id}
                                href={`/shop?category=${encodeURIComponent(c.name)}`}
                                onClick={() => {
                                  setIsSearchOpen(false);
                                  setIsMobileSearchOpen(false);
                                  setSearchQuery("");
                                }}
                                className="px-2.5 py-1 rounded-full bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-100 text-[11px] font-extrabold transition"
                              >
                                <span>{c.name}</span>
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Empty State */}
                      {searchResults.products.length === 0 &&
                        searchResults.themes.length === 0 &&
                        searchResults.categories.length === 0 && (
                          <div className="py-6 text-center text-slate-500">
                            <p className="text-xs font-bold">
                              No products found for "{searchQuery}"
                            </p>
                            <p className="text-[10px] text-slate-400 mt-1">
                              Try searching for figurines, candles, or themes
                            </p>
                          </div>
                        )}

                      {/* View All Results Button */}
                      <button
                        type="button"
                        onClick={() => handleSearchSubmit()}
                        className="w-full mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-extrabold text-pink-600 hover:text-pink-700 hover:bg-pink-50/50 p-2 rounded-xl transition text-left"
                      >
                        <span>View all results for "{searchQuery}"</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Accordion Menu with Smooth Animated Slide Dropdown */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="md:hidden border-t border-slate-100 bg-white overflow-hidden"
          >
            <div className="px-6 py-4 space-y-4">
              <div className="space-y-3">
                <p className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                  Product Categories
                </p>
                {productLines.map((line) => {
                  const subCats = categories.filter(
                    (c) => c.productLineId === line.id,
                  );
                  return (
                    <div
                      key={line.id}
                      className="space-y-1 pl-2 border-l-2 border-pink-200"
                    >
                      <Link
                        href={`/shop?productLineId=${line.id}`}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="font-bold text-sm text-slate-800 flex items-center space-x-2"
                      >
                        <span>{line.icon || "📦"}</span>
                        <span>{line.name}</span>
                      </Link>
                      {subCats.map((cat) => (
                        <Link
                          key={cat.id}
                          href={`/shop?category=${encodeURIComponent(cat.name)}`}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="block text-xs font-semibold text-slate-500 pl-6 py-1 hover:text-pink-600 transition"
                        >
                          {cat.name}
                        </Link>
                      ))}
                    </div>
                  );
                })}
              </div>

              <div className="pt-2 border-t border-slate-100 flex flex-col space-y-2 font-bold text-xs">
                <Link
                  href="/shop"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="py-2 text-slate-700 hover:text-pink-600 transition"
                >
                  Shop All Products
                </Link>
                <Link
                  href="/bundles"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="py-2 text-pink-600 flex items-center space-x-1 hover:text-pink-700 transition"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Build Package (10% Off)</span>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
