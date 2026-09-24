import { publicSlug } from "./slug";

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
  return `/shop?productLine=${publicSlug(line)}`;
}
