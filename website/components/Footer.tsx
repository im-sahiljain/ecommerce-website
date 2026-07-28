"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { API_BASE_URL } from "../config/api";

interface ThemeItem {
  id: string;
  name: string;
  slug: string;
  isVisible?: boolean;
}

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  isVisible?: boolean;
}

export default function Footer() {
  const [themes, setThemes] = useState<ThemeItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/themes`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setThemes(data.filter((t) => t.isVisible !== false));
        }
      })
      .catch(() => {});

    fetch(`${API_BASE_URL}/api/categories`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCategories(data.filter((c) => c.isVisible !== false));
        }
      })
      .catch(() => {});
  }, []);

  return (
    <footer className="bg-white pt-16 pb-8 border-t border-gray-100 font-quicksand">
      <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
        <div>
          <h3 className="font-bold text-xl mb-4 text-[#3C2A21]">
            Kits and Craft
          </h3>
          <p className="text-gray-500 text-sm leading-relaxed max-w-sm">
            Sparking joy through painting kits. Safe, fun, and creative plaster kits for kids.
          </p>
        </div>

        <div>
          <h4 className="font-bold mb-4 text-[#3C2A21]">Themes</h4>
          <ul className="text-gray-500 text-sm space-y-2">
            {themes.length > 0 ? (
              themes.map((t) => (
                <li key={t.id}>
                  <Link
                    href={`/shop?theme=${encodeURIComponent(t.name)}`}
                    className="hover:text-[#3C2A21] transition"
                  >
                    {t.name}
                  </Link>
                </li>
              ))
            ) : (
              <>
                <li>
                  <Link href="/shop" className="hover:text-[#3C2A21] transition">
                    Wild Kingdom
                  </Link>
                </li>
                <li>
                  <Link href="/shop" className="hover:text-[#3C2A21] transition">
                    Secret Garden
                  </Link>
                </li>
                <li>
                  <Link href="/shop" className="hover:text-[#3C2A21] transition">
                    Little Friends
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>

        <div>
          <h4 className="font-bold mb-4 text-[#3C2A21]">Categories</h4>
          <ul className="text-gray-500 text-sm space-y-2">
            {categories.length > 0 ? (
              categories.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/shop?category=${encodeURIComponent(c.name)}`}
                    className="hover:text-[#3C2A21] transition"
                  >
                    {c.name}
                  </Link>
                </li>
              ))
            ) : (
              <>
                <li>
                  <Link href="/shop" className="hover:text-[#3C2A21] transition">
                    Single Pieces
                  </Link>
                </li>
                <li>
                  <Link href="/shop" className="hover:text-[#3C2A21] transition">
                    Party Packs
                  </Link>
                </li>
                <li>
                  <Link href="/shop" className="hover:text-[#3C2A21] transition">
                    All Kits
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>

      <div className="container mx-auto px-6 pt-8 border-t border-gray-50 text-center md:text-left">
        <p className="text-gray-400 text-xs">
          © 2024 Kits and Craft. Sparking joy through painting kits.
        </p>
      </div>
    </footer>
  );
}
