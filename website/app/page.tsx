"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useCart } from "../context/CartContext";
import { useAppSelector } from "../store/hooks";
import type { RootState } from "../store/store";

interface Product {
  id: string;
  name: string;
  price: number;
  theme: string;
  category: string;
  ageGroup: string;
  isNonToxic: boolean;
  image: string;
  description: string;
}

interface DecorationItem {
  id: string;
  type: 'emoji' | 'image';
  content: string; // Emoji char or image URL
  imageUrl?: string; // Saved image URL code for reference
  style: React.CSSProperties;
  className?: string;
}

interface ThemeSectionConfig {
  id: string;
  title: string | React.ReactNode;
  themeKeyword: string;
  titleLayout: 'left' | 'center' | 'right';
  bgColor: string;
  textColor: string;
  topDividerFill: string;
  cardSize: 'large' | 'small';
  decorations?: DecorationItem[];
}

export default function HomePage() {
  const { addToCart } = useCart();
  const products = useAppSelector((state: RootState) => state.products.items);

  const getThemeProducts = (themeKeyword: string) => {
    return products
      .filter((p) => p.theme.toLowerCase().includes(themeKeyword.toLowerCase()))
      .slice(0, 2);
  };

  // CONFIGURABLE THEME SECTIONS ARRAY (DRIVEN DIRECTLY BY DATABASE PRODUCTS)
  const themeSections: ThemeSectionConfig[] = [
    {
      id: "space",
      title: (
        <>
          Space
          <br />
          Adventures
        </>
      ),
      themeKeyword: "Space",
      titleLayout: "left",
      bgColor: "#2D366D",
      textColor: "#FFFFFF",
      topDividerFill: "white",
      cardSize: "large",
      decorations: [
        { id: "s1", type: "emoji", content: "🪐", style: { top: "15%", left: "5%", fontSize: "48px", opacity: 0.9, transform: "rotate(-15deg)" } },
        { id: "s2", type: "emoji", content: "⭐", style: { top: "8%", left: "30%", fontSize: "18px", opacity: 0.8 }, className: "hidden sm:block" },
        { id: "s3", type: "emoji", content: "✨", style: { top: "12%", right: "8%", fontSize: "14px", opacity: 0.7 }, className: "hidden sm:block" },
        { id: "s4", type: "emoji", content: "⭐", style: { top: "5%", right: "15%", fontSize: "20px", opacity: 0.8 } },
        { id: "s5", type: "emoji", content: "🌍", style: { top: "25%", right: "3%", fontSize: "42px", opacity: 0.85 }, className: "hidden md:block" },
        { id: "s6", type: "emoji", content: "🚀", style: { bottom: "30%", left: "8%", fontSize: "36px", opacity: 0.8, transform: "rotate(25deg)" }, className: "hidden sm:block" },
        { id: "s7", type: "emoji", content: "🚀", style: { bottom: "15%", right: "5%", fontSize: "38px", opacity: 0.8, transform: "rotate(-20deg) scaleX(-1)" }, className: "hidden sm:block" },
        { id: "s8", type: "emoji", content: "⭐", style: { top: "45%", left: "2%", fontSize: "14px", opacity: 0.6 }, className: "hidden md:block" },
        { id: "s9", type: "emoji", content: "✨", style: { top: "60%", left: "15%", fontSize: "12px", opacity: 0.5 }, className: "hidden md:block" }
      ]
    },
    {
      id: "garden",
      title: "Secret Garden (Floral)",
      themeKeyword: "Garden",
      titleLayout: "center",
      bgColor: "#D1E7D2",
      textColor: "#3C2A21",
      topDividerFill: "#2D366D",
      cardSize: "large",
      decorations: [
        {
          id: "g1",
          type: "emoji",
          content: "🌿",
          imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAS0H4RpDNj1wH6AR0qZ8Rn8McleCflgnz5Vg0_fQ9qqp_mstz0-IbqPw5O3mHFuNwBptJpVfeSh5oK_uyaWjLQxL7yYRQaqUzP1brGeF94hf_F6dpCvPlnNQI4tPy2MqvaQSKA9KhzS9caJMt4FyCo8qdRIQgjimRvkuEnvwXL7ILGZSeKCC5lylBp0hXrgjau4CmlaCpI4BVwexveLFlVgP_nlUSSio50rMV7YWltP58c4rmnZw--ryrxgWyOZslVbSYpvJdf1X4",
          style: { top: "20px", left: "20px", fontSize: "46px", opacity: 0.85 },
          className: "hidden sm:block"
        },
        {
          id: "g2",
          type: "emoji",
          content: "🌺",
          imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAtvOa9Z4BzqyCTT40TPkB_rJMyog9dxotykaM8tgg3r8K-znF-u7cqY0GMhHXlMzCxWzm2aKedtGfKzlVytEMdElQLRg7kdKd8S1yoYI6Nm9oDMEQsDnGITWXlI9ixUez_6rNNXGgjelbapytN9a-QWT2DBbYiKL8RZ77O95oeqSegWKPxpZ24xJZCw0-3J_-bccgnqOXh64KSVnBqd5rFtTaAuqyTd2iNObdYF2cOU7AA95NZ1bW5VYVu3pt4oXG5Tt3H9mRoHy4",
          style: { bottom: "20px", right: "20px", fontSize: "46px", opacity: 0.85 },
          className: "hidden sm:block"
        },
        { id: "g3", type: "emoji", content: "🌸", style: { top: "15%", right: "12%", fontSize: "36px", opacity: 0.8 }, className: "hidden sm:block" },
        { id: "g4", type: "emoji", content: "🦋", style: { top: "25%", left: "10%", fontSize: "38px", opacity: 0.8 }, className: "hidden sm:block" },
        { id: "g5", type: "emoji", content: "🌷", style: { bottom: "30%", left: "5%", fontSize: "32px", opacity: 0.75 }, className: "hidden md:block" },
        { id: "g6", type: "emoji", content: "🐝", style: { top: "10%", left: "40%", fontSize: "28px", opacity: 0.8 }, className: "hidden sm:block" }
      ]
    },
    {
      id: "fairytale",
      title: (
        <>
          Fairytale
          <br />
          Magic
        </>
      ),
      themeKeyword: "Fairytale",
      titleLayout: "left",
      bgColor: "#F1E4F7",
      textColor: "#3C2A21",
      topDividerFill: "#D1E7D2",
      cardSize: "small",
      decorations: [
        {
          id: "f1",
          type: "emoji",
          content: "🏰",
          imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuComB21zuW6PCQia8SUTMPu0q9ZTZO0rR0Vp9STHfUsNoO0j5qTw9Sn62NLSJBQNGSPEQcOQQwGcUWmaNcCeJuRs5RVcKmb211tUNNKQ4IaSVfHiWeiPMghpJM0I9TIci0s6qbRB6sfaYJWrB852e8XR-EJ74yw_ex7Qy4sfHWrS_ubxGz893uWYxG28q9JyAmgsmXWy-nP2Qo3dA5uuP4r5ChN0bNr2NvU9r-lC-QAh6n52sPP2VLLIFQAya4JfhepeQiw68SZH-s",
          style: { bottom: "20px", left: "20px", fontSize: "44px", opacity: 0.85 },
          className: "hidden md:block"
        },
        { id: "f2", type: "emoji", content: "🦄", style: { top: "18%", right: "8%", fontSize: "42px", opacity: 0.85 }, className: "hidden sm:block" },
        { id: "f3", type: "emoji", content: "👑", style: { top: "12%", left: "25%", fontSize: "32px", opacity: 0.8 }, className: "hidden sm:block" },
        { id: "f4", type: "emoji", content: "🪄", style: { bottom: "25%", right: "12%", fontSize: "36px", opacity: 0.8 }, className: "hidden md:block" },
        { id: "f5", type: "emoji", content: "✨", style: { top: "35%", right: "20%", fontSize: "24px", opacity: 0.7 }, className: "hidden sm:block" }
      ]
    },
    {
      id: "wild",
      title: (
        <>
          Wild
          <br />
          Kingdom
        </>
      ),
      themeKeyword: "Wild",
      titleLayout: "right",
      bgColor: "#F9E6C3",
      textColor: "#3C2A21",
      topDividerFill: "#F1E4F7",
      cardSize: "small",
      decorations: [
        {
          id: "w1",
          type: "emoji",
          content: "🍃",
          imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDXyCpZUjaQfYpaOp5ai0oQeFYPxroB2o4suZygVoQ0Nql86CdrVoYX17qWeE2ySHLJHjudkhg_78Q_I9rrOcYkbSykBOnQS2-QJA8eeLq-R8PpRWA4D55g63-Qf_r0nuovF8SbC6d00YdfD_Gn5A5e3dK1-Kq9qBvrKd1zJyRCYqA5zCeHhpWgsJDdJqCvJZ70vUvxLcBujM7tjjWpZIWB3qO4Yx44pzFTFPstvk1i4U8INi_zvwPsbEIUrtxClc4kOxVxFp2y2WA",
          style: { bottom: "20px", left: "20px", fontSize: "46px", opacity: 0.85 },
          className: "hidden sm:block"
        },
        {
          id: "w2",
          type: "emoji",
          content: "🐾",
          imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBFuq1NrDk9hDdAAaD786n-QEpOQm9jFqkMS4w_NOBwj3FJvcQm8MVVlDG9xXKdsEmUD2v09nzXK8HxPVbktkCZ4yMhVY4K5QiMdEytLdSkuFhl93g5ZF4z2EarZzxdbTEyug4upfkRfQ1c3LAkG4ADGeNtaGg0x82yPqn1WqnjY3OJv16w2Etrtk5od9iwbjbj7oJ_18AItqsK6Emv6wndCCxsJIStjiEk7LRltWrt-Vl5Cmqywg_c58R0xwcXS_GpQO9frHKoivg",
          style: { top: "20px", right: "20px", fontSize: "38px", opacity: 0.75 },
          className: "hidden sm:block"
        },
        { id: "w3", type: "emoji", content: "🦁", style: { top: "15%", left: "12%", fontSize: "40px", opacity: 0.85 }, className: "hidden sm:block" },
        { id: "w4", type: "emoji", content: "🐘", style: { bottom: "15%", right: "10%", fontSize: "40px", opacity: 0.85 }, className: "hidden sm:block" },
        { id: "w5", type: "emoji", content: "🌴", style: { top: "40%", right: "4%", fontSize: "36px", opacity: 0.75 }, className: "hidden md:block" }
      ]
    }
  ];

  return (
    <div style={{ fontFamily: "'Quicksand', sans-serif", color: "#333" }}>
      {/* ─── HERO SECTION ─── */}
      <section
        className="relative overflow-hidden"
        style={{ backgroundColor: "#EFF6FF", minHeight: "420px" }}
      >
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <svg
            className="absolute bottom-0 left-0 w-full"
            fill="white"
            viewBox="0 0 1440 320"
          >
            <path
              fillOpacity="1"
              d="M0,224L60,202.7C120,181,240,139,360,138.7C480,139,600,181,720,202.7C840,224,960,224,1080,192C1200,160,1320,96,1380,64L1440,32L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"
            />
          </svg>
        </div>

        <div
          className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col md:flex-row items-center"
          style={{ padding: "60px 24px 80px 24px" }}
        >
          <div className="w-full md:w-5/12 text-center md:text-left mb-10 md:mb-0">
            <h1
              className="font-bold leading-tight mb-6"
              style={{
                fontSize: "clamp(2rem, 5vw, 3.25rem)",
                color: "#3C2A21",
              }}
            >
              Paint Your World
              <br />
              with Little Creators!
            </h1>
            <p
              className="mb-8 max-w-md mx-auto md:mx-0"
              style={{
                color: "#4B5563",
                fontSize: "17px",
                lineHeight: "28px",
                fontWeight: 500,
              }}
            >
              Complete ready-to-paint plaster craft kits designed for curious
              young minds.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Link
                href="/shop"
                className="px-7 py-3.5 text-white rounded-full font-bold shadow-lg text-center transition hover:opacity-90"
                style={{ backgroundColor: "#3C2A21", fontSize: "15px" }}
              >
                Shop Painting Kits
              </Link>
              <Link
                href="/shop"
                className="px-7 py-3.5 rounded-full font-bold text-center transition hover:bg-blue-50"
                style={{
                  border: "2px solid #3C2A21",
                  color: "#3C2A21",
                  fontSize: "15px",
                }}
              >
                Explore Themes
              </Link>
            </div>
          </div>

          <div className="w-full md:w-7/12 flex justify-center md:justify-end relative">
            <div className="relative w-full" style={{ maxWidth: "600px" }}>
              <div
                className="overflow-hidden w-full"
                style={{
                  clipPath: "ellipse(85% 95% at 65% 50%)",
                  WebkitClipPath: "ellipse(85% 95% at 65% 50%)",
                  borderRadius: "0 0 0 40%",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDX3XrM68ibMOJBdg1KJRUcl3673jAz2D2uXdkdQeaKwhwGhZTxIu8h5jhX2wgGfN4T4za5H8vEK81153qHcO1XDeFGtyatNhetX5KReX37UFA4clyI1RCDN92VMtPPRRbjlR6OM4hNvlAX7d9tTARtByd6DcpXfVPPqhZDuu_0Uwxd1uD_eXlki6tqbHGjDv16EIWCTA50urtFql5gYcWIEibj3HBYXQy9IXjOYNoknK47cI92Hbyycq81r1RFoWw0_6WCUDirB2E"
                  alt="Children painting crafts"
                  className="w-full h-full object-cover"
                  style={{ minHeight: "320px", maxHeight: "440px" }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── WHY LITTLE CREATORS ─── */}
      <section style={{ backgroundColor: "white", padding: "64px 0" }}>
        <div className="max-w-7xl mx-auto px-6">
          <h2
            className="text-center font-bold mb-12"
            style={{ fontSize: "30px", color: "#3C2A21" }}
          >
            Why Little Creators?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <WhyCard
              bg="#EFF6FF"
              iconSrc="https://lh3.googleusercontent.com/aida-public/AB6AXuC05Fn2RrTeXXbi8ozDNSOEp966CdSel8NRXnfqnE_9L4NlK7VPfAnROXfVs27_LXYlXroCvXOKBtRvldzWFIKIOXjMeG-vykL9icHpUz1VPoqjgP4VRZQkfydZohsCGV0-Y-wgmD8RgcJJyPgDtNxJ-FrCfUXzGgppZfHLwG3-tN9CqL9oSFa1afF9CDibssiTAcWqya6Rxz1uSEQhlK-XhhUhO5-M5QrwnPj31iav7vovFVgnOAGdgfwi5bW4IPWFwXQfqC_wbEg"
              title="Cognitive Growth"
              desc="Boosts creativity, focus, and fine motor skills through art."
            />
            <WhyCard
              bg="#FEFCE8"
              iconSrc="https://lh3.googleusercontent.com/aida-public/AB6AXuA1NgK7ZecsjWENFgT54D5Cv7_WmCJQmXcjVv2vDTOohUD08d6ixK0W8VSCjBec872DQ56yJRCZWjM3nMkcFbfrjffEBuqgP62_b3wdF1ffUSUaYQR2bWbjGsv5LqTUe4ePnMWCIgqEwQtyDbCtl00mUNAbqsSkubAEACbLuU0NWjKMcosJIMVAO6No4bjom5d37epqn_B2eymBS-0CFmPkuIIP6yljbIcbt0OLzKeSVZgWR4_BTe5Zipc8EKN83XAdX72AcsKH18A"
              title="Screen-Free Fun"
              desc="Engaging, hands-on activity that keeps kids entertained."
            />
            <WhyCard
              bg="#FEF2F2"
              iconSrc="https://lh3.googleusercontent.com/aida-public/AB6AXuD-C7wnjb5D37c9ELK5XHJi86GQiHBzVQLW8RWz-gdqnMaiUrNUTdJpLkh5Z5nj0Q4-pfO_PX-yYZLgGq3VE6jjxtDZLjAQqp_Jt1cTRjszStJusR7U9b71bICgoXDP_DouaMmNbyV-g0htz3vzAvPTdsXS6ChxzsfF5ebH9KHSRUJaDAf2zyCuMUy-GqgQjvYQYu3eNvSihMnFVN5iW-QiHzcowhy97nhagNPl36Xbim3Xgrcr2oIdlioZDZNvIFjAYmvZkSIvD3M"
              title="Travel-Friendly Hobby"
              desc="Portable kits perfect for vacations or quiet time anywhere."
            />
          </div>
        </div>
      </section>

      {/* ─── DYNAMIC CONFIGURABLE THEME SECTIONS (DATABASE DRIVEN) ─── */}
      {themeSections.map((sectionConfig) => {
        const themeProducts = getThemeProducts(sectionConfig.themeKeyword);

        return (
          <section
            key={sectionConfig.id}
            className="relative overflow-hidden"
            style={{
              backgroundColor: sectionConfig.bgColor,
              color: sectionConfig.textColor,
              paddingTop: "80px",
              paddingBottom: "100px",
            }}
          >
            {/* Top Wavy Divider */}
            <div
              className="absolute top-0 left-0 w-full overflow-hidden"
              style={{ lineHeight: 0 }}
            >
              <svg
                className="relative block"
                style={{ width: "calc(100% + 1.3px)", height: "60px" }}
                fill={sectionConfig.topDividerFill}
                preserveAspectRatio="none"
                viewBox="0 0 1200 120"
              >
                <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5,73.84-4.36,147.54,16.88,218.2,35.26,69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113,2,1200,0Z" />
              </svg>
            </div>

            {/* Configurable Decorative Elements */}
            {sectionConfig.decorations?.map((decor) => (
              <React.Fragment key={decor.id}>
                {decor.type === "emoji" ? (
                  <span
                    className={`absolute pointer-events-none select-none ${decor.className || ""}`}
                    style={decor.style}
                  >
                    {decor.content}
                  </span>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={decor.content}
                    alt=""
                    className={`absolute pointer-events-none ${decor.className || ""}`}
                    style={decor.style}
                    onError={(e: any) => {
                      e.target.style.display = "none";
                    }}
                  />
                )}
              </React.Fragment>
            ))}

            {/* Configurable Section Layout */}
            <div className="max-w-7xl mx-auto px-6 relative z-10">
              {sectionConfig.titleLayout === "center" ? (
                /* Center Layout */
                <div className="text-center">
                  <h2
                    className="font-bold mb-12"
                    style={{ fontSize: "36px", color: sectionConfig.textColor }}
                  >
                    {sectionConfig.title}
                  </h2>
                  <div className="flex flex-wrap justify-center gap-10">
                    {themeProducts.map((p) => (
                      <ThemeProductCard
                        key={p.id}
                        product={p}
                        size={sectionConfig.cardSize}
                        onAdd={() => addToCart(p)}
                      />
                    ))}
                  </div>
                </div>
              ) : sectionConfig.titleLayout === "left" ? (
                /* Left Title Layout */
                <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16">
                  <div className="w-full md:w-2/5 text-center md:text-left shrink-0">
                    <h2
                      className="font-bold leading-tight"
                      style={{
                        fontSize: "clamp(2.25rem, 5vw, 3.5rem)",
                        color: sectionConfig.textColor,
                      }}
                    >
                      {sectionConfig.title}
                    </h2>
                  </div>
                  <div className="w-full md:w-3/5 flex flex-col sm:flex-row justify-center gap-6 sm:gap-8">
                    {themeProducts.map((p) => (
                      <ThemeProductCard
                        key={p.id}
                        product={p}
                        size={sectionConfig.cardSize}
                        onAdd={() => addToCart(p)}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                /* Right Title Layout */
                <div className="flex flex-col md:flex-row-reverse items-center justify-center gap-12 text-center">
                  <div className="w-full md:w-2/5 text-center md:text-left shrink-0">
                    <h2
                      className="font-bold mb-4 leading-tight"
                      style={{
                        fontSize: "clamp(2.25rem, 5vw, 3.5rem)",
                        color: sectionConfig.textColor,
                      }}
                    >
                      {sectionConfig.title}
                    </h2>
                  </div>
                  <div className="w-full md:w-3/5 flex flex-wrap justify-center gap-8">
                    {themeProducts.map((p) => (
                      <ThemeProductCard
                        key={p.id}
                        product={p}
                        size={sectionConfig.cardSize}
                        onAdd={() => addToCart(p)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        );
      })}

      {/* ─── EXPLORE ALL THEMES BUTTON ─── */}
      <div
        className="flex justify-center relative z-20 pb-16"
        style={{ marginTop: "-32px" }}
      >
        <Link
          href="/shop"
          className="text-white rounded-full font-bold shadow-2xl uppercase tracking-wide inline-block text-center transition hover:scale-105"
          style={{
            background: "linear-gradient(90deg, #818CF8, #F472B6, #FB923C)",
            padding: "20px 48px",
            fontSize: "20px",
          }}
        >
          Explore All Themes
        </Link>
      </div>
    </div>
  );
}

/* ─── WHY CARD COMPONENT ─── */
function WhyCard({
  bg,
  iconSrc,
  title,
  desc,
}: {
  bg: string;
  iconSrc: string;
  title: string;
  desc: string;
}) {
  return (
    <div
      className="p-8 rounded-3xl text-center flex flex-col items-center"
      style={{ backgroundColor: bg }}
    >
      <div className="w-20 h-20 mb-6 bg-white rounded-full flex items-center justify-center shadow-sm">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={iconSrc} alt={title} className="w-12 h-12 object-contain" />
      </div>
      <h3
        className="font-bold mb-3"
        style={{ fontSize: "20px", color: "#3C2A21" }}
      >
        {title}
      </h3>
      <p style={{ color: "#4B5563", fontSize: "16px" }}>{desc}</p>
    </div>
  );
}

/* ─── PRODUCT CARD FOR THEME SECTIONS ─── */
function ThemeProductCard({
  product,
  size,
  onAdd,
}: {
  product: Product;
  size: "large" | "small";
  onAdd: () => void;
}) {
  const isLarge = size === "large";
  const cardWidth = isLarge ? "280px" : "256px";
  const imgHeight = isLarge ? "192px" : "160px";
  const titleSize = isLarge ? "20px" : "18px";
  const btnPy = isLarge ? "12px" : "8px";
  const btnFontSize = isLarge ? "16px" : "14px";

  return (
    <div
      className="bg-white rounded-3xl flex flex-col justify-between transition-transform hover:-translate-y-1"
      style={{
        padding: "24px",
        width: "100%",
        maxWidth: cardWidth,
        color: "#3C2A21",
        boxShadow:
          "0 20px 25px -5px rgba(0,0,0,.1), 0 8px 10px -6px rgba(0,0,0,.1)",
      }}
    >
      <div>
        {/* Badges */}
        <div className="flex gap-2 mb-3 self-start">
          <span
            className="text-xs font-bold px-2 py-0.5 rounded"
            style={{ backgroundColor: "#E0F2FE", color: "#0284C7" }}
          >
            {product.ageGroup || "Ages 4+"}
          </span>
          {product.isNonToxic && (
            <span
              className="text-xs font-bold px-2 py-0.5 rounded"
              style={{ backgroundColor: "#DCFCE7", color: "#15803D" }}
            >
              Non-Toxic
            </span>
          )}
        </div>

        {/* Image Container */}
        <div
          className="rounded-2xl mb-4 flex items-center justify-center overflow-hidden"
          style={{
            backgroundColor: "#F9FAFB",
            padding: "16px",
            height: imgHeight,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.image}
            alt={product.name}
            className="max-h-full object-contain"
          />
        </div>

        {/* Title & Price */}
        <Link href={`/product/${product.id}`}>
          <h3
            className="font-bold mb-1 hover:text-blue-500 transition line-clamp-1"
            style={{ fontSize: titleSize, color: "#3C2A21" }}
          >
            {product.name}
          </h3>
        </Link>
        <p className="mb-4" style={{ color: "#6B7280", fontWeight: 600 }}>
          ${product.price.toFixed(2)}
        </p>
      </div>

      {/* Add to Cart */}
      <button
        onClick={onAdd}
        className="w-full text-white rounded-full font-bold transition hover:opacity-90"
        style={{
          backgroundColor: "#3C2A21",
          padding: `${btnPy} 0`,
          fontSize: btnFontSize,
        }}
      >
        Add to Cart
      </button>
    </div>
  );
}
