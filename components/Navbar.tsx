"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCart } from "../context/CartContext";
// import { useAuth } from "../context/AuthContext";
import {
  Search,
  ShoppingBag,
  ChevronDown,
  Home,
  Sparkles,
  Menu,
  X,
  ArrowRight,
  Loader2,
} from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";
import { productPath } from "@/lib/site";
import Image from "next/image";

function navItemClass(active: boolean) {
  return `transition ${active ? "text-primary" : "hover:text-primary"}`;
}

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname() || "/";
  const onHome = pathname === "/";
  const onOffers = pathname === "/offers" || pathname.startsWith("/offers/");
  const { totalCount, setIsCartOpen } = useCart();
  // const { user, openAuth, logout } = useAuth();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
      router.push(`/?search=${encodeURIComponent(searchQuery.trim())}#catalog`);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-xs font-quicksand">
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
            {/* <span className="font-extrabold text-lg sm:text-xl tracking-tight bg-linear-to-r from-primary via-danger-500 to-secondary bg-clip-text text-transparent group-hover:opacity-90 transition">
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
        <nav className="hidden md:flex items-center space-x-8 font-extrabold text-sm text-secondary absolute left-1/2 -translate-x-1/2">
          <Link
            href="/"
            className={`flex items-center gap-1.5 ${navItemClass(onHome)}`}
            aria-current={onHome ? "page" : undefined}
          >
            <Home className="w-4 h-4" />
            <span>Home</span>
          </Link>
          <Link
            href="/offers"
            className={`${navItemClass(onOffers)} flex items-center space-x-1`}
            aria-current={onOffers ? "page" : undefined}
          >
            <Sparkles className="w-4 h-4" />
            <span>Offers</span>
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
                    className="p-2 hover:bg-neutral-100 rounded-full text-neutral-700 transition flex items-center justify-center cursor-pointer"
                  >
                    <Search className="w-5 h-5 text-neutral-700" />
                  </motion.button>
                ) : (
                  <motion.form
                    key="search-input-form"
                    initial={{ width: 40, opacity: 0 }}
                    animate={{ width: 240, opacity: 1 }}
                    exit={{ width: 40, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 350, damping: 26 }}
                    onSubmit={handleSearchSubmit}
                    className="flex items-center bg-neutral-100/90 border border-neutral-200/80 rounded-full px-3 py-1.5 focus-within:bg-white focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10 shadow-2xs group"
                  >
                    <Search className="w-4 h-4 text-neutral-400 shrink-0 mr-2 group-focus-within:text-primary transition" />
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
                      className="bg-transparent text-xs font-bold text-neutral-800 placeholder-neutral-400 outline-hidden w-full"
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
                      className="p-0.5 hover:bg-neutral-200 rounded-full text-neutral-400 hover:text-neutral-600 transition shrink-0 ml-1"
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
              <Search className="w-5 h-5 text-neutral-700" />
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
                    className="absolute top-full right-0 mt-2 w-[340px] bg-white rounded-3xl shadow-2xl border border-neutral-100/90 p-3.5 z-100 overflow-hidden text-left"
                  >
                    {isSearchLoading ? (
                      <div className="flex items-center justify-center py-6 space-x-2 text-neutral-400">
                        <Loader2 className="w-5 h-5 animate-spin text-primary" />
                        <span className="text-xs font-bold">
                          Searching catalog...
                        </span>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1 no-scrollbar">
                        {/* Matching Products Section */}
                        {searchResults.products.length > 0 && (
                          <div>
                            <div className="text-[10px] font-black uppercase tracking-wider text-neutral-400 px-2 mb-1.5 flex items-center justify-between">
                              <span>Products</span>
                              <span>{searchResults.products.length} found</span>
                            </div>
                            <div className="space-y-1">
                              {searchResults.products.map((item) => (
                                <Link
                                  key={item.id}
                                  href={productPath(item)}
                                  onClick={() => {
                                    setIsSearchOpen(false);
                                    setIsMobileSearchOpen(false);
                                    setSearchQuery("");
                                  }}
                                  className="flex items-center space-x-3 p-2 rounded-2xl hover:bg-primary/5 transition group cursor-pointer"
                                >
                                  <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-11 h-11 rounded-xl object-cover border border-neutral-100 shrink-0 bg-neutral-50"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                      <h4 className="text-xs font-extrabold text-neutral-800 group-hover:text-primary truncate transition">
                                        {item.name}
                                      </h4>
                                      {item.theme && (
                                        <span className="px-1.5 py-0.2 bg-neutral-100 text-neutral-500 rounded-sm text-[9px] font-bold shrink-0 ml-1">
                                          {item.theme}
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex items-center space-x-2 mt-0.5">
                                      <span className="text-xs font-black text-neutral-900">
                                        ₹{item.price.toFixed(2)}
                                      </span>
                                      {item.originalPrice &&
                                        item.originalPrice > item.price && (
                                          <span className="text-[10px] text-neutral-400 line-through">
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
                          <div className="pt-2 border-t border-neutral-100">
                            <div className="text-[10px] font-black uppercase tracking-wider text-neutral-400 px-2 mb-1.5">
                              Themes & Categories
                            </div>
                            <div className="flex flex-wrap gap-1.5 px-1">
                              {searchResults.themes.map((t) => (
                                <Link
                                  key={t.id}
                                  href={`/?theme=${encodeURIComponent(t.name)}#catalog`}
                                  onClick={() => {
                                    setIsSearchOpen(false);
                                    setIsMobileSearchOpen(false);
                                    setSearchQuery("");
                                  }}
                                  className="px-2.5 py-1 rounded-full bg-primary/10 text-primary hover:bg-primary/15 border border-primary/15 text-[11px] font-extrabold transition flex items-center space-x-1"
                                >
                                  <span>{t.icon || "🎨"}</span>
                                  <span>{t.name}</span>
                                </Link>
                              ))}
                              {searchResults.categories.map((c) => (
                                <Link
                                  key={c.id}
                                  href={`/?category=${encodeURIComponent(c.name)}#catalog`}
                                  onClick={() => {
                                    setIsSearchOpen(false);
                                    setIsMobileSearchOpen(false);
                                    setSearchQuery("");
                                  }}
                                  className="px-2.5 py-1 rounded-full bg-info-50 text-info-700 hover:bg-info-100 border border-info-100 text-[11px] font-extrabold transition"
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
                            <div className="py-6 text-center text-neutral-500">
                              <p className="text-xs font-bold">
                                No products found for "{searchQuery}"
                              </p>
                              <p className="text-[10px] text-neutral-400 mt-1">
                                Try searching for figurines, candles, or themes
                              </p>
                            </div>
                          )}

                        {/* View All Results Button */}
                        <button
                          type="button"
                          onClick={() => handleSearchSubmit()}
                          className="w-full mt-2 pt-2 border-t border-neutral-100 flex items-center justify-between text-xs font-extrabold text-primary hover:text-primary hover:bg-primary/5 p-2 rounded-xl transition text-left"
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
                className="p-2.5 bg-primary/15 hover:bg-primary/25 rounded-full text-primary transition flex items-center space-x-1 shadow-2xs"
              >
                <UserIcon className="w-5 h-5 text-primary" />
                <ChevronDown className="w-3 h-3 text-primary group-hover:rotate-180 transition-transform duration-200" />
              </button>

              {/* User Dropdown Menu 
              <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border border-neutral-100 p-2 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all duration-200 z-50">
                <div className="px-3 py-2 border-b border-neutral-100 mb-1 bg-primary/5 rounded-xl">
                  <p className="text-[10px] font-extrabold text-primary uppercase tracking-wider">
                    Signed in as
                  </p>
                  <p className="text-xs font-bold text-neutral-800 truncate">
                    {user.name || user.identifier}
                  </p>
                </div>

                <Link
                  href="/account"
                  className="flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-neutral-700 hover:bg-primary/10 hover:text-primary transition"
                >
                  <UserIcon className="w-4 h-4 text-primary" />
                  <span>View Account</span>
                </Link>
                <button
                  onClick={logout}
                  className="w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-danger-600 hover:bg-danger-50 transition text-left"
                >
                  <LogOut className="w-4 h-4 text-danger-500" />
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
            <span className="absolute top-0 right-0 bg-primary text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-extrabold">
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
            className="md:hidden border-t border-b border-neutral-100 bg-white/95 backdrop-blur-md px-4 py-2.5 z-40 relative"
          >
            <form
              onSubmit={handleSearchSubmit}
              className="flex items-center space-x-2"
            >
              <div className="flex-1 flex items-center bg-neutral-100 rounded-full px-3.5 py-2 border border-neutral-200/80 focus-within:bg-white focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
                <Search className="w-4 h-4 text-neutral-400 shrink-0 mr-2" />
                <input
                  ref={mobileSearchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setIsSearchOpen(true);
                  }}
                  placeholder="Search products, themes..."
                  className="bg-transparent text-xs font-bold text-neutral-800 placeholder-neutral-400 outline-hidden w-full"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="p-0.5 text-neutral-400 hover:text-neutral-600"
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
                className="text-xs font-extrabold text-neutral-500 hover:text-neutral-800 px-2 py-1"
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
                  className="absolute top-full left-3 right-3 mt-2 bg-white rounded-3xl shadow-2xl border border-neutral-100/90 p-3.5 z-100 overflow-hidden text-left"
                >
                  {isSearchLoading ? (
                    <div className="flex items-center justify-center py-6 space-x-2 text-neutral-400">
                      <Loader2 className="w-5 h-5 animate-spin text-primary" />
                      <span className="text-xs font-bold">
                        Searching catalog...
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1 no-scrollbar">
                      {/* Matching Products Section */}
                      {searchResults.products.length > 0 && (
                        <div>
                          <div className="text-[10px] font-black uppercase tracking-wider text-neutral-400 px-2 mb-1.5 flex items-center justify-between">
                            <span>Products</span>
                            <span>{searchResults.products.length} found</span>
                          </div>
                          <div className="space-y-1">
                            {searchResults.products.map((item) => (
                              <Link
                                key={item.id}
                                href={productPath(item)}
                                onClick={() => {
                                  setIsSearchOpen(false);
                                  setIsMobileSearchOpen(false);
                                  setSearchQuery("");
                                }}
                                className="flex items-center space-x-3 p-2 rounded-2xl hover:bg-primary/5 transition group cursor-pointer"
                              >
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-11 h-11 rounded-xl object-cover border border-neutral-100 shrink-0 bg-neutral-50"
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between">
                                    <h4 className="text-xs font-extrabold text-neutral-800 group-hover:text-primary truncate transition">
                                      {item.name}
                                    </h4>
                                    {item.theme && (
                                      <span className="px-1.5 py-0.2 bg-neutral-100 text-neutral-500 rounded-sm text-[9px] font-bold shrink-0 ml-1">
                                        {item.theme}
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center space-x-2 mt-0.5">
                                    <span className="text-xs font-black text-neutral-900">
                                      ₹{item.price.toFixed(2)}
                                    </span>
                                    {item.originalPrice &&
                                      item.originalPrice > item.price && (
                                        <span className="text-[10px] text-neutral-400 line-through">
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
                        <div className="pt-2 border-t border-neutral-100">
                          <div className="text-[10px] font-black uppercase tracking-wider text-neutral-400 px-2 mb-1.5">
                            Themes & Categories
                          </div>
                          <div className="flex flex-wrap gap-1.5 px-1">
                            {searchResults.themes.map((t) => (
                              <Link
                                key={t.id}
                                href={`/?theme=${encodeURIComponent(t.name)}#catalog`}
                                onClick={() => {
                                  setIsSearchOpen(false);
                                  setIsMobileSearchOpen(false);
                                  setSearchQuery("");
                                }}
                                className="px-2.5 py-1 rounded-full bg-primary/10 text-primary hover:bg-primary/15 border border-primary/15 text-[11px] font-extrabold transition flex items-center space-x-1"
                              >
                                <span>{t.icon || "🎨"}</span>
                                <span>{t.name}</span>
                              </Link>
                            ))}
                            {searchResults.categories.map((c) => (
                              <Link
                                key={c.id}
                                href={`/?category=${encodeURIComponent(c.name)}#catalog`}
                                onClick={() => {
                                  setIsSearchOpen(false);
                                  setIsMobileSearchOpen(false);
                                  setSearchQuery("");
                                }}
                                className="px-2.5 py-1 rounded-full bg-info-50 text-info-700 hover:bg-info-100 border border-info-100 text-[11px] font-extrabold transition"
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
                          <div className="py-6 text-center text-neutral-500">
                            <p className="text-xs font-bold">
                              No products found for "{searchQuery}"
                            </p>
                            <p className="text-[10px] text-neutral-400 mt-1">
                              Try searching for figurines, candles, or themes
                            </p>
                          </div>
                        )}

                      {/* View All Results Button */}
                      <button
                        type="button"
                        onClick={() => handleSearchSubmit()}
                        className="w-full mt-2 pt-2 border-t border-neutral-100 flex items-center justify-between text-xs font-extrabold text-primary hover:text-primary hover:bg-primary/5 p-2 rounded-xl transition text-left"
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
            className="md:hidden border-t border-neutral-100 bg-white overflow-hidden"
          >
            <div className="px-6 py-4 space-y-4">
              <Link
                href="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-1.5 py-2 font-bold text-sm transition ${onHome ? "text-primary" : "text-neutral-800 hover:text-primary"}`}
                aria-current={onHome ? "page" : undefined}
              >
                <Home className="w-4 h-4" />
                <span>Home</span>
              </Link>
              <div className="pt-2 border-t border-neutral-100 flex flex-col space-y-2 font-bold text-xs">
                <Link
                  href="/offers"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`py-2 flex items-center space-x-1 transition ${onOffers ? "text-primary" : "text-black hover:text-primary"}`}
                  aria-current={onOffers ? "page" : undefined}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Offers</span>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
