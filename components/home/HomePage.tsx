import { Suspense } from "react";
import ShopCatalog, {
  ShopCatalogSkeleton,
} from "@/components/shop/ShopCatalog";
import { loadShopCatalog } from "@/lib/shopCatalog";
import HeroCarousel from "./HeroCarousel";
import HomePromo from "./HomePromo";

type CatalogSearchParams = { [key: string]: string | string[] | undefined };

const CATALOG_QUERY_KEYS = [
  "search",
  "q",
  "theme",
  "category",
  "ageGroup",
  "productLine",
  "productLineId",
  "packId",
] as const;

function catalogQueryString(params: CatalogSearchParams) {
  const next = new URLSearchParams();
  for (const key of CATALOG_QUERY_KEYS) {
    const value = params[key];
    if (typeof value !== "string" || !value) continue;
    next.set(key === "q" ? "search" : key, value);
  }
  return next.toString();
}

export default function HomePage({
  searchParams,
}: {
  searchParams: Promise<CatalogSearchParams>;
}) {
  return (
    <div style={{ fontFamily: "'Quicksand', sans-serif", color: "#333" }}>
      <HeroCarousel />
      <div id="catalog">
        <Suspense fallback={<ShopCatalogSkeleton />}>
          <HomeShopCatalog searchParams={searchParams} />
        </Suspense>
      </div>
      <HomePromo />
    </div>
  );
}

async function HomeShopCatalog({
  searchParams,
}: {
  searchParams: Promise<CatalogSearchParams>;
}) {
  const [catalog, params] = await Promise.all([
    loadShopCatalog(),
    searchParams,
  ]);
  return (
    <ShopCatalog
      syncUrl={false}
      searchParamsString={catalogQueryString(params)}
      initialProducts={catalog.products}
      initialPacks={catalog.packs}
      initialProductLines={catalog.productLines}
    />
  );
}
