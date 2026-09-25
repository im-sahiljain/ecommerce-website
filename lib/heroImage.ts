const HERO_WIDTHS = [800, 1024];

export const HERO_IMAGE_SIZES = "(min-width: 640px) 32rem, calc(100vw - 3rem)";

const FIRST_SLIDE =
  "https://res.cloudinary.com/dagkrnoap/image/upload/v1785413297/indian-kids-painting_zcbcf2.jpg";

const KIDS_SLIDE =
  "https://res.cloudinary.com/dagkrnoap/image/upload/v1790319150/kids-painting-slide_frxve1.jpg";

function sizedSrc(
  url: string,
  width: number,
  format: "avif" | "webp" | "jpg",
) {
  const height = Math.round(width * 0.75);
  return url.replace(
    "/upload/",
    `/upload/c_fill,g_auto,w_${width},h_${height},f_${format},q_auto/`,
  );
}

function srcSet(url: string, format: "avif" | "webp" | "jpg") {
  return HERO_WIDTHS.map(
    (width) => `${sizedSrc(url, width, format)} ${width}w`,
  ).join(", ");
}

export function heroSrcSet(format: "avif" | "webp" | "jpg") {
  return srcSet(FIRST_SLIDE, format);
}

export const heroFallbackSrc = sizedSrc(FIRST_SLIDE, 1024, "jpg");

export function kidsSlideSrcSet(format: "avif" | "webp" | "jpg") {
  return srcSet(KIDS_SLIDE, format);
}

export const kidsSlideFallbackSrc = sizedSrc(KIDS_SLIDE, 1024, "jpg");

const OWL_SHELF =
  "https://res.cloudinary.com/dagkrnoap/image/upload/v1790319149/owl-shelf_x9lcjm.png";

const PLASTER_CRAFTS =
  "https://res.cloudinary.com/dagkrnoap/image/upload/v1790319150/plaster-crafts_nmhps6.png";

const ILLUSTRATION_WIDTHS = [320, 480];

export const ILLUSTRATION_SIZES = "(min-width: 640px) 24rem, 20rem";

function limitedSrc(
  url: string,
  width: number,
  format: "avif" | "webp" | "png",
) {
  return url.replace(
    "/upload/",
    `/upload/c_limit,w_${width},f_${format},q_auto/`,
  );
}

function limitedSrcSet(url: string, format: "avif" | "webp" | "png") {
  return ILLUSTRATION_WIDTHS.map(
    (width) => `${limitedSrc(url, width, format)} ${width}w`,
  ).join(", ");
}

export function owlShelfSrcSet(format: "avif" | "webp" | "png") {
  return limitedSrcSet(OWL_SHELF, format);
}

export const owlShelfFallbackSrc = limitedSrc(OWL_SHELF, 480, "png");

export function plasterCraftsSrcSet(format: "avif" | "webp" | "png") {
  return limitedSrcSet(PLASTER_CRAFTS, format);
}

export const plasterCraftsFallbackSrc = limitedSrc(PLASTER_CRAFTS, 480, "png");
