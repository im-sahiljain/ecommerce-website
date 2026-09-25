import Link from "next/link";
import CatalogImage from "../CatalogImage";
import { productPath } from "@/lib/site";
import type { Product } from "./homeTypes";

export interface HomeKit {
  id: string;
  slug?: string;
  name: string;
  price: number;
  originalPrice?: number;
  image?: string;
  productIds?: string[];
  inStock?: boolean;
}

function piecesFor(kit: HomeKit, products: Product[]) {
  return (kit.productIds || []).flatMap((id) => {
    const product = products.find((item) => item.id === id);
    return product ? [product] : [];
  });
}

function KitCard({ kit, products }: { kit: HomeKit; products: Product[] }) {
  const pieces = piecesFor(kit, products);
  const image = kit.image || pieces[0]?.image || "";
  const names = pieces.map((piece) => piece.name);

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-2xl border border-neutral-100 bg-white text-secondary shadow-md">
      <Link href={productPath(kit)} className="block min-w-0">
        <div className="relative aspect-5/6 w-full overflow-hidden bg-sand sm:aspect-square">
          <CatalogImage
            src={image}
            name={kit.name}
            sizes="(max-width: 640px) 46vw, 280px"
            className="object-center transition duration-500 group-hover:scale-105"
          />
          <span className="absolute left-1.5 top-1.5 rounded-full bg-warning-500 px-2 py-0.5 text-xs font-bold text-white">
            Kit of {pieces.length || kit.productIds?.length || 1}
          </span>
        </div>
        <div className="px-2.5 pt-2">
          <h3 className="line-clamp-2 text-left text-base font-extrabold leading-tight">
            {kit.name}
          </h3>
          {names.length > 0 && (
            <p className="mt-1 line-clamp-2 text-xs font-semibold leading-snug text-neutral-500">
              {names.join(", ")}
            </p>
          )}
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-base font-black">
              ₹{Number(kit.price).toFixed(0)}
            </span>
            {kit.originalPrice && kit.originalPrice > kit.price && (
              <span className="text-[11px] font-semibold text-neutral-400 line-through">
                ₹{Number(kit.originalPrice).toFixed(0)}
              </span>
            )}
          </div>
        </div>
      </Link>
      <div className="mt-auto px-2.5 pb-2.5 pt-2">
        {kit.inStock === false ? (
          <span className="flex min-h-9 w-full items-center justify-center rounded-full bg-neutral-200 px-3 py-1.5 text-sm font-bold text-neutral-500">
            Out of Stock
          </span>
        ) : (
          <Link
            href={productPath(kit)}
            className="flex min-h-9 w-full items-center justify-center rounded-full bg-secondary px-3 py-1.5 text-sm font-bold text-white"
          >
            Buy Now
          </Link>
        )}
      </div>
    </div>
  );
}

function KitCardSkeleton() {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-md">
      <div className="aspect-5/6 w-full bg-sand motion-safe:animate-pulse sm:aspect-square" />
      <div className="space-y-2 px-2.5 pt-2">
        <div className="h-4 w-3/4 rounded-full bg-neutral-100 motion-safe:animate-pulse" />
        <div className="h-3 w-full rounded-full bg-neutral-100 motion-safe:animate-pulse" />
        <div className="h-3 w-2/3 rounded-full bg-neutral-100 motion-safe:animate-pulse" />
        <div className="h-4 w-1/3 rounded-full bg-neutral-100 motion-safe:animate-pulse" />
      </div>
      <div className="mt-auto px-2.5 pb-2.5 pt-2">
        <div className="h-9 w-full rounded-full bg-neutral-100 motion-safe:animate-pulse" />
      </div>
    </div>
  );
}

export default function HomeKits({
  kits,
  products,
  loading,
}: {
  kits: HomeKit[];
  products: Product[];
  loading: boolean;
}) {
  if (!loading && kits.length === 0) return null;

  const listed = [...kits].sort((a, b) => Number(b.price) - Number(a.price));

  return (
    <section className="bg-white px-6 pb-4 pt-2" aria-busy={loading}>
      <div className="mx-auto w-full max-w-7xl">
        <div className="max-w-xl space-y-2">
          <h2 className="text-3xl font-extrabold leading-tight text-secondary sm:text-4xl">
            Painting kits
          </h2>
          <p className="text-sm font-medium leading-relaxed text-neutral-600 sm:text-base">
            Each kit is a set of figurines, ready to paint together.
          </p>
        </div>
        <ul className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {loading
            ? [0, 1, 2, 3].map((slot) => (
                <li key={slot} aria-hidden="true">
                  <KitCardSkeleton />
                </li>
              ))
            : listed.map((kit) => (
                <li key={kit.id}>
                  <KitCard kit={kit} products={products} />
                </li>
              ))}
        </ul>
      </div>
    </section>
  );
}
