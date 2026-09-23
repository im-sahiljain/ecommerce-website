"use client";

import { useEffect, useMemo, useState } from "react";
import { useAppSelector } from "../store/hooks";
import type { RootState } from "../store/store";
import HeroCarousel from "../components/home/HeroCarousel";
import HomePromo from "../components/home/HomePromo";
import ThemeSections from "../components/home/ThemeSections";
import WhatWeSell from "../components/home/WhatWeSell";
import WhySection from "../components/home/WhySection";
import {
  DEFAULT_HOMEPAGE_SECTIONS,
  HOMEPAGE_SECTION_ORDER,
} from "../components/home/homepageSections";
import { productsForTheme } from "../components/home/themeProducts";
import type { Product } from "../components/home/homeTypes";

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
