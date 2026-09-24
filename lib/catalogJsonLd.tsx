import { productPath, siteUrl } from "@/lib/site";

export function catalogJsonLd(
  name: string,
  items: Array<{ id: string; name: string; slug?: string | null }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      url: `${siteUrl()}${productPath(item)}`,
    })),
  };
}

export function CatalogJsonLdScript({
  name,
  items,
}: {
  name: string;
  items: Array<{ id: string; name: string; slug?: string | null }>;
}) {
  const jsonLd = catalogJsonLd(name, items);
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
      }}
    />
  );
}
