export default function ProductImageTrack({
  images,
  index,
  dragX,
  animateSlide,
  alt,
  fit,
}: {
  images: string[];
  index: number;
  dragX: number;
  animateSlide: boolean;
  alt: string;
  fit: "cover" | "contain";
}) {
  if (images.length === 0) return null;
  if (images.length === 1) {
    return (
      <img
        src={images[0]}
        alt={alt}
        className={`h-full w-full select-none ${
          fit === "cover" ? "object-cover" : "object-contain"
        }`}
      />
    );
  }

  const count = images.length;
  const frames = [
    images[(index - 1 + count) % count],
    images[index],
    images[(index + 1) % count],
  ];

  return (
    <div
      className="flex h-full w-[300%]"
      style={{
        transform: `translateX(calc(${-100 / 3}% + ${dragX}px))`,
        transition: animateSlide
          ? "transform 320ms cubic-bezier(0.22, 1, 0.36, 1)"
          : "none",
      }}
    >
      {frames.map((src, frameIndex) => (
        <div
          key={`${src}-${frameIndex}`}
          className="flex h-full w-1/3 shrink-0 items-center justify-center"
        >
          <img
            src={src}
            alt={alt}
            className={`pointer-events-none h-full w-full select-none ${
              fit === "cover"
                ? "object-cover"
                : "max-h-[76vh] max-w-[85vw] object-contain"
            }`}
          />
        </div>
      ))}
    </div>
  );
}
