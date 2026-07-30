"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useCart } from "../context/CartContext";
import { useAppSelector } from "../store/hooks";
import type { RootState } from "../store/store";
import OptimisticAddToCart from "../components/OptimisticAddToCart";

import {
  Flame,
  Sparkles,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Heart,
} from "lucide-react";

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
  images?: string[];
  description: string;
  badge?: string;
  isNewLaunch?: boolean;
  isSellingFast?: boolean;
  size?: string;
  material?: string;
  isVisible?: boolean;
  inStock?: boolean;
  likesCount?: number;
  attributes?: Record<string, string>;
  createdAt?: string;
  updatedAt?: string;
}

interface DecorationItem {
  id: string;
  type: "emoji" | "image";
  content: string;
  imageUrl?: string;
  style: React.CSSProperties;
  className?: string;
}

interface ThemeSectionConfig {
  id: string;
  title: React.ReactNode;
  subtitle?: string;
  displayTitle?: React.ReactNode;
  displayDescription?: string;
  themeKeyword: string;
  titleLayout: "left" | "center" | "right";
  bgColor: string;
  textColor: string;
  topDividerFill: string;
  cardSize: "large" | "small";
  limit?: number;
  decorations?: DecorationItem[];
}

const DEFAULT_HOMEPAGE_SECTIONS: ThemeSectionConfig[] = [
  {
    id: "sec-space",
    title: (
      <>
        Space
        <br />
        Adventures
      </>
    ),
    subtitle: "Explore galaxy, astronaut, & planet figurines ready to paint.",
    themeKeyword: "Space",
    titleLayout: "left",
    bgColor: "#2D366D",
    textColor: "#FFFFFF",
    topDividerFill: "white",
    cardSize: "large",
    limit: 4,
    decorations: [
      {
        id: "s1",
        type: "emoji",
        content: "🪐",
        style: {
          top: "15%",
          left: "5%",
          fontSize: "48px",
          opacity: 0.9,
          transform: "rotate(-15deg)",
        },
      },
      {
        id: "s2",
        type: "emoji",
        content: "⭐",
        style: { top: "8%", left: "30%", fontSize: "18px", opacity: 0.8 },
        className: "hidden sm:block",
      },
      {
        id: "s3",
        type: "emoji",
        content: "✨",
        style: { top: "12%", right: "8%", fontSize: "14px", opacity: 0.7 },
        className: "hidden sm:block",
      },
      {
        id: "s4",
        type: "emoji",
        content: "⭐",
        style: { top: "5%", right: "15%", fontSize: "20px", opacity: 0.8 },
      },
      {
        id: "s5",
        type: "emoji",
        content: "🌍",
        style: { top: "25%", right: "3%", fontSize: "42px", opacity: 0.85 },
        className: "hidden md:block",
      },
      {
        id: "s6",
        type: "emoji",
        content: "🚀",
        style: {
          bottom: "30%",
          left: "8%",
          fontSize: "36px",
          opacity: 0.8,
          transform: "rotate(25deg)",
        },
        className: "hidden sm:block",
      },
      {
        id: "s7",
        type: "emoji",
        content: "🚀",
        style: {
          bottom: "15%",
          right: "5%",
          fontSize: "38px",
          opacity: 0.8,
          transform: "rotate(-20deg) scaleX(-1)",
        },
        className: "hidden sm:block",
      },
    ],
  },
  {
    id: "sec-garden",
    title: "Secret Garden (Floral)",
    subtitle:
      "Beautiful botanical shapes, floral plaster crafts, and nature art.",
    themeKeyword: "Garden",
    titleLayout: "center",
    bgColor: "#D1E7D2",
    textColor: "#3C2A21",
    topDividerFill: "#2D366D",
    cardSize: "large",
    limit: 4,
    decorations: [
      {
        id: "g1",
        type: "emoji",
        content: "🌿",
        style: { top: "20px", left: "20px", fontSize: "46px", opacity: 0.85 },
        className: "hidden sm:block",
      },
      {
        id: "g2",
        type: "emoji",
        content: "🌺",
        style: {
          bottom: "20px",
          right: "20px",
          fontSize: "46px",
          opacity: 0.85,
        },
        className: "hidden sm:block",
      },
      {
        id: "g3",
        type: "emoji",
        content: "🌸",
        style: { top: "15%", right: "12%", fontSize: "36px", opacity: 0.8 },
        className: "hidden sm:block",
      },
      {
        id: "g4",
        type: "emoji",
        content: "🦋",
        style: { top: "25%", left: "10%", fontSize: "38px", opacity: 0.8 },
        className: "hidden sm:block",
      },
    ],
  },
  {
    id: "sec-fairytale",
    title: (
      <>
        Fairytale
        <br />
        Magic
      </>
    ),
    subtitle:
      "Enchanted castles, magical unicorns, and fantasy plaster painting sets.",
    themeKeyword: "Fairytale",
    titleLayout: "left",
    bgColor: "#F1E4F7",
    textColor: "#3C2A21",
    topDividerFill: "#D1E7D2",
    cardSize: "small",
    limit: 4,
    decorations: [
      {
        id: "f1",
        type: "emoji",
        content: "🏰",
        style: {
          bottom: "20px",
          left: "20px",
          fontSize: "44px",
          opacity: 0.85,
        },
        className: "hidden md:block",
      },
      {
        id: "f2",
        type: "emoji",
        content: "🦄",
        style: { top: "18%", right: "8%", fontSize: "42px", opacity: 0.85 },
        className: "hidden sm:block",
      },
      {
        id: "f3",
        type: "emoji",
        content: "👑",
        style: { top: "12%", left: "25%", fontSize: "32px", opacity: 0.8 },
        className: "hidden sm:block",
      },
    ],
  },
  {
    id: "sec-wild",
    title: (
      <>
        Wild
        <br />
        Kingdom
      </>
    ),
    subtitle:
      "Lions, squirrels, owls, foxes & safari animal plaster figurines for kids.",
    themeKeyword: "Wild",
    titleLayout: "right",
    bgColor: "#F9E6C3",
    textColor: "#3C2A21",
    topDividerFill: "#F1E4F7",
    cardSize: "small",
    limit: 4,
    decorations: [
      {
        id: "w1",
        type: "emoji",
        content: "🍃",
        style: {
          bottom: "20px",
          left: "20px",
          fontSize: "46px",
          opacity: 0.85,
        },
        className: "hidden sm:block",
      },
      {
        id: "w2",
        type: "emoji",
        content: "🐾",
        style: { top: "20px", right: "20px", fontSize: "38px", opacity: 0.75 },
        className: "hidden sm:block",
      },
      {
        id: "w3",
        type: "emoji",
        content: "🦁",
        style: { top: "15%", left: "12%", fontSize: "40px", opacity: 0.85 },
        className: "hidden sm:block",
      },
      {
        id: "w4",
        type: "emoji",
        content: "🐘",
        style: { bottom: "15%", right: "10%", fontSize: "40px", opacity: 0.85 },
        className: "hidden sm:block",
      },
      {
        id: "w5",
        type: "emoji",
        content: "🌴",
        style: { top: "40%", right: "4%", fontSize: "36px", opacity: 0.75 },
        className: "hidden md:block",
      },
    ],
  },
];

