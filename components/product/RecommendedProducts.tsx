import Link from "next/link";
import { Heart } from "lucide-react";
import OptimisticAddToCart from "../OptimisticAddToCart";
import { otherCategoryProducts, type ProductDetail } from "./types";

function ProductBadges({ item }: { item: ProductDetail }) {
  const sellingFast =
    item.isSellingFast || Boolean(item.badge?.toLowerCase().includes("selling"));
  const isNew =
    item.isNewLaunch || Boolean(item.badge?.toLowerCase().includes("new"));
  const likes = item.likesCount || 0;

  return (
    <>
      <div className="absolute left-1.5 top-1.5 flex max-w-[70%] flex-wrap gap-1">
        {item.isPack ? (
          <span className="whitespace-nowrap rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white">
            {item.category || "Pack"}
          </span>
        ) : item.ageGroup?.trim() ? (
          <span className="whitespace-nowrap rounded-full bg-white/95 px-2 py-0.5 text-[10px] font-bold text-sky-800">
            {item.ageGroup}
          </span>
        ) : null}
        {sellingFast ? (
          <span className="whitespace-nowrap rounded-full bg-rose-600 px-2 py-0.5 text-[10px] font-bold text-white">
            Selling fast
          </span>
        ) : isNew ? (
          <span className="whitespace-nowrap rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-bold text-slate-900">
            New
          </span>
        ) : null}
      </div>
      {likes > 0 && (
        <div className="absolute right-1.5 top-1.5 flex items-center gap-0.5 rounded-full bg-white/95 px-2 py-0.5 text-[10px] font-bold text-rose-600">
          <Heart className="h-3 w-3 fill-rose-500 text-rose-500" />
          <span>{likes}</span>
        </div>
      )}
    </>
  );
}

export default function RecommendedProducts({
  product,
  catalog,
}: {
  product: ProductDetail;
  catalog: ProductDetail[];
}) {
  const recommended = otherCategoryProducts(product, catalog);
  if (recommended.length === 0) return null;

  return (
    <section className="mt-10 sm:mt-14">
      <h2 className="text-xl font-extrabold text-slate-800 sm:text-2xl">
        Recommended products
      </h2>
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
        {recommended.map((item) => (
          <article
            key={item.id}
            className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm"
          >
            <Link href={`/product/${item.id}`} className="group flex flex-col">
              <div className="relative aspect-square overflow-hidden bg-slate-50">
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
                <ProductBadges item={item} />
              </div>
              <div className="space-y-1 p-3 pb-2">
                {item.theme && item.theme !== "General" && (
                  <p className="text-[10px] font-bold uppercase tracking-wider text-pink-500">
                    {item.theme}
                  </p>
                )}
                <h3 className="line-clamp-2 text-sm font-bold text-slate-800 group-hover:text-pink-500">
                  {item.name}
                </h3>
              </div>
            </Link>
            <div className="mt-auto space-y-2 px-3 pb-3">
              <p className="text-sm font-extrabold text-slate-700">
                ₹{Number(item.price).toFixed(2)}
              </p>
              <OptimisticAddToCart
                product={{
                  id: item.id,
                  name: item.name,
                  price: Number(item.price),
                  image: item.image,
                  inStock: item.inStock,
                }}
              />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
