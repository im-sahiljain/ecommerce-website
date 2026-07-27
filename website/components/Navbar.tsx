"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
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
} from "lucide-react";

import { API_BASE_URL } from "../config/api";

interface ProductLine {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  description?: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  productLineId?: string;
}

export default function Navbar() {
  const { totalCount, setIsCartOpen } = useCart();
  const { user, openAuth, logout } = useAuth();

  const [productLines, setProductLines] = useState<ProductLine[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [packs, setPacks] = useState<any[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProductsOpen, setIsProductsOpen] = useState(false);

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
    fetch(`${API_BASE_URL}/api/product-lines`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setProductLines(data);
      })
      .catch(() => {});

    fetch(`${API_BASE_URL}/api/categories`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setCategories(data);
      })
      .catch(() => {});

    fetch(`${API_BASE_URL}/api/packs`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setPacks(data);
      })
      .catch(() => {});
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm font-quicksand">
      <div className="bg-gradient-to-r from-yellow-100 via-pink-100 to-sky-100 py-2 text-center text-xs font-bold text-[#3C2A21]">
        {/* ✨ Unleash Creative Magic with <span className="font-extrabold text-pink-600">Kits & Craft</span>! Free Shipping on plaster shape painting sets & soy candles over ₹499! 🎨🚚 */}
        🎉 Launching{" "}
        <span className="font-extrabold text-pink-600">Kits & Craft </span>
      </div>

      {/* Main Header Container */}
      <div className="container mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
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
            <span className="font-extrabold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-pink-600 via-rose-500 to-[#3C2A21] bg-clip-text text-transparent group-hover:opacity-90 transition">
              Kits & Craft
            </span>
          </Link>
        </div>

        {/* Desktop Navigation with Dynamic Mega-Menu */}
        <nav className="hidden md:flex items-center space-x-8 font-extrabold text-sm text-[#3C2A21]">
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
                            className="inline-flex items-center text-xs font-extrabold text-pink-600 hover:text-pink-700 py-1 transition"
                          >
                            View All {line.name} →
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
                                href={`/shop?packId=${pack.id}`}
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
          {/* <Link
            href="/shop"
            aria-label="Search"
            className="p-2 hover:bg-gray-100 rounded-full text-gray-700"
          >
            <Search className="w-5 h-5" />
          </Link>

          {user ? (
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

      {/* Mobile Accordion Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-6 py-4 space-y-4 animate-in slide-in-from-top duration-200">
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
                    <span>{line.icon}</span>
                    <span>{line.name}</span>
                  </Link>
                  {subCats.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/shop?category=${encodeURIComponent(cat.name)}`}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block text-xs font-semibold text-slate-500 pl-6 py-1"
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
              className="py-2 text-slate-700"
            >
              Shop All Products
            </Link>
            <Link
              href="/bundles"
              onClick={() => setIsMobileMenuOpen(false)}
              className="py-2 text-pink-600 flex items-center space-x-1"
            >
              <Sparkles className="w-4 h-4" />
              <span>Build Package (10% Off)</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
