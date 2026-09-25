import { publicSlug } from "./slug";

const SITE_LOGO_URL =
  "https://res.cloudinary.com/dagkrnoap/image/upload/v1790319105/logo_j5owq1.png";

const SHARE_TRANSFORM =
  "c_pad,w_1200,h_630,b_white,f_jpg,q_auto,fl_progressive";

export function siteLogoUrl(): string {
  return process.env.NEXT_PUBLIC_SEO_IMAGE_URL || SITE_LOGO_URL;
}

export function siteShareImageUrl(): string {
  const source = siteLogoUrl();
  if (
    !source.includes("res.cloudinary.com") ||
    !source.includes("/upload/") ||
    source.includes(`/${SHARE_TRANSFORM}/`)
  ) {
    return source;
  }
  return source.replace("/upload/", `/upload/${SHARE_TRANSFORM}/`);
}

export function siteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL || "https://kitsandcraft.vercel.app";
  return raw.replace(/\/+$/, "");
}

export function productPath(item: {
  id: string;
  name?: string | null;
  slug?: string | null;
}) {
  return `/product/${publicSlug(item)}`;
}

export function productLineShopHref(line: {
  id: string;
  name?: string | null;
  slug?: string | null;
}) {
  return `/?productLine=${publicSlug(line)}#catalog`;
}
