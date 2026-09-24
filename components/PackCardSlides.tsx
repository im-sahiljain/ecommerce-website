"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import CatalogImage from "./CatalogImage";
import type { PackSlide } from "@/lib/packSlides";

export type { PackSlide };

export default function PackCardSlides({
  slides,
  sizes,
  className = "",
  children,
}: {
  slides: PackSlide[];
  sizes: string;
  className?: string;
  children?: React.ReactNode;
}) {
  const [index, setIndex] = useState(0);
  const count = slides.length;
  const current = slides[Math.min(index, Math.max(count - 1, 0))];
  if (!current) return null;

  const names: string[] = [];
  for (const slide of slides) {
    if (!names.includes(slide.name)) names.push(slide.name);
  }

  const step = (direction: number) => (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIndex((value) => (value + direction + count) % count);
  };

  return (
    <div>
      <div className={`relative aspect-square overflow-hidden bg-slate-50 ${className}`}>
        <CatalogImage
          key={`${index}-${current.image}`}
          src={current.image}
          name={current.name}
          sizes={sizes}
          className="transition duration-500"
        />
        {children}
        {count > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous product image"
              onClick={step(-1)}
              className="absolute left-2 top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-800 shadow-md"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label="Next product image"
              onClick={step(1)}
              className="absolute right-2 top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-800 shadow-md"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>
      {names.length > 0 && (
        <p className="mt-2 flex flex-wrap gap-x-2 gap-y-0.5 text-[11px] font-bold leading-snug">
          {names.map((name) => (
            <span
              key={name}
              className={name === current.name ? "text-pink-500" : "text-slate-400"}
            >
              {name}
            </span>
          ))}
        </p>
      )}
    </div>
  );
}