export default function HomePage() {
  const { addToCart } = useCart();
  const reduxProducts = useAppSelector(
    (state: RootState) => state.products.items,
  ) as Product[];
  const [fetchedProducts, setFetchedProducts] = useState<Product[]>([]);
  const [dbThemeSections, setDbThemeSections] = useState<ThemeSectionConfig[]>(
    [],
  );
  const [fetchedThemes, setFetchedThemes] = useState<any[]>([]);

  const products = reduxProducts.length > 0 ? reduxProducts : fetchedProducts;

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setFetchedProducts(data);
      })
      .catch(() => {});

    fetch("/api/homepage-sections")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setDbThemeSections(data);
      })
      .catch(() => {});

    fetch("/api/themes")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setFetchedThemes(data);
      })
      .catch(() => {});
  }, []);

  const getThemeProducts = (themeKeyword: string): Product[] => {
    if (!themeKeyword) return [];
    const kw = themeKeyword.toLowerCase().trim();
    return products
      .filter(
        (p) =>
          p.isVisible !== false &&
          p.theme &&
          (p.theme.toLowerCase().includes(kw) ||
            kw.includes(p.theme.toLowerCase())),
      )
      .sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
      });
  };

  const themeSections: ThemeSectionConfig[] =
    dbThemeSections.length > 0 ? dbThemeSections : DEFAULT_HOMEPAGE_SECTIONS;

  const activeThemeSections = useMemo(() => {
    return themeSections
      .map((sectionConfig) => {
        const keyword = sectionConfig.themeKeyword || "";
        const matchedTheme = fetchedThemes.find(
          (t) =>
            t.id === sectionConfig.id ||
            t.name.toLowerCase() === keyword.toLowerCase() ||
            t.name.toLowerCase().includes(keyword.toLowerCase()) ||
            keyword.toLowerCase().includes(t.name.toLowerCase()),
        );

        const displayTitle = matchedTheme
          ? matchedTheme.name
          : sectionConfig.title;
        const displayDescription =
          matchedTheme && matchedTheme.description
            ? matchedTheme.description
            : sectionConfig.subtitle;

        const queryKeyword = matchedTheme ? matchedTheme.name : keyword;
        const themeProducts = getThemeProducts(queryKeyword);

        return {
          sectionConfig: {
            ...sectionConfig,
            displayTitle,
            displayDescription,
          },
          themeProducts,
        };
      })
      .filter((item) => item.themeProducts.length > 0);
  }, [themeSections, products, fetchedThemes]);

  // const candleProducts = products.filter(
  //   (p) =>
  //     p.category.toLowerCase().includes("candle") ||
  //     (p.productLineId && p.productLineId.toLowerCase().includes("candle")) ||
  //     p.productLineId === "line-2",
  // );

  // HERO CAROUSEL SLIDES DEFINITION
  const heroSlides = [
    {
      id: 0,
      bgColor: "#EBF5FF",
      content: (
        <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col md:flex-row items-center w-full py-10 md:py-16">
          <div className="w-full md:w-5/12 text-center md:text-left mb-8 md:mb-0">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 mb-3 rounded-full text-xs font-extrabold bg-sky-100 text-sky-900 tracking-wide uppercase border border-sky-200/80 shadow-xs">
              <span>🎨 Plaster Craft Kits for Kids</span>
            </span>
            <h1
              className="font-extrabold leading-tight mb-4"
              style={{
                fontSize: "clamp(2rem, 5vw, 3.25rem)",
                color: "#3C2A21",
              }}
            >
              Paint Your World
              <br />
              with Kits and Craft!
            </h1>
            <p className="mb-8 max-w-md mx-auto md:mx-0 text-slate-600 text-base sm:text-lg leading-relaxed font-medium">
              Complete ready-to-paint plaster craft kits designed to ignite
              creativity, joy, & proud young artists!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Link
                href="/shop"
                className="px-7 py-3.5 text-white rounded-full font-bold shadow-lg text-center transition hover:opacity-90 active:scale-95 bg-[#3C2A21]"
                style={{ fontSize: "15px" }}
              >
                Shop Painting Kits
              </Link>
              <Link
                href="/shop"
                className="px-7 py-3.5 rounded-full font-bold text-center transition hover:bg-sky-100/60 active:scale-95"
                style={{
                  border: "2px solid #3C2A21",
                  color: "#3C2A21",
                  fontSize: "15px",
                }}
              >
                Explore Themes
              </Link>
            </div>
          </div>

          <div className="w-full md:w-7/12 flex justify-center md:justify-end relative">
            <div className="relative w-full max-w-md sm:max-w-lg">
              <div className="overflow-hidden rounded-3xl shadow-2xl border-4 border-white transform rotate-1 hover:rotate-0 transition duration-500">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/hero/indian-kids-painting.png"
                  alt="Indian children joyfully painting plaster crafts"
                  className="w-full h-72 sm:h-96 object-cover object-center"
                />
              </div>
              <div className="absolute -top-3 -right-2 bg-sky-600 text-white rounded-full px-3.5 py-1 text-xs font-black shadow-lg">
                ✨ Ready-To-Paint Kits
              </div>
              <div className="absolute -bottom-4 -left-3 bg-white px-4 py-2 rounded-2xl shadow-xl border border-sky-100 flex items-center space-x-2">
                <span className="text-xl">🦚</span>
                <div className="text-left">
                  <p className="text-xs font-black text-slate-800">
                    Peacock & Animal Models
                  </p>
                  <p className="text-[10px] text-slate-500 font-medium">
                    Includes paints & brushes
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 1,
      bgColor: "#FDF2F0",
      content: (
        <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col md:flex-row items-center w-full py-10 md:py-16">
          <div className="w-full md:w-5/12 text-center md:text-left mb-8 md:mb-0">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 mb-3 rounded-full text-xs font-extrabold bg-pink-100 text-pink-800 tracking-wide uppercase">
              <span>✨ DIY Home Decor Project</span>
            </div>

            <h1
              className="font-black leading-tight mb-3 uppercase tracking-tight"
              style={{
                fontSize: "clamp(1.8rem, 4.5vw, 2.75rem)",
                color: "#3C2A21",
              }}
            >
              Brighten Up
              <br />
              Your Home!
              <br />
              <span className="text-pink-600">Décor Project.</span>
            </h1>

            <div className="inline-block bg-amber-100/90 text-[#3C2A21] px-3.5 py-1.5 rounded-xl font-bold text-xs sm:text-sm mb-5 border border-amber-300/60 shadow-xs">
              🏡 Kids' Art as Charming Home Décor!
            </div>

            <p className="mb-6 max-w-md mx-auto md:mx-0 text-slate-600 text-sm sm:text-base leading-relaxed font-medium">
              Turn your kids' hand-painted plaster creations into timeless shelf
              & desk keepsakes to proudly display around the house.
            </p>

            <div className="flex justify-center md:justify-start">
              <Link
                href="/shop"
                className="px-7 py-3.5 text-white rounded-full font-black uppercase tracking-wider shadow-xl text-center transition hover:opacity-95 active:scale-95 bg-pink-700 hover:bg-pink-800"
                style={{ fontSize: "14px" }}
              >
                Start Your Decor Project!
              </Link>
            </div>
          </div>

          <div className="w-full md:w-7/12 flex flex-col sm:flex-row items-center justify-center gap-5 relative">
            <div className="relative max-w-xs sm:max-w-sm w-full flex flex-col items-center">
              <div className="relative rounded-3xl bg-white/70 backdrop-blur-xs p-3.5 border border-rose-200/70 shadow-lg hover:shadow-xl transition duration-300 w-full flex justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/hero/owl-shelf.png"
                  alt="Owl Figurine on Shelf"
                  className="w-full h-auto max-h-52 object-contain filter drop-shadow-md"
                />
                <div className="absolute -top-3 -right-2 bg-pink-600 text-white rounded-full px-3 py-0.5 text-[10px] font-black shadow">
                  Home Shelf Decor
                </div>
              </div>

              <div className="relative rounded-3xl bg-white/70 backdrop-blur-xs p-3 mt-3 border border-rose-200/70 shadow-md hover:shadow-lg transition duration-300 w-full flex justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/hero/plaster-crafts.png"
                  alt="Painted Plaster Figurines"
                  className="w-full h-auto max-h-36 object-contain filter drop-shadow-xs"
                />
              </div>
            </div>

            {/* <div className="hidden lg:flex flex-col items-center justify-center p-4 bg-white/85 backdrop-blur-md rounded-3xl border border-rose-200 shadow-lg w-40 text-center shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element 
              <img
                src="/images/hero/silicone-mold.png"
                alt="Silicone Mold"
                className="w-20 h-20 object-contain mb-2 drop-shadow"
              />
              <span className="text-xs font-extrabold text-pink-900 leading-tight">
                Includes Mold & Paints
              </span>
            </div> */}
          </div>
        </div>
      ),
    },
    {
      id: 2,
      bgColor: "#FFFDF0",
      content: (
        <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col md:flex-row items-center w-full py-10 md:py-16">
          <div className="w-full md:w-5/12 text-center md:text-left mb-8 md:mb-0">
            <span className="inline-block px-3.5 py-1 mb-3 rounded-full text-xs font-extrabold bg-amber-100 text-amber-800 tracking-wide uppercase">
              🌟 Screen-Free Family Joy
            </span>
            <h1
              className="font-extrabold leading-tight mb-5"
              style={{
                fontSize: "clamp(2rem, 5vw, 3.25rem)",
                color: "#3C2A21",
              }}
            >
              Unleash Their
              <br />
              Creative Wonder!
            </h1>
            <p
              className="mb-8 max-w-md mx-auto md:mx-0"
              style={{
                color: "#4B5563",
                fontSize: "17px",
                lineHeight: "28px",
                fontWeight: 500,
              }}
            >
              Watch young imaginations blossom! Non-toxic, vibrant plaster
              painting kits that bring hours of proud artistic fun.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Link
                href="/shop"
                className="px-7 py-3.5 text-white rounded-full font-bold shadow-lg text-center transition hover:opacity-90 active:scale-95 bg-amber-600 hover:bg-amber-700"
                style={{ fontSize: "15px" }}
              >
                Shop Kids' Art Kits
              </Link>
              <Link
                href="/bundles"
                className="px-7 py-3.5 rounded-full font-bold text-center transition hover:bg-amber-100/60 active:scale-95"
                style={{
                  border: "2px solid #3C2A21",
                  color: "#3C2A21",
                  fontSize: "15px",
                }}
              >
                Build Custom Bundle
              </Link>
            </div>
          </div>

          <div className="w-full md:w-7/12 flex justify-center md:justify-end relative">
            <div className="relative w-full max-w-md sm:max-w-lg">
              <div className="overflow-hidden rounded-3xl shadow-2xl border-4 border-white transform rotate-1 hover:rotate-0 transition duration-500">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/hero/kids-painting-slide.png"
                  alt="Kids enjoying painting crafts"
                  className="w-full h-72 sm:h-96 object-cover object-center"
                />
              </div>
              <div className="absolute -bottom-4 -left-3 bg-white px-4 py-2 rounded-2xl shadow-xl border border-amber-200 flex items-center space-x-2">
                <span className="text-xl">👩‍🎨</span>
                <div className="text-left">
                  <p className="text-xs font-black text-slate-800">
                    100% Non-Toxic & Safe
                  </p>
                  <p className="text-[10px] text-slate-500 font-medium">
                    Certified child friendly
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const extendedSlides = [
    { ...heroSlides[heroSlides.length - 1], extendedKey: "clone-last" },
    ...heroSlides.map((s, idx) => ({ ...s, extendedKey: `real-${idx}` })),
    { ...heroSlides[0], extendedKey: "clone-first" },
  ];

  // Calculate safe index to prevent out of bounds
  const rawIndex = (currentIndex - 1) % heroSlides.length;
  const realIndex = (rawIndex + heroSlides.length) % heroSlides.length;

  // Auto-play Timer (5 seconds)
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      nextSlide();
    }, 3000);
    return () => clearInterval(interval);
  }, [isPaused, currentIndex]);

  const nextSlide = () => {
    if (isAnimating) return; // Lock rapid spam clicking during active animation
    setIsAnimating(true);
    setIsTransitioning(true);
    setCurrentIndex((prev) => {
      if (prev >= extendedSlides.length - 1) return 1;
      return prev + 1;
    });
  };

  const prevSlide = () => {
    if (isAnimating) return; // Lock rapid spam clicking during active animation
    setIsAnimating(true);
    setIsTransitioning(true);
    setCurrentIndex((prev) => {
      if (prev <= 0) return heroSlides.length;
      return prev - 1;
    });
  };

  const handleTransitionEnd = () => {
    setIsAnimating(false);
    if (currentIndex >= extendedSlides.length - 1) {
      setIsTransitioning(false);
      setCurrentIndex(1);
    } else if (currentIndex <= 0) {
      setIsTransitioning(false);
      setCurrentIndex(heroSlides.length);
    }
  };

  const handleDotClick = (idx: number) => {
    if (isAnimating) return;
    setIsAnimating(true);
    setIsTransitioning(true);
    setCurrentIndex(idx + 1);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    if (diff > 50) {
      nextSlide();
    } else if (diff < -50) {
      prevSlide();
    }
    setTouchStartX(null);
  };

  return (
    <div style={{ fontFamily: "'Quicksand', sans-serif", color: "#333" }}>
      {/* ─── HERO CAROUSEL SECTION ─── */}
      <section
        className="relative overflow-hidden select-none transition-colors duration-700"
        style={{
          backgroundColor: heroSlides[realIndex].bgColor,
          minHeight: "460px",
        }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={(e) => {
          setIsPaused(true);
          handleTouchStart(e);
        }}
        onTouchEnd={(e) => {
          setIsPaused(false);
          handleTouchEnd(e);
        }}
      >
        {/* Subtle Bottom Wavy Divider */}
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none overflow-hidden z-0 leading-none">
          <svg
            className="w-full h-12 sm:h-20 block"
            fill="white"
            preserveAspectRatio="none"
            viewBox="0 0 1440 120"
          >
            <path
              fillOpacity="1"
              d="M0,32L60,42.7C120,53,240,75,360,80C480,85,600,75,720,64C840,53,960,43,1080,48C1200,53,1320,75,1380,85L1440,96L1440,120L1380,120C1320,120,1200,120,1080,120C960,120,840,120,720,120C600,120,480,120,360,120C240,120,120,120,60,120L0,120Z"
            />
          </svg>
        </div>

        {/* Left Arrow Button */}
        <button
          onClick={prevSlide}
          aria-label="Previous slide"
          className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 z-30 p-2.5 sm:p-3 rounded-full bg-white/80 hover:bg-white text-[#3C2A21] backdrop-blur-md shadow-lg border border-white/60 transition-all transform hover:scale-110 active:scale-95 focus:outline-none cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* Right Arrow Button */}
        <button
          onClick={nextSlide}
          aria-label="Next slide"
          className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 z-30 p-2.5 sm:p-3 rounded-full bg-white/80 hover:bg-white text-[#3C2A21] backdrop-blur-md shadow-lg border border-white/60 transition-all transform hover:scale-110 active:scale-95 focus:outline-none cursor-pointer"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* Carousel Slides Container */}
        <div className="relative w-full overflow-hidden min-h-[460px] flex items-center z-10">
          <div
            className={`flex w-full ${isTransitioning ? "transition-transform duration-700 ease-in-out" : ""}`}
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            onTransitionEnd={handleTransitionEnd}
          >
            {extendedSlides.map((slide) => (
              <div
                key={`${slide.id}-${slide.extendedKey}`}
                className="w-full shrink-0 flex items-center"
              >
                {slide.content}
              </div>
            ))}
          </div>
        </div>

        {/* Dot Indicators */}
        <div className="absolute bottom-6 left-0 right-0 z-30 flex justify-center items-center gap-2.5">
          {heroSlides.map((slide, idx) => (
            <button
              key={slide.id}
              onClick={() => handleDotClick(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`transition-all duration-300 rounded-full focus:outline-none cursor-pointer ${
                realIndex === idx
                  ? "w-8 h-3 bg-[#3C2A21] shadow-sm"
                  : "w-3 h-3 bg-[#3C2A21]/30 hover:bg-[#3C2A21]/60"
              }`}
            />
          ))}
        </div>
      </section>

      {/* ─── WHAT DO WE SELL ? SECTION ─── */}
      <section className="bg-gradient-to-b from-white to-pink-50/30 py-16 px-6 relative overflow-hidden">
        {/* Decorative background blur shapes */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-pink-100/40 rounded-full blur-3xl -z-10 animate-pulse duration-[6s]" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-sky-100/30 rounded-full blur-3xl -z-10 animate-pulse duration-[8s]" />

        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-pink-100 text-pink-700 tracking-wider uppercase">
              ✨ Discover Our Handcrafted Collections
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#3C2A21] tracking-tight">
              What do we sell?
            </h2>
            <p className="text-slate-600 font-medium text-sm sm:text-base leading-relaxed">
              We sell the best{" "}
              <span className="font-bold text-[#3C2A21]">
                POP painting kits
              </span>
              , ready-to-paint plaster figurines, and creative craft activity
              kits in India. Ignite your child’s imagination with child-safe,
              creative craft activity boxes, screen-free painting sets, and fun
              plaster figurines!
            </p>
          </div>

          {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-4">
            {/* Card 1: Plaster Kits 
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition duration-300 flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-pink-50 flex items-center justify-center text-2xl group-hover:scale-105 transition transform">
                  🎨
                </div>
                <h3 className="text-lg font-bold text-[#3C2A21]">
                  Ready-To-Paint Plaster Figurines
                </h3>
                <p className="text-slate-500 text-xs sm:text-sm leading-relaxed font-medium">
                  Detailed, screen-free plaster of paris (POP) painting kits for
                  kids. Perfect for school activities, birthday party return
                  gifts, and creative weekend fun!
                </p>
              </div>
              <div className="pt-6 border-t border-slate-50 mt-6 flex justify-between items-center">
                <span className="text-xs font-bold text-pink-600">
                  Explore Collection
                </span>
                <ChevronRight className="w-4 h-4 text-pink-500 group-hover:translate-x-1 transition transform" />
              </div>
            </div>

            {/* Card 2: DIY Painting Sets 
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition duration-300 flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-2xl group-hover:scale-105 transition transform">
                  🖌️
                </div>
                <h3 className="text-lg font-bold text-[#3C2A21]">
                  DIY Plaster Painting Sets
                </h3>
                <p className="text-slate-500 text-xs sm:text-sm leading-relaxed font-medium">
                  Complete craft painting sets featuring smooth plaster shapes,
                  vibrant non-toxic paints, and detail brushes for hours of
                  screen-free fun!
                </p>
              </div>
              <div className="pt-6 border-t border-slate-50 mt-6 flex justify-between items-center">
                <span className="text-xs font-bold text-amber-600">
                  Explore Collection
                </span>
                <ChevronRight className="w-4 h-4 text-amber-500 group-hover:translate-x-1 transition transform" />
              </div>
            </div>

            {/* Card 3: Birthday Return Gifts / Custom Bundles 
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition duration-300 flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-sky-50 flex items-center justify-center text-2xl group-hover:scale-105 transition transform">
                  🎁
                </div>
                <h3 className="text-lg font-bold text-[#3C2A21]">
                  Creative Return Gift Kits
                </h3>
                <p className="text-slate-500 text-xs sm:text-sm leading-relaxed font-medium">
                  Simplify your party planning with customizable kids activity
                  boxes. Premium non-toxic painting sets that make thoughtful
                  and educational return gifts.
                </p>
              </div>
              <div className="pt-6 border-t border-slate-50 mt-6 flex justify-between items-center">
                <span className="text-xs font-bold text-sky-600">
                  Explore Collection
                </span>
                <ChevronRight className="w-4 h-4 text-sky-500 group-hover:translate-x-1 transition transform" />
              </div>
            </div>
          </div> */}
        </div>
      </section>

      {/* ─── WHY Kits and Craft ─── */}
      <WhySection />

      {/* ─── DYNAMIC THEME SECTIONS FROM DATABASE ─── */}
      {activeThemeSections.map(({ sectionConfig, themeProducts }, index) => {
        // Dynamic wave fill color matching the section rendered directly above it
        const previousBgColor =
          index === 0
            ? "white"
            : activeThemeSections[index - 1].sectionConfig.bgColor;

        return (
          <section
            key={sectionConfig.id}
            className="relative overflow-hidden"
            style={{
              backgroundColor: sectionConfig.bgColor,
              color: sectionConfig.textColor,
              paddingTop: "80px",
              paddingBottom: "100px",
            }}
          >
            {/* Top Wavy Divider */}
            <div
              className="absolute top-0 left-0 w-full overflow-hidden"
              style={{ lineHeight: 0 }}
            >
              <svg
                className="relative block"
                style={{ width: "calc(100% + 1.3px)", height: "60px" }}
                fill={previousBgColor}
                preserveAspectRatio="none"
                viewBox="0 0 1200 120"
              >
                <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5,73.84-4.36,147.54,16.88,218.2,35.26,69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113,2,1200,0Z" />
              </svg>
            </div>

            {/* Decorative Elements */}
            {sectionConfig.decorations?.map((decor) => (
              <React.Fragment key={decor.id}>
                {decor.type === "emoji" ? (
                  <span
                    className={`absolute pointer-events-none select-none ${decor.className || ""}`}
                    style={decor.style}
                  >
                    {decor.content}
                  </span>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={decor.content}
                    alt=""
                    className={`absolute pointer-events-none ${decor.className || ""}`}
                    style={decor.style}
                    onError={(e: any) => {
                      e.target.style.display = "none";
                    }}
                  />
                )}
              </React.Fragment>
            ))}

            {/* Section Layout */}
            <div className="max-w-7xl mx-auto px-6 relative z-10">
              {sectionConfig.titleLayout === "center" ? (
                /* Center Layout */
                <div className="text-center space-y-3">
                  <h2
                    className="font-bold text-3xl sm:text-4xl"
                    style={{ color: sectionConfig.textColor }}
                  >
                    {sectionConfig.displayTitle || sectionConfig.title}
                  </h2>
                  {(sectionConfig.displayDescription ||
                    sectionConfig.subtitle) && (
                    <p className="text-xs sm:text-sm font-medium opacity-90 max-w-lg mx-auto">
                      {sectionConfig.displayDescription ||
                        sectionConfig.subtitle}
                    </p>
                  )}
                  <div className="pt-1 pb-6">
                    <Link
                      href="/shop"
                      className="inline-flex items-center space-x-1.5 px-6 py-2.5 rounded-full text-xs font-extrabold bg-[#3C2A21] text-white shadow-md hover:bg-[#251A14] transition active:scale-95 cursor-pointer"
                    >
                      <span>Shop More</span>
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                  <ThemeProductCarousel
                    themeProducts={themeProducts}
                    onAddToCart={(p) => addToCart(p)}
                  />
                </div>
              ) : sectionConfig.titleLayout === "left" ? (
                /* Left Title Layout */
                <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
                  <div className="w-full md:w-1/3 text-center md:text-left shrink-0 space-y-3">
                    <h2
                      className="font-extrabold leading-tight text-3xl sm:text-4xl md:text-5xl"
                      style={{ color: sectionConfig.textColor }}
                    >
                      {sectionConfig.displayTitle || sectionConfig.title}
                    </h2>
                    {(sectionConfig.displayDescription ||
                      sectionConfig.subtitle) && (
                      <p className="text-xs sm:text-sm font-medium opacity-90 leading-relaxed">
                        {sectionConfig.displayDescription ||
                          sectionConfig.subtitle}
                      </p>
                    )}
                    <div className="pt-2">
                      <Link
                        href="/shop"
                        className="inline-flex items-center space-x-1.5 px-6 py-2.5 rounded-full text-xs font-extrabold bg-[#3C2A21] text-white shadow-md hover:bg-[#251A14] transition active:scale-95 cursor-pointer"
                      >
                        <span>Shop More</span>
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                  <div className="w-full md:w-2/3">
                    <ThemeProductCarousel
                      themeProducts={themeProducts}
                      onAddToCart={(p) => addToCart(p)}
                    />
                  </div>
                </div>
              ) : (
                /* Right Title Layout */
                <div className="flex flex-col md:flex-row-reverse items-center justify-center gap-8 md:gap-12 text-center md:text-left">
                  <div className="w-full md:w-1/3 text-center md:text-left shrink-0 space-y-3">
                    <h2
                      className="font-extrabold leading-tight text-3xl sm:text-4xl md:text-5xl"
                      style={{ color: sectionConfig.textColor }}
                    >
                      {sectionConfig.displayTitle || sectionConfig.title}
                    </h2>
                    {(sectionConfig.displayDescription ||
                      sectionConfig.subtitle) && (
                      <p className="text-xs sm:text-sm font-medium opacity-90 leading-relaxed">
                        {sectionConfig.displayDescription ||
                          sectionConfig.subtitle}
                      </p>
                    )}
                    <div className="pt-2">
                      <Link
                        href="/shop"
                        className="inline-flex items-center space-x-1.5 px-6 py-2.5 rounded-full text-xs font-extrabold bg-[#3C2A21] text-white shadow-md hover:bg-[#251A14] transition active:scale-95 cursor-pointer"
                      >
                        <span>Shop More</span>
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                  <div className="w-full md:w-2/3">
                    <ThemeProductCarousel
                      themeProducts={themeProducts}
                      onAddToCart={(p) => addToCart(p)}
                    />
                  </div>
                </div>
              )}
            </div>
          </section>
        );
      })}

      {/* ─── EXPLORE ALL THEMES BUTTON ─── */}
      <div className="flex justify-center py-10 relative z-20">
        <Link
          href="/shop"
          className="text-white rounded-full font-extrabold shadow-xl uppercase tracking-wider inline-flex items-center space-x-2 px-8 py-3.5 text-xs sm:text-sm bg-gradient-to-r from-indigo-500 via-pink-500 to-amber-500 hover:opacity-95 transition transform hover:scale-105 active:scale-95 cursor-pointer border border-white/20"
        >
          <span>Explore All Themes</span>
          <ArrowRight className="w-4 h-4 ml-1" />
        </Link>
      </div>

      {/* ─── BUNDLE PACKAGE PROMO BANNER ─── */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="bg-gradient-to-r from-pink-200 via-yellow-200 to-sky-200 p-8 sm:p-10 rounded-3xl text-center space-y-4 shadow-sm border border-slate-100">
          <Sparkles className="w-10 h-10 text-pink-600 mx-auto" />
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-800">
            Build Your Custom Craft Package
          </h3>
          <p className="text-xs sm:text-sm text-slate-700 max-w-xl mx-auto">
            Build your custom bundle set of plaster figurines and POP painting
            kits to receive exclusive package discounts at checkout.
          </p>
          <Link
            href="/bundles"
            className="inline-flex items-center space-x-2 px-8 py-3.5 bg-slate-800 hover:bg-slate-900 text-white font-extrabold text-xs rounded-full shadow transition cursor-pointer"
          >
            <span>Start Building Package</span>
            <ArrowRight className="w-4 h-4 text-pink-400" />
          </Link>
        </div>
      </section>
    </div>
  );
}

/* ─── WHY CARD COMPONENT ─── */
function WhyCard({
  bg,
  iconSrc,
  title,
  desc,
}: {
  bg: string;
  iconSrc: string;
  title: string;
  desc: string;
}) {
  return (
    <div
      className="p-6 sm:p-8 rounded-3xl text-center flex flex-col items-center justify-between h-full space-y-4"
      style={{ backgroundColor: bg }}
    >
      <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm overflow-hidden shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={iconSrc}
          alt={title}
          className="w-full h-full object-contain p-1"
        />
      </div>
      <div>
        <h3
          className="font-bold mb-2 text-lg sm:text-xl"
          style={{ color: "#3C2A21" }}
        >
          {title}
        </h3>
        <p className="text-slate-600 text-xs sm:text-sm font-medium leading-relaxed">
          {desc}
        </p>
      </div>
    </div>
  );
}

function WhySection() {
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -300, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 300, behavior: "smooth" });
    }
  };

  const cards = [
    {
      bg: "#EFF6FF",
      iconSrc:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuC05Fn2RrTeXXbi8ozDNSOEp966CdSel8NRXnfqnE_9L4NlK7VPfAnROXfVs27_LXYlXroCvXOKBtRvldzWFIKIOXjMeG-vykL9icHpUz1VPoqjgP4VRZQkfydZohsCGV0-Y-wgmD8RgcJJyPgDtNxJ-FrCfUXzGgppZfHLwG3-tN9CqL9oSFa1afF9CDibssiTAcWqya6Rxz1uSEQhlK-XhhUhO5-M5QrwnPj31iav7vovFVgnOAGdgfwi5bW4IPWFwXQfqC_wbEg",
      title: "Cognitive Growth",
      desc: "Boosts creativity, focus, and fine motor skills through art.",
    },
    {
      bg: "#FEFCE8",
      iconSrc:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuA1NgK7ZecsjWENFgT54D5Cv7_WmCJQmXcjVv2vDTOohUD08d6ixK0W8VSCjBec872DQ56yJRCZWjM3nMkcFbfrjffEBuqgP62_b3wdF1ffUSUaYQR2bWbjGsv5LqTUe4ePnMWCIgqEwQtyDbCtl00mUNAbqsSkubAEACbLuU0NWjKMcosJIMVAO6No4bjom5d37epqn_B2eymBS-0CFmPkuIIP6yljbIcbt0OLzKeSVZgWR4_BTe5Zipc8EKN83XAdX72AcsKH18A",
      title: "Screen-Free Fun",
      desc: "Engaging, hands-on activity that keeps kids entertained.",
    },
    {
      bg: "#FEF2F2",
      iconSrc:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuD-C7wnjb5D37c9ELK5XHJi86GQiHBzVQLW8RWz-gdqnMaiUrNUTdJpLkh5Z5nj0Q4-pfO_PX-yYZLgGq3VE6jjxtDZLjAQqp_Jt1cTRjszStJusR7U9b71bICgoXDP_DouaMmNbyV-g0htz3vzAvPTdsXS6ChxzsfF5ebH9KHSRUJaDAf2zyCuMUy-GqgQjvYQYu3eNvSihMnFVN5iW-QiHzcowhy97nhagNPl36Xbim3Xgrcr2oIdlioZDZNvIFjAYmvZkSIvD3M",
      title: "Travel-Friendly Hobby",
      desc: "Portable kits perfect for vacations or quiet time anywhere.",
    },
  ];

  return (
    <section style={{ backgroundColor: "white", padding: "64px 0" }}>
      <div className="max-w-7xl mx-auto px-6 relative">
        <h2
          className="text-center font-bold mb-10"
          style={{ fontSize: "30px", color: "#3C2A21" }}
        >
          Why Kits and Craft?
        </h2>

        {/* Carousel Container */}
        <div className="relative group">
          {/* Scroll Left Arrow (Visible on Mobile) */}
          <button
            onClick={scrollLeft}
            aria-label="Scroll left"
            className="md:hidden absolute left-0 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-white/90 shadow-md border border-slate-200 text-[#3C2A21] hover:bg-white active:scale-95 cursor-pointer -ml-3"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Scroll Right Arrow (Visible on Mobile) */}
          <button
            onClick={scrollRight}
            aria-label="Scroll right"
            className="md:hidden absolute right-0 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-white/90 shadow-md border border-slate-200 text-[#3C2A21] hover:bg-white active:scale-95 cursor-pointer -mr-3"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Scrollable Track */}
          <div
            ref={scrollRef}
            className="flex md:grid md:grid-cols-3 gap-6 overflow-x-auto md:overflow-x-visible snap-x snap-mandatory no-scrollbar pb-4 md:pb-0 px-1"
          >
            {cards.map((card, idx) => (
              <div
                key={idx}
                className="w-[85vw] max-w-[320px] sm:w-[340px] md:w-auto shrink-0 md:shrink snap-center"
              >
                <WhyCard
                  bg={card.bg}
                  iconSrc={card.iconSrc}
                  title={card.title}
                  desc={card.desc}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── REDESIGNED BEAUTIFUL PRODUCT CARD FOR THEME SECTIONS ─── */
function ThemeProductCard({
  product,
  onAdd,
}: {
  product: Product;
  onAdd: () => void;
}) {
  return (
    <div className="bg-white/95 backdrop-blur-md rounded-3xl p-4 sm:p-5 w-full flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl border border-white/60 text-[#3C2A21] shadow-md group relative">
      <div>
        {/* Badges Header */}
        <div className="flex flex-wrap items-center justify-between gap-1.5 mb-3">
          {product.ageGroup && product.ageGroup.trim() !== "" && (
            <span className="text-[10px] sm:text-xs font-black px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-200/60 shadow-2xs">
              {product.ageGroup}
            </span>
          )}
          <div className="flex flex-wrap items-center gap-1">
            {(product.isNewLaunch ||
              Boolean(product.badge?.toLowerCase().includes("new"))) && (
              <span className="text-[10px] sm:text-xs font-black px-2 py-0.5 rounded-full bg-amber-400 text-slate-900 shadow-2xs uppercase tracking-wider">
                ✨ New Launch
              </span>
            )}
            {(product.isSellingFast ||
              Boolean(product.badge?.toLowerCase().includes("selling"))) && (
              <span className="text-[10px] sm:text-xs font-black px-2 py-0.5 rounded-full bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-2xs uppercase tracking-wider">
                🔥 Selling Fast
              </span>
            )}
          </div>
        </div>

        {/* Product Image Container */}
        <Link href={`/product/${product.id}`} className="block">
          <div className="rounded-2xl mb-3 bg-slate-50/80 aspect-square w-full overflow-hidden border border-slate-100 relative transition duration-300">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition duration-500 ease-out"
            />
            {/* Top-Right Like Count Badge if > 0 */}
            {(product.likesCount || 0) > 0 && (
              <div className="absolute top-2 right-2 z-10 px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-md border border-rose-100 text-rose-600 font-extrabold text-[10px] sm:text-xs flex items-center space-x-1 shadow-xs">
                <Heart className="w-3 h-3 fill-rose-500 text-rose-500" />
                <span>{product.likesCount}</span>
              </div>
            )}
          </div>

          {/* Product Name */}
          <h3 className="font-extrabold text-sm sm:text-base text-[#3C2A21] group-hover:text-sky-700 transition line-clamp-1 mb-1 leading-snug">
            {product.name}
          </h3>
        </Link>

        {/* Price Tag */}
        <div className="flex items-baseline space-x-2 mb-4">
          <span className="font-black text-base sm:text-lg text-[#3C2A21]">
            ₹{product.price.toFixed(2)}
          </span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-xs text-slate-400 line-through font-semibold">
              ₹{product.originalPrice.toFixed(2)}
            </span>
          )}
        </div>
      </div>

      {/* Optimistic Add to Cart & Quantity Stepper */}
      <OptimisticAddToCart product={product} variant="dark" />
    </div>
  );
}

/* ─── PRODUCT CAROUSEL FOR THEME SECTIONS (INFINITE LOOP, 1-CARD STEP) ─── */
function ThemeProductCarousel({
  themeProducts,
  onAddToCart,
}: {
  themeProducts: Product[];
  onAddToCart: (p: Product) => void;
}) {
  const [cardsPerView, setCardsPerView] = useState(3);

  useEffect(() => {
    const handleResize = () => {
      setCardsPerView(window.innerWidth < 768 ? 2 : 3);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const realLen = themeProducts?.length || 0;

  // Number of clone cards on each side. Must be enough to fill the
  // viewport during the wrap-around, but capped at realLen so we never
  // try to slice more unique items than actually exist.
  const cloneCount = Math.min(Math.max(cardsPerView, 1), realLen);

  // Build extended infinite array with clone buffers
  const extendedProducts = useMemo(() => {
    if (!themeProducts || realLen === 0) return [];
    if (cloneCount === 0) return [];
    const cloneHead = themeProducts.slice(-cloneCount);
    const cloneTail = themeProducts.slice(0, cloneCount);
    return [
      ...cloneHead.map((p, i) => ({ ...p, cloneKey: `head-${i}` })),
      ...themeProducts.map((p, i) => ({ ...p, cloneKey: `real-${i}` })),
      ...cloneTail.map((p, i) => ({ ...p, cloneKey: `tail-${i}` })),
    ];
  }, [themeProducts, cloneCount, realLen]);

  const startIndex = cloneCount;
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  // Measure the real pixel width of one "step" (card + gap) so the
  // translateX always moves exactly one card, regardless of gap size,
  // padding, or how percentages round at different viewport widths.
  const trackRef = React.useRef<HTMLDivElement | null>(null);
  const [stepPx, setStepPx] = useState(0);

  const measureStep = React.useCallback(() => {
    const track = trackRef.current;
    if (!track || track.children.length < 2) return;
    const first = track.children[0] as HTMLElement;
    const second = track.children[1] as HTMLElement;
    // Distance between the start of card 1 and the start of card 2
    // = card width + gap, however the gap is implemented.
    const step = second.offsetLeft - first.offsetLeft;
    if (step > 0) setStepPx(step);
  }, []);

  useEffect(() => {
    measureStep();
    window.addEventListener("resize", measureStep);
    return () => window.removeEventListener("resize", measureStep);
  }, [measureStep, extendedProducts, cardsPerView]);

  useEffect(() => {
    setCurrentIndex(startIndex);
    // Re-measure after layout settles for the new product set.
    const id = requestAnimationFrame(measureStep);
    return () => cancelAnimationFrame(id);
  }, [themeProducts, startIndex, measureStep]);

  const handleNext = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev - 1);
  };

  const handleTransitionEnd = () => {
    setIsAnimating(false);
    if (!themeProducts || realLen === 0) return;

    if (currentIndex >= startIndex + realLen) {
      setIsTransitioning(false);
      setCurrentIndex(currentIndex - realLen);
    } else if (currentIndex < startIndex) {
      setIsTransitioning(false);
      setCurrentIndex(currentIndex + realLen);
    }
  };

  // Turn transitions back on after a snap (transition was disabled for
  // one frame to jump invisibly from clone -> real position).
  useEffect(() => {
    if (!isTransitioning) {
      const id = requestAnimationFrame(() => setIsTransitioning(true));
      return () => cancelAnimationFrame(id);
    }
  }, [isTransitioning]);

  if (!themeProducts || realLen === 0) {
    return (
      <div className="text-center py-8 text-slate-500 font-medium">
        No items available in this theme yet.
      </div>
    );
  }

  // If there aren't enough products to fill a viewport, looping/cloning
  // isn't meaningful (and can't be built safely) — just render statically.
  if (realLen <= cardsPerView) {
    return (
      <div className="relative w-full max-w-5xl mx-auto px-1 sm:px-2">
        <div className="flex w-full gap-3 sm:gap-4 py-8 -my-4 px-2">
          {themeProducts.map((p) => (
            <div
              key={p.id}
              className="w-[calc(50%-6px)] md:w-[calc(33.333%-11px)] shrink-0 flex"
            >
              <ThemeProductCard product={p} onAdd={() => onAddToCart(p)} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-5xl mx-auto px-1 sm:px-2">
      {/* Left Navigation Arrow */}
      <button
        onClick={handlePrev}
        aria-label="Previous product"
        className="absolute left-2 sm:left-3 md:left-4 top-1/2 -translate-y-1/2 z-30 p-2.5 sm:p-3 rounded-full bg-white/95 text-[#3C2A21] shadow-xl border border-slate-200/80 transition-all transform hover:scale-110 active:scale-95 focus:outline-none cursor-pointer hover:bg-white"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {/* Right Navigation Arrow */}
      <button
        onClick={handleNext}
        aria-label="Next product"
        className="absolute right-2 sm:right-3 md:right-4 top-1/2 -translate-y-1/2 z-30 p-2.5 sm:p-3 rounded-full bg-white/95 text-[#3C2A21] shadow-xl border border-slate-200/80 transition-all transform hover:scale-110 active:scale-95 focus:outline-none cursor-pointer hover:bg-white"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Product Cards Track Container */}
      <div className="overflow-hidden w-full py-8 -my-4 px-2">
        <div
          ref={trackRef}
          className={`flex w-full ${isTransitioning ? "transition-transform duration-500 ease-out" : ""} gap-3 sm:gap-4`}
          style={{
            transform: stepPx
              ? `translateX(-${currentIndex * stepPx}px)`
              : `translateX(-${currentIndex * (100 / cardsPerView)}%)`, // fallback before first measure
          }}
          onTransitionEnd={handleTransitionEnd}
        >
          {extendedProducts.map((p, i) => (
            <div
              key={`${p.id}-${p.cloneKey || i}`}
              className="w-[calc(50%-6px)] md:w-[calc(33.333%-11px)] shrink-0 flex"
            >
              <ThemeProductCard product={p} onAdd={() => onAddToCart(p)} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
