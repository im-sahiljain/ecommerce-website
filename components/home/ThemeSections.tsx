import Link from "next/link";
import type { CSSProperties } from "react";
import { ChevronRight } from "lucide-react";
import ThemeProductGrid from "./ThemeProductGrid";
import { whatWeSellBottomColor } from "./WhatWeSell";
import type { Product, ThemeSectionConfig } from "./homeTypes";

function shopMoreHref(products: Product[], themeKeyword: string) {
  const params = new URLSearchParams();
  const theme = products.find((product) => {
    const name = product.theme?.trim().toLowerCase();
    return Boolean(name) && name !== "general";
  })?.theme;
  if (theme) params.set("theme", theme);

  const lineCounts = new Map<string, number>();
  for (const product of products) {
    if (!product.productLineId) continue;
    lineCounts.set(
      product.productLineId,
      (lineCounts.get(product.productLineId) || 0) + 1,
    );
  }
  let productLineId = "";
  let bestCount = 0;
  for (const [id, count] of lineCounts) {
    if (count > bestCount) {
      productLineId = id;
      bestCount = count;
    }
  }
  if (productLineId) params.set("productLineId", productLineId);
  if (!params.has("theme") && !params.has("productLineId") && themeKeyword) {
    params.set("theme", themeKeyword);
  }
  return `/shop?${params.toString()}`;
}

export interface ActiveThemeSection {
  sectionConfig: ThemeSectionConfig;
  themeProducts: Product[];
}

export default function ThemeSections({
  sections,
  productsLoading,
}: {
  sections: ActiveThemeSection[];
  productsLoading: boolean;
}) {
  return (
    <>
      {sections.map(({ sectionConfig, themeProducts }, index) => {
        const previousBgColor =
          index === 0
            ? whatWeSellBottomColor
            : sections[index - 1].sectionConfig.bgColor;

        return (
          <section
            key={sectionConfig.id}
            className="relative overflow-hidden pt-14 pb-10 sm:pt-20 sm:pb-24"
            style={{
              backgroundColor: sectionConfig.bgColor,
              color: sectionConfig.textColor,
              marginTop: index === 0 ? -1 : undefined,
            }}
          >
            <div
              className="absolute top-0 left-0 w-full overflow-hidden"
              style={{ lineHeight: 0 }}
            >
              <svg
                className="relative block"
                style={{ width: "calc(100% + 1.3px)", height: "60px" }}
                fill={previousBgColor}
                preserveAspectRatio="none"
                viewBox="0 0 1200 120"
              >
                <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5,73.84-4.36,147.54,16.88,218.2,35.26,69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113,2,1200,0Z" />
              </svg>
            </div>

            {sectionConfig.decorations?.map((decor) =>
              decor.type === "emoji" ? (
                <span
                  key={decor.id}
                  className={`absolute pointer-events-none select-none ${decor.className || ""}`}
                  style={decor.style}
                >
                  {decor.content}
                </span>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={decor.id}
                  src={decor.content}
                  alt=""
                  className={`absolute pointer-events-none ${decor.className || ""}`}
                  style={decor.style}
                  onError={(event) => {
                    event.currentTarget.style.display = "none";
                  }}
                />
              ),
            )}

            <div className="relative z-10 mx-auto w-[84%] max-w-5xl">
              <div className="flex flex-col items-start gap-6 text-left sm:flex-row sm:items-end sm:justify-between sm:gap-8">
                <div className="max-w-xl space-y-4 sm:max-w-none sm:flex-1">
                  <h2
                    className="font-extrabold leading-tight text-3xl sm:whitespace-nowrap sm:text-4xl md:text-5xl"
                    style={{ color: sectionConfig.textColor }}
                  >
                    {sectionConfig.displayTitle || sectionConfig.title}
                  </h2>
                  {(sectionConfig.displayDescription ||
                    sectionConfig.subtitle) && (
                    <p className="text-sm font-medium leading-relaxed opacity-90 sm:text-base">
                      {sectionConfig.displayDescription ||
                        sectionConfig.subtitle}
                    </p>
                  )}
                </div>
                <Link
                  href={shopMoreHref(themeProducts, sectionConfig.themeKeyword)}
                  className="inline-flex shrink-0 items-center space-x-1.5 rounded-full bg-(--shop-more-bg) px-6 py-2.5 text-sm font-extrabold shadow-md transition hover:bg-(--shop-more-hover) active:scale-95"
                  style={
                    {
                      color: sectionConfig.shopMoreText,
                      "--shop-more-bg": sectionConfig.shopMoreBg,
                      "--shop-more-hover": sectionConfig.shopMoreHoverBg,
                    } as CSSProperties
                  }
                >
                  <span>{sectionConfig.shopMoreLabel}</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              <ThemeProductGrid
                themeProducts={themeProducts}
                loading={productsLoading}
              />
            </div>
          </section>
        );
      })}
    </>
  );
}
