"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useReducedMotion } from "framer-motion";
import CatalogImage from "./CatalogImage";
import type { PackSlide } from "@/lib/packSlides";

export type { PackSlide };

export default function PackCardSlides({
  slides,
  sizes,
  className = "",
  children,
  caption,
}: {
  slides: PackSlide[];
  sizes: string;
  className?: string;
  children?: React.ReactNode;
  caption?: (current: { names: string[]; currentName: string }) => React.ReactNode;
}) {
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [animate, setAnimate] = useState(true);
  const count = slides.length;
  const looping = count > 1 && !reduceMotion;
  const track = looping ? [...slides, slides[0]] : slides;
  const trackCount = track.length;
  const visibleIndex = count === 0 ? 0 : index >= count ? 0 : index;
  const current = slides[visibleIndex];

  const names: string[] = [];
  for (const slide of slides) {
    if (!names.includes(slide.name)) names.push(slide.name);
  }

  useEffect(() => {
    if (count < 2 || paused || reduceMotion) return;
    const timer = window.setInterval(() => {
      setAnimate(true);
      setIndex((value) => (value >= count ? value : value + 1));
    }, 2800);
    return () => window.clearInterval(timer);
  }, [count, paused, reduceMotion]);

  useEffect(() => {
    if (!looping || index < count) return;
    const timer = window.setTimeout(() => {
      setAnimate(false);
      setIndex(0);
    }, 520);
    return () => window.clearTimeout(timer);
  }, [index, count, looping]);

  const step = (direction: number) => (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (direction > 0 && looping) {
      setAnimate(true);
      setIndex((value) => (value >= count ? value : value + 1));
      return;
    }
    setAnimate(!reduceMotion);
    setIndex((value) => {
      const shown = value >= count ? 0 : value;
      return (shown + direction + count) % count;
    });
  };

  const finishForwardLoop = (event: React.TransitionEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget || event.propertyName !== "transform") return;
    if (index < count) return;
    setAnimate(false);
    setIndex(0);
  };

  if (!current) return null;

  return (
    <div>
      <div
        className={`relative aspect-square overflow-hidden bg-neutral-50 ${className}`}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div
          className={`flex h-full ${animate && !reduceMotion ? "transition-transform duration-500 ease-out" : ""}`}
          style={{
            width: `${trackCount * 100}%`,
            transform: `translateX(-${(index * 100) / trackCount}%)`,
          }}
          onTransitionEnd={finishForwardLoop}
        >
          {track.map((slide, slideIndex) => (
            <div
              key={`${slide.name}-${slide.image}-${slideIndex}`}
              className="relative h-full"
              style={{ width: `${100 / trackCount}%` }}
            >
              <CatalogImage src={slide.image} name={slide.name} sizes={sizes} />
            </div>
          ))}
        </div>
        {children}
        {count > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous product image"
              onClick={step(-1)}
              className="absolute left-2 top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-neutral-800 shadow-md"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label="Next product image"
              onClick={step(1)}
              className="absolute right-2 top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-neutral-800 shadow-md"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>
      {caption?.({ names, currentName: current.name })}
    </div>
  );
}
