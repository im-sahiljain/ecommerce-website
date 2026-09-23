import type React from "react";

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  theme: string;
  category: string;
  ageGroup: string;
  productLineId?: string;
  isNonToxic: boolean;
  image: string;
  images?: string[];
  description: string;
  badge?: string;
  isNewLaunch?: boolean;
  isSellingFast?: boolean;
  size?: string;
  material?: string;
  isVisible?: boolean;
  inStock?: boolean;
  likesCount?: number;
  attributes?: Record<string, string>;
  createdAt?: string;
  updatedAt?: string;
}

export interface DecorationItem {
  id: string;
  type: "emoji" | "image";
  content: string;
  imageUrl?: string;
  style: React.CSSProperties;
  className?: string;
}

export interface ThemeSectionConfig {
  id: string;
  title: React.ReactNode;
  subtitle?: string;
  displayTitle?: React.ReactNode;
  displayDescription?: string;
  themeKeyword: string;
  productLineId?: string;
  shopMoreLabel: string;
  shopMoreBg: string;
  shopMoreHoverBg: string;
  shopMoreText: string;
  titleLayout: "left" | "center" | "right";
  bgColor: string;
  textColor: string;
  topDividerFill: string;
  cardSize: "large" | "small";
  limit?: number;
  decorations?: DecorationItem[];
}
