"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Heart, X, ZoomIn } from "lucide-react";
import ProductImageTrack from "./ProductImageTrack";
import { productImages, type ProductDetail } from "./types";

export default function ProductGallery({
  product,
  likesCount,
  isLiked,
  onLike,
}: {
  product: ProductDetail;
  likesCount: number;
  isLiked: boolean;
  onLike: () => void;
}) {
  const images = productImages(product);
  const [selectedImgIndex, setSelectedImgIndex] = useState(0);
  const [imageDragX, setImageDragX] = useState(0);
  const [imageDragging, setImageDragging] = useState(false);
  const [imageSlideInstant, setImageSlideInstant] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [isFullscreenModalOpen, setIsFullscreenModalOpen] = useState(false);
  const imageTouchStart = useRef<{ x: number; y: number } | null>(null);
  const blockImageClick = useRef(false);
  const imageSlideLock = useRef(false);

  useEffect(() => {
    setSelectedImgIndex(0);
    setImageDragX(0);
    setImageDragging(false);
    setIsFullscreenModalOpen(false);
  }, [product.id]);

  const slideImage = (direction: 1 | -1, frameWidth?: number) => {
    if (images.length < 2 || imageSlideLock.current) return;
    imageSlideLock.current = true;
    const distance = frameWidth && frameWidth > 0 ? frameWidth : 320;
    setImageDragging(false);
    setImageDragX(direction === 1 ? -distance : distance);
    window.setTimeout(() => {
      setImageSlideInstant(true);
      setImageDragX(0);
      setSelectedImgIndex(
        (current) => (current + direction + images.length) % images.length,
      );
    }, 320);
  };

  useEffect(() => {
    if (!imageSlideInstant) return;
    const frame = requestAnimationFrame(() => {
      setImageSlideInstant(false);
      imageSlideLock.current = false;
    });
    return () => cancelAnimationFrame(frame);
  }, [imageSlideInstant]);

  useEffect(() => {
    if (!isFullscreenModalOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") slideImage(-1);
      if (event.key === "ArrowRight") slideImage(1);
      if (event.key === "Escape") setIsFullscreenModalOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreenModalOpen, images.length]);

  const handlePrevImage = (event?: React.MouseEvent) => {
    event?.stopPropagation();
    const frame = (event?.currentTarget as HTMLElement | undefined)
      ?.parentElement;
    slideImage(-1, frame?.clientWidth);
  };

  const handleNextImage = (event?: React.MouseEvent) => {
    event?.stopPropagation();
    const frame = (event?.currentTarget as HTMLElement | undefined)
      ?.parentElement;
    slideImage(1, frame?.clientWidth);
  };

  const handleImageTouchStart = (event: React.TouchEvent) => {
    if (imageSlideLock.current || images.length < 2) return;
    const touch = event.changedTouches[0];
    imageTouchStart.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleImageTouchMove = (event: React.TouchEvent) => {
    const start = imageTouchStart.current;
    if (!start || imageSlideLock.current) return;
    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - start.x;
    const deltaY = touch.clientY - start.y;
    if (!imageDragging && Math.abs(deltaX) <= Math.abs(deltaY)) return;
    if (!imageDragging && Math.abs(deltaX) < 8) return;
    setImageDragging(true);
    setImageDragX(deltaX);
  };

  const handleImageTouchEnd = (event: React.TouchEvent) => {
    const start = imageTouchStart.current;
    imageTouchStart.current = null;
    if (!start || images.length < 2) return;
    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - start.x;
    const deltaY = touch.clientY - start.y;
    if (
      !imageDragging &&
      (Math.abs(deltaX) < 48 || Math.abs(deltaX) <= Math.abs(deltaY))
    ) {
      setImageDragX(0);
      return;
    }
    if (Math.abs(deltaX) < 48) {
      setImageDragging(false);
      setImageDragX(0);
      return;
    }
    blockImageClick.current = true;
    slideImage(
      deltaX < 0 ? 1 : -1,
      (event.currentTarget as HTMLElement).clientWidth,
    );
  };

  const openImageLightbox = () => {
    if (blockImageClick.current) {
      blockImageClick.current = false;
      return;
    }
    setIsFullscreenModalOpen(true);
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setMousePos({
      x: Math.max(
        0,
        Math.min(100, ((event.clientX - rect.left) / rect.width) * 100),
      ),
      y: Math.max(
        0,
        Math.min(100, ((event.clientY - rect.top) / rect.height) * 100),
      ),
    });
  };

  const currentImageUrl = images[selectedImgIndex] || product.image;
  const animateSlide = !imageDragging && !imageSlideInstant;

  return (
    <>
      <div className="space-y-4">
        <div
          className="group relative flex aspect-square cursor-pointer select-none items-center justify-center overflow-hidden rounded-3xl border border-slate-200/80 bg-slate-50 shadow-xs touch-pan-y"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onMouseMove={handleMouseMove}
          onTouchStart={handleImageTouchStart}
          onTouchMove={handleImageTouchMove}
          onTouchEnd={handleImageTouchEnd}
          onClick={openImageLightbox}
        >
          <div className="absolute inset-0 overflow-hidden">
            <ProductImageTrack
              images={images}
              index={selectedImgIndex}
              dragX={imageDragX}
              animateSlide={animateSlide}
              alt={product.name}
              fit="cover"
            />
          </div>

          {isHovered && (
            <div
              className="pointer-events-none absolute z-30 hidden h-28 w-28 rounded-2xl border-2 border-pink-500 bg-pink-500/20 shadow-lg transition-transform duration-75 md:block"
              style={{
                left: `calc(${mousePos.x}% - 3.5rem)`,
                top: `calc(${mousePos.y}% - 3.5rem)`,
              }}
            />
          )}

          <div className="pointer-events-none absolute left-4 top-4 z-20 flex flex-col space-y-2">
            <span className="rounded-full bg-sky-100/90 px-3.5 py-1.5 text-xs font-bold text-sky-800 shadow-xs backdrop-blur-md">
              {product.ageGroup}
            </span>
          </div>

          {/* <div className="absolute right-4 top-4 z-20 flex items-center space-x-2">
            <motion.button
              layout
              onClick={(event) => {
                event.stopPropagation();
                onLike();
              }}
              title={isLiked ? "Unlike Product" : "Like Product"}
              className={`flex h-9 items-center justify-center rounded-full shadow-sm backdrop-blur-md transition-all duration-300 active:scale-95 ${
                likesCount > 0 ? "space-x-1.5 px-3" : "w-9 px-0"
              } ${
                isLiked
                  ? "bg-rose-500 text-white"
                  : "bg-white/80 text-slate-700 hover:bg-white hover:text-rose-500"
              }`}
            >
              <Heart
                className={`h-4 w-4 shrink-0 transition-transform ${isLiked ? "scale-110 fill-current" : ""}`}
              />
              <AnimatePresence initial={false}>
                {likesCount > 0 && (
                  <motion.span
                    key="img-like-count"
                    initial={{ opacity: 0, width: 0, scale: 0.8 }}
                    animate={{ opacity: 1, width: "auto", scale: 1 }}
                    exit={{ opacity: 0, width: 0, scale: 0.8 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="inline-block overflow-hidden whitespace-nowrap text-xs font-extrabold"
                  >
                    {likesCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div> */}

          {images.length > 1 && (
            <>
              <button
                onClick={handlePrevImage}
                aria-label="Previous Image"
                className="absolute left-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-800 opacity-90 shadow-md backdrop-blur-md transition-all hover:scale-110 hover:bg-white group-hover:opacity-100 sm:opacity-0"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={handleNextImage}
                aria-label="Next Image"
                className="absolute right-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-800 opacity-90 shadow-md backdrop-blur-md transition-all hover:scale-110 hover:bg-white group-hover:opacity-100 sm:opacity-0"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}
        </div>

        {images.length > 0 && (
          <div className="no-scrollbar flex items-center space-x-3 overflow-x-auto p-1">
            {images.map((imgUrl, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImgIndex(idx)}
                className={`flex h-16 w-16 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-2 bg-white transition sm:h-20 sm:w-20 ${
                  selectedImgIndex === idx
                    ? "scale-105 border-pink-500 shadow-md ring-2 ring-pink-500/30"
                    : "border-slate-200 opacity-70 hover:border-slate-300 hover:opacity-100"
                }`}
              >
                <img
                  src={imgUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {isHovered && (
        <div className="animate-fade-in pointer-events-none absolute left-[51.5%] top-10 z-40 hidden aspect-square w-[45%] overflow-hidden rounded-3xl border-2 border-pink-400 bg-white shadow-2xl lg:block">
          <div
            className="h-full w-full bg-no-repeat"
            style={{
              backgroundImage: `url(${currentImageUrl})`,
              backgroundSize: "280% 280%",
              backgroundPosition: `${mousePos.x}% ${mousePos.y}%`,
            }}
          />
        </div>
      )}

      {isFullscreenModalOpen && (
        <div className="animate-fade-in fixed inset-0 z-[100] flex flex-col justify-between bg-black/95 p-4 text-white backdrop-blur-xl sm:p-8">
          <div className="z-10 mx-auto flex w-full max-w-7xl items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-bold text-white backdrop-blur-md">
                {selectedImgIndex + 1} / {images.length}
              </span>
              <h3 className="max-w-xs truncate text-sm font-bold text-slate-200 sm:max-w-md sm:text-base">
                {product.name}
              </h3>
            </div>
            <button
              onClick={() => setIsFullscreenModalOpen(false)}
              className="rounded-full bg-white/10 p-3 text-white backdrop-blur-md transition hover:scale-110 hover:bg-white/20"
              aria-label="Close Lightbox"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div
            className="relative my-4 flex w-full max-w-7xl flex-1 touch-pan-y items-center justify-center overflow-hidden"
            onTouchStart={handleImageTouchStart}
            onTouchMove={handleImageTouchMove}
            onTouchEnd={handleImageTouchEnd}
          >
            {images.length > 1 && (
              <button
                onClick={handlePrevImage}
                className="absolute left-2 z-20 rounded-full bg-white/10 p-3 text-white shadow-lg backdrop-blur-md transition hover:scale-110 hover:bg-white/25 sm:left-6 sm:p-4"
                aria-label="Previous Image"
              >
                <ChevronLeft className="h-8 w-8 sm:h-10 sm:w-10" />
              </button>
            )}
            <div className="h-full w-full overflow-hidden">
              <ProductImageTrack
                images={images}
                index={selectedImgIndex}
                dragX={imageDragX}
                animateSlide={animateSlide}
                alt={product.name}
                fit="contain"
              />
            </div>
            {images.length > 1 && (
              <button
                onClick={handleNextImage}
                className="absolute right-2 z-20 rounded-full bg-white/10 p-3 text-white shadow-lg backdrop-blur-md transition hover:scale-110 hover:bg-white/25 sm:right-6 sm:p-4"
                aria-label="Next Image"
              >
                <ChevronRight className="h-8 w-8 sm:h-10 sm:w-10" />
              </button>
            )}
          </div>

          {images.length > 1 && (
            <div className="no-scrollbar z-10 mx-auto flex w-full max-w-7xl items-center justify-center space-x-3 overflow-x-auto py-2">
              {images.map((imgUrl, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImgIndex(idx)}
                  className={`h-14 w-14 shrink-0 cursor-pointer overflow-hidden rounded-xl border-2 bg-white p-1 transition sm:h-16 sm:w-16 ${
                    selectedImgIndex === idx
                      ? "scale-110 border-pink-500 shadow-lg ring-2 ring-pink-500/50"
                      : "border-white/20 opacity-60 hover:opacity-100"
                  }`}
                >
                  <img
                    src={imgUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
