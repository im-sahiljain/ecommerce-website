'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Search, User as UserIcon, Heart, ShoppingBag, ChevronDown, LogOut } from 'lucide-react';

export default function Navbar() {
  const { totalCount, setIsCartOpen } = useCart();
  const { user, openAuth, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm font-quicksand">
      {/* Announcement Banner */}
      <div className="bg-yellow-100 py-2 text-center text-sm font-semibold text-[#3C2A21]">
        Free shipping on all Party Packs! 🎉 Use code <span className="font-bold">CREATIVEKIDS</span> at checkout.
      </div>

      {/* Main Header Container */}
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuB_UQUMwLrsnDMCn3_g3cToAVSI3k4qukosF44ecbU05eSe91otMhXSkPxDTBzsC4MhKORdnU2q61582CqZP3irVG3T33y7di3j99Z2cpQdYg6YqjMy3LRdCtCecGKFnZb7OI-AHJitGYfIx2Tg_xI8dkjOAuMGesnUaCQpfpP_JKRlFMv-JnZP9sDnSt5DVJn1mwC5h__mkiCVEkcgQhMx1H9zROXqzzoQQHNYsQwWXeYJjtuwVTX-1Os30Si01k240O0t6CRMoqM"
            onError={(e: any) => { e.target.src = 'https://placehold.co/150x50?text=Little+Creators'; }}
            alt="Little Creators Logo"
            className="h-10 w-auto"
          />
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-8 font-medium text-sm lg:text-base text-[#3C2A21]">
          <div className="relative group cursor-pointer flex items-center gap-1 hover:text-blue-500 py-1">
            <span>Shop by Theme</span>
            <ChevronDown className="w-4 h-4 text-gray-400 group-hover:rotate-180 transition transform" />
            <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 hidden group-hover:block animate-in fade-in zoom-in-95 duration-150">
              <Link href="/shop?theme=Space Adventures" className="block px-4 py-2.5 hover:bg-blue-50 rounded-xl text-xs font-semibold text-gray-700">🚀 Space Adventures</Link>
              <Link href="/shop?theme=Secret Garden (Floral)" className="block px-4 py-2.5 hover:bg-blue-50 rounded-xl text-xs font-semibold text-gray-700">🌸 Secret Garden (Floral)</Link>
              <Link href="/shop?theme=Fairytale Magic" className="block px-4 py-2.5 hover:bg-blue-50 rounded-xl text-xs font-semibold text-gray-700">🦄 Fairytale Magic</Link>
              <Link href="/shop?theme=Wild Kingdom" className="block px-4 py-2.5 hover:bg-blue-50 rounded-xl text-xs font-semibold text-gray-700">🦁 Wild Kingdom</Link>
            </div>
          </div>

          <Link href="/shop?ageGroup=Ages 4+" className="hover:text-blue-500 transition">Age Group</Link>
          <Link href="/shop?category=Party Packs" className="hover:text-blue-500 transition">Party Packs</Link>
          <Link href="/shop?category=New Arrivals" className="hover:text-blue-500 transition">New Arrivals</Link>
        </nav>

        {/* Utility Icons */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          <button aria-label="Search" className="p-2 hover:bg-gray-100 rounded-full text-gray-700">
            <Search className="w-6 h-6" />
          </button>

          {user ? (
            <div className="flex items-center space-x-2">
              <Link
                href="/account"
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-100 hover:bg-blue-200 rounded-full text-xs font-bold text-[#3C2A21] transition"
              >
                <UserIcon className="w-4 h-4 text-blue-600" />
                <span className="max-w-24 truncate">{user.name || user.identifier}</span>
              </Link>
              <button
                onClick={logout}
                title="Logout"
                className="p-1.5 text-gray-400 hover:text-red-500 transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={openAuth}
              aria-label="Profile"
              className="p-2 hover:bg-gray-100 rounded-full text-gray-700"
            >
              <UserIcon className="w-6 h-6" />
            </button>
          )}

          <button aria-label="Wishlist" className="p-2 hover:bg-gray-100 rounded-full text-gray-700 hidden sm:block">
            <Heart className="w-6 h-6" />
          </button>

          {/* Cart Icon */}
          <div
            onClick={() => setIsCartOpen(true)}
            aria-label="Cart"
            className="relative p-2 hover:bg-gray-100 rounded-full cursor-pointer text-gray-700"
          >
            <ShoppingBag className="w-6 h-6" />
            <span className="absolute top-0 right-0 bg-yellow-600 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-bold">
              {totalCount}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
