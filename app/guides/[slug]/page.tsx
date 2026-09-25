import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import CatalogImage from "@/components/CatalogImage";
import OptimisticAddToCart from "@/components/OptimisticAddToCart";
import PackCardSlides from "@/components/PackCardSlides";
import { slidesForPack, type PackSlide } from "@/lib/packSlides";
import { db, type Pack, type Product } from "@/lib/db";
import { guideBySlug, GUIDES } from "@/lib/guides";
import { productPath, siteUrl } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

type GuidePick = {
  id: string;
  name: string;
  slug?: string | null;
  price: number;
  image?: string;
  inStock?: boolean;
  theme?: string;
  slides?: PackSlide[];
};

function productPick(product: Product): GuidePick {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    price: product.price,
    image: product.image,
    inStock: product.inStock,
    theme: product.theme,
  };
}

function packPick(pack: Pack, products: Product[]): GuidePick {
  const slides = slidesForPack(pack.productIds, products);
  return {
    id: pack.id,
    name: pack.name,
    slug: pack.slug,
    price: pack.price,
    image: pack.image || slides[0]?.image,
    inStock: pack.inStock,
    slides,
  };
}

function picksFor(slug: string, products: Product[], packs: Pack[]): GuidePick[] {
  if (slug === "home-decor-figurines") {
    return products
      .filter(
        (product) =>
          product.isVisible !== false &&
          (product.category === "Pot" || /pot/i.test(product.name)),
      )
      .map(productPick);
  }
  if (slug === "birthday-return-gifts") {
    const singles = products
      .filter((product) => product.isVisible !== false && product.category !== "Pot")
      .slice(0, 6)
      .map(productPick);
    return [...packs.map((pack) => packPick(pack, products)), ...singles];
  }
  return products
    .filter((product) => product.isVisible !== false && product.category !== "Pot")
    .map(productPick);
}

export function generateStaticParams() {
  return GUIDES.map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const guide = guideBySlug(slug);
  if (!guide) {
    return { title: "Guide Not Found", robots: { index: false, follow: false } };
  }
  const path = `/guides/${guide.slug}`;
  return {
    title: guide.title,
    description: guide.description,
    alternates: { canonical: path },
    openGraph: {
      title: guide.title,
      description: guide.description,
      url: `${siteUrl()}${path}`,
    },
  };
}

export default async function GuidePage({ params }: Props) {
  const { slug } = await params;
  const guide = guideBySlug(slug);
  if (!guide) notFound();

  const [products, packs] = await Promise.all([db.getProducts(), db.getPacks()]);
  const picks = picksFor(guide.slug, products, packs).slice(0, 8);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: guide.h1,
    itemListElement: picks.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      url: `${siteUrl()}${productPath(item)}`,
    })),
  };

  return (
    <article className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <div>
        <h1 className="text-3xl font-extrabold text-secondary sm:text-4xl">{guide.h1}</h1>
        <div className="mt-6 space-y-4 text-base leading-relaxed text-neutral-600">
          {guide.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        <p className="mt-8">
          <Link href={guide.shopHref} className="font-bold text-primary hover:text-primary">
            {guide.shopLabel}
          </Link>
        </p>
      </div>
      {picks.length > 0 && (
        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
          {picks.map((item) => (
            <article
              key={item.id}
              className="flex h-full flex-col overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-xs"
            >
              <Link href={productPath(item)} className="group flex flex-col">
                {item.slides && item.slides.length > 1 ? (
                  <PackCardSlides
                    slides={item.slides}
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                ) : (
                <div className="relative aspect-square overflow-hidden bg-neutral-50">
                  <CatalogImage
                    src={item.image}
                    name={item.name}
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="transition duration-500 group-hover:scale-105"
                  />
                </div>
                )}
                <div className="space-y-1 p-3 pb-2">
                  {item.theme && item.theme !== "General" && (
                    <p className="text-[10px] font-bold uppercase tracking-wider text-primary">
                      {item.theme}
                    </p>
                  )}
                  <h2 className="line-clamp-2 text-sm font-bold text-neutral-800 group-hover:text-primary">
                    {item.name}
                  </h2>
                </div>
              </Link>
              <div className="mt-auto space-y-2 px-3 pb-3">
                <p className="text-sm font-extrabold text-neutral-700">
                  ₹{Number(item.price).toFixed(2)}
                </p>
                <OptimisticAddToCart
                  product={{
                    id: item.id,
                    name: item.name,
                    price: Number(item.price),
                    image: item.image || "",
                    inStock: item.inStock,
                  }}
                />
              </div>
            </article>
          ))}
        </div>
      )}
    </article>
  );
}
