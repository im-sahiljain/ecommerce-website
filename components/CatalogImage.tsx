import Image from "next/image";

export default function CatalogImage({
  src,
  name,
  sizes,
  className = "",
}: {
  src?: string;
  name: string;
  sizes: string;
  className?: string;
}) {
  if (!src) return null;
  return (
    <Image
      src={src}
      alt={`${name} plaster painting kit`}
      fill
      sizes={sizes}
      className={`object-cover ${className}`}
    />
  );
}
