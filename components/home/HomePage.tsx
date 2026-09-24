"use client";

import { useEffect, useMemo, useState } from "react";
import { useAppSelector } from "../../store/hooks";
import type { RootState } from "../../store/store";
import HeroCarousel from "./HeroCarousel";
import HomePromo from "./HomePromo";
import ThemeSections from "./ThemeSections";
import WhatWeSell from "./WhatWeSell";
import WhySection from "./WhySection";
import {
  DEFAULT_HOMEPAGE_SECTIONS,
  HOMEPAGE_SECTION_ORDER,
} from "./homepageSections";
import { productsForTheme } from "./themeProducts";
import type { Product } from "./homeTypes";

export default function HomePage() {
  const reduxProducts = useAppSelector(
    (state: RootState) => state.products.items,
  ) as Product[];
  const [fetchedProducts, setFetchedProducts] = useState<Product[]>([]);
  const [productsFetchSettled, setProductsFetchSettled] = useState(false);

  const products = reduxProducts.length > 0 ? reduxProducts : fetchedProducts;
  const productsLoading =
    reduxProducts.length === 0 &&
    fetchedProducts.length === 0 &&
    !productsFetchSettled;

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setFetchedProducts(data);
      })
      .catch(() => {})
      .finally(() => setProductsFetchSettled(true));
  }, []);

  const activeThemeSections = useMemo(
    () =>
      HOMEPAGE_SECTION_ORDER.map((id) =>
        DEFAULT_HOMEPAGE_SECTIONS.find((section) => section.id === id),
      )
        .filter((section) => section != null)
        .map((sectionConfig) => ({
          sectionConfig: {
            ...sectionConfig,
            displayTitle: sectionConfig.title,
            displayDescription: sectionConfig.subtitle,
          },
          themeProducts: productsForTheme(
            products,
            sectionConfig.themeKeyword,
            sectionConfig.productLineId,
          ),
        })),
    [products],
  );

  return (
    <div style={{ fontFamily: "'Quicksand', sans-serif", color: "#333" }}>
      <HeroCarousel />
      <WhatWeSell />
      {/* <WhySection /> */}
      <ThemeSections
        sections={activeThemeSections}
        productsLoading={productsLoading}
      />
      <HomePromo />
    </div>
  );
}
