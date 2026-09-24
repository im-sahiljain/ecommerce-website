import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db, type Pack, type Product } from "@/lib/db";
import { guideBySlug, GUIDES } from "@/lib/guides";
import { productPath, siteUrl } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

function picksFor(slug: string, products: Product[], packs: Pack[]) {
  if (slug === "home-decor-figurines") {
    return products.filter(
      (product) =>
        product.isVisible !== false &&
        (product.category === "Pot" || /pot/i.test(product.name)),
    );
  }
  if (slug === "birthday-return-gifts") {
    const packRows = packs.map((pack) => ({
      id: pack.id,
      name: pack.name,
      slug: pack.slug,
      price: pack.price,
    }));
    const singles = products
      .filter((product) => product.isVisible !== false && product.category !== "Pot")
      .slice(0, 6)
      .map((product) => ({
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
      }));
    return [...packRows, ...singles];
  }
  return products.filter(
    (product) => product.isVisible !== false && product.category !== "Pot",
  );
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
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <h1 className="text-3xl font-extrabold text-[#3C2A21] sm:text-4xl">{guide.h1}</h1>
      <div className="mt-6 space-y-4 text-base leading-relaxed text-slate-600">
        {guide.paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
      <p className="mt-8">
        <Link href={guide.shopHref} className="font-bold text-pink-600 hover:text-pink-700">
          {guide.shopLabel}
        </Link>
      </p>
      {picks.length > 0 && (
        <ul className="mt-10 divide-y divide-slate-100 rounded-2xl border border-slate-100 bg-white">
          {picks.map((item) => (
            <li key={item.id}>
              <Link
                href={productPath(item)}
                className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-slate-50"
              >
                <span className="font-bold text-slate-800">{item.name}</span>
                <span className="text-sm font-semibold text-slate-500">
                  ₹{Number(item.price).toFixed(0)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
