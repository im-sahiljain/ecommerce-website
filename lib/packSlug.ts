import { db } from "@/lib/db";
import { publicSlug, slugify } from "@/lib/slug";

export function packSlugFrom(name: string, slug?: string | null) {
  return slugify(slug || "") || slugify(name);
}

export async function packSlugError(slug: string, exceptPackId?: string) {
  const [products, packs] = await Promise.all([db.getProducts(), db.getPacks()]);
  const product = products.find((item) => publicSlug(item) === slug);
  if (product) return `This link is already used by ${product.name}.`;
  const pack = packs.find((item) => item.id !== exceptPackId && publicSlug(item) === slug);
  if (pack) return `This link is already used by ${pack.name}.`;
  return null;
}
