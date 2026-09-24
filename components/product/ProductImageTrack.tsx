import Image from "next/image";

function SlideImage({
  src,
  alt,
  fit,
}: {
  src: string;
  alt: string;
  fit: "cover" | "contain";
}) {
  return (
    <Image
      src={src}
      alt={`${alt} plaster painting kit`}
      fill
      sizes="(max-width: 768px) 100vw, 50vw"
      className={`pointer-events-none select-none ${
        fit === "cover" ? "object-cover" : "object-contain"
      }`}
    />
  );
}

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
      <div className="relative h-full w-full">
        <SlideImage src={images[0]} alt={alt} fit={fit} />
      </div>
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
          className="relative flex h-full w-1/3 shrink-0 items-center justify-center"
        >
          <SlideImage src={src} alt={alt} fit={fit} />
        </div>
      ))}
    </div>
  );
}
