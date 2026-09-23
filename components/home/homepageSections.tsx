import React from "react";
import type { ThemeSectionConfig } from "./homeTypes";

export const DEFAULT_HOMEPAGE_SECTIONS: ThemeSectionConfig[] = [
  {
    id: "sec-space",
    title: (
      <>
        Space
        <br />
        Adventures
      </>
    ),
    subtitle: "Explore galaxy, astronaut, & planet figurines ready to paint.",
    themeKeyword: "Space",
    shopMoreLabel: "Shop Space",
    shopMoreBg: "#FDE68A",
    shopMoreHoverBg: "#F5D56A",
    shopMoreText: "#1E293B",
    titleLayout: "left",
    bgColor: "#2D366D",
    textColor: "#FFFFFF",
    topDividerFill: "white",
    cardSize: "large",
    limit: 4,
    decorations: [
      {
        id: "s1",
        type: "emoji",
        content: "🪐",
        style: {
          top: "15%",
          left: "5%",
          fontSize: "48px",
          opacity: 0.9,
          transform: "rotate(-15deg)",
        },
      },
      {
        id: "s2",
        type: "emoji",
        content: "⭐",
        style: { top: "8%", left: "30%", fontSize: "18px", opacity: 0.8 },
        className: "hidden sm:block",
      },
      {
        id: "s3",
        type: "emoji",
        content: "✨",
        style: { top: "12%", right: "8%", fontSize: "14px", opacity: 0.7 },
        className: "hidden sm:block",
      },
      {
        id: "s4",
        type: "emoji",
        content: "⭐",
        style: { top: "5%", right: "15%", fontSize: "20px", opacity: 0.8 },
      },
      {
        id: "s5",
        type: "emoji",
        content: "🌍",
        style: { top: "25%", right: "3%", fontSize: "42px", opacity: 0.85 },
        className: "hidden md:block",
      },
      {
        id: "s6",
        type: "emoji",
        content: "🚀",
        style: {
          bottom: "30%",
          left: "8%",
          fontSize: "36px",
          opacity: 0.8,
          transform: "rotate(25deg)",
        },
        className: "hidden sm:block",
      },
      {
        id: "s7",
        type: "emoji",
        content: "🚀",
        style: {
          bottom: "15%",
          right: "5%",
          fontSize: "38px",
          opacity: 0.8,
          transform: "rotate(-20deg) scaleX(-1)",
        },
        className: "hidden sm:block",
      },
    ],
  },
  {
    id: "sec-garden",
    title: "Secret Garden (Floral)",
    subtitle:
      "Beautiful botanical shapes, floral plaster crafts, and nature art.",
    themeKeyword: "Secret Garden (Floral)",
    shopMoreLabel: "Shop Garden",
    shopMoreBg: "#2F6B4F",
    shopMoreHoverBg: "#24543E",
    shopMoreText: "#FFFFFF",
    titleLayout: "center",
    bgColor: "#D1E7D2",
    textColor: "#3C2A21",
    topDividerFill: "#2D366D",
    cardSize: "large",
    limit: 4,
    decorations: [
      {
        id: "g1",
        type: "emoji",
        content: "🌿",
        style: { top: "20px", left: "20px", fontSize: "46px", opacity: 0.85 },
        className: "hidden sm:block",
      },
      {
        id: "g2",
        type: "emoji",
        content: "🌺",
        style: {
          bottom: "20px",
          right: "20px",
          fontSize: "46px",
          opacity: 0.85,
        },
        className: "hidden sm:block",
      },
      {
        id: "g3",
        type: "emoji",
        content: "🌸",
        style: { top: "15%", right: "12%", fontSize: "36px", opacity: 0.8 },
        className: "hidden sm:block",
      },
      {
        id: "g4",
        type: "emoji",
        content: "🦋",
        style: { top: "25%", left: "10%", fontSize: "38px", opacity: 0.8 },
        className: "hidden sm:block",
      },
    ],
  },
  {
    id: "sec-fairytale",
    title: (
      <>
        Fairytale
        <br />
        Magic
      </>
    ),
    subtitle:
      "Enchanted castles, magical unicorns, and fantasy plaster painting sets.",
    themeKeyword: "Fairytale",
    shopMoreLabel: "Shop Fairytale",
    shopMoreBg: "#7C3AED",
    shopMoreHoverBg: "#6D28D9",
    shopMoreText: "#FFFFFF",
    titleLayout: "left",
    bgColor: "#F1E4F7",
    textColor: "#3C2A21",
    topDividerFill: "#D1E7D2",
    cardSize: "small",
    limit: 4,
    decorations: [
      {
        id: "f1",
        type: "emoji",
        content: "🏰",
        style: {
          bottom: "20px",
          left: "20px",
          fontSize: "44px",
          opacity: 0.85,
        },
        className: "hidden md:block",
      },
      {
        id: "f2",
        type: "emoji",
        content: "🦄",
        style: { top: "18%", right: "8%", fontSize: "42px", opacity: 0.85 },
        className: "hidden sm:block",
      },
      {
        id: "f3",
        type: "emoji",
        content: "👑",
        style: { top: "12%", left: "25%", fontSize: "32px", opacity: 0.8 },
        className: "hidden sm:block",
      },
    ],
  },
  {
    id: "sec-wild",
    title: (
      <>
        Wild <br className="sm:hidden" />
        Kingdom
      </>
    ),
    subtitle:
      "Lions, squirrels, owls, foxes & safari animal plaster figurines for kids.",
    themeKeyword: "Wild Kingdom",
    shopMoreLabel: "Shop Wild Kingdom",
    shopMoreBg: "#3C2A21",
    shopMoreHoverBg: "#251A14",
    shopMoreText: "#FFFFFF",
    titleLayout: "right",
    bgColor: "#F9E6C3",
    textColor: "#3C2A21",
    topDividerFill: "#F1E4F7",
    cardSize: "small",
    limit: 4,
    decorations: [
      {
        id: "w1",
        type: "emoji",
        content: "🍃",
        style: {
          bottom: "20px",
          left: "20px",
          fontSize: "46px",
          opacity: 0.85,
        },
        className: "hidden sm:block",
      },
      {
        id: "w2",
        type: "emoji",
        content: "🐾",
        style: { top: "20px", right: "20px", fontSize: "38px", opacity: 0.75 },
        className: "hidden sm:block",
      },
      {
        id: "w3",
        type: "emoji",
        content: "🦁",
        style: { top: "15%", left: "12%", fontSize: "40px", opacity: 0.85 },
        className: "hidden sm:block",
      },
      {
        id: "w4",
        type: "emoji",
        content: "🐘",
        style: { bottom: "15%", right: "10%", fontSize: "40px", opacity: 0.85 },
        className: "hidden sm:block",
      },
      {
        id: "w5",
        type: "emoji",
        content: "🌴",
        style: { top: "40%", right: "4%", fontSize: "36px", opacity: 0.75 },
        className: "hidden md:block",
      },
    ],
  },
  {
    id: "sec-little-friends",
    title: "Little Friends",
    subtitle: "Small cat, horse, fish, rabbit, parrot",
    themeKeyword: "Little Friends",
    shopMoreLabel: "Shop Little Friends",
    shopMoreBg: "#DB2777",
    shopMoreHoverBg: "#BE185D",
    shopMoreText: "#FFFFFF",
    titleLayout: "left",
    bgColor: "#FEF9C3",
    textColor: "#000000",
    topDividerFill: "white",
    cardSize: "large",
    limit: 4,
    decorations: [
      {
        id: "lf1",
        type: "emoji",
        content: "🦋",
        style: { top: "15%", left: "5%", fontSize: "38px", opacity: 0.85 },
        className: "hidden sm:block",
      },
      {
        id: "lf2",
        type: "emoji",
        content: "🐝",
        style: { top: "30%", left: "27%", fontSize: "38px", opacity: 0.85 },
        className: "hidden sm:block",
      },
      {
        id: "lf3",
        type: "emoji",
        content: "🐦",
        style: { top: "45%", left: "49%", fontSize: "38px", opacity: 0.85 },
        className: "hidden sm:block",
      },
      {
        id: "lf4",
        type: "emoji",
        content: "🦚",
        style: { top: "60%", left: "71%", fontSize: "38px", opacity: 0.85 },
        className: "hidden sm:block",
      },
    ],
  },
  {
    id: "sec-home-decor",
    title: "Home Decor",
    subtitle: "Home decoration POP items.",
    themeKeyword: "Home Decor",
    shopMoreLabel: "Shop Home Decor",
    shopMoreBg: "#F6E7C1",
    shopMoreHoverBg: "#EBD49A",
    shopMoreText: "#2D366D",
    productLineId: "line-1785522769418",
    titleLayout: "left",
    bgColor: "#2D366D",
    textColor: "#FFFFFF",
    topDividerFill: "white",
    cardSize: "large",
    limit: 4,
    decorations: [
      {
        id: "hd1",
        type: "emoji",
        content: "⭐",
        style: { top: "15%", left: "5%", fontSize: "38px", opacity: 0.85 },
        className: "hidden sm:block",
      },
      {
        id: "hd2",
        type: "emoji",
        content: "🌍",
        style: { top: "30%", left: "27%", fontSize: "38px", opacity: 0.85 },
        className: "hidden sm:block",
      },
      {
        id: "hd3",
        type: "emoji",
        content: "🌿",
        style: { top: "45%", left: "49%", fontSize: "38px", opacity: 0.85 },
        className: "hidden sm:block",
      },
      {
        id: "hd4",
        type: "emoji",
        content: "🕯️",
        style: { top: "60%", left: "71%", fontSize: "38px", opacity: 0.85 },
        className: "hidden sm:block",
      },
      {
        id: "hd5",
        type: "emoji",
        content: "🏰",
        style: { top: "75%", left: "18%", fontSize: "38px", opacity: 0.85 },
        className: "hidden sm:block",
      },
    ],
  },
];

export const HOMEPAGE_SECTION_ORDER = [
  "sec-home-decor",
  "sec-wild",
  "sec-garden",
  "sec-little-friends",
];
