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

function categoryShopHref(cat: { name: string; slug?: string }) {
  const slug = cat.slug?.trim();
  return slug
    ? `/shop/${slug}`
    : `/shop?category=${encodeURIComponent(cat.name)}`;
}

type FooterLink = { key: string; href: string; label: string };

const fallbackThemes: FooterLink[] = [
  { key: "wild-kingdom", href: "/shop", label: "Wild Kingdom" },
  { key: "secret-garden", href: "/shop", label: "Secret Garden" },
  { key: "little-friends", href: "/shop", label: "Little Friends" },
];

const fallbackCategories: FooterLink[] = [
  { key: "single-pieces", href: "/shop", label: "Single Pieces" },
  { key: "party-packs", href: "/shop", label: "Party Packs" },
  { key: "all-kits", href: "/shop", label: "All Kits" },
];

const guideLinks: FooterLink[] = [
  {
    key: "plaster-painting-kits",
    href: "/guides/plaster-painting-kits-for-kids",
    label: "Plaster painting kits for kids",
  },
  {
    key: "birthday-return-gifts",
    href: "/guides/birthday-return-gifts",
    label: "Birthday return gifts",
  },
  {
    key: "home-decor-figurines",
    href: "/guides/home-decor-figurines",
    label: "Home décor figurines",
  },
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
              href: `/shop?theme=${encodeURIComponent(theme.name)}`,
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
    { title: "Guides", links: guideLinks },
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
