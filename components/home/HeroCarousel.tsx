"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

const heroSlides = [
  {
    id: 0,
    bgColor: "#EBF5FF",
    content: (
      <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col md:flex-row items-center w-full py-5 md:py-16">
        <div className="w-full md:w-5/12 text-center md:text-left mb-8 md:mb-0">
          {/* <span className="inline-flex items-center gap-1.5 px-3.5 py-1 mb-3 rounded-full text-xs font-extrabold bg-sky-100 text-sky-900 tracking-wide uppercase border border-sky-200/80 shadow-xs">
            <span>🎨 Plaster Craft Kits for Kids</span>
          </span> */}
          <h1
            className="font-extrabold leading-tight mb-4"
            style={{
              fontSize: "clamp(2.15rem, 5.5vw, 3.6rem)",
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
              className="px-7 py-3.5 text-white rounded-full font-bold shadow-lg text-center text-base transition hover:opacity-90 active:scale-95 bg-[#3C2A21]"
            >
              Shop Painting Kits
            </Link>
            <Link
              href="/shop"
              className="hidden md:block px-7 py-3.5 rounded-full font-bold text-center text-base transition hover:bg-sky-100/60 active:scale-95"
              style={{
                border: "2px solid #3C2A21",
                color: "#3C2A21",
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
      <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col md:flex-row items-center w-full py-5 md:py-16">
        <div className="w-full md:w-5/12 text-center md:text-left mb-8 md:mb-0">
          {/* <div className="inline-flex items-center gap-2 px-3.5 py-1 mb-3 rounded-full text-xs font-extrabold bg-pink-100 text-pink-800 tracking-wide uppercase">
            <span>✨ DIY Home Decor Project</span>
          </div> */}

          <h2
            className="font-black leading-tight mb-3 uppercase tracking-tight"
            style={{
              fontSize: "clamp(2rem, 5vw, 3.15rem)",
              color: "#3C2A21",
            }}
          >
            Brighten Up
            <br />
            Your Home!
            <br />
            {/* <span className="text-pink-600">Décor Project.</span> */}
          </h2>

          {/* <div className="inline-block bg-amber-100/90 text-[#3C2A21] px-3.5 py-1.5 rounded-xl font-bold text-xs sm:text-sm mb-5 border border-amber-300/60 shadow-xs">
            🏡 Kids' Art as Charming Home Décor!
          </div> */}

          <p className="mb-6 max-w-md mx-auto md:mx-0 text-slate-600 text-sm sm:text-base leading-relaxed font-medium">
            Turn your kids' hand-painted plaster creations into timeless shelf &
            desk keepsakes to proudly display around the house.
          </p>

          <div className="flex justify-center md:justify-start">
            <Link
              href="/shop"
              className="px-7 py-3.5 text-white rounded-full font-black uppercase tracking-wider shadow-xl text-center text-base transition hover:opacity-95 active:scale-95 bg-pink-700 hover:bg-pink-800"
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
      <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col md:flex-row items-center w-full py-5 md:py-16">
        <div className="w-full md:w-5/12 text-center md:text-left mb-8 md:mb-0">
          {/* <span className="inline-block px-3.5 py-1 mb-3 rounded-full text-xs font-extrabold bg-amber-100 text-amber-800 tracking-wide uppercase">
            🌟 Screen-Free Family Joy
          </span> */}
          <h2
            className="font-extrabold leading-tight mb-5"
            style={{
              fontSize: "clamp(2.15rem, 5.5vw, 3.6rem)",
              color: "#3C2A21",
            }}
          >
            Unleash Their
            <br />
            Creative Wonder!
          </h2>
          <p className="mb-8 max-w-md mx-auto md:mx-0 text-base sm:text-lg font-medium leading-relaxed text-slate-600">
            Watch young imaginations blossom! Non-toxic, vibrant plaster
            painting kits that bring hours of proud artistic fun.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <Link
              href="/shop"
              className="px-7 py-3.5 text-white rounded-full font-bold shadow-lg text-center text-base transition hover:opacity-90 active:scale-95 bg-amber-600 hover:bg-amber-700"
            >
              Shop Kids' Art Kits
            </Link>
            <Link
              href="/bundles"
              className="hidden md:block px-7 py-3.5 rounded-full font-bold text-center text-base transition hover:bg-amber-100/60 active:scale-95"
              style={{
                border: "2px solid #3C2A21",
                color: "#3C2A21",
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

export default function HeroCarousel() {
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
  );
}
