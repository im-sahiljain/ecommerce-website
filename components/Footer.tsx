"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

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

function categoryShopHref(_cat: { name: string; slug?: string }) {
  return "/#catalog";
}

type FooterLink = { key: string; href: string; label: string };

const fallbackThemes: FooterLink[] = [
  { key: "wild-kingdom", href: "/#catalog", label: "Wild Kingdom" },
  { key: "secret-garden", href: "/#catalog", label: "Secret Garden" },
  { key: "little-friends", href: "/#catalog", label: "Little Friends" },
];

const fallbackCategories: FooterLink[] = [
  { key: "single-pieces", href: "/#catalog", label: "Single Pieces" },
  { key: "party-packs", href: "/#catalog", label: "Party Kits" },
  { key: "all-kits", href: "/#catalog", label: "All Kits" },
];

const linkClassName = "hover:text-primary transition";

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: FooterLink[];
}) {
  return (
    <div>
      <h4 className="font-bold mb-4 text-secondary">{title}</h4>
      <ul className="text-gray-500 text-sm space-y-2">
        {links.map((link) => (
          <li key={link.key}>
            <Link href={link.href} className={linkClassName}>
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Footer() {
  const [themes, setThemes] = useState<ThemeItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);

  useEffect(() => {
    fetch("/api/themes")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setThemes(data.filter((t) => t.isVisible !== false));
        }
      })
      .catch(() => {});

    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCategories(data.filter((c) => c.isVisible !== false));
        }
      })
      .catch(() => {});
  }, []);

  const columns = [
    {
      title: "Themes",
      links:
        themes.length > 0
          ? themes.map((theme) => ({
              key: theme.id,
              href: "/#catalog",
              label: theme.name,
            }))
          : fallbackThemes,
    },
    {
      title: "Categories",
      links:
        categories.length > 0
          ? categories.map((category) => ({
              key: category.id,
              href: categoryShopHref(category),
              label: category.name,
            }))
          : fallbackCategories,
    },
  ];

  return (
    <footer className="bg-white pt-16 pb-8 border-t border-gray-100 font-quicksand">
      <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
        <div>
          <h3 className="font-bold text-xl mb-4 text-secondary">
            Kits and Craft
          </h3>
          <p className="text-gray-500 text-sm leading-relaxed max-w-sm">
            Sparking joy through painting kits. Safe, fun, and creative plaster
            kits for kids.
          </p>
        </div>

        {columns.map((column) => (
          <FooterColumn
            key={column.title}
            title={column.title}
            links={column.links}
          />
        ))}
      </div>

      <div className="container mx-auto px-6 pt-8 border-t border-gray-50 text-center md:text-left">
        <p className="text-gray-400 text-xs">
          Kits and Craft. Sparking joy through painting kits.
        </p>
      </div>
    </footer>
  );
}
